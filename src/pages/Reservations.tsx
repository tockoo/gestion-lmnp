import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useProperties, useReservations } from '@/lib/store';
import { formatCurrency, formatDateFR } from '@/lib/receipt-utils';
import { PLATFORM_TYPES, type Reservation } from '@/types/lmnp';
import { Plus, Pencil, Trash2, CalendarDays } from 'lucide-react';
import { toast } from 'sonner';

function calcNights(checkIn: string, checkOut: string): number {
  if (!checkIn || !checkOut) return 0;
  const d1 = new Date(checkIn + 'T00:00:00');
  const d2 = new Date(checkOut + 'T00:00:00');
  return Math.max(0, Math.round((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24)));
}

const emptyReservation: Omit<Reservation, 'id'> = {
  propertyId: '', guestName: '', guestEmail: '', guestPhone: '',
  checkIn: '', checkOut: '', nightlyRate: 0, nights: 0, totalAmount: 0,
  platformFees: 0, cleaningFees: 0, status: 'confirmee', platform: 'airbnb', notes: '',
};

export default function Reservations() {
  const { data: properties } = useProperties();
  const { data: reservations, add, update, remove } = useReservations();
  const [editing, setEditing] = useState<Reservation | null>(null);
  const [form, setForm] = useState<Omit<Reservation, 'id'>>(emptyReservation);
  const [open, setOpen] = useState(false);

  const shortTermProps = useMemo(() => properties.filter(p => p.rentalType === 'courte-duree'), [properties]);

  const openNew = () => {
    setEditing(null);
    const defaultProp = shortTermProps[0];
    setForm({
      ...emptyReservation,
      propertyId: defaultProp?.id || properties[0]?.id || '',
      nightlyRate: defaultProp?.nightlyRate || 0,
    });
    setOpen(true);
  };
  const openEdit = (r: Reservation) => { setEditing(r); setForm({ ...r }); setOpen(true); };

  const save = async () => {
    const nights = calcNights(form.checkIn, form.checkOut);
    const totalAmount = (form.nightlyRate * nights) + form.cleaningFees - form.platformFees;
    const data = { ...form, nights, totalAmount };
    try {
      if (editing) {
        await update({ ...data, id: editing.id });
      } else {
        await add(data);
      }
      setOpen(false);
    } catch (err: any) { toast.error(err.message); }
  };

  const handleRemove = async (id: string) => {
    try { await remove(id); } catch (err: any) { toast.error(err.message); }
  };

  const updateForm = (key: string, value: string | number) => {
    setForm(prev => {
      const next = { ...prev, [key]: value };
      if (key === 'checkIn' || key === 'checkOut' || key === 'nightlyRate') {
        next.nights = calcNights(next.checkIn, next.checkOut);
        next.totalAmount = (next.nightlyRate * next.nights) + next.cleaningFees - next.platformFees;
      }
      if (key === 'propertyId') {
        const prop = properties.find(p => p.id === value);
        if (prop?.nightlyRate) next.nightlyRate = prop.nightlyRate;
      }
      return next;
    });
  };

  const propName = (id: string) => properties.find(p => p.id === id)?.name || '—';

  const statusColor = (s: Reservation['status']) => {
    if (s === 'confirmee') return 'bg-success text-success-foreground';
    if (s === 'terminee') return 'bg-primary text-primary-foreground';
    return 'bg-destructive text-destructive-foreground';
  };

  const statusLabel = (s: Reservation['status']) => {
    if (s === 'confirmee') return 'Confirmée';
    if (s === 'terminee') return 'Terminée';
    return 'Annulée';
  };

  const monthlyData = useMemo(() => {
    const now = new Date();
    const months: { month: number; year: number; label: string; reservations: Reservation[] }[] = [];
    for (let i = 0; i < 6; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const monthReservations = reservations.filter(r => {
        const ci = new Date(r.checkIn + 'T00:00:00');
        const co = new Date(r.checkOut + 'T00:00:00');
        const monthStart = new Date(d.getFullYear(), d.getMonth(), 1);
        const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0);
        return ci <= monthEnd && co >= monthStart && r.status !== 'annulee';
      });
      months.push({
        month: d.getMonth() + 1,
        year: d.getFullYear(),
        label: d.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }),
        reservations: monthReservations,
      });
    }
    return months;
  }, [reservations]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Réservations courte durée</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNew}><Plus className="h-4 w-4 mr-2" />Nouvelle réservation</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editing ? 'Modifier la réservation' : 'Nouvelle réservation'}</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-4">
              <div>
                <Label>Bien</Label>
                <Select value={form.propertyId} onValueChange={v => updateForm('propertyId', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {properties.map(p => <SelectItem key={p.id} value={p.id}>{p.name} {p.rentalType === 'courte-duree' ? '🏠' : ''}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Nom du voyageur</Label><Input value={form.guestName} onChange={e => updateForm('guestName', e.target.value)} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Email</Label><Input type="email" value={form.guestEmail || ''} onChange={e => updateForm('guestEmail', e.target.value)} /></div>
                <div><Label>Téléphone</Label><Input value={form.guestPhone || ''} onChange={e => updateForm('guestPhone', e.target.value)} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Arrivée</Label><Input type="date" value={form.checkIn} onChange={e => updateForm('checkIn', e.target.value)} /></div>
                <div><Label>Départ</Label><Input type="date" value={form.checkOut} onChange={e => updateForm('checkOut', e.target.value)} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Plateforme</Label>
                  <Select value={form.platform} onValueChange={v => updateForm('platform', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{Object.entries(PLATFORM_TYPES).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Statut</Label>
                  <Select value={form.status} onValueChange={v => updateForm('status', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="confirmee">Confirmée</SelectItem>
                      <SelectItem value="terminee">Terminée</SelectItem>
                      <SelectItem value="annulee">Annulée</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div><Label>Tarif/nuit (€)</Label><Input type="number" value={form.nightlyRate || ''} onChange={e => updateForm('nightlyRate', +e.target.value)} /></div>
                <div><Label>Ménage (€)</Label><Input type="number" value={form.cleaningFees || ''} onChange={e => updateForm('cleaningFees', +e.target.value)} /></div>
                <div><Label>Commission (€)</Label><Input type="number" value={form.platformFees || ''} onChange={e => updateForm('platformFees', +e.target.value)} /></div>
              </div>
              {form.checkIn && form.checkOut && (
                <div className="bg-muted rounded-lg p-3 text-sm space-y-1">
                  <div>{calcNights(form.checkIn, form.checkOut)} nuits × {formatCurrency(form.nightlyRate)}</div>
                  <div className="font-semibold">Total estimé : {formatCurrency((form.nightlyRate * calcNights(form.checkIn, form.checkOut)) + form.cleaningFees - form.platformFees)}</div>
                </div>
              )}
              <div><Label>Notes</Label><Textarea value={form.notes || ''} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} /></div>
              <Button onClick={save} className="w-full">{editing ? 'Enregistrer' : 'Ajouter'}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {monthlyData.map(m => (
          <Card key={`${m.year}-${m.month}`} className="shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-primary" />
                {m.label}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs space-y-1">
              {m.reservations.length === 0 ? (
                <span className="text-muted-foreground">Aucune réservation</span>
              ) : m.reservations.map(r => (
                <div key={r.id} className="flex justify-between items-center bg-accent/50 rounded px-2 py-1">
                  <span>{r.guestName}</span>
                  <Badge variant="outline" className="text-[10px]">{PLATFORM_TYPES[r.platform]}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="shadow-md">
        <CardHeader><CardTitle>Toutes les réservations</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Bien</TableHead>
                <TableHead>Voyageur</TableHead>
                <TableHead>Arrivée</TableHead>
                <TableHead>Départ</TableHead>
                <TableHead>Nuits</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Plateforme</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reservations.sort((a, b) => b.checkIn.localeCompare(a.checkIn)).map(r => (
                <TableRow key={r.id}>
                  <TableCell>{propName(r.propertyId)}</TableCell>
                  <TableCell className="font-medium">{r.guestName}</TableCell>
                  <TableCell>{formatDateFR(r.checkIn)}</TableCell>
                  <TableCell>{formatDateFR(r.checkOut)}</TableCell>
                  <TableCell>{r.nights}</TableCell>
                  <TableCell className="font-medium">{formatCurrency(r.totalAmount)}</TableCell>
                  <TableCell><Badge variant="outline">{PLATFORM_TYPES[r.platform]}</Badge></TableCell>
                  <TableCell><Badge className={statusColor(r.status)}>{statusLabel(r.status)}</Badge></TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(r)}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleRemove(r.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {reservations.length === 0 && <TableRow><TableCell colSpan={9} className="text-center text-muted-foreground py-8">Aucune réservation</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
