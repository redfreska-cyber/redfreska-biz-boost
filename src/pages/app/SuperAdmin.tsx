import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, Users, Award, TrendingUp, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface RestauranteStats {
  id: string;
  nombre: string;
  correo: string;
  ruc?: string;
  telefono?: string;
  estado_suscripcion?: string;
  plan_actual?: string;
  fecha_inicio?: string;
  fecha_fin?: string;
  total_clientes: number;
  total_conversiones: number;
  total_premios: number;
}

const SuperAdmin = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [restaurantes, setRestaurantes] = useState<RestauranteStats[]>([]);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  useEffect(() => {
    checkSuperAdmin();
  }, [user]);

  const checkSuperAdmin = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    const { data, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (error || data?.role !== "superadmin") {
      toast.error("No tienes permisos de superadmin");
      navigate("/app/dashboard");
      return;
    }

    setIsSuperAdmin(true);
    fetchRestaurantes();
  };

  const fetchRestaurantes = async () => {
    try {
      setLoading(true);

      // Fetch all restaurants
      const { data: restaurantesData, error: restaurantesError } = await supabase
        .from("restaurantes")
        .select("*")
        .order("created_at", { ascending: false });

      if (restaurantesError) throw restaurantesError;

      // Fetch stats for each restaurant
      const restaurantesWithStats = await Promise.all(
        (restaurantesData || []).map(async (restaurante) => {
          const [clientesCount, conversionesCount, premiosCount] = await Promise.all([
            supabase
              .from("clientes")
              .select("id", { count: "exact", head: true })
              .eq("restaurante_id", restaurante.id),
            supabase
              .from("conversiones")
              .select("id", { count: "exact", head: true })
              .eq("restaurante_id", restaurante.id),
            supabase
              .from("premios")
              .select("id", { count: "exact", head: true })
              .eq("restaurante_id", restaurante.id),
          ]);

          return {
            ...restaurante,
            total_clientes: clientesCount.count || 0,
            total_conversiones: conversionesCount.count || 0,
            total_premios: premiosCount.count || 0,
          };
        })
      );

      setRestaurantes(restaurantesWithStats);
    } catch (error) {
      console.error("Error fetching restaurantes:", error);
      toast.error("Error al cargar los restaurantes");
    } finally {
      setLoading(false);
    }
  };

  const getEstadoBadge = (estado?: string) => {
    switch (estado) {
      case "activa":
        return <Badge variant="default" className="bg-green-500">Activa</Badge>;
      case "pendiente":
        return <Badge variant="secondary">Pendiente</Badge>;
      case "cancelada":
        return <Badge variant="destructive">Cancelada</Badge>;
      default:
        return <Badge variant="outline">Sin suscripción</Badge>;
    }
  };

  if (!isSuperAdmin) {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Panel de SuperAdmin</h1>
          <p className="text-muted-foreground mt-2">
            Gestiona todos los restaurantes registrados en la plataforma
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Restaurantes</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{restaurantes.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Clientes</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {restaurantes.reduce((acc, r) => acc + r.total_clientes, 0)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Conversiones</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {restaurantes.reduce((acc, r) => acc + r.total_conversiones, 0)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Premios</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {restaurantes.reduce((acc, r) => acc + r.total_premios, 0)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Restaurants Table */}
        <Card>
          <CardHeader>
            <CardTitle>Restaurantes Registrados</CardTitle>
            <CardDescription>
              Lista completa de todos los restaurantes en la plataforma
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                Cargando restaurantes...
              </div>
            ) : restaurantes.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No hay restaurantes registrados
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Correo</TableHead>
                      <TableHead>RUC</TableHead>
                      <TableHead>Teléfono</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Clientes</TableHead>
                      <TableHead>Conversiones</TableHead>
                      <TableHead>Premios</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {restaurantes.map((restaurante) => (
                      <TableRow key={restaurante.id}>
                        <TableCell className="font-medium">{restaurante.nombre}</TableCell>
                        <TableCell>{restaurante.correo || "-"}</TableCell>
                        <TableCell>{restaurante.ruc || "-"}</TableCell>
                        <TableCell>{restaurante.telefono || "-"}</TableCell>
                        <TableCell>
                          {restaurante.plan_actual ? (
                            <Badge variant="outline">{restaurante.plan_actual}</Badge>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        <TableCell>{getEstadoBadge(restaurante.estado_suscripcion)}</TableCell>
                        <TableCell className="text-center">{restaurante.total_clientes}</TableCell>
                        <TableCell className="text-center">{restaurante.total_conversiones}</TableCell>
                        <TableCell className="text-center">{restaurante.total_premios}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              // TODO: Implement view details functionality
                              toast.info("Vista de detalles próximamente");
                            }}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default SuperAdmin;
