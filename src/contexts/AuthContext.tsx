import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface Restaurante {
  id: string;
  nombre: string;
  correo: string;
  ruc?: string;
  telefono?: string;
  direccion?: string;
}

interface Usuario {
  id: string;
  nombre: string;
  correo: string;
  rol: string;
  restaurante_id: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  restaurante: Restaurante | null;
  usuario: Usuario | null;
  loading: boolean;
  signOut: () => Promise<void>;
  setRestaurante: (restaurante: Restaurante | null) => void;
  setUsuario: (usuario: Usuario | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [restaurante, setRestaurante] = useState<Restaurante | null>(null);
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch restaurante data when user is authenticated
  const fetchRestauranteData = async (userId: string) => {
    try {
      // Get user's restaurante_id from user_roles
      const { data: roleData, error: roleError } = await supabase
        .from("user_roles")
        .select("restaurante_id, role")
        .eq("user_id", userId)
        .single();

      if (roleError || !roleData) {
        console.error("Error fetching user role:", roleError);
        return;
      }

      // Get restaurant data
      const { data: restauranteData, error: restauranteError } = await supabase
        .from("restaurantes")
        .select("*")
        .eq("id", roleData.restaurante_id)
        .single();

      if (restauranteError || !restauranteData) {
        console.error("Error fetching restaurant:", restauranteError);
        return;
      }

      // Set restaurant context
      setRestaurante({
        id: restauranteData.id,
        nombre: restauranteData.nombre,
        correo: restauranteData.correo || "",
        ruc: restauranteData.ruc,
        telefono: restauranteData.telefono,
        direccion: restauranteData.direccion,
      });
    } catch (error) {
      console.error("Error loading restaurant data:", error);
    }
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (!session) {
          setRestaurante(null);
          setUsuario(null);
        } else if (session.user) {
          // Fetch restaurante data when user logs in
          await fetchRestauranteData(session.user.id);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        await fetchRestauranteData(session.user.id);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setRestaurante(null);
    setUsuario(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        restaurante,
        usuario,
        loading,
        signOut,
        setRestaurante,
        setUsuario,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
