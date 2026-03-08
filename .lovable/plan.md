

## Plan : Import des réservations via iCal (Airbnb & Booking.com)

Airbnb et Booking.com exportent chacun un lien iCal (.ics) pour chaque annonce. On va créer une fonctionnalité qui permet de coller ces liens et de synchroniser automatiquement les réservations.

### Comment ça marche

1. Dans les paramètres de chaque **bien** (Property), vous ajoutez vos liens iCal Airbnb et/ou Booking
2. Un bouton "Synchroniser" sur la page Réservations appelle une fonction backend qui récupère les calendriers iCal, parse les événements et crée/met à jour les réservations en base
3. Les doublons sont détectés par combinaison (property_id + check_in + check_out + guest_name)

### Modifications techniques

**1. Migration base de données** — Ajouter des colonnes iCal sur la table `properties`
- `ical_airbnb_url` (text, nullable)
- `ical_booking_url` (text, nullable)

**2. Edge Function `sync-ical`** — Fonction backend qui :
- Reçoit un `property_id` et le `user_id` authentifié
- Lit les URLs iCal depuis la table `properties`
- Fetch les fichiers .ics, parse les événements VEVENT (dates, summary/guest name)
- Upsert les réservations dans la table `reservations` (évite les doublons)
- Retourne le nombre de réservations importées/mises à jour

**3. Page Properties** — Ajouter deux champs optionnels dans le formulaire de bien :
- "Lien iCal Airbnb"
- "Lien iCal Booking.com"

**4. Page Reservations** — Ajouter un bouton "Synchroniser iCal" qui :
- Appelle l'edge function pour chaque bien ayant un lien iCal configuré
- Affiche un toast avec le résultat (ex: "3 nouvelles réservations importées")
- Rafraîchit la liste des réservations

### Où trouver les liens iCal
- **Airbnb** : Annonce → Calendrier → Disponibilité → Exporter le calendrier → copier le lien
- **Booking.com** : Extranet → Calendrier → Synchronisation du calendrier → copier le lien iCal

