-- Add public read access for active premios
CREATE POLICY "Public users can view active premios"
ON public.premios
FOR SELECT
TO public
USING (is_active = true);