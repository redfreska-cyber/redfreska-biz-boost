import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Building2, Users, Award, TrendingUp, Calendar, Mail, Phone, MapPin, CreditCard, UserCog } from "lucide-react";

interface RestauranteDetailDialogProps {
  restauranteId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

interface RestauranteDetail {
  id: string;
  nombre: string;
  correo?: string;
  ruc?: string;
  telefono?: string;
  direccion?: string;
  estado_suscripcion?: string;
  plan_actual?: string;
  fecha_inicio?: string;
  fecha_fin?: string;
}

interface Usuario {
  id: string;
  nombre: string;
  correo?: string;
  telefono?: string;
  estado?: string;
}

interface UserRole {
  id: string;
  user_id: string;
  role: string;
  usuario?: {
    email?: string;
  };
}

const RestauranteDetailDialog = ({ restauranteId, isOpen, onClose, onUpdate }: RestauranteDetailDialogProps) => {
  const [restaurante, setRestaurante] = useState<RestauranteDetail | null>(null);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [stats, setStats] = useState({
    clientes: 0,
    conversiones: 0,
    premios: 0,
    validaciones: 0,
  });

  useEffect(() => {
    if (restauranteId && isOpen) {
      fetchRestauranteDetails();
    }
  }, [restauranteId, isOpen]);

  const fetchRestauranteDetails = async () => {
    if (!restauranteId) return;

    try {
      setLoading(true);

      // Fetch restaurant details
      const { data: restauranteData, error: restauranteError } = await supabase
        .from("restaurantes")
        .select("*")
        .eq("id", restauranteId)
        .single();

      if (restauranteError) throw restauranteError;
      setRestaurante(restauranteData);

      // Fetch usuarios
      const { data: usuariosData } = await supabase
        .from("usuarios")
        .select("*")
        .eq("restaurante_id", restauranteId);

      setUsuarios(usuariosData || []);

      // Fetch user roles
      const { data: rolesData } = await supabase
        .from("user_roles")
        .select("*")
        .eq("restaurante_id", restauranteId);

      setUserRoles(rolesData || []);

      // Fetch stats
      const [clientesCount, conversionesCount, premiosCount, validacionesRes] = await Promise.all([
        supabase.from("clientes").select("id", { count: "exact", head: true }).eq("restaurante_id", restauranteId),
        supabase.from("conversiones").select("id", { count: "exact", head: true }).eq("restaurante_id", restauranteId),
        supabase.from("premios").select("id", { count: "exact", head: true }).eq("restaurante_id", restauranteId),
        supabase
          .from("validaciones")
          .select("id", { count: "exact", head: true })
          .in(
            "cliente_id",
            (await supabase.from("clientes").select("id").eq("restaurante_id", restauranteId)).data?.map((c) => c.id) || []
          ),
      ]);

      setStats({
        clientes: clientesCount.count || 0,
        conversiones: conversionesCount.count || 0,
        premios: premiosCount.count || 0,
        validaciones: validacionesRes.count || 0,
      });
    } catch (error) {
      console.error("Error fetching restaurante details:", error);
      toast.error("Error al cargar los detalles del restaurante");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!restaurante) return;

    try {
      const { error } = await supabase
        .from("restaurantes")
        .update({
          nombre: restaurante.nombre,
          correo: restaurante.correo,
          ruc: restaurante.ruc,
          telefono: restaurante.telefono,
          direccion: restaurante.direccion,
          plan_actual: restaurante.plan_actual,
          estado_suscripcion: restaurante.estado_suscripcion,
          fecha_fin: restaurante.fecha_fin,
        })
        .eq("id", restaurante.id);

      if (error) throw error;

      toast.success("Restaurante actualizado correctamente");
      setEditing(false);
      onUpdate();
    } catch (error) {
      console.error("Error updating restaurante:", error);
      toast.error("Error al actualizar el restaurante");
    }
  };

  if (!restaurante) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{restaurante.nombre}</DialogTitle>
          <DialogDescription>
            Información detallada y gestión del restaurante
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="info" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="info">Información</TabsTrigger>
            <TabsTrigger value="stats">Estadísticas</TabsTrigger>
            <TabsTrigger value="usuarios">Usuarios</TabsTrigger>
            <TabsTrigger value="suscripcion">Suscripción</TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Información General</span>
                  {!editing ? (
                    <Button onClick={() => setEditing(true)} size="sm">
                      Editar
                    </Button>
                  ) : (
                    <div className="space-x-2">
                      <Button onClick={handleUpdate} size="sm">
                        Guardar
                      </Button>
                      <Button onClick={() => setEditing(false)} variant="outline" size="sm">
                        Cancelar
                      </Button>
                    </div>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nombre">Nombre</Label>
                    <Input
                      id="nombre"
                      value={restaurante.nombre}
                      onChange={(e) => setRestaurante({ ...restaurante, nombre: e.target.value })}
                      disabled={!editing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ruc">RUC</Label>
                    <Input
                      id="ruc"
                      value={restaurante.ruc || ""}
                      onChange={(e) => setRestaurante({ ...restaurante, ruc: e.target.value })}
                      disabled={!editing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="correo">Correo</Label>
                    <Input
                      id="correo"
                      type="email"
                      value={restaurante.correo || ""}
                      onChange={(e) => setRestaurante({ ...restaurante, correo: e.target.value })}
                      disabled={!editing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="telefono">Teléfono</Label>
                    <Input
                      id="telefono"
                      value={restaurante.telefono || ""}
                      onChange={(e) => setRestaurante({ ...restaurante, telefono: e.target.value })}
                      disabled={!editing}
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="direccion">Dirección</Label>
                    <Input
                      id="direccion"
                      value={restaurante.direccion || ""}
                      onChange={(e) => setRestaurante({ ...restaurante, direccion: e.target.value })}
                      disabled={!editing}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stats" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Clientes</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.clientes}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Conversiones</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.conversiones}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Premios</CardTitle>
                  <Award className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.premios}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Validaciones</CardTitle>
                  <Award className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.validaciones}</div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="usuarios" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Usuarios del Sistema</CardTitle>
              </CardHeader>
              <CardContent>
                {usuarios.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    No hay usuarios registrados
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nombre</TableHead>
                        <TableHead>Correo</TableHead>
                        <TableHead>Teléfono</TableHead>
                        <TableHead>Estado</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {usuarios.map((usuario) => (
                        <TableRow key={usuario.id}>
                          <TableCell>{usuario.nombre}</TableCell>
                          <TableCell>{usuario.correo || "-"}</TableCell>
                          <TableCell>{usuario.telefono || "-"}</TableCell>
                          <TableCell>
                            <Badge variant={usuario.estado === "activo" ? "default" : "secondary"}>
                              {usuario.estado || "activo"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Roles de Acceso</CardTitle>
              </CardHeader>
              <CardContent>
                {userRoles.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    No hay roles asignados
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User ID</TableHead>
                        <TableHead>Rol</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {userRoles.map((role) => (
                        <TableRow key={role.id}>
                          <TableCell className="font-mono text-xs">{role.user_id}</TableCell>
                          <TableCell>
                            <Badge>{role.role}</Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="suscripcion" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Gestión de Suscripción</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="plan">Plan Actual</Label>
                    <Select
                      value={restaurante.plan_actual || ""}
                      onValueChange={(value) => setRestaurante({ ...restaurante, plan_actual: value })}
                      disabled={!editing}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar plan" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="basico">Básico</SelectItem>
                        <SelectItem value="premium">Premium</SelectItem>
                        <SelectItem value="empresarial">Empresarial</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="estado">Estado de Suscripción</Label>
                    <Select
                      value={restaurante.estado_suscripcion || ""}
                      onValueChange={(value) => setRestaurante({ ...restaurante, estado_suscripcion: value })}
                      disabled={!editing}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar estado" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="activa">Activa</SelectItem>
                        <SelectItem value="pendiente">Pendiente</SelectItem>
                        <SelectItem value="cancelada">Cancelada</SelectItem>
                        <SelectItem value="suspendida">Suspendida</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fecha_inicio">Fecha de Inicio</Label>
                    <Input
                      id="fecha_inicio"
                      type="date"
                      value={restaurante.fecha_inicio || ""}
                      disabled
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fecha_fin">Fecha de Fin</Label>
                    <Input
                      id="fecha_fin"
                      type="date"
                      value={restaurante.fecha_fin || ""}
                      onChange={(e) => setRestaurante({ ...restaurante, fecha_fin: e.target.value })}
                      disabled={!editing}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 p-4 bg-muted rounded-lg">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">
                      Estado: {restaurante.estado_suscripcion || "Sin suscripción"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {restaurante.fecha_fin
                        ? `Vence el ${new Date(restaurante.fecha_fin).toLocaleDateString()}`
                        : "Sin fecha de vencimiento"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default RestauranteDetailDialog;
