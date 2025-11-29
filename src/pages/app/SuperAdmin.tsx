import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const SuperAdmin = () => {
  const navigate = useNavigate();

  useEffect(() => {
    checkSuperAdmin();
  }, []);

  const checkSuperAdmin = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Debes iniciar sesión");
        navigate("/login");
        return;
      }

      const { data: roleData, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .single();

      if (error || roleData?.role !== "superadmin") {
        toast.error("No tienes permisos de superadmin");
        navigate("/app/dashboard");
        return;
      }

      // Redirect to restaurantes page
      navigate("/app/superadmin/restaurantes");
    } catch (error) {
      console.error("Error checking superadmin:", error);
      navigate("/app/dashboard");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-muted-foreground">Redirigiendo...</p>
    </div>
  );
};

export default SuperAdmin;
