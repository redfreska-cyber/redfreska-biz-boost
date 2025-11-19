import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

interface PremioDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  premio?: any;
}

export const PremioDialog = ({ open, onOpenChange, onSuccess, premio }: PremioDialogProps) => {
  const { restaurante } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    orden: premio?.orden || 1,
    descripcion: premio?.descripcion || "",
    umbral: premio?.umbral || 1,
    tipo_premio: premio?.tipo_premio || "cliente",
    detalle_premio: premio?.detalle_premio || "",
    monto_minimo_consumo: premio?.monto_minimo_consumo || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const dataToSave = {
        orden: formData.orden,
        descripcion: formData.descripcion,
        umbral: formData.tipo_premio === "cliente" ? formData.umbral : null,
        tipo_premio: formData.tipo_premio,
        detalle_premio: formData.detalle_premio,
        monto_minimo_consumo: formData.monto_minimo_consumo || null,
      };

      if (premio) {
        // Actualizar premio existente
        const { error } = await supabase
          .from("premios")
          .update(dataToSave)
          .eq("id", premio.id);

        if (error) throw error;
        toast.success("Premio actualizado exitosamente");
      } else {
        // Crear nuevo premio
        const { error } = await supabase.from("premios").insert({
          restaurante_id: restaurante?.id,
          ...dataToSave,
          is_active: true,
        });

        if (error) throw error;
        toast.success("Premio creado exitosamente");
      }

      onSuccess();
      onOpenChange(false);
      setFormData({ orden: 1, descripcion: "", umbral: 1, tipo_premio: "cliente", detalle_premio: "", monto_minimo_consumo: "" });
    } catch (error: any) {
      toast.error(error.message || `Error al ${premio ? "actualizar" : "crear"} premio`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{premio ? "Editar Premio" : "Nuevo Premio"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="orden">Orden</Label>
            <Input
              id="orden"
              type="number"
              min="1"
              value={formData.orden}
              onChange={(e) => setFormData({ ...formData, orden: parseInt(e.target.value) || 1 })}
              required
            />
          </div>

          <div>
            <Label htmlFor="descripcion">Descripción</Label>
            <Textarea
              id="descripcion"
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="tipo_premio">Tipo de premio (¿para quién es?)</Label>
            <Select
              value={formData.tipo_premio}
              onValueChange={(value) => setFormData({ ...formData, tipo_premio: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona el tipo de premio" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cliente">Cliente</SelectItem>
                <SelectItem value="referido">Referido</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.tipo_premio === "cliente" && (
            <div>
              <Label htmlFor="umbral">Umbral (cantidad de referidos)</Label>
              <Input
                id="umbral"
                type="number"
                min="1"
                value={formData.umbral}
                onChange={(e) => setFormData({ ...formData, umbral: parseInt(e.target.value) || 1 })}
                required
              />
            </div>
          )}

          <div>
            <Label htmlFor="monto_minimo_consumo">Monto Mínimo de Consumo (S/)</Label>
            <Input
              id="monto_minimo_consumo"
              type="number"
              min="0"
              step="0.01"
              value={formData.monto_minimo_consumo}
              onChange={(e) => setFormData({ ...formData, monto_minimo_consumo: e.target.value })}
              placeholder="0.00"
            />
          </div>

          <div>
            <Label htmlFor="detalle_premio">Detalle del Premio</Label>
            <Textarea
              id="detalle_premio"
              value={formData.detalle_premio}
              onChange={(e) => setFormData({ ...formData, detalle_premio: e.target.value })}
              placeholder="Describe los detalles del premio"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || !formData.tipo_premio}>
              {loading ? (premio ? "Actualizando..." : "Creando...") : (premio ? "Actualizar" : "Crear")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
