import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
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
import { ConversionDialog } from "@/components/ConversionDialog";

const Conversiones = () => {
  const { restaurante } = useAuth();
  const [conversiones, setConversiones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (restaurante?.id) {
      fetchConversiones();
    }
  }, [restaurante]);

  const fetchConversiones = async () => {
    try {
      const { data, error } = await supabase
        .from("referidos")
        .select(`
          *,
          cliente_owner:clientes!referidos_cliente_owner_id_fkey(nombre),
          cliente_referido:clientes!referidos_cliente_referido_id_fkey(nombre)
        `)
        .eq("restaurante_id", restaurante?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setConversiones(data || []);
    } catch (error: any) {
      toast.error("Error al cargar referidos");
    } finally {
      setLoading(false);
    }
  };

  const getConsumoRealizadoBadge = (consumo: boolean) => {
    return (
      <Badge variant={consumo ? "default" : "secondary"}>
        {consumo ? "Confirmado" : "Pendiente"}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Referidos</h1>
          <p className="text-muted-foreground">
            Gestiona los referidos de tus clientes
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Referido
        </Button>
      </div>

      <ConversionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={fetchConversiones}
      />

      <Card>
        <CardHeader>
          <CardTitle>Lista de Referidos</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center py-8">Cargando...</p>
          ) : conversiones.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No hay referidos registrados
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Cliente Dueño</TableHead>
                  <TableHead>Código</TableHead>
                  <TableHead>Cliente Referido</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {conversiones.map((conversion) => (
                  <TableRow key={conversion.id}>
                    <TableCell>
                      {new Date(conversion.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{conversion.cliente_owner?.nombre || "-"}</TableCell>
                    <TableCell>{conversion.codigo_referido || "-"}</TableCell>
                    <TableCell>{conversion.dni_referido || "-"}</TableCell>
                    <TableCell>{getConsumoRealizadoBadge(conversion.consumo_realizado)}</TableCell>
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

export default Conversiones;
