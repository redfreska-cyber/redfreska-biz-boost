import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";

interface SuperAdminFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  estadoFilter: string;
  setEstadoFilter: (value: string) => void;
  planFilter: string;
  setPlanFilter: (value: string) => void;
  onReset: () => void;
}

const SuperAdminFilters = ({
  searchTerm,
  setSearchTerm,
  estadoFilter,
  setEstadoFilter,
  planFilter,
  setPlanFilter,
  onReset,
}: SuperAdminFiltersProps) => {
  const hasActiveFilters = searchTerm || estadoFilter !== "todos" || planFilter !== "todos";

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
      <div className="flex-1 space-y-2">
        <label className="text-sm font-medium text-foreground">Buscar</label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre, correo o RUC..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="w-full sm:w-48 space-y-2">
        <label className="text-sm font-medium text-foreground">Estado</label>
        <Select value={estadoFilter} onValueChange={setEstadoFilter}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="activa">Activa</SelectItem>
            <SelectItem value="pendiente">Pendiente</SelectItem>
            <SelectItem value="cancelada">Cancelada</SelectItem>
            <SelectItem value="suspendida">Suspendida</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="w-full sm:w-48 space-y-2">
        <label className="text-sm font-medium text-foreground">Plan</label>
        <Select value={planFilter} onValueChange={setPlanFilter}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="basico">Básico</SelectItem>
            <SelectItem value="premium">Premium</SelectItem>
            <SelectItem value="empresarial">Empresarial</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {hasActiveFilters && (
        <Button
          variant="outline"
          onClick={onReset}
          className="w-full sm:w-auto"
        >
          <X className="h-4 w-4 mr-2" />
          Limpiar filtros
        </Button>
      )}
    </div>
  );
};

export default SuperAdminFilters;
