import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ReferidoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const ReferidoDialog = ({ open, onOpenChange, onSuccess }: ReferidoDialogProps) => {
  const { restaurante } = useAuth();
  const [loading, setLoading] = useState(false);
  const [clientes, setClientes] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    cliente_owner_id: "",
    codigo_referido: "",
    cliente_referido_id: "",
  });

  useEffect(() => {
    if (restaurante?.id && open) {
      fetchClientes();
    }
  }, [restaurante?.id, open]);

  const fetchClientes = async () => {
    try {
      const { data, error } = await supabase
        .from("clientes")
        .select("id, nombre, codigo_referido")
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
      const { error } = await supabase.from("referidos").insert({
        restaurante_id: restaurante?.id,
        cliente_owner_id: formData.cliente_owner_id,
        codigo_referido: formData.codigo_referido,
        cliente_referido_id: formData.cliente_referido_id || null,
      });

      if (error) throw error;

      toast.success("Referido registrado exitosamente");
      onSuccess();
      onOpenChange(false);
      setFormData({ cliente_owner_id: "", codigo_referido: "", cliente_referido_id: "" });
    } catch (error: any) {
      toast.error(error.message || "Error al registrar referido");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registrar Referido</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="cliente_owner_id">Cliente Dueño</Label>
            <Select
              value={formData.cliente_owner_id}
              onValueChange={(value) => {
                setFormData({ ...formData, cliente_owner_id: value });
                const cliente = clientes.find((c) => c.id === value);
                if (cliente) {
                  setFormData((prev) => ({ ...prev, codigo_referido: cliente.codigo_referido || "" }));
                }
              }}
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
            <Label htmlFor="codigo_referido">Código Usado</Label>
            <Input
              id="codigo_referido"
              value={formData.codigo_referido}
              onChange={(e) => setFormData({ ...formData, codigo_referido: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="cliente_referido_id">Cliente Referido (Opcional)</Label>
            <Select
              value={formData.cliente_referido_id}
              onValueChange={(value) => setFormData({ ...formData, cliente_referido_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un cliente (opcional)" />
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
