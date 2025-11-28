-- Update RLS policies to allow superadmin access to all data

-- Restaurantes: superadmin can view and manage all restaurants
CREATE POLICY "Superadmin can view all restaurantes"
ON public.restaurantes
FOR SELECT
USING (has_role(auth.uid(), 'superadmin'::app_role));

CREATE POLICY "Superadmin can update all restaurantes"
ON public.restaurantes
FOR UPDATE
USING (has_role(auth.uid(), 'superadmin'::app_role));

-- Clientes: superadmin can view all clients
CREATE POLICY "Superadmin can view all clientes"
ON public.clientes
FOR SELECT
USING (has_role(auth.uid(), 'superadmin'::app_role));

-- Conversiones: superadmin can view all conversions
CREATE POLICY "Superadmin can view all conversiones"
ON public.conversiones
FOR ALL
USING (has_role(auth.uid(), 'superadmin'::app_role));

-- Premios: superadmin can view all prizes
CREATE POLICY "Superadmin can view all premios"
ON public.premios
FOR ALL
USING (has_role(auth.uid(), 'superadmin'::app_role));

-- Referidos: superadmin can view all referrals
CREATE POLICY "Superadmin can view all referidos"
ON public.referidos
FOR ALL
USING (has_role(auth.uid(), 'superadmin'::app_role));

-- Usuarios: superadmin can view all users
CREATE POLICY "Superadmin can view all usuarios"
ON public.usuarios
FOR ALL
USING (has_role(auth.uid(), 'superadmin'::app_role));

-- Validaciones: superadmin can view all validations
CREATE POLICY "Superadmin can view all validaciones"
ON public.validaciones
FOR ALL
USING (has_role(auth.uid(), 'superadmin'::app_role));

-- Suscripciones: superadmin can view all subscriptions
CREATE POLICY "Superadmin can view all suscripciones"
ON public.suscripciones
FOR ALL
USING (has_role(auth.uid(), 'superadmin'::app_role));

-- User roles: superadmin can view and manage all user roles
CREATE POLICY "Superadmin can manage all roles"
ON public.user_roles
FOR ALL
USING (has_role(auth.uid(), 'superadmin'::app_role));