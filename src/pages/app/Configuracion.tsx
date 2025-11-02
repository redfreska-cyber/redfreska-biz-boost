import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

const Configuracion = () => {
  const { restaurante, setRestaurante } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombre: "",
    ruc: "",
    telefono: "",
    direccion: "",
    correo: "",
  });

  useEffect(() => {
    if (restaurante) {
      setFormData({
        nombre: restaurante.nombre || "",
        ruc: restaurante.ruc || "",
        telefono: restaurante.telefono || "",
        direccion: restaurante.direccion || "",
        correo: restaurante.correo || "",
      });
    }
  }, [restaurante]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from("restaurantes")
        .update({
          nombre: formData.nombre,
          ruc: formData.ruc,
          telefono: formData.telefono,
          direccion: formData.direccion,
        })
        .eq("id", restaurante?.id)
        .select()
        .single();

      if (error) throw error;

      setRestaurante({
        id: data.id,
        nombre: data.nombre,
        correo: data.correo,
        ruc: data.ruc,
        telefono: data.telefono,
        direccion: data.direccion,
      });

      toast.success("Configuración actualizada");
    } catch (error: any) {
      toast.error("Error al actualizar configuración");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Configuración</h1>
        <p className="text-muted-foreground">
          Actualiza los datos de tu restaurante
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información del Restaurante</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre del Restaurante</Label>
              <Input
                id="nombre"
                value={formData.nombre}
                onChange={(e) =>
                  setFormData({ ...formData, nombre: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ruc">RUC</Label>
              <Input
                id="ruc"
                value={formData.ruc}
                onChange={(e) =>
                  setFormData({ ...formData, ruc: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="correo">Correo</Label>
              <Input
                id="correo"
                type="email"
                value={formData.correo}
                disabled
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="telefono">Teléfono</Label>
              <Input
                id="telefono"
                value={formData.telefono}
                onChange={(e) =>
                  setFormData({ ...formData, telefono: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="direccion">Dirección</Label>
              <Input
                id="direccion"
                value={formData.direccion}
                onChange={(e) =>
                  setFormData({ ...formData, direccion: e.target.value })
                }
              />
            </div>

            <Button type="submit" disabled={loading}>
              {loading ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Configuracion;
