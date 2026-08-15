import { createFileRoute } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, Gauge, Plus, Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { AppShell } from "@/components/layout/AppShell";
import { AlertsPanel } from "@/components/tower/AlertsPanel";
import { AvailabilityStrip } from "@/components/tower/AvailabilityStrip";
import { CommsCenter } from "@/components/tower/CommsCenter";
import { KpiRow } from "@/components/tower/KpiRow";
import { RecommendationPanel } from "@/components/tower/RecommendationPanel";
import { StatusLegend } from "@/components/tower/StatusChip";
import { UnitDrawer } from "@/components/tower/UnitDrawer";
import { UpcomingPanel } from "@/components/tower/UpcomingPanel";
import { WeeklyGrid } from "@/components/tower/WeeklyGrid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { AR_BASES, CL_PORTS, STATUS_META, STATUS_ORDER } from "@/domain/catalog";
import { DRIVERS, buildWeeklyPlan, driverById } from "@/domain/demo";
import { SIMULATED_TODAY_INDEX, addDays, fmtDayLong } from "@/lib/week";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Torre de Control Semanal | Surfrigo Control Tower" },
      {
        name: "description",
        content:
          "Grilla semanal de la flota de gran porte: salidas desde CD Ezeiza, bases argentinas, retornos de salmón desde Chile, riesgo de frontera y ETA en un solo tablero.",
      },
      { property: "og:title", content: "Torre de Control Semanal | Surfrigo Control Tower" },
      {
        property: "og:description",
        content:
          "Estado de la flota en menos de 5 segundos: unidades, estados, alertas operativas y recomendaciones de asignación explicables.",
      },
    ],
  }),
  component: TorreDeControl,
});

const ALL = "todos";

function TorreDeControl() {
  const [weekOffset, setWeekOffset] = useState(0);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>(ALL);
  const [baseFilter, setBaseFilter] = useState<string>(ALL);
  const [destinationFilter, setDestinationFilter] = useState<string>(ALL);
  const [driverFilter, setDriverFilter] = useState<string>(ALL);
  const [selectedUnitId, setSelectedUnitId] = useState<string | undefined>(undefined);

  const plan = useMemo(() => buildWeeklyPlan(weekOffset), [weekOffset]);

  const units = useMemo(() => {
    const q = query.trim().toLowerCase();
    return plan.units.filter((unit) => {
      const driver = driverById(unit.driverId);
      const unitMovements = plan.movements.filter((m) => m.unitId === unit.id);
      if (q) {
        const haystack = [
          unit.code,
          unit.tractorPlate,
          unit.trailerPlate,
          driver?.name ?? "",
          driver?.province ?? "",
        ]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      if (statusFilter !== ALL && !unitMovements.some((m) => m.status === statusFilter))
        return false;
      if (baseFilter !== ALL && unit.currentLocationId !== baseFilter) return false;
      if (
        destinationFilter !== ALL &&
        !unitMovements.some((m) => m.toId === destinationFilter || m.fromId === destinationFilter)
      )
        return false;
      if (driverFilter !== ALL && unit.driverId !== driverFilter) return false;
      return true;
    });
  }, [plan, query, statusFilter, baseFilter, destinationFilter, driverFilter]);

  const filtersActive =
    query !== "" ||
    [statusFilter, baseFilter, destinationFilter, driverFilter].some((f) => f !== ALL);

  const todayIso = addDays(plan.weekStart, SIMULATED_TODAY_INDEX);

  return (
    <AppShell>
      <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 lg:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-md border border-border bg-surface-strong text-primary">
              <Gauge className="size-4.5" />
            </span>
            <div className="min-w-0">
              <h1 className="truncate text-[15px] font-semibold tracking-tight">
                Surfrigo Control Tower
              </h1>
              <p className="truncate text-[11px] text-muted-foreground">
                Torre de Control Semanal · hoy {fmtDayLong(todayIso)} (semana demo)
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <div className="flex items-center gap-0.5 rounded-md border border-border bg-surface p-0.5">
              <Button
                size="icon"
                variant="ghost"
                className="size-7"
                aria-label="Semana anterior"
                onClick={() => setWeekOffset((w) => w - 1)}
              >
                <ChevronLeft className="size-4" />
              </Button>
              <span className="tabular min-w-[112px] px-1 text-center font-mono text-[11px] font-semibold">
                {plan.weekLabel}
              </span>
              <Button
                size="icon"
                variant="ghost"
                className="size-7"
                aria-label="Semana siguiente"
                onClick={() => setWeekOffset((w) => w + 1)}
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>
            <div className="relative hidden sm:block">
              <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar unidad, patente o chofer"
                className="h-8 w-[236px] bg-surface pl-8 text-xs"
              />
            </div>
            <Button
              size="sm"
              className="h-8"
              onClick={() =>
                toast("Nueva actualización operativa (demo)", {
                  description:
                    "Aquí el analista registrará novedades de viaje: salida de planta, cruce de frontera, demora o liberación.",
                })
              }
            >
              <Plus className="size-3.5" /> Nueva actualización
            </Button>
          </div>
        </div>
      </header>

      <div className="space-y-3 p-4 lg:p-6">
        <KpiRow plan={plan} />

        <AvailabilityStrip availability={plan.availability} />

        <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="min-w-0 space-y-3">
            <div className="panel grid grid-cols-2 gap-2 p-2.5 sm:grid-cols-4">
              <FilterSelect
                label="Estado"
                value={statusFilter}
                onChange={setStatusFilter}
                options={STATUS_ORDER.map((s) => ({ value: s, label: STATUS_META[s].label }))}
              />
              <FilterSelect
                label="Base actual"
                value={baseFilter}
                onChange={setBaseFilter}
                options={[
                  { value: "ezeiza", label: "CD Ezeiza" },
                  ...AR_BASES.map((b) => ({ value: b.id, label: b.name })),
                  ...CL_PORTS.map((p) => ({ value: p.id, label: p.name })),
                ]}
              />
              <FilterSelect
                label="Destino"
                value={destinationFilter}
                onChange={setDestinationFilter}
                options={[
                  { value: "ezeiza", label: "CD Ezeiza" },
                  ...AR_BASES.map((b) => ({ value: b.id, label: b.name })),
                  ...CL_PORTS.map((p) => ({ value: p.id, label: p.name })),
                ]}
              />
              <FilterSelect
                label="Chofer"
                value={driverFilter}
                onChange={setDriverFilter}
                options={DRIVERS.filter((d) => d.role === "titular").map((d) => ({
                  value: d.id,
                  label: d.name,
                }))}
              />
            </div>

            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
              <p className="min-w-0 truncate text-[11px] text-muted-foreground">
                {units.length} de {plan.units.length} unidades · barras continuas = operación de
                varios días · clic en una fila abre el detalle
              </p>
              {filtersActive && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 shrink-0 text-[11px]"
                  onClick={() => {
                    setQuery("");
                    setStatusFilter(ALL);
                    setBaseFilter(ALL);
                    setDestinationFilter(ALL);
                    setDriverFilter(ALL);
                  }}
                >
                  <X className="size-3" /> Limpiar filtros
                </Button>
              )}
            </div>

            <WeeklyGrid
              units={units}
              movements={plan.movements}
              weekStart={plan.weekStart}
              selectedUnitId={selectedUnitId}
              onSelectUnit={setSelectedUnitId}
            />

            <StatusLegend className="panel px-3 py-2.5" />

            <CommsCenter plan={plan} />
          </div>

          <div className="min-w-0 space-y-3">
            <AlertsPanel plan={plan} onSelectUnit={setSelectedUnitId} />
            <UpcomingPanel plan={plan} onSelectUnit={setSelectedUnitId} />
            <RecommendationPanel plan={plan} onSelectUnit={setSelectedUnitId} />
          </div>
        </div>
      </div>

      <UnitDrawer
        plan={plan}
        unitId={selectedUnitId}
        onClose={() => setSelectedUnitId(undefined)}
      />
    </AppShell>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <label className="min-w-0 space-y-1">
      <span className="block truncate text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
        {label}
      </span>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="h-8 w-full bg-surface-strong/60 text-xs">
          <span className="truncate">
            {value === ALL ? "Todos" : (options.find((o) => o.value === value)?.label ?? "Todos")}
          </span>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>Todos</SelectItem>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </label>
  );
}
