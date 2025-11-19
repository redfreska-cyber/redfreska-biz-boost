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
import { Switch } from "@/components/ui/switch";
import { PremioDialog } from "@/components/PremioDialog";

const Premios = () => {
  const { restaurante } = useAuth();
  const [premios, setPremios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPremio, setSelectedPremio] = useState<any>(null);

  useEffect(() => {
    if (restaurante?.id) {
      fetchPremios();
    }
  }, [restaurante]);

  const fetchPremios = async () => {
    try {
      const { data, error } = await supabase
        .from("premios")
        .select("*")
        .eq("restaurante_id", restaurante?.id)
        .order("orden", { ascending: true });

      if (error) throw error;
      setPremios(data || []);
    } catch (error: any) {
      toast.error("Error al cargar premios");
    } finally {
      setLoading(false);
    }
  };

  const toggleActive = async (id: string, currentState: boolean) => {
    try {
      const { error } = await supabase
        .from("premios")
        .update({ is_active: !currentState })
        .eq("id", id);

      if (error) throw error;
      toast.success("Premio actualizado");
      fetchPremios();
    } catch (error: any) {
      toast.error("Error al actualizar premio");
    }
  };

  const deletePremio = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este premio?")) return;
    
    try {
      const { error } = await supabase
        .from("premios")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast.success("Premio eliminado");
      fetchPremios();
    } catch (error: any) {
      toast.error("Error al eliminar premio");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Premios</h1>
          <p className="text-muted-foreground">
            Configura los premios por referidos
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Premio
        </Button>
      </div>

      <PremioDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setSelectedPremio(null);
        }}
        onSuccess={fetchPremios}
        premio={selectedPremio}
      />

      <Card>
        <CardHeader>
          <CardTitle>Lista de Premios</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center py-8">Cargando...</p>
          ) : premios.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No hay premios configurados
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Orden</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Umbral</TableHead>
                  <TableHead>Monto Mínimo (S/)</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Activo</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {premios.map((premio) => (
                  <TableRow key={premio.id}>
                    <TableCell>{premio.orden}</TableCell>
                    <TableCell>{premio.descripcion}</TableCell>
                    <TableCell>{premio.umbral ? `${premio.umbral} referidos` : 'N/A'}</TableCell>
                    <TableCell>
                      {premio.monto_minimo_consumo ? `S/ ${parseFloat(premio.monto_minimo_consumo).toFixed(2)}` : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Badge>{premio.tipo_premio}</Badge>
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={premio.is_active}
                        onCheckedChange={() => toggleActive(premio.id, premio.is_active)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            setSelectedPremio(premio);
                            setDialogOpen(true);
                          }}
                        >
                          Editar
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => deletePremio(premio.id)}
                        >
                          Eliminar
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

export default Premios;
