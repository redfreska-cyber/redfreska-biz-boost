-- Add premio_id column to clientes table to store the selected prize
ALTER TABLE clientes 
ADD COLUMN premio_id uuid REFERENCES premios(id) ON DELETE SET NULL;