-- Actualizar todos los referidos existentes para que aparezcan como confirmados
UPDATE referidos SET consumo_realizado = true WHERE consumo_realizado = false;