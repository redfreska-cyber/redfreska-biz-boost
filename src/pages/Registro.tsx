import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, CheckCircle2 } from "lucide-react";
import redFreskaLogo from "@/assets/redfreska-logo.png";

const Registro = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [registroExitoso, setRegistroExitoso] = useState(false);
  const [codigoReferido, setCodigoReferido] = useState("");
  const [premios, setPremios] = useState<any[]>([]);
  const [restauranteId, setRestauranteId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nombre: "",
    telefono: "",
    dni: "",
    correo: "",
    premio_id: "",
  });

  useEffect(() => {
    if (slug) {
      fetchRestauranteAndPremios();
    }
  }, [slug]);

  const fetchRestauranteAndPremios = async () => {
    // Get restaurante by slug
    const { data: restaurante } = await supabase
      .from("restaurantes")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    if (restaurante) {
      setRestauranteId(restaurante.id);
      
      // Fetch active premios
      const { data: premiosData } = await supabase
        .from("premios")
        .select("*")
        .eq("restaurante_id", restaurante.id)
        .eq("is_active", true)
        .order("orden", { ascending: true });

      if (premiosData) {
        setPremios(premiosData);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate inputs
      if (!formData.nombre || !formData.telefono) {
        toast({
          title: "Error",
          description: "Por favor completa todos los campos requeridos",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Call edge function
      const { data, error } = await supabase.functions.invoke('registro-cliente', {
        body: {
          slug,
          nombre: formData.nombre.trim(),
          telefono: formData.telefono.trim(),
          dni: formData.dni.trim() || null,
          correo: formData.correo.trim() || null,
          premio_id: formData.premio_id || null,
        },
      });

      if (error) {
        console.error('Error registering cliente:', error);
        toast({
          title: "Error",
          description: "No se pudo completar el registro. Por favor intenta nuevamente.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      if (data?.error) {
        toast({
          title: "Error",
          description: data.error,
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Success
      setCodigoReferido(data.cliente.codigo_referido);
      setRegistroExitoso(true);
      
      toast({
        title: "¡Registro exitoso!",
        description: "Te hemos enviado tu código de referido por correo electrónico",
      });
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Ocurrió un error inesperado",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (registroExitoso) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle2 className="w-16 h-16 text-primary" />
            </div>
            <CardTitle className="text-2xl">¡Registro Exitoso!</CardTitle>
            <CardDescription>
              Bienvenido al programa de fidelización
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-primary/10 p-6 rounded-lg text-center">
              <p className="text-sm text-muted-foreground mb-2">Tu código de referido:</p>
              <p className="text-2xl font-bold text-primary">{codigoReferido}</p>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                • Te hemos enviado tu código por correo electrónico
              </p>
              <p className="text-sm text-muted-foreground">
                • Comparte tu código con amigos y familiares
              </p>
              <p className="text-sm text-muted-foreground">
                • Gana premios cuando tus referidos consuman
              </p>
            </div>

            <Button 
              onClick={() => navigate('/')} 
              className="w-full"
            >
              Cerrar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <img src={redFreskaLogo} alt="RedFreska Logo" className="w-16 h-16 object-contain" />
          </div>
          <CardTitle className="text-2xl">Únete al Programa</CardTitle>
          <CardDescription>
            Regístrate y comienza a ganar premios por tus referidos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre completo *</Label>
              <Input
                id="nombre"
                type="text"
                placeholder="Ej: Juan Pérez"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="telefono">Teléfono / WhatsApp *</Label>
              <Input
                id="telefono"
                type="tel"
                placeholder="Ej: 987654321"
                value={formData.telefono}
                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                required
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">
                Recibirás tu código de referido por WhatsApp
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dni">DNI (opcional)</Label>
              <Input
                id="dni"
                type="text"
                placeholder="Ej: 12345678"
                value={formData.dni}
                onChange={(e) => setFormData({ ...formData, dni: e.target.value })}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="correo">Correo electrónico (opcional)</Label>
              <Input
                id="correo"
                type="email"
                placeholder="Ej: juan@email.com"
                value={formData.correo}
                onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
                disabled={loading}
              />
            </div>

            {premios.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="premio">Premio a Elegir (Opcional)</Label>
                <Select
                  value={formData.premio_id}
                  onValueChange={(value) => setFormData({ ...formData, premio_id: value })}
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un premio" />
                  </SelectTrigger>
                  <SelectContent>
                    {premios.map((premio) => (
                      <SelectItem key={premio.id} value={premio.id}>
                        {premio.descripcion} - {premio.umbral} referidos
                        {premio.monto_minimo_consumo && ` (Min: S/ ${parseFloat(premio.monto_minimo_consumo).toFixed(2)})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Registrando...
                </>
              ) : (
                'Registrarme'
              )}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              Al registrarte, aceptas participar en el programa de fidelización
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Registro;
