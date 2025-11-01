-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'empleado');

-- Create user_roles table for secure role management
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  restaurante_id UUID REFERENCES public.restaurantes(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'empleado',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, restaurante_id)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Create function to get user's restaurante_id
CREATE OR REPLACE FUNCTION public.get_user_restaurante_id(_user_id UUID)
RETURNS UUID
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT restaurante_id
  FROM public.user_roles
  WHERE user_id = _user_id
  LIMIT 1
$$;

-- RLS Policies for restaurantes
ALTER TABLE public.restaurantes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own restaurante"
ON public.restaurantes
FOR SELECT
TO authenticated
USING (id = public.get_user_restaurante_id(auth.uid()));

CREATE POLICY "Users can update their own restaurante"
ON public.restaurantes
FOR UPDATE
TO authenticated
USING (id = public.get_user_restaurante_id(auth.uid()));

CREATE POLICY "Anyone can create a restaurante"
ON public.restaurantes
FOR INSERT
TO authenticated
WITH CHECK (true);

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Admins can manage roles in their restaurante"
ON public.user_roles
FOR ALL
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') 
  AND restaurante_id = public.get_user_restaurante_id(auth.uid())
);

CREATE POLICY "System can create initial roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- RLS Policies for clientes
CREATE POLICY "Users can view clientes from their restaurante"
ON public.clientes
FOR SELECT
TO authenticated
USING (restaurante_id = public.get_user_restaurante_id(auth.uid()));

CREATE POLICY "Users can insert clientes to their restaurante"
ON public.clientes
FOR INSERT
TO authenticated
WITH CHECK (restaurante_id = public.get_user_restaurante_id(auth.uid()));

CREATE POLICY "Users can update clientes from their restaurante"
ON public.clientes
FOR UPDATE
TO authenticated
USING (restaurante_id = public.get_user_restaurante_id(auth.uid()));

-- RLS Policies for other tables
CREATE POLICY "Users can view referidos from their restaurante"
ON public.referidos
FOR ALL
TO authenticated
USING (restaurante_id = public.get_user_restaurante_id(auth.uid()));

CREATE POLICY "Users can manage conversiones from their restaurante"
ON public.conversiones
FOR ALL
TO authenticated
USING (restaurante_id = public.get_user_restaurante_id(auth.uid()));

CREATE POLICY "Users can manage premios from their restaurante"
ON public.premios
FOR ALL
TO authenticated
USING (restaurante_id = public.get_user_restaurante_id(auth.uid()));