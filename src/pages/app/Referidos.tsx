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
import { ReferidoDialog } from "@/components/ReferidoDialog";

const Referidos = () => {
  const { restaurante } = useAuth();
  const [referidos, setReferidos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (restaurante?.id) {
      fetchReferidos();
    }
  }, [restaurante]);

  const fetchReferidos = async () => {
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
      setReferidos(data || []);
    } catch (error: any) {
      toast.error("Error al cargar referidos");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Conversiones</h1>
          <p className="text-muted-foreground">
            Gestiona las conversiones de tus clientes
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Registrar Conversión
        </Button>
      </div>

      <ReferidoDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={fetchReferidos}
      />

      <Card>
        <CardHeader>
          <CardTitle>Lista de Conversiones</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center py-8">Cargando...</p>
          ) : referidos.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No hay referidos registrados
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente Dueño</TableHead>
                  <TableHead>Código Usado</TableHead>
                  <TableHead>Cliente Referido</TableHead>
                  <TableHead>Fecha</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {referidos.map((referido) => (
                  <TableRow key={referido.id}>
                    <TableCell>{referido.cliente_owner?.nombre || "-"}</TableCell>
                    <TableCell>{referido.codigo_referido}</TableCell>
                    <TableCell>{referido.dni_referido || "Pendiente"}</TableCell>
                    <TableCell>{new Date(referido.fecha_registro).toLocaleDateString()}</TableCell>
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

export default Referidos;
