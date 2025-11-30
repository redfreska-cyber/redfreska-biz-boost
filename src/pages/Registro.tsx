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
  const [loadingRestaurante, setLoadingRestaurante] = useState(true);
  const [registroExitoso, setRegistroExitoso] = useState(false);
  const [codigoReferido, setCodigoReferido] = useState("");
  const [premios, setPremios] = useState<any[]>([]);
  const [premioSeleccionado, setPremioSeleccionado] = useState<any>(null);
  const [restauranteId, setRestauranteId] = useState<string | null>(null);
  const [restauranteNoEncontrado, setRestauranteNoEncontrado] = useState(false);
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
    try {
      setLoadingRestaurante(true);
      // Get restaurante by slug
      const { data: restaurante, error } = await supabase
        .from("restaurantes")
        .select("id")
        .eq("slug", slug)
        .maybeSingle();

      if (error || !restaurante) {
        setRestauranteNoEncontrado(true);
        setLoadingRestaurante(false);
        return;
      }

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
    } catch (error) {
      console.error('Error fetching restaurante:', error);
      setRestauranteNoEncontrado(true);
    } finally {
      setLoadingRestaurante(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate inputs
      if (!formData.nombre || !formData.telefono || !formData.dni || !formData.correo || !formData.premio_id) {
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
          dni: formData.dni.trim(),
          correo: formData.correo.trim(),
          premio_id: formData.premio_id,
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
      const premio = premios.find(p => p.id === formData.premio_id);
      setPremioSeleccionado(premio);
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

  if (loadingRestaurante) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground">Cargando formulario de registro...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (restauranteNoEncontrado) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Restaurante no encontrado</CardTitle>
            <CardDescription>
              El enlace de registro no es válido o ha expirado
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => navigate('/')} 
              className="w-full"
            >
              Ir al inicio
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (registroExitoso) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
        <Card className="w-full max-w-md" id="registro-exitoso-card">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <CheckCircle2 className="w-12 h-12 text-green-600 dark:text-green-500" strokeWidth={2.5} />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold">¡Registro Exitoso!</CardTitle>
            <CardDescription className="text-base mt-2">
              Bienvenido al programa de fidelización
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Premio Seleccionado */}
            {premioSeleccionado && (
              <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-xl border border-green-200 dark:border-green-900/40">
                <p className="text-green-700 dark:text-green-400 font-semibold mb-4 text-center">
                  🎁 ¡Has elegido un premio increíble!
                </p>
                
                {premioSeleccionado.imagen_url && (
                  <div className="mb-4 rounded-lg overflow-hidden">
                    <img 
                      src={premioSeleccionado.imagen_url} 
                      alt={premioSeleccionado.descripcion}
                      className="w-full h-48 object-cover"
                    />
                  </div>
                )}
                
                <p className="text-center font-medium text-foreground mb-4">
                  {premioSeleccionado.descripcion}
                </p>
                
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg space-y-2 text-sm">
                  <p className="flex items-center gap-2">
                    <span>👥</span>
                    <span><strong>Referidos necesarios:</strong> {premioSeleccionado.umbral} personas</span>
                  </p>
                  {premioSeleccionado.monto_minimo_consumo && (
                    <p className="flex items-center gap-2">
                      <span>💰</span>
                      <span><strong>Monto mínimo por consumo:</strong> S/ {parseFloat(premioSeleccionado.monto_minimo_consumo).toFixed(2)}</span>
                    </p>
                  )}
                </div>
                
                <p className="text-green-700 dark:text-green-400 font-semibold mt-4 text-center">
                  ✨ ¡Estás a solo {premioSeleccionado.umbral} referidos de alcanzar tu premio!
                </p>
                
                <p className="text-sm text-muted-foreground mt-3 text-center">
                  Comparte tu código con amigos y familiares. Cada vez que consuman en nuestro restaurante, ¡estarás más cerca de tu objetivo!
                </p>
              </div>
            )}
            
            {/* Código de Referido */}
            <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-xl text-center border border-gray-200 dark:border-gray-800">
              <p className="text-sm text-muted-foreground mb-3">Tu código de referido es:</p>
              <p className="text-4xl font-bold text-foreground tracking-wider mb-4">{codigoReferido}</p>
            </div>
            
            {/* CTA Compartir */}
            <div className="bg-orange-50 dark:bg-orange-900/20 p-5 rounded-xl border-l-4 border-orange-500">
              <p className="font-bold text-orange-700 dark:text-orange-400 mb-3 flex items-center gap-2">
                <span>💪</span>
                <span>¡Comparte y gana!</span>
              </p>
              <p className="text-sm text-muted-foreground mb-2">
                Cada vez que un amigo use tu código de referido y consuma en nuestro restaurante, <strong>¡estarás más cerca de ganar increíbles premios!</strong>
              </p>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                <li>• Comparte tu código con amigos y familiares</li>
                <li>• Ellos disfrutan en nuestro restaurante</li>
                <li>• Tú acumulas conversiones y ganas premios</li>
              </ul>
              <p className="text-sm font-medium text-orange-700 dark:text-orange-400 mt-3">
                ¿Qué esperas? Entre más compartas, más rápido alcanzarás tus premios.
              </p>
            </div>

            <div className="bg-muted/50 p-4 rounded-lg text-center text-sm text-muted-foreground">
              <p>📧 Recibirás esta misma información por correo electrónico.</p>
              <p className="mt-1">💡 Puedes tomar captura de pantalla para guardar tu código.</p>
            </div>

            <Button 
              onClick={() => navigate('/')} 
              className="w-full bg-green-600 hover:bg-green-700 text-white py-6 text-base font-medium"
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
              <Label htmlFor="dni">DNI *</Label>
              <Input
                id="dni"
                type="text"
                placeholder="Ej: 12345678"
                value={formData.dni}
                onChange={(e) => setFormData({ ...formData, dni: e.target.value })}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="correo">Correo electrónico *</Label>
              <Input
                id="correo"
                type="email"
                placeholder="Ej: juan@email.com"
                value={formData.correo}
                onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="premio">Premio a Elegir *</Label>
              <Select
                value={formData.premio_id}
                onValueChange={(value) => setFormData({ ...formData, premio_id: value })}
                disabled={loading || premios.length === 0}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder={premios.length === 0 ? "No hay premios disponibles" : "Selecciona un premio"} />
                </SelectTrigger>
                <SelectContent>
                  {premios.length > 0 ? (
                    premios.map((premio) => (
                      <SelectItem key={premio.id} value={premio.id}>
                        <div className="flex items-center gap-3">
                          {premio.imagen_url ? (
                            <img 
                              src={premio.imagen_url} 
                              alt={premio.descripcion}
                              className="w-10 h-10 object-cover rounded"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-muted rounded flex items-center justify-center text-muted-foreground text-xs">
                              Sin imagen
                            </div>
                          )}
                          <div className="flex-1">
                            <div className="font-medium">{premio.descripcion}</div>
                            <div className="text-xs text-muted-foreground">
                              {premio.umbral} referidos
                              {premio.monto_minimo_consumo && ` - Mín: S/ ${parseFloat(premio.monto_minimo_consumo).toFixed(2)}`}
                            </div>
                          </div>
                        </div>
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-premios" disabled>
                      No hay premios disponibles
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

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
