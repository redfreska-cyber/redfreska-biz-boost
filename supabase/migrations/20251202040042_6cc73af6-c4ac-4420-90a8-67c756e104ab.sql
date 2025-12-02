-- Agregar columna dominio_base a la tabla restaurantes
ALTER TABLE restaurantes ADD COLUMN IF NOT EXISTS dominio_base TEXT;