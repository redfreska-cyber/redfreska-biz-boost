-- Create storage bucket for premio images
INSERT INTO storage.buckets (id, name, public)
VALUES ('premios', 'premios', true);

-- Add imagen_url column to premios table
ALTER TABLE public.premios
ADD COLUMN imagen_url text;

-- Storage policies for premios bucket
CREATE POLICY "Premio images are publicly accessible"
ON storage.objects
FOR SELECT
USING (bucket_id = 'premios');

CREATE POLICY "Authenticated users can upload premio images"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'premios' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "Users can update their restaurant's premio images"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'premios' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "Users can delete their restaurant's premio images"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'premios' AND
  auth.role() = 'authenticated'
);