import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const Validaciones = () => {
  const { restaurante } = useAuth();
  const [validaciones, setValidaciones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (restaurante?.id) {
      fetchValidaciones();
    }
  }, [restaurante]);

  const fetchValidaciones = async () => {
    try {
      // Fetch existing validaciones
      const { data: validacionesData, error: validacionesError } = await supabase
        .from("validaciones")
        .select(`
          *,
          cliente:clientes(nombre, restaurante_id),
          premio:premios(descripcion, umbral, detalle_premio)
        `)
        .order("fecha_validacion", { ascending: false });

      if (validacionesError) throw validacionesError;

      // Fetch clientes and count their referidos
      const { data: clientesData, error: clientesError } = await supabase
        .from("clientes")
        .select("id, nombre, restaurante_id")
        .eq("restaurante_id", restaurante?.id);

      if (clientesError) throw clientesError;

      // Fetch premios
      const { data: premiosData, error: premiosError } = await supabase
        .from("premios")
        .select("*")
        .eq("restaurante_id", restaurante?.id)
        .eq("is_active", true)
        .order("umbral", { ascending: true });

      if (premiosError) throw premiosError;

      // Count referidos for each cliente
      const { data: referidosData, error: referidosError } = await supabase
        .from("referidos")
        .select("cliente_owner_id")
        .eq("restaurante_id", restaurante?.id);

      if (referidosError) throw referidosError;

      // Group referidos by cliente
      const referidosCounts: { [key: string]: number } = {};
      referidosData?.forEach((ref) => {
        referidosCounts[ref.cliente_owner_id] = (referidosCounts[ref.cliente_owner_id] || 0) + 1;
      });

      // Check for new validaciones to create
      const newValidaciones = [];
      for (const cliente of clientesData || []) {
        const count = referidosCounts[cliente.id] || 0;
        
        for (const premio of premiosData || []) {
          if (count >= premio.umbral) {
            // Check if validation already exists
            const exists = validacionesData?.some(
              (v) => v.cliente_id === cliente.id && (v as any).premio_id === premio.id
            );
            
            if (!exists) {
              newValidaciones.push({
                cliente_id: cliente.id,
                premio_id: premio.id,
                conversiones_realizadas: count,
                validado: false,
              });
            }
          }
        }
      }

      // Insert new validaciones
      if (newValidaciones.length > 0) {
        const { error: insertError } = await supabase
          .from("validaciones")
          .insert(newValidaciones);

        if (insertError) throw insertError;

        // Refetch validaciones
        const { data: updatedData, error: refetchError } = await supabase
          .from("validaciones")
          .select(`
            *,
            cliente:clientes(nombre, restaurante_id),
            premio:premios(descripcion, umbral, detalle_premio)
          `)
          .order("fecha_validacion", { ascending: false });

        if (refetchError) throw refetchError;
        
        const filtered = updatedData?.filter((v) => v.cliente?.restaurante_id === restaurante?.id) || [];
        setValidaciones(filtered);
      } else {
        const filtered = validacionesData?.filter((v) => v.cliente?.restaurante_id === restaurante?.id) || [];
        setValidaciones(filtered);
      }
    } catch (error: any) {
      toast.error("Error al cargar validaciones");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAprobar = async (validacionId: string) => {
    try {
      const { error } = await supabase
        .from("validaciones")
        .update({ validado: true, motivo: "Premio entregado" })
        .eq("id", validacionId);

      if (error) throw error;

      toast.success("Validación aprobada");
      fetchValidaciones();
    } catch (error: any) {
      toast.error("Error al aprobar validación");
    }
  };

  const handleRechazar = async (validacionId: string) => {
    try {
      const { error } = await supabase
        .from("validaciones")
        .delete()
        .eq("id", validacionId);

      if (error) throw error;

      toast.success("Validación rechazada");
      fetchValidaciones();
    } catch (error: any) {
      toast.error("Error al rechazar validación");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Validaciones</h1>
          <p className="text-muted-foreground">
            Aprueba o rechaza clientes
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Validaciones</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center py-8">Cargando...</p>
          ) : validaciones.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No hay validaciones pendientes
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Premio</TableHead>
                  <TableHead>Conversiones</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {validaciones.map((validacion) => (
                  <TableRow key={validacion.id}>
                    <TableCell>{validacion.cliente?.nombre || "-"}</TableCell>
                    <TableCell>{validacion.premio?.descripcion || "-"}</TableCell>
                    <TableCell>
                      {validacion.conversiones_realizadas || 0} / {validacion.premio?.umbral || 0}
                    </TableCell>
                    <TableCell>
                      {new Date(validacion.fecha_validacion).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant={validacion.validado ? "default" : "secondary"}>
                        {validacion.validado ? "Entregado" : "Pendiente"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {!validacion.validado && (
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleAprobar(validacion.id)}
                          >
                            Aprobar
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => handleRechazar(validacion.id)}
                          >
                            Rechazar
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Validaciones;
