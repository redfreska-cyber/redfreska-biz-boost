-- Agregar campo dni_referido a la tabla conversiones
ALTER TABLE public.conversiones
ADD COLUMN dni_referido text;