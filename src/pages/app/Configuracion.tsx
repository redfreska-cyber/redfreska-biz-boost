import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { QRCodeSVG } from "qrcode.react";
import { Copy, Download } from "lucide-react";

const Configuracion = () => {
  const { restaurante, setRestaurante } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombre: "",
    ruc: "",
    telefono: "",
    direccion: "",
    correo: "",
    slug: "",
    dominio_base: "",
  });

  useEffect(() => {
    if (restaurante) {
      setFormData({
        nombre: restaurante.nombre || "",
        ruc: restaurante.ruc || "",
        telefono: restaurante.telefono || "",
        direccion: restaurante.direccion || "",
        correo: restaurante.correo || "",
        slug: (restaurante as any).slug || "",
        dominio_base: (restaurante as any).dominio_base || "",
      });
    }
  }, [restaurante]);

  const baseUrl = formData.dominio_base || window.location.origin;
  const registrationUrl = formData.slug 
    ? `${baseUrl}/registro/${formData.slug}`
    : "";

  const handleCopyUrl = () => {
    if (registrationUrl) {
      navigator.clipboard.writeText(registrationUrl);
      toast.success("Link copiado al portapapeles");
    }
  };

  const handleDownloadQR = () => {
    const svg = document.getElementById("qr-code");
    if (!svg) return;
    
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL("image/png");
      
      const downloadLink = document.createElement("a");
      downloadLink.download = `qr-registro-${formData.slug}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
      
      toast.success("QR descargado");
    };
    
    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

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
          slug: formData.slug || null,
          dominio_base: formData.dominio_base || null,
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

      <Card>
        <CardHeader>
          <CardTitle>Portal de Registro Público</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 space-y-2">
              <p className="text-sm font-medium text-yellow-600 dark:text-yellow-500">
                ⚠️ Importante: Configuración de dominio
              </p>
              <p className="text-xs text-muted-foreground">
                Para que el QR funcione correctamente, debes publicar tu proyecto y luego ingresar la URL publicada abajo.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dominio_base">
                Dominio Publicado
                <span className="text-xs text-muted-foreground ml-2">
                  Ejemplo: https://mi-app.lovable.app
                </span>
              </Label>
              <Input
                id="dominio_base"
                value={formData.dominio_base}
                onChange={(e) =>
                  setFormData({ ...formData, dominio_base: e.target.value.trim() })
                }
                placeholder="https://tu-proyecto.lovable.app"
              />
              <p className="text-xs text-muted-foreground">
                Encuentra tu URL publicada haciendo clic en "Publish" (botón verde arriba a la derecha)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">
                URL personalizada (slug)
                <span className="text-xs text-muted-foreground ml-2">
                  Solo letras, números y guiones
                </span>
              </Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => {
                  const value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
                  setFormData({ ...formData, slug: value });
                }}
                placeholder="mi-restaurante"
              />
              {formData.slug && (
                <p className="text-xs text-muted-foreground">
                  Link de registro: {registrationUrl}
                </p>
              )}
            </div>
          </div>

          {formData.slug && registrationUrl && (
            <div className="space-y-4 pt-4 border-t">
              <div className="flex flex-col items-center gap-4">
                <div className="bg-white p-4 rounded-lg border">
                  <QRCodeSVG
                    id="qr-code"
                    value={registrationUrl}
                    size={200}
                    level="H"
                    includeMargin
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCopyUrl}
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Copiar Link
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleDownloadQR}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Descargar QR
                  </Button>
                </div>
              </div>

              <div className="bg-muted p-4 rounded-lg space-y-2">
                <p className="text-sm font-medium">¿Cómo usar el QR?</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Imprime el código QR y colócalo en tu restaurante</li>
                  <li>• Los clientes pueden escanearlo para registrarse</li>
                  <li>• Recibirán su código de referido por WhatsApp</li>
                </ul>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Configuracion;
