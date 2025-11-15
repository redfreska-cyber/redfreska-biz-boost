-- Add slug field to restaurantes table for public registration URLs
ALTER TABLE public.restaurantes 
ADD COLUMN IF NOT EXISTS slug text UNIQUE;

-- Create index for faster slug lookups
CREATE INDEX IF NOT EXISTS idx_restaurantes_slug ON public.restaurantes(slug);

-- Add comment to explain the column
COMMENT ON COLUMN public.restaurantes.slug IS 'Unique URL slug for public client registration (e.g., pollos-brasa-miraflores)';
