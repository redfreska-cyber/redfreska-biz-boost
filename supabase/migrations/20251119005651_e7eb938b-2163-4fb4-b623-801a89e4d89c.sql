-- Add public read access for restaurantes
-- This allows the public registration form to find restaurants by slug
CREATE POLICY "Public users can view restaurantes"
ON public.restaurantes
FOR SELECT
TO public
USING (true);