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
        .from("conversiones")
        .select(`
          *,
          cliente:clientes(nombre)
        `)
        .eq("restaurante_id", restaurante?.id)
        .order("fecha_conversion", { ascending: false });

      if (error) throw error;
      setConversiones(data || []);
    } catch (error: any) {
      toast.error("Error al cargar conversiones");
    } finally {
      setLoading(false);
    }
  };

  const getEstadoBadge = (estado: string) => {
    const variants: any = {
      pendiente: "secondary",
      confirmado: "default",
      rechazado: "destructive",
    };
    return <Badge variant={variants[estado] || "secondary"}>{estado}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Conversiones</h1>
          <p className="text-muted-foreground">
            Gestiona las conversiones de referidos
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nueva Conversión
        </Button>
      </div>

      <ConversionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={fetchConversiones}
      />

      <Card>
        <CardHeader>
          <CardTitle>Lista de Conversiones</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center py-8">Cargando...</p>
          ) : conversiones.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No hay conversiones registradas
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Código</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {conversiones.map((conversion) => (
                  <TableRow key={conversion.id}>
                    <TableCell>
                      {new Date(conversion.fecha_conversion).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{conversion.cliente?.nombre || "-"}</TableCell>
                    <TableCell>{conversion.codigo_referente || "-"}</TableCell>
                    <TableCell>{getEstadoBadge(conversion.estado)}</TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline">
                        Ver Detalle
                      </Button>
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

export default Conversiones;
