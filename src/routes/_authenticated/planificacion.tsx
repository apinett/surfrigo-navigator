import { createFileRoute } from "@tanstack/react-router";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { CalendarClock, ChevronLeft, ChevronRight, Search, Undo2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { DayPicker } from "@/components/dispatch/DayPicker";
import { DestinationCard } from "@/components/dispatch/DestinationCard";
import { ImportRequestsDialog } from "@/components/dispatch/ImportRequestsDialog";
import { RequestEditDialog } from "@/components/dispatch/RequestEditDialog";
import { ScoreDrawer, type ScoreView } from "@/components/dispatch/ScoreDrawer";
import { UnitCard, type UnitCardData } from "@/components/dispatch/UnitCard";
import { WeekContextStrip } from "@/components/dispatch/WeekContextStrip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DAYS, STATUS_META, STATUS_ORDER, locationName } from "@/domain/catalog";
import { buildWeeklyPlan, driverById } from "@/domain/demo";
import { buildDailyPlan, buildDepositRequests, buildWeekContext } from "@/domain/dispatch-demo";
import { DISPATCH_CONFIG, evaluateAssignment, prioritizeRequests } from "@/domain/dispatch";
import type { DepositRequest, DispatchAssignment, UnitAvailability } from "@/domain/types";
import { SIMULATED_TODAY_INDEX, fmtMargin, fmtStamp, weekStartForOffset } from "@/lib/week";

export const Route = createFileRoute("/_authenticated/planificacion")({
  head: () => ({
    meta: [
      { title: "Planificación diaria | Surfrigo Control Tower" },
      {
        name: "description",
        content:
          "Tablero diario de despacho: previsto de Depósito, unidades disponibles en Ezeiza y asignación con drag & drop, ETA, margen, riesgo y score explicable.",
      },
      { property: "og:title", content: "Planificación diaria | Surfrigo Control Tower" },
      {
        property: "og:description",
        content:
          "Asigná unidades a las salidas del día con ETA, margen, riesgo y score explicable 0–100.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PlanificacionDiariaPage,
});

type Store = Record<string, DispatchAssignment[]>;

const keyFor = (offset: number, day: number) => `${offset}:${day}`;

function PlanificacionDiariaPage() {
  const [offset, setOffset] = useState(0);
  const [dayIndex, setDayIndex] = useState(SIMULATED_TODAY_INDEX);
  const [store, setStore] = useState<Store>({});
  const [history, setHistory] = useState<{ store: Store; label: string }[]>([]);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [scoreView, setScoreView] = useState<ScoreView | null>(null);
  const [dragUnitId, setDragUnitId] = useState<string | null>(null);
  const [requestOverrides, setRequestOverrides] = useState<Record<string, DepositRequest[]>>({});
  const [editingId, setEditingId] = useState<string | null>(null);

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [locationFilter, setLocationFilter] = useState("todas");
  const [lastDestFilter, setLastDestFilter] = useState("todos");
  const [driverFilter, setDriverFilter] = useState("todos");

  const plan = useMemo(() => buildWeeklyPlan(offset), [offset]);
  const daily = useMemo(() => buildDailyPlan(offset, dayIndex), [offset, dayIndex]);
  const week = useMemo(() => buildWeekContext(offset, plan.units), [offset, plan.units]);
  const dayRequests = requestOverrides[keyFor(offset, dayIndex)] ?? daily.requests;
  const requests = useMemo(
    () => prioritizeRequests(dayRequests, daily.date),
    [dayRequests, daily.date],
  );

  const dayKey = keyFor(offset, dayIndex);
  const assignments = store[dayKey] ?? [];

  const unitById = (id: string) => plan.units.find((u) => u.id === id);
  const availabilityFor = (unitId: string): UnitAvailability | undefined =>
    daily.availability.find((a) => a.unitId === unitId);

  const assignedByDay = useMemo(
    () => Array.from({ length: 7 }, (_, d) => (store[keyFor(offset, d)] ?? []).length),
    [store, offset],
  );
  const alertsByDay = useMemo(
    () =>
      Array.from({ length: 7 }, (_, d) => {
        const reqs =
          requestOverrides[keyFor(offset, d)] ??
          buildDepositRequests(weekStartForOffset(offset), d);
        const required = reqs.reduce((s, r) => s + r.unitsRequired, 0);
        const list = store[keyFor(offset, d)] ?? [];
        const unmet = Math.max(0, required - list.length);
        const risky = list.filter((a) => a.risk === "alto").length;
        return unmet + risky;
      }),
    [store, offset, requestOverrides],
  );

  const commit = (next: Store, label: string) => {
    setHistory((h) => [...h.slice(-19), { store, label }]);
    setStore(next);
  };

  const undo = () => {
    const last = history[history.length - 1];
    if (!last) {
      toast("Nada para deshacer");
      return;
    }
    setStore(last.store);
    setHistory((h) => h.slice(0, -1));
    toast.success("Acción deshecha", { description: last.label });
  };

  const makeAssignment = (unitId: string, requestId: string): DispatchAssignment | null => {
    const unit = unitById(unitId);
    const request = requests.find((r) => r.id === requestId);
    if (!unit || !request) return null;
    const availability = availabilityFor(unitId);
    const evaluation = evaluateAssignment({
      unit,
      driver: driverById(unit.reliefDriverId ?? unit.driverId),
      availability,
      request,
      dateIso: daily.date,
    });
    return {
      id: `asg-${dayKey}-${unitId}-${requestId}`,
      requestId,
      unitId,
      createdAt: new Date().toISOString().slice(0, 19),
      departureAt: evaluation.departureAt,
      etaAt: evaluation.etaAt,
      marginMinutes: evaluation.marginMinutes,
      risk: evaluation.risk,
      score: evaluation.breakdown.total,
    };
  };

  const assign = (unitId: string, requestId: string, force = false) => {
    const request = requests.find((r) => r.id === requestId);
    const unit = unitById(unitId);
    if (!request || !unit) return;

    const current = store[dayKey] ?? [];
    if (current.some((a) => a.unitId === unitId && a.requestId === requestId)) {
      toast("La unidad ya está asignada a esa salida");
      return;
    }
    const filled = current.filter((a) => a.requestId === requestId).length;
    if (filled >= request.unitsRequired && !force) {
      toast.warning(
        `${locationName(request.destinationId)} ya cubrió su cupo (${filled}/${request.unitsRequired})`,
        {
          description: "Podés asignar de todas formas si Depósito amplía el pedido.",
          action: { label: "Asignar igual", onClick: () => assign(unitId, requestId, true) },
        },
      );
      return;
    }

    const created = makeAssignment(unitId, requestId);
    if (!created) return;
    const previous = current.find((a) => a.unitId === unitId);
    const next: Store = {
      ...store,
      [dayKey]: [...current.filter((a) => a.unitId !== unitId), created],
    };
    const label = previous
      ? `Unidad ${unit.code} movida a ${locationName(request.destinationId)}`
      : `Unidad ${unit.code} asignada a ${locationName(request.destinationId)}`;
    commit(next, label);

    toast.success(label, {
      description: `ETA ${fmtStamp(created.etaAt)} · margen ${fmtMargin(created.marginMinutes)} · riesgo ${created.risk} · score ${created.score}/100`,
      action: { label: "Deshacer", onClick: undo },
    });
  };

  const unassign = (assignmentId: string) => {
    const current = store[dayKey] ?? [];
    const target = current.find((a) => a.id === assignmentId);
    if (!target) return;
    const unit = unitById(target.unitId);
    commit(
      { ...store, [dayKey]: current.filter((a) => a.id !== assignmentId) },
      `Unidad ${unit?.code} devuelta al pool`,
    );
    toast(`Unidad ${unit?.code} devuelta al pool de disponibles`, {
      action: { label: "Deshacer", onClick: undo },
    });
  };

  const inspect = (unitId: string, requestId: string, assigned: boolean) => {
    const unit = unitById(unitId);
    const request = requests.find((r) => r.id === requestId);
    if (!unit || !request) return;
    const evaluation = evaluateAssignment({
      unit,
      driver: driverById(unit.reliefDriverId ?? unit.driverId),
      availability: availabilityFor(unitId),
      request,
      dateIso: daily.date,
    });
    setScoreView({
      unit,
      request,
      breakdown: evaluation.breakdown,
      etaAt: evaluation.etaAt,
      departureAt: evaluation.departureAt,
      marginMinutes: evaluation.marginMinutes,
      risk: evaluation.risk,
      assigned,
    });
  };

  const setDayRequests = (list: DepositRequest[]) =>
    setRequestOverrides((prev) => ({ ...prev, [keyFor(offset, dayIndex)]: list }));

  const importRequests = (incoming: DepositRequest[], mode: "replace" | "append") => {
    const normalized = incoming.map((r) => ({ ...r, dayIndex, unitsRequired: 1 }));
    if (mode === "replace") {
      setDayRequests(normalized);
      commit({ ...store, [dayKey]: [] }, "Previsto reemplazado");
      toast.success(`${normalized.length} salidas cargadas para el día`, {
        description: "Se limpiaron las asignaciones previas del día.",
      });
    } else {
      setDayRequests([...dayRequests, ...normalized]);
      toast.success(`${normalized.length} salidas agregadas al previsto del día`);
    }
  };

  const saveRequest = (updated: DepositRequest) => {
    setDayRequests(dayRequests.map((r) => (r.id === updated.id ? updated : r)));
    setEditingId(null);
    const current = store[dayKey] ?? [];
    const affected = current.filter((a) => a.requestId === updated.id);
    if (affected.length) {
      setStore((prev) => ({
        ...prev,
        [dayKey]: (prev[dayKey] ?? []).filter((a) => a.requestId !== updated.id),
      }));
      toast.success(`Salida a ${locationName(updated.destinationId)} actualizada`, {
        description: "Volvé a asignar la unidad para recalcular ETA, margen y riesgo.",
      });
    } else {
      toast.success(`Salida a ${locationName(updated.destinationId)} actualizada`);
    }
  };

  const deleteRequest = (requestId: string) => {
    setDayRequests(dayRequests.filter((r) => r.id !== requestId));
    setStore((prev) => ({
      ...prev,
      [dayKey]: (prev[dayKey] ?? []).filter((a) => a.requestId !== requestId),
    }));
    setEditingId(null);
    toast("Salida eliminada del previsto del día");
  };

  const assignedUnitIds = new Set(assignments.map((a) => a.unitId));
  const selectedRequest = requests.find((r) => r.id === selectedRequestId);

  const pool: UnitCardData[] = daily.availability
    .filter((a) => !assignedUnitIds.has(a.unitId))
    .map((a) => {
      const unit = unitById(a.unitId)!;
      const driver = driverById(unit.driverId);
      const relief = unit.reliefDriverId ? driverById(unit.reliefDriverId) : undefined;
      const score = selectedRequest
        ? evaluateAssignment({
            unit,
            driver: relief ?? driver,
            availability: a,
            request: selectedRequest,
            dateIso: daily.date,
          }).breakdown.total
        : undefined;
      return { unit, driver, relief, availability: a, score };
    })
    .filter(({ unit, driver, relief, availability }) => {
      const q = query.trim().toLowerCase();
      const matchQuery =
        !q ||
        [unit.code, unit.tractorPlate, unit.trailerPlate, driver?.name, relief?.name]
          .filter(Boolean)
          .some((v) => v!.toLowerCase().includes(q));
      return (
        matchQuery &&
        (statusFilter === "todos" || unit.status === statusFilter) &&
        (locationFilter === "todas" || availability.locationId === locationFilter) &&
        (lastDestFilter === "todos" || unit.lastDestinationId === lastDestFilter) &&
        (driverFilter === "todos" ||
          unit.driverId === driverFilter ||
          unit.reliefDriverId === driverFilter)
      );
    })
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0) || a.unit.code.localeCompare(b.unit.code));

  const now = pool.filter((p) => p.availability.kind === "ahora");
  const next = pool.filter((p) => p.availability.kind === "proxima");
  const requiredTotal = requests.reduce((s, r) => s + r.unitsRequired, 0);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const onDragStart = (e: DragStartEvent) => setDragUnitId(String(e.active.id));
  const onDragEnd = (e: DragEndEvent) => {
    setDragUnitId(null);
    if (e.over) assign(String(e.active.id), String(e.over.id));
  };

  const locationOptions = Array.from(new Set(daily.availability.map((a) => a.locationId)));
  const lastDestOptions = Array.from(
    new Set(plan.units.map((u) => u.lastDestinationId).filter(Boolean) as string[]),
  );

  return (
    <AppShell>
      <PageHeader
        icon={CalendarClock}
        title="Planificación diaria"
        subtitle={`${DAYS[dayIndex]} ${daily.date.split("-").reverse().join("/")} · previsto de Depósito · semana ${daily.weekLabel}`}
        actions={
          <>
            <div className="hidden items-center gap-1 sm:flex">
              <Button
                size="icon"
                variant="outline"
                aria-label="Semana anterior"
                onClick={() => setOffset((o) => o - 1)}
              >
                <ChevronLeft className="size-4" />
              </Button>
              <Button
                size="sm"
                variant={offset === 0 ? "default" : "outline"}
                onClick={() => setOffset(0)}
              >
                Semana actual
              </Button>
              <Button
                size="icon"
                variant="outline"
                aria-label="Semana siguiente"
                onClick={() => setOffset((o) => o + 1)}
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>
            <ImportRequestsDialog
              dayIndex={dayIndex}
              dateIso={daily.date}
              onApply={importRequests}
            />
            <Button size="sm" variant="outline" onClick={undo} disabled={history.length === 0}>
              <Undo2 className="size-3.5" /> Deshacer
            </Button>
          </>
        }
      />

      <div className="space-y-3 p-4 lg:p-6">
        <DayPicker
          week={week}
          assignedByDay={assignedByDay}
          alertsByDay={alertsByDay}
          dayIndex={dayIndex}
          todayIndex={SIMULATED_TODAY_INDEX}
          onSelect={setDayIndex}
        />

        <DndContext
          id="despacho-diario"
          sensors={sensors}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
        >
          <div className="grid gap-3 xl:grid-cols-[340px_minmax(0,1fr)]">
            {/* A — pool de unidades */}
            <aside className="panel flex max-h-[calc(100vh-13rem)] flex-col overflow-hidden p-0">
              <div className="border-b border-border p-3">
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
                  <h2 className="truncate text-[12px] font-semibold uppercase tracking-[0.1em]">
                    Unidades disponibles en Ezeiza
                  </h2>
                  <span className="tabular shrink-0 rounded border border-border px-1.5 text-[11px] text-muted-foreground">
                    {now.length} ahora
                  </span>
                </div>
                <div className="relative mt-2">
                  <Search className="pointer-events-none absolute left-2 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Unidad, patente o chofer"
                    className="h-8 pl-7 text-xs"
                  />
                </div>
                <div className="mt-2 grid grid-cols-2 gap-1.5">
                  <FilterSelect
                    value={statusFilter}
                    onChange={setStatusFilter}
                    placeholder="Estado"
                    allLabel="Todos los estados"
                    allValue="todos"
                    options={STATUS_ORDER.map((s) => ({ value: s, label: STATUS_META[s].label }))}
                  />
                  <FilterSelect
                    value={locationFilter}
                    onChange={setLocationFilter}
                    placeholder="Ubicación"
                    allLabel="Toda ubicación"
                    allValue="todas"
                    options={locationOptions.map((l) => ({ value: l, label: locationName(l) }))}
                  />
                  <FilterSelect
                    value={lastDestFilter}
                    onChange={setLastDestFilter}
                    placeholder="Destino anterior"
                    allLabel="Cualquier destino previo"
                    allValue="todos"
                    options={lastDestOptions.map((l) => ({ value: l, label: locationName(l) }))}
                  />
                  <FilterSelect
                    value={driverFilter}
                    onChange={setDriverFilter}
                    placeholder="Chofer"
                    allLabel="Todos los choferes"
                    allValue="todos"
                    options={plan.drivers.map((d) => ({ value: d.id, label: d.name }))}
                  />
                </div>
                {selectedRequest && (
                  <p className="mt-2 text-[10.5px] text-primary">
                    Score relativo a {locationName(selectedRequest.destinationId)} (salida{" "}
                    {selectedRequest.suggestedDepartureTime}).
                  </p>
                )}
              </div>

              <div className="scroll-slim flex-1 space-y-2 overflow-y-auto p-3">
                <SectionTitle label={`Disponibles ahora (${now.length})`} />
                {now.map((data) => (
                  <UnitCard
                    key={data.unit.id}
                    data={data}
                    requests={requests}
                    onAssign={(requestId) => assign(data.unit.id, requestId)}
                    onInspect={() =>
                      inspect(data.unit.id, selectedRequest?.id ?? requests[0]?.id ?? "", false)
                    }
                  />
                ))}
                {now.length === 0 && (
                  <Empty label="Sin unidades libres en CD Ezeiza para este día." />
                )}

                <SectionTitle label={`Próximas a quedar disponibles (${next.length})`} />
                {next.map((data) => (
                  <UnitCard
                    key={data.unit.id}
                    data={data}
                    requests={requests}
                    onAssign={(requestId) => assign(data.unit.id, requestId)}
                    onInspect={() =>
                      inspect(data.unit.id, selectedRequest?.id ?? requests[0]?.id ?? "", false)
                    }
                  />
                ))}
                {next.length === 0 && <Empty label="Sin arribos previstos en las próximas 48 h." />}
              </div>
            </aside>

            {/* B — previsto de Depósito */}
            <div className="min-w-0 space-y-3">
              <div className="panel grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 px-3 py-2">
                <h2 className="truncate text-[12px] font-semibold uppercase tracking-[0.1em]">
                  Previsto de Depósito · salidas del {(DAYS[dayIndex] ?? "día").toLowerCase()}
                </h2>
                <p className="tabular shrink-0 text-[11px] text-muted-foreground">
                  {assignments.length}/{requiredTotal} unidades asignadas · objetivo{" "}
                  {DISPATCH_CONFIG.kmTarget.toLocaleString("es-AR")} km
                </p>
              </div>

              {requests.length === 0 ? (
                <Empty label="Depósito no solicitó salidas para este día." />
              ) : (
                <div className="grid gap-3 md:grid-cols-2">
                  {requests.map((request) => (
                    <DestinationCard
                      key={request.id}
                      request={request}
                      assignments={assignments.filter((a) => a.requestId === request.id)}
                      unitById={unitById}
                      selected={selectedRequestId === request.id}
                      onSelect={() => setSelectedRequestId(request.id)}
                      onUnassign={unassign}
                      onMove={(assignmentId, requestId) => {
                        const target = assignments.find((a) => a.id === assignmentId);
                        if (target) assign(target.unitId, requestId);
                      }}
                      onInspect={(a) => inspect(a.unitId, a.requestId, true)}
                      onEdit={() => setEditingId(request.id)}
                      otherRequests={requests.filter((r) => r.id !== request.id)}
                    />
                  ))}
                </div>
              )}

              <WeekContextStrip
                week={week}
                assignedByDay={assignedByDay}
                dayIndex={dayIndex}
                onSelect={setDayIndex}
              />
            </div>
          </div>

          <DragOverlay dropAnimation={null}>
            {dragUnitId && (
              <div className="rounded-md border border-primary bg-surface-strong px-3 py-2 text-xs shadow-lg">
                <span className="tabular font-mono font-bold">{unitById(dragUnitId)?.code}</span>{" "}
                <span className="text-muted-foreground">soltar sobre un destino</span>
              </div>
            )}
          </DragOverlay>
        </DndContext>
      </div>

      <RequestEditDialog
        request={dayRequests.find((r) => r.id === editingId) ?? null}
        onClose={() => setEditingId(null)}
        onSave={saveRequest}
        onDelete={deleteRequest}
      />

      <ScoreDrawer view={scoreView} onClose={() => setScoreView(null)} />
    </AppShell>
  );
}

function SectionTitle({ label }: { label: string }) {
  return (
    <p className="pt-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
      {label}
    </p>
  );
}

function Empty({ label }: { label: string }) {
  return (
    <p className="rounded-md border border-dashed border-border px-3 py-4 text-center text-[11px] text-muted-foreground">
      {label}
    </p>
  );
}

function FilterSelect({
  value,
  onChange,
  placeholder,
  allLabel,
  allValue,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  allLabel: string;
  allValue: string;
  options: { value: string; label: string }[];
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-8 text-[11px]" aria-label={placeholder}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={allValue} className="text-xs">
          {allLabel}
        </SelectItem>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value} className="text-xs">
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
