import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, Users, Award, TrendingUp, Eye, Download, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import RestauranteDetailDialog from "@/components/RestauranteDetailDialog";
import SuperAdminFilters from "@/components/SuperAdminFilters";

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
  const [selectedRestauranteId, setSelectedRestauranteId] = useState<string | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [estadoFilter, setEstadoFilter] = useState("todos");
  const [planFilter, setPlanFilter] = useState("todos");

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

  // Filtered restaurants
  const filteredRestaurantes = useMemo(() => {
    return restaurantes.filter((restaurante) => {
      const matchesSearch =
        searchTerm === "" ||
        restaurante.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        restaurante.correo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        restaurante.ruc?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesEstado =
        estadoFilter === "todos" || restaurante.estado_suscripcion === estadoFilter;

      const matchesPlan =
        planFilter === "todos" || restaurante.plan_actual === planFilter;

      return matchesSearch && matchesEstado && matchesPlan;
    });
  }, [restaurantes, searchTerm, estadoFilter, planFilter]);

  const getEstadoBadge = (estado?: string) => {
    switch (estado) {
      case "activa":
        return <Badge className="bg-green-500 hover:bg-green-600">Activa</Badge>;
      case "pendiente":
        return <Badge variant="secondary">Pendiente</Badge>;
      case "cancelada":
        return <Badge variant="destructive">Cancelada</Badge>;
      case "suspendida":
        return <Badge variant="outline" className="border-orange-500 text-orange-500">Suspendida</Badge>;
      default:
        return <Badge variant="outline">Sin suscripción</Badge>;
    }
  };

  const handleViewDetails = (restauranteId: string) => {
    setSelectedRestauranteId(restauranteId);
    setIsDetailDialogOpen(true);
  };

  const handleExportData = () => {
    try {
      const dataStr = JSON.stringify(filteredRestaurantes, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `restaurantes_${new Date().toISOString().split("T")[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success("Datos exportados correctamente");
    } catch (error) {
      toast.error("Error al exportar los datos");
    }
  };

  const resetFilters = () => {
    setSearchTerm("");
    setEstadoFilter("todos");
    setPlanFilter("todos");
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

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filtros de Búsqueda</CardTitle>
            <CardDescription>
              Filtra y busca restaurantes por diferentes criterios
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SuperAdminFilters
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              estadoFilter={estadoFilter}
              setEstadoFilter={setEstadoFilter}
              planFilter={planFilter}
              setPlanFilter={setPlanFilter}
              onReset={resetFilters}
            />
          </CardContent>
        </Card>

        {/* Restaurants Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Restaurantes Registrados</CardTitle>
                <CardDescription>
                  {filteredRestaurantes.length} de {restaurantes.length} restaurantes
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchRestaurantes}
                  disabled={loading}
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                  Actualizar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportData}
                  disabled={filteredRestaurantes.length === 0}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Exportar
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                Cargando restaurantes...
              </div>
            ) : filteredRestaurantes.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {restaurantes.length === 0
                  ? "No hay restaurantes registrados"
                  : "No se encontraron restaurantes con los filtros aplicados"}
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
                      <TableHead className="text-center">Clientes</TableHead>
                      <TableHead className="text-center">Conversiones</TableHead>
                      <TableHead className="text-center">Premios</TableHead>
                      <TableHead className="text-center">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRestaurantes.map((restaurante) => (
                      <TableRow key={restaurante.id}>
                        <TableCell className="font-medium">{restaurante.nombre}</TableCell>
                        <TableCell>{restaurante.correo || "-"}</TableCell>
                        <TableCell>{restaurante.ruc || "-"}</TableCell>
                        <TableCell>{restaurante.telefono || "-"}</TableCell>
                        <TableCell>
                          {restaurante.plan_actual ? (
                            <Badge variant="outline" className="capitalize">
                              {restaurante.plan_actual}
                            </Badge>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        <TableCell>{getEstadoBadge(restaurante.estado_suscripcion)}</TableCell>
                        <TableCell className="text-center">{restaurante.total_clientes}</TableCell>
                        <TableCell className="text-center">{restaurante.total_conversiones}</TableCell>
                        <TableCell className="text-center">{restaurante.total_premios}</TableCell>
                        <TableCell className="text-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewDetails(restaurante.id)}
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

      <RestauranteDetailDialog
        restauranteId={selectedRestauranteId}
        isOpen={isDetailDialogOpen}
        onClose={() => {
          setIsDetailDialogOpen(false);
          setSelectedRestauranteId(null);
        }}
        onUpdate={fetchRestaurantes}
      />
    </DashboardLayout>
  );
};

export default SuperAdmin;
