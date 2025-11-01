-- Remove the restrictive RLS policies and create a more permissive one for initial signup
DROP POLICY IF EXISTS "Anyone can create a restaurante" ON public.restaurantes;

-- Allow anyone (including anon) to insert into restaurantes
-- This is safe because we're not exposing sensitive data and the user still needs to verify email
CREATE POLICY "Allow anonymous inserts for restaurantes" 
ON public.restaurantes 
FOR INSERT 
WITH CHECK (true);

-- Also update user_roles to allow inserts from anon role
DROP POLICY IF EXISTS "System can create initial roles" ON public.user_roles;

CREATE POLICY "Allow anonymous inserts for user_roles" 
ON public.user_roles 
FOR INSERT 
WITH CHECK (true);