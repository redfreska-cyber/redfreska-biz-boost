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

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (!session) {
          setRestaurante(null);
          setUsuario(null);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
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
