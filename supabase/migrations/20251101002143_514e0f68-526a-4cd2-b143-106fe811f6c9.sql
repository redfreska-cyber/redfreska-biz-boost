-- Drop existing INSERT policy
DROP POLICY IF EXISTS "Anyone can create a restaurante" ON public.restaurantes;

-- Create new INSERT policy that explicitly allows anon role
CREATE POLICY "Anyone can create a restaurante" 
ON public.restaurantes 
FOR INSERT 
TO anon, authenticated
WITH CHECK (true);

-- Also ensure the user_roles INSERT policy allows the initial role creation
DROP POLICY IF EXISTS "System can create initial roles" ON public.user_roles;

CREATE POLICY "System can create initial roles" 
ON public.user_roles 
FOR INSERT 
TO anon, authenticated
WITH CHECK (user_id = auth.uid());