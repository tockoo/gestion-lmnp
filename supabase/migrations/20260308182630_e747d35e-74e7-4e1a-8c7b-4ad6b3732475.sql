ALTER TABLE public.properties 
  ADD COLUMN ical_airbnb_url text DEFAULT NULL,
  ADD COLUMN ical_booking_url text DEFAULT NULL;