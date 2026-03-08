import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

interface ICalEvent {
  summary: string
  dtstart: string
  dtend: string
}

function parseICalDate(val: string): string {
  // iCal dates: YYYYMMDD or YYYYMMDDTHHMMSSZ
  const clean = val.replace(/[^0-9T]/g, '')
  const y = clean.substring(0, 4)
  const m = clean.substring(4, 6)
  const d = clean.substring(6, 8)
  return `${y}-${m}-${d}`
}

function parseICalEvents(icsText: string): ICalEvent[] {
  const events: ICalEvent[] = []
  const blocks = icsText.split('BEGIN:VEVENT')

  for (let i = 1; i < blocks.length; i++) {
    const block = blocks[i].split('END:VEVENT')[0]
    let summary = ''
    let dtstart = ''
    let dtend = ''

    for (const line of block.split('\n')) {
      const trimmed = line.trim()
      if (trimmed.startsWith('SUMMARY:')) {
        summary = trimmed.substring(8).trim()
      } else if (trimmed.startsWith('DTSTART')) {
        const val = trimmed.includes(':') ? trimmed.split(':').pop()! : trimmed.split('=').pop()!
        dtstart = parseICalDate(val.trim())
      } else if (trimmed.startsWith('DTEND')) {
        const val = trimmed.includes(':') ? trimmed.split(':').pop()! : trimmed.split('=').pop()!
        dtend = parseICalDate(val.trim())
      }
    }

    if (dtstart && dtend) {
      events.push({ summary: summary || 'Réservation', dtstart, dtend })
    }
  }

  return events
}

function calcNights(checkIn: string, checkOut: string): number {
  const d1 = new Date(checkIn + 'T00:00:00Z')
  const d2 = new Date(checkOut + 'T00:00:00Z')
  return Math.max(0, Math.round((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24)))
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    )

    const token = authHeader.replace('Bearer ', '')
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token)
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders })
    }
    const userId = claimsData.claims.sub as string

    const { property_id } = await req.json()

    // Get property with iCal URLs
    const { data: property, error: propError } = await supabase
      .from('properties')
      .select('id, ical_airbnb_url, ical_booking_url, nightly_rate')
      .eq('id', property_id)
      .single()

    if (propError || !property) {
      return new Response(JSON.stringify({ error: 'Bien introuvable' }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const urls: { url: string; platform: string }[] = []
    if (property.ical_airbnb_url) urls.push({ url: property.ical_airbnb_url, platform: 'airbnb' })
    if (property.ical_booking_url) urls.push({ url: property.ical_booking_url, platform: 'booking' })

    if (urls.length === 0) {
      return new Response(JSON.stringify({ imported: 0, message: 'Aucun lien iCal configuré' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    let totalImported = 0
    const nightlyRate = Number(property.nightly_rate) || 0

    for (const { url, platform } of urls) {
      try {
        console.log(`Fetching iCal from ${platform}: ${url}`)
        const res = await fetch(url)
        if (!res.ok) {
          console.error(`Failed to fetch iCal for ${platform}: ${res.status}`)
          await res.text()
          continue
        }
        const icsText = await res.text()
        const events = parseICalEvents(icsText)
        console.log(`Parsed ${events.length} events from ${platform}`)

        for (const event of events) {
          // Skip blocked/unavailable entries (no real guest)
          const lowerSummary = event.summary.toLowerCase()
          if (lowerSummary.includes('not available') || lowerSummary.includes('blocked') || lowerSummary === 'airbnb (not available)') {
            continue
          }

          const nights = calcNights(event.dtstart, event.dtend)
          if (nights <= 0) continue

          // Check if reservation already exists (same property + dates + platform)
          const { data: existing } = await supabase
            .from('reservations')
            .select('id')
            .eq('property_id', property_id)
            .eq('check_in', event.dtstart)
            .eq('check_out', event.dtend)
            .eq('platform', platform)
            .maybeSingle()

          if (existing) {
            // Already exists, skip
            continue
          }

          const totalAmount = nightlyRate * nights

          const { error: insertError } = await supabase
            .from('reservations')
            .insert({
              user_id: userId,
              property_id: property_id,
              guest_name: event.summary || 'Voyageur',
              check_in: event.dtstart,
              check_out: event.dtend,
              nightly_rate: nightlyRate,
              nights,
              total_amount: totalAmount,
              platform_fees: 0,
              cleaning_fees: 0,
              status: 'confirmee',
              platform,
              notes: 'Importé via iCal',
            })

          if (insertError) {
            console.error('Insert error:', insertError)
          } else {
            totalImported++
          }
        }
      } catch (err) {
        console.error(`Error processing ${platform} iCal:`, err)
      }
    }

    return new Response(
      JSON.stringify({ imported: totalImported, message: `${totalImported} nouvelle(s) réservation(s) importée(s)` }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('sync-ical error:', error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Erreur interne' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
