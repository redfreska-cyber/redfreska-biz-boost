import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { LogIn, UserPlus, Utensils, Shield } from "lucide-react";

const Access = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4 relative">
      <Button 
        variant="ghost" 
        className="absolute top-4 right-4 gap-2"
        onClick={() => navigate("/superadmin/signup")}
      >
        <Shield className="w-4 h-4" />
        Portal SuperAdmin
      </Button>
      
      <div className="w-full max-w-4xl space-y-8">
        <div className="text-center space-y-4">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Utensils className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            RedFreska
          </h1>
          <p className="text-muted-foreground text-lg">
            Selecciona una opción para continuar
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/50 cursor-pointer" onClick={() => navigate("/login")}>
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <LogIn className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-2xl">Iniciar sesión</CardTitle>
              <CardDescription className="text-base">
                Accede a tu cuenta de restaurante
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" size="lg">
                Entrar
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300 border-2 hover:border-secondary/50 cursor-pointer" onClick={() => navigate("/signup")}>
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center mb-4">
                <UserPlus className="w-6 h-6 text-secondary" />
              </div>
              <CardTitle className="text-2xl">Crear cuenta</CardTitle>
              <CardDescription className="text-base">
                Registra tu restaurante en RedFreska
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="secondary" className="w-full" size="lg">
                Registrarse
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Access;
