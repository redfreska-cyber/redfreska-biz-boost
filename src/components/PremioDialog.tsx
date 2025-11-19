import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { Upload, X } from "lucide-react";

interface PremioDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  premio?: any;
}

export const PremioDialog = ({ open, onOpenChange, onSuccess, premio }: PremioDialogProps) => {
  const { restaurante } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [formData, setFormData] = useState({
    orden: 1,
    descripcion: "",
    umbral: 1,
    tipo_premio: "cliente",
    detalle_premio: "",
    monto_minimo_consumo: "",
    imagen_url: "",
  });

  useEffect(() => {
    if (premio) {
      setFormData({
        orden: premio.orden || 1,
        descripcion: premio.descripcion || "",
        umbral: premio.umbral || 1,
        tipo_premio: premio.tipo_premio || "cliente",
        detalle_premio: premio.detalle_premio || "",
        monto_minimo_consumo: premio.monto_minimo_consumo || "",
        imagen_url: premio.imagen_url || "",
      });
      setImagePreview(premio.imagen_url || "");
    } else {
      setFormData({
        orden: 1,
        descripcion: "",
        umbral: 1,
        tipo_premio: "cliente",
        detalle_premio: "",
        monto_minimo_consumo: "",
        imagen_url: "",
      });
      setImagePreview("");
    }
    setImageFile(null);
  }, [premio]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview("");
    setFormData({ ...formData, imagen_url: "" });
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile) return formData.imagen_url || null;

    setUploading(true);
    try {
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${restaurante?.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('premios')
        .upload(filePath, imageFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('premios')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error: any) {
      toast.error("Error al subir imagen: " + error.message);
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const imageUrl = await uploadImage();

      const dataToSave: any = {
        orden: formData.orden,
        descripcion: formData.descripcion,
        umbral: formData.tipo_premio === "cliente" ? formData.umbral : null,
        tipo_premio: formData.tipo_premio,
        detalle_premio: formData.detalle_premio,
        monto_minimo_consumo: formData.monto_minimo_consumo ? parseFloat(formData.monto_minimo_consumo) : null,
        imagen_url: imageUrl,
      };

      if (premio) {
        const { error } = await supabase
          .from("premios")
          .update(dataToSave)
          .eq("id", premio.id);

        if (error) throw error;
        toast.success("Premio actualizado exitosamente");
      } else {
        const { error } = await supabase.from("premios").insert([{
          restaurante_id: restaurante?.id,
          ...dataToSave,
          is_active: true,
        }]);

        if (error) throw error;
        toast.success("Premio creado exitosamente");
      }

      onSuccess();
      onOpenChange(false);
      setFormData({ orden: 1, descripcion: "", umbral: 1, tipo_premio: "cliente", detalle_premio: "", monto_minimo_consumo: "", imagen_url: "" });
      setImageFile(null);
      setImagePreview("");
    } catch (error: any) {
      toast.error(error.message || `Error al ${premio ? "actualizar" : "crear"} premio`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{premio ? "Editar Premio" : "Nuevo Premio"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="imagen">Imagen del Premio</Label>
            <div className="mt-2">
              {imagePreview ? (
                <div className="relative inline-block w-full">
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="w-full max-w-xs h-48 object-cover rounded-lg mx-auto"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={removeImage}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer hover:bg-accent/50 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-10 h-10 mb-3 text-muted-foreground" />
                    <p className="mb-2 text-sm text-muted-foreground">
                      <span className="font-semibold">Click para subir</span> o arrastra y suelta
                    </p>
                    <p className="text-xs text-muted-foreground">PNG, JPG o WEBP</p>
                  </div>
                  <input
                    id="imagen"
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </label>
              )}
            </div>
          </div>

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
                <SelectItem value="cliente">Para el cliente que refiere</SelectItem>
                <SelectItem value="referido">Para el cliente referido</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.tipo_premio === "cliente" && (
            <div>
              <Label htmlFor="umbral">Umbral (número de referidos)</Label>
              <Input
                id="umbral"
                type="number"
                min="1"
                value={formData.umbral}
                onChange={(e) => setFormData({ ...formData, umbral: parseInt(e.target.value) || 1 })}
                required={formData.tipo_premio === "cliente"}
              />
            </div>
          )}

          <div>
            <Label htmlFor="monto_minimo_consumo">Monto mínimo de consumo (S/)</Label>
            <Input
              id="monto_minimo_consumo"
              type="number"
              step="0.01"
              min="0"
              value={formData.monto_minimo_consumo}
              onChange={(e) => setFormData({ ...formData, monto_minimo_consumo: e.target.value })}
              placeholder="Opcional"
            />
          </div>

          <div>
            <Label htmlFor="detalle_premio">Detalle del premio</Label>
            <Textarea
              id="detalle_premio"
              value={formData.detalle_premio}
              onChange={(e) => setFormData({ ...formData, detalle_premio: e.target.value })}
              placeholder="Ejemplo: 1 pisco sour gratis"
            />
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={loading || uploading}
              className="flex-1"
            >
              {uploading ? "Subiendo..." : loading ? "Guardando..." : premio ? "Actualizar" : "Crear"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
