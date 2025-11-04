-- Add dni_referido column to referidos table
ALTER TABLE referidos ADD COLUMN IF NOT EXISTS dni_referido text;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_referidos_dni_referido ON referidos(dni_referido);