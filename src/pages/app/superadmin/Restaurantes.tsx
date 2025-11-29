import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Download, Store, Users, TrendingUp, Award } from "lucide-react";
import { toast } from "sonner";
import SuperAdminFilters from "@/components/SuperAdminFilters";
import RestauranteDetailDialog from "@/components/RestauranteDetailDialog";

interface RestauranteStats {
  id: string;
  nombre: string;
  ruc: string | null;
  correo: string | null;
  telefono: string | null;
  direccion: string | null;
  plan_actual: string | null;
  estado_suscripcion: string | null;
  fecha_inicio: string | null;
  fecha_fin: string | null;
  total_clientes: number;
  total_conversiones: number;
  total_premios: number;
}

const Restaurantes = () => {
  const navigate = useNavigate();
  const [restaurantes, setRestaurantes] = useState<RestauranteStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [estadoFilter, setEstadoFilter] = useState("");
  const [planFilter, setPlanFilter] = useState("");
  const [selectedRestauranteId, setSelectedRestauranteId] = useState<string | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  useEffect(() => {
    checkSuperAdmin();
    fetchRestaurantes();
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
    } catch (error) {
      console.error("Error checking superadmin:", error);
      navigate("/app/dashboard");
    }
  };

  const fetchRestaurantes = async () => {
    try {
      const { data: restaurantesData, error: restaurantesError } = await supabase
        .from("restaurantes")
        .select("*")
        .order("created_at", { ascending: false });

      if (restaurantesError) throw restaurantesError;

      const restaurantesWithStats = await Promise.all(
        (restaurantesData || []).map(async (restaurante) => {
          const [clientesCount, conversionesCount, premiosCount] = await Promise.all([
            supabase
              .from("clientes")
              .select("*", { count: "exact", head: true })
              .eq("restaurante_id", restaurante.id),
            supabase
              .from("conversiones")
              .select("*", { count: "exact", head: true })
              .eq("restaurante_id", restaurante.id),
            supabase
              .from("premios")
              .select("*", { count: "exact", head: true })
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
      toast.error("Error al cargar restaurantes");
    } finally {
      setLoading(false);
    }
  };

  const filteredRestaurantes = useMemo(() => {
    return restaurantes.filter((restaurante) => {
      const matchesSearch =
        restaurante.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (restaurante.ruc && restaurante.ruc.includes(searchTerm)) ||
        (restaurante.correo && restaurante.correo.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesEstado = !estadoFilter || restaurante.estado_suscripcion === estadoFilter;
      const matchesPlan = !planFilter || restaurante.plan_actual === planFilter;

      return matchesSearch && matchesEstado && matchesPlan;
    });
  }, [restaurantes, searchTerm, estadoFilter, planFilter]);

  const totalStats = useMemo(() => {
    return filteredRestaurantes.reduce(
      (acc, curr) => ({
        restaurantes: acc.restaurantes + 1,
        clientes: acc.clientes + curr.total_clientes,
        conversiones: acc.conversiones + curr.total_conversiones,
        premios: acc.premios + curr.total_premios,
      }),
      { restaurantes: 0, clientes: 0, conversiones: 0, premios: 0 }
    );
  }, [filteredRestaurantes]);

  const getEstadoBadge = (estado: string | null) => {
    switch (estado) {
      case "activa":
        return <Badge className="bg-green-500">Activa</Badge>;
      case "pendiente":
        return <Badge variant="secondary">Pendiente</Badge>;
      case "vencida":
        return <Badge variant="destructive">Vencida</Badge>;
      default:
        return <Badge variant="outline">Sin estado</Badge>;
    }
  };

  const handleViewDetails = (restauranteId: string) => {
    setSelectedRestauranteId(restauranteId);
    setDetailDialogOpen(true);
  };

  const handleExportData = () => {
    const dataStr = JSON.stringify(filteredRestaurantes, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `restaurantes-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    toast.success("Datos exportados exitosamente");
  };

  const resetFilters = () => {
    setSearchTerm("");
    setEstadoFilter("");
    setPlanFilter("");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Cargando datos...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Gestión de Restaurantes</h1>
        <p className="text-muted-foreground mt-2">
          Panel de administración global del sistema
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Restaurantes</CardTitle>
            <Store className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStats.restaurantes}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStats.clientes}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Conversiones</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStats.conversiones}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Premios</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStats.premios}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle>Lista de Restaurantes</CardTitle>
            <Button onClick={handleExportData} variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
          </div>
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

          <div className="rounded-md border mt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>RUC</TableHead>
                  <TableHead>Correo</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-center">Clientes</TableHead>
                  <TableHead className="text-center">Conversiones</TableHead>
                  <TableHead className="text-center">Premios</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRestaurantes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      No se encontraron restaurantes
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRestaurantes.map((restaurante) => (
                    <TableRow key={restaurante.id}>
                      <TableCell className="font-medium">{restaurante.nombre}</TableCell>
                      <TableCell>{restaurante.ruc || "-"}</TableCell>
                      <TableCell>{restaurante.correo || "-"}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {restaurante.plan_actual || "Sin plan"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {getEstadoBadge(restaurante.estado_suscripcion)}
                      </TableCell>
                      <TableCell className="text-center">{restaurante.total_clientes}</TableCell>
                      <TableCell className="text-center">{restaurante.total_conversiones}</TableCell>
                      <TableCell className="text-center">{restaurante.total_premios}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetails(restaurante.id)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {selectedRestauranteId && (
        <RestauranteDetailDialog
          restauranteId={selectedRestauranteId}
          isOpen={detailDialogOpen}
          onClose={() => {
            setDetailDialogOpen(false);
            setSelectedRestauranteId(null);
          }}
          onUpdate={fetchRestaurantes}
        />
      )}
    </div>
  );
};

export default Restaurantes;
