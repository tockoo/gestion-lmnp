-- Create storage bucket for invoice attachments
INSERT INTO storage.buckets (id, name, public) VALUES ('invoices', 'invoices', true);

-- Allow public read access
CREATE POLICY "Invoice files are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'invoices');

-- Allow anyone to upload invoices (no auth in this app)
CREATE POLICY "Anyone can upload invoices"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'invoices');

-- Allow anyone to delete invoices
CREATE POLICY "Anyone can delete invoices"
ON storage.objects FOR DELETE
USING (bucket_id = 'invoices');