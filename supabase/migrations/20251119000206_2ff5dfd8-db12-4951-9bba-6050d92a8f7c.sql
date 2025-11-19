-- Add monto_minimo_consumo column to premios table
ALTER TABLE premios 
ADD COLUMN monto_minimo_consumo NUMERIC(10, 2) DEFAULT NULL;