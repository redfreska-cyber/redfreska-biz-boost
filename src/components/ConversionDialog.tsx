import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ConversionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const ConversionDialog = ({ open, onOpenChange, onSuccess }: ConversionDialogProps) => {
  const { restaurante } = useAuth();
  const [loading, setLoading] = useState(false);
  const [clientes, setClientes] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    cliente_id: "",
    codigo_referente: "",
    estado: "pendiente",
  });

  useEffect(() => {
    if (restaurante?.id && open) {
      fetchClientes();
    }
  }, [restaurante, open]);

  const fetchClientes = async () => {
    try {
      const { data, error } = await supabase
        .from("clientes")
        .select("id, nombre")
        .eq("restaurante_id", restaurante?.id);

      if (error) throw error;
      setClientes(data || []);
    } catch (error: any) {
      toast.error("Error al cargar clientes");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from("conversiones").insert({
        restaurante_id: restaurante?.id,
        cliente_id: formData.cliente_id,
        codigo_referente: formData.codigo_referente,
        estado: formData.estado,
      });

      if (error) throw error;

      // También crear el registro en referidos si es confirmado
      if (formData.estado === "confirmado" && formData.codigo_referente) {
        // Buscar el cliente owner por código
        const { data: clienteOwner } = await supabase
          .from("clientes")
          .select("id")
          .eq("codigo_referido", formData.codigo_referente)
          .eq("restaurante_id", restaurante?.id)
          .single();

        if (clienteOwner) {
          await supabase.from("referidos").insert({
            restaurante_id: restaurante?.id,
            cliente_owner_id: clienteOwner.id,
            codigo_referido: formData.codigo_referente,
            cliente_referido_id: formData.cliente_id,
            consumo_realizado: true,
          });
        }
      }

      toast.success("Referido registrado exitosamente");
      onSuccess();
      onOpenChange(false);
      setFormData({ cliente_id: "", codigo_referente: "", estado: "pendiente" });
    } catch (error: any) {
      toast.error(error.message || "Error al registrar conversión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nuevo Referido</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="cliente_id">Cliente</Label>
            <Select
              value={formData.cliente_id}
              onValueChange={(value) => setFormData({ ...formData, cliente_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un cliente" />
              </SelectTrigger>
              <SelectContent>
                {clientes.map((cliente) => (
                  <SelectItem key={cliente.id} value={cliente.id}>
                    {cliente.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="codigo_referente">Código Referente</Label>
            <Input
              id="codigo_referente"
              value={formData.codigo_referente}
              onChange={(e) => setFormData({ ...formData, codigo_referente: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="estado">Estado</Label>
            <Select
              value={formData.estado}
              onValueChange={(value) => setFormData({ ...formData, estado: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pendiente">Pendiente</SelectItem>
                <SelectItem value="confirmado">Confirmado</SelectItem>
                <SelectItem value="rechazado">Rechazado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Registrando..." : "Registrar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
