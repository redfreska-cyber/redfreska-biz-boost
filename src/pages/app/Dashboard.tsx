import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserPlus, ShoppingCart, Award } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const Dashboard = () => {
  const { restaurante } = useAuth();
  const [stats, setStats] = useState({
    totalClientes: 0,
    totalReferidos: 0,
    totalConversiones: 0,
    premiosActivos: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (restaurante?.id) {
      fetchStats();
    }
  }, [restaurante]);

  const fetchStats = async () => {
    try {
      if (!restaurante?.id) {
        setLoading(false);
        return;
      }

      // Fetch total clientes
      const { count: clientesCount } = await supabase
        .from("clientes")
        .select("*", { count: "exact", head: true })
        .eq("restaurante_id", restaurante.id);

      // Fetch total referidos
      const { count: referidosCount } = await supabase
        .from("referidos")
        .select("*", { count: "exact", head: true })
        .eq("restaurante_id", restaurante.id);

      // Fetch conversiones confirmadas (referidos con consumo realizado)
      const { count: conversionesCount } = await supabase
        .from("referidos")
        .select("*", { count: "exact", head: true })
        .eq("restaurante_id", restaurante.id)
        .eq("consumo_realizado", true);

      // Fetch premios activos
      const { count: premiosCount } = await supabase
        .from("premios")
        .select("*", { count: "exact", head: true })
        .eq("restaurante_id", restaurante.id)
        .eq("is_active", true);

      setStats({
        totalClientes: clientesCount || 0,
        totalReferidos: referidosCount || 0,
        totalConversiones: conversionesCount || 0,
        premiosActivos: premiosCount || 0,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
      toast.error("Error al cargar estadísticas");
    } finally {
      setLoading(false);
    }
  };

  // Realtime updates for dashboard stats
  useEffect(() => {
    if (!restaurante?.id) return;

    const channel = supabase
      .channel('dashboard-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'clientes', filter: `restaurante_id=eq.${restaurante.id}` },
        fetchStats
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'referidos', filter: `restaurante_id=eq.${restaurante.id}` },
        fetchStats
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'conversiones', filter: `restaurante_id=eq.${restaurante.id}` },
        fetchStats
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'premios', filter: `restaurante_id=eq.${restaurante.id}` },
        fetchStats
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [restaurante?.id]);

  const statCards = [
    {
      title: "Total Clientes",
      value: stats.totalClientes,
      icon: Users,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Total Referidos",
      value: stats.totalReferidos,
      icon: UserPlus,
      color: "text-secondary",
      bgColor: "bg-secondary/10",
    },
    {
      title: "Conversiones",
      value: stats.totalConversiones,
      icon: ShoppingCart,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Premios Activos",
      value: stats.premiosActivos,
      icon: Award,
      color: "text-secondary",
      bgColor: "bg-secondary/10",
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">
          Bienvenido, {restaurante?.nombre}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title} className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`w-10 h-10 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Conversiones Recientes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-center py-8">
              No hay conversiones recientes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Clientes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-center py-8">
              No hay datos disponibles
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
