-- Add premio_id and conversiones_realizadas columns to validaciones table
ALTER TABLE validaciones ADD COLUMN IF NOT EXISTS premio_id uuid;
ALTER TABLE validaciones ADD COLUMN IF NOT EXISTS conversiones_realizadas integer DEFAULT 0;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_validaciones_cliente_id ON validaciones(cliente_id);
CREATE INDEX IF NOT EXISTS idx_validaciones_premio_id ON validaciones(premio_id);

-- Add foreign key constraint
ALTER TABLE validaciones 
ADD CONSTRAINT validaciones_premio_id_fkey 
FOREIGN KEY (premio_id) REFERENCES premios(id) ON DELETE CASCADE;

-- Enable RLS on validaciones table
ALTER TABLE validaciones ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for validaciones
CREATE POLICY "Users can view validaciones from their restaurante" 
ON validaciones 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM clientes 
    WHERE clientes.id = validaciones.cliente_id 
    AND clientes.restaurante_id = get_user_restaurante_id(auth.uid())
  )
);

CREATE POLICY "Users can update validaciones from their restaurante" 
ON validaciones 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM clientes 
    WHERE clientes.id = validaciones.cliente_id 
    AND clientes.restaurante_id = get_user_restaurante_id(auth.uid())
  )
);

CREATE POLICY "Users can insert validaciones from their restaurante" 
ON validaciones 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM clientes 
    WHERE clientes.id = validaciones.cliente_id 
    AND clientes.restaurante_id = get_user_restaurante_id(auth.uid())
  )
);

CREATE POLICY "Users can delete validaciones from their restaurante" 
ON validaciones 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM clientes 
    WHERE clientes.id = validaciones.cliente_id 
    AND clientes.restaurante_id = get_user_restaurante_id(auth.uid())
  )
);