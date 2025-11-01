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

const Signup = () => {
  const navigate = useNavigate();
  const { setRestaurante } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombre: "",
    ruc: "",
    correo: "",
    password: "",
    telefono: "",
    direccion: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Create Supabase auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.correo,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("Error al crear usuario");

      // 2. Create restaurant in Supabase
      const { data: restauranteData, error: restauranteError } = await supabase
        .from("restaurantes")
        .insert({
          nombre: formData.nombre,
          ruc: formData.ruc,
          correo: formData.correo,
          telefono: formData.telefono,
          direccion: formData.direccion,
        })
        .select()
        .single();

      if (restauranteError) throw restauranteError;
      if (!restauranteData) throw new Error("Error al crear restaurante");

      // 3. Create user role (admin)
      const { error: roleError } = await supabase
        .from("user_roles")
        .insert({
          user_id: authData.user.id,
          restaurante_id: restauranteData.id,
          role: "admin",
        });

      if (roleError) throw roleError;

      // 4. Set restaurant context
      setRestaurante({
        id: restauranteData.id,
        nombre: restauranteData.nombre,
        correo: restauranteData.correo,
        ruc: restauranteData.ruc,
        telefono: restauranteData.telefono,
        direccion: restauranteData.direccion,
      });

      toast.success("¡Cuenta creada exitosamente!");
      navigate("/app/dashboard");
    } catch (error: any) {
      console.error("Signup error:", error);
      toast.error(error.message || "Error al crear la cuenta");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
      <div className="w-full max-w-md space-y-6">
        <Button variant="ghost" onClick={() => navigate("/access")} className="mb-4">
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
            <CardTitle className="text-2xl">Crear cuenta de restaurante</CardTitle>
            <CardDescription>Completa los datos para registrar tu restaurante</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre del restaurante *</Label>
                <Input
                  id="nombre"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  required
                  placeholder="Mi Restaurante"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ruc">RUC</Label>
                <Input id="ruc" name="ruc" value={formData.ruc} onChange={handleChange} placeholder="20123456789" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="correo">Correo electrónico *</Label>
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
                <Label htmlFor="password">Contraseña *</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={8}
                  placeholder="Mínimo 8 caracteres"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefono">Teléfono</Label>
                <Input
                  id="telefono"
                  name="telefono"
                  type="tel"
                  value={formData.telefono}
                  onChange={handleChange}
                  placeholder="+51 999 999 999"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="direccion">Dirección</Label>
                <Input
                  id="direccion"
                  name="direccion"
                  value={formData.direccion}
                  onChange={handleChange}
                  placeholder="Av. Principal 123"
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Creando cuenta..." : "Crear cuenta"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Signup;
