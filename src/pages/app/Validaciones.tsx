import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const Validaciones = () => {
  const { restaurante } = useAuth();
  const [validaciones, setValidaciones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (restaurante?.id) {
      fetchValidaciones();
    }
  }, [restaurante]);

  // Suscripción en tiempo real para actualizar cuando cambien referidos/premios/validaciones
  useEffect(() => {
    if (!restaurante?.id) return;

    const channel = supabase
      .channel("validaciones-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "referidos" },
        () => fetchValidaciones()
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "referidos" },
        () => fetchValidaciones()
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "referidos" },
        () => fetchValidaciones()
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "validaciones" },
        () => fetchValidaciones()
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "validaciones" },
        () => fetchValidaciones()
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "premios" },
        () => fetchValidaciones()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [restaurante?.id]);
  const fetchValidaciones = async () => {
    try {
      // 1) Traer validaciones existentes
      const { data: validacionesData, error: validacionesError } = await supabase
        .from("validaciones")
        .select(`
          *,
          cliente:clientes(nombre, restaurante_id),
          premio:premios(descripcion, umbral, detalle_premio)
        `)
        .order("fecha_validacion", { ascending: false });

      if (validacionesError) throw validacionesError;

      // 2) Traer todos los clientes del restaurante
      const { data: clientesData, error: clientesError } = await supabase
        .from("clientes")
        .select("id, nombre, restaurante_id")
        .eq("restaurante_id", restaurante?.id);

      if (clientesError) throw clientesError;

      // 3) Traer premios activos ordenados por umbral
      const { data: premiosData, error: premiosError } = await supabase
        .from("premios")
        .select("*")
        .eq("restaurante_id", restaurante?.id)
        .eq("is_active", true)
        .order("umbral", { ascending: true });

      if (premiosError) throw premiosError;

      // 4) Contar conversiones reales (referidos confirmados)
      const { data: referidosData, error: referidosError } = await supabase
        .from("referidos")
        .select("cliente_owner_id, consumo_realizado")
        .eq("restaurante_id", restaurante?.id)
        .eq("consumo_realizado", true);

      if (referidosError) throw referidosError;

      // Agrupar conteos por cliente
      const referidosCounts: { [key: string]: number } = {};
      referidosData?.forEach((ref) => {
        if (!ref || !ref.cliente_owner_id) return;
        referidosCounts[ref.cliente_owner_id] = (referidosCounts[ref.cliente_owner_id] || 0) + 1;
      });

      // 5) Crear nuevas validaciones si alcanzan el umbral y no existen
      const newValidaciones: any[] = [];
      for (const cliente of clientesData || []) {
        const count = referidosCounts[cliente.id] || 0;
        for (const premio of premiosData || []) {
          if (count >= premio.umbral) {
            const exists = validacionesData?.some(
              (v) => v.cliente_id === cliente.id && (v as any).premio_id === premio.id
            );
            if (!exists) {
              newValidaciones.push({
                cliente_id: cliente.id,
                premio_id: premio.id,
                conversiones_realizadas: count,
                validado: false,
              });
            }
          }
        }
      }

      let currentValidaciones = validacionesData || [];

      if (newValidaciones.length > 0) {
        const { data: insertData, error: insertError } = await supabase
          .from("validaciones")
          .insert(newValidaciones)
          .select(`
            *,
            cliente:clientes(nombre, restaurante_id),
            premio:premios(descripcion, umbral, detalle_premio)
          `);

        if (insertError) throw insertError;

        // Mezclar con existentes
        currentValidaciones = [...(currentValidaciones || []), ...(insertData || [])];
      }

      // Filtrar por restaurante
      const filtered = currentValidaciones.filter((v) => v.cliente?.restaurante_id === restaurante?.id);

      // 6) Construir filas para TODOS los clientes (aunque no tengan validación)
      const rows = (clientesData || []).map((cliente) => {
        const count = referidosCounts[cliente.id] || 0;
        // Validación pendiente/última si existe
        const v =
          filtered.find((x) => x.cliente_id === cliente.id && !x.validado) ||
          filtered.find((x) => x.cliente_id === cliente.id);

        // Premio objetivo: el de la validación si existe; si no, el siguiente premio por alcanzar
        const premioTarget =
          v?.premio ||
          (premiosData || []).find((p) => p.umbral >= count) ||
          (premiosData || [])[Math.max(0, (premiosData?.length || 1) - 1)];

        return {
          ...(v || {}),
          id: v?.id || `placeholder-${cliente.id}`,
          cliente: { nombre: cliente.nombre, restaurante_id: cliente.restaurante_id },
          premio: premioTarget
            ? {
                descripcion: premioTarget.descripcion,
                umbral: premioTarget.umbral,
                detalle_premio: premioTarget.detalle_premio,
              }
            : null,
          conversiones_realizadas: count,
          fecha_validacion: v?.fecha_validacion || null,
          validado: v?.validado || false,
          _isPlaceholder: !v,
        } as any;
      });

      setValidaciones(rows);
    } catch (error: any) {
      toast.error("Error al cargar validaciones");
      console.error("Error en fetchValidaciones:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAprobar = async (validacionId: string) => {
    try {
      const { error } = await supabase
        .from("validaciones")
        .update({ validado: true, motivo: "Premio entregado" })
        .eq("id", validacionId);

      if (error) throw error;

      toast.success("Validación aprobada");
      fetchValidaciones();
    } catch (error: any) {
      toast.error("Error al aprobar validación");
    }
  };

  const handleRechazar = async (validacionId: string) => {
    try {
      const { error } = await supabase
        .from("validaciones")
        .delete()
        .eq("id", validacionId);

      if (error) throw error;

      toast.success("Validación rechazada");
      fetchValidaciones();
    } catch (error: any) {
      toast.error("Error al rechazar validación");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Validaciones</h1>
          <p className="text-muted-foreground">
            Aprueba o rechaza clientes
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Validaciones</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center py-8">Cargando...</p>
          ) : validaciones.length === 0 ? (
            <div className="text-center py-8 space-y-2">
              <p className="text-muted-foreground">
                No hay validaciones pendientes
              </p>
              <p className="text-sm text-muted-foreground">
                Las validaciones se generan automáticamente cuando un cliente alcanza el umbral de un premio
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Premio</TableHead>
                  <TableHead>Conversiones</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {validaciones.map((validacion) => {
                  const isPlaceholder = (validacion as any)._isPlaceholder;
                  const estadoLabel = validacion.validado
                    ? "Entregado"
                    : isPlaceholder
                    ? "En progreso"
                    : "Pendiente";

                  return (
                    <TableRow key={validacion.id}>
                      <TableCell>{validacion.cliente?.nombre || "-"}</TableCell>
                      <TableCell>{validacion.premio?.descripcion || "-"}</TableCell>
                      <TableCell>
                        {validacion.conversiones_realizadas || 0} / {validacion.premio?.umbral || 0}
                      </TableCell>
                      <TableCell>
                        {validacion.fecha_validacion
                          ? new Date(validacion.fecha_validacion).toLocaleDateString()
                          : "-"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={validacion.validado ? "default" : "secondary"}>
                          {estadoLabel}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {!validacion.validado && !isPlaceholder && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleAprobar(validacion.id)}
                            >
                              Aprobar
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleRechazar(validacion.id)}
                            >
                              Rechazar
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Validaciones;
