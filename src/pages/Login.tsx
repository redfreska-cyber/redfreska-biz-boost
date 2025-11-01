import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Utensils, ArrowLeft } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const { setRestaurante } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    correo: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Supabase Auth login
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: formData.correo,
        password: formData.password,
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("Error al iniciar sesión");

      // 2. Get user's restaurante_id from user_roles
      const { data: roleData, error: roleError } = await supabase
        .from("user_roles")
        .select("restaurante_id, role")
        .eq("user_id", authData.user.id)
        .single();

      if (roleError || !roleData) {
        throw new Error("Tu usuario no está vinculado a un restaurante");
      }

      // 3. Get restaurant data
      const { data: restauranteData, error: restauranteError } = await supabase
        .from("restaurantes")
        .select("*")
        .eq("id", roleData.restaurante_id)
        .single();

      if (restauranteError || !restauranteData) {
        throw new Error("No se encontró información del restaurante");
      }

      // 4. Set restaurant context
      setRestaurante({
        id: restauranteData.id,
        nombre: restauranteData.nombre,
        correo: restauranteData.correo,
        ruc: restauranteData.ruc,
        telefono: restauranteData.telefono,
        direccion: restauranteData.direccion,
      });

      toast.success(`¡Bienvenido, ${restauranteData.nombre}!`);
      navigate("/app/dashboard");
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error(error.message || "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
      <div className="w-full max-w-md space-y-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/access")}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver
        </Button>

        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <Utensils className="w-6 h-6 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl">Iniciar sesión</CardTitle>
            <CardDescription>Ingresa a tu cuenta de restaurante</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="correo">Correo electrónico</Label>
                <Input
                  id="correo"
                  name="correo"
                  type="email"
                  value={formData.correo}
                  onChange={handleChange}
                  required
                  placeholder="correo@restaurante.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="Tu contraseña"
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Iniciando sesión..." : "Iniciar sesión"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
