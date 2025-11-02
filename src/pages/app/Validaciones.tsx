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
      const { data, error } = await supabase
        .from("validaciones")
        .select(`
          *,
          cliente:clientes(nombre, restaurante_id)
        `)
        .order("fecha_validacion", { ascending: false });

      if (error) throw error;
      
      const filtered = data?.filter((v) => v.cliente?.restaurante_id === restaurante?.id) || [];
      setValidaciones(filtered);
    } catch (error: any) {
      toast.error("Error al cargar validaciones");
    } finally {
      setLoading(false);
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
                  <TableHead>Fecha</TableHead>
                  <TableHead>Validado</TableHead>
                  <TableHead>Motivo</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {validaciones.map((validacion) => (
                  <TableRow key={validacion.id}>
                    <TableCell>{validacion.cliente?.nombre || "-"}</TableCell>
                    <TableCell>
                      {new Date(validacion.fecha_validacion).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant={validacion.validado ? "default" : "secondary"}>
                        {validacion.validado ? "Sí" : "No"}
                      </Badge>
                    </TableCell>
                    <TableCell>{validacion.motivo || "-"}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          Aprobar
                        </Button>
                        <Button size="sm" variant="destructive">
                          Rechazar
                        </Button>
                      </div>
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
