import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserPlus, ShoppingCart, Award } from "lucide-react";
import { toast } from "sonner";

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
      // Fetch stats from Supabase tables
      // For now, using placeholder data
      setStats({
        totalClientes: 0,
        totalReferidos: 0,
        totalConversiones: 0,
        premiosActivos: 0,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
      toast.error("Error al cargar estadísticas");
    } finally {
      setLoading(false);
    }
  };

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
