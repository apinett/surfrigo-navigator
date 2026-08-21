import { useDroppable } from "@dnd-kit/core";
import { AlertTriangle, Clock, Flag, Pencil, Route, Target, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { locationName } from "@/domain/catalog";
import { RISK_META, type PrioritizedRequest } from "@/domain/dispatch";
import type { DispatchAssignment, Unit } from "@/domain/types";
import { fmtMargin, fmtStamp } from "@/lib/week";

export function DestinationCard({
  request,
  assignments,
  unitById,
  selected,
  onSelect,
  onUnassign,
  onMove,
  onInspect,
  onEdit,
  otherRequests,
}: {
  request: PrioritizedRequest;
  assignments: DispatchAssignment[];
  unitById: (id: string) => Unit | undefined;
  selected: boolean;
  onSelect: () => void;
  onUnassign: (assignmentId: string) => void;
  onMove: (assignmentId: string, requestId: string) => void;
  onInspect: (assignment: DispatchAssignment) => void;
  onEdit: () => void;
  otherRequests: PrioritizedRequest[];
}) {
  const { setNodeRef, isOver } = useDroppable({ id: request.id });
  const emptySlots = Math.max(0, request.unitsRequired - assignments.length);
  const worst = assignments.reduce<"bajo" | "medio" | "alto">(
    (acc, a) => (a.risk === "alto" ? "alto" : a.risk === "medio" && acc !== "alto" ? "medio" : acc),
    "bajo",
  );
  const risk = assignments.length ? RISK_META[worst] : null;

  return (
    <section
      ref={setNodeRef}
      onClick={onSelect}
      className={`panel p-3 transition-colors ${
        isOver ? "border-primary bg-primary/8" : selected ? "border-primary/60" : ""
      }`}
    >
      <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-2.5">
        <span className="tabular grid size-7 shrink-0 place-items-center rounded-md border border-border bg-surface-strong font-mono text-xs font-bold">
          {request.priority}
        </span>
        <div className="min-w-0">
          <h3
            className="truncate text-sm font-semibold tracking-tight"
            title={request.routeLabel ?? undefined}
          >
            {request.routeLabel ?? `Ezeiza → ${locationName(request.destinationId)}`}
          </h3>
          <p className="truncate text-[11px] text-muted-foreground">{request.cargo}</p>
          {request.routeLabel && (
            <div className="mt-1 grid gap-1">
              {validation?.ok ? (
                <p className="flex items-center gap-1 rounded border border-st-disponible/40 bg-st-disponible/10 px-1.5 py-0.5 text-[10px] font-medium text-st-disponible">
                  <Check className="size-3 shrink-0" />
                  Tramo validado ·{" "}
                  {request.routeExact ?? validation.exact
                    ? "recorrido de planilla"
                    : `${validation.legs.length} tramo${validation.legs.length === 1 ? "" : "s"} combinados`}
                </p>
              ) : (
                <div className="rounded border border-st-riesgo/40 bg-st-riesgo/10 px-1.5 py-1 text-[10px] text-st-riesgo">
                  <p className="flex items-start gap-1">
                    <AlertTriangle className="mt-px size-3 shrink-0" />
                    <span className="min-w-0">
                      Tramo no validado: {validation?.error ?? "no figura en el catálogo"}
                    </span>
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-1 h-6 px-2 text-[10px]"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (addCustomRoute(request.routeLabel!)) {
                        toast.success("Tramo agregado al catálogo", {
                          description: request.routeLabel!,
                        });
                      } else {
                        toast.error("No se pudo agregar el tramo", {
                          description: "Indicá al menos dos paradas separadas por guiones.",
                        });
                      }
                    }}
                  >
                    <Plus className="size-3" /> Agregar tramo al catálogo
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>


        <span className="flex shrink-0 items-center gap-1">
          <span className="tabular rounded border border-border px-1.5 py-0.5 text-[11px] font-medium">
            {assignments.length}/{request.unitsRequired}
          </span>
          <Button
            size="icon"
            variant="ghost"
            aria-label={`Editar salida a ${locationName(request.destinationId)}`}
            className="size-6"
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
          >
            <Pencil className="size-3.5" />
          </Button>
        </span>
      </div>

      {request.mustGoFirst && (
        <p className="mt-2 flex items-center gap-1.5 rounded border border-st-riesgo/40 bg-st-riesgo/10 px-2 py-1 text-[10.5px] font-semibold uppercase tracking-[0.08em] text-st-riesgo">
          <Flag className="size-3" /> Debe salir primero
        </p>
      )}

      <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-[11px]">
        <Row
          icon={Clock}
          label="Ventana salida"
          value={`${request.suggestedDepartureTime}–${request.windowEndTime}`}
        />
        <Row icon={Target} label="Objetivo descarga" value={fmtStamp(request.targetUnloadAt)} />
        <Row icon={Route} label="Distancia" value={`${request.km.toLocaleString("es-AR")} km`} />
        <Row
          icon={AlertTriangle}
          label="Última salida viable"
          value={fmtStamp(request.latestDepartureAt)}
        />
      </dl>

      {risk && (
        <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px]">
          <span className={`rounded border px-1.5 py-0.5 font-medium ${risk.chip}`}>
            {risk.label}
          </span>
          <span className="text-muted-foreground">
            ETA {fmtStamp(assignments[0]?.etaAt)} · margen{" "}
            <span
              className={
                (assignments[0]?.marginMinutes ?? 0) < 0 ? "text-st-riesgo" : "text-st-disponible"
              }
            >
              {fmtMargin(assignments[0]?.marginMinutes)}
            </span>
          </span>
        </div>
      )}

      <div className="mt-2.5 space-y-1.5">
        {assignments.map((a) => {
          const unit = unitById(a.unitId);
          const m = RISK_META[a.risk];
          return (
            <div
              key={a.id}
              className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 rounded border border-border bg-surface-strong/70 px-2 py-1.5"
            >
              <button type="button" onClick={() => onInspect(a)} className="min-w-0 text-left">
                <p className="flex min-w-0 items-center gap-1.5">
                  <span className={`size-1.5 shrink-0 rounded-full ${m.dot}`} />
                  <span className="tabular font-mono text-xs font-semibold">{unit?.code}</span>
                  <span className="truncate text-[10.5px] text-muted-foreground">
                    ETA {fmtStamp(a.etaAt)} · {fmtMargin(a.marginMinutes)}
                  </span>
                </p>
                <p className="truncate text-[10px] text-muted-foreground">
                  Salida {fmtStamp(a.departureAt)} · {m.label} · score {a.score}/100
                </p>
              </button>
              <span className="flex shrink-0 items-center gap-1">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="sm" variant="ghost" className="h-6 px-1.5 text-[10.5px]">
                      Cambiar
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-60">
                    <DropdownMenuLabel className="text-[11px]">
                      Mover unidad {unit?.code} a…
                    </DropdownMenuLabel>
                    {otherRequests.map((r) => (
                      <DropdownMenuItem
                        key={r.id}
                        onSelect={() => onMove(a.id, r.id)}
                        className="text-xs"
                      >
                        <span className="tabular mr-1 font-mono text-[10px] text-muted-foreground">
                          #{r.priority}
                        </span>
                        {locationName(r.destinationId)}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button
                  size="icon"
                  variant="ghost"
                  aria-label={`Quitar unidad ${unit?.code}`}
                  className="size-6"
                  onClick={() => onUnassign(a.id)}
                >
                  <X className="size-3.5" />
                </Button>
              </span>
            </div>
          );
        })}

        {Array.from({ length: emptySlots }, (_, i) => (
          <div
            key={`slot-${i}`}
            className={`rounded border border-dashed px-2 py-2 text-center text-[10.5px] ${
              isOver ? "border-primary text-primary" : "border-border text-muted-foreground"
            }`}
          >
            Soltá una unidad acá o usá “Asignar”
          </div>
        ))}
      </div>

      {request.notes && (
        <p className="mt-2 text-[10px] italic text-muted-foreground">{request.notes}</p>
      )}
    </section>
  );
}

function Row({ icon: Icon, label, value }: { icon: typeof Clock; label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="flex items-center gap-1 truncate text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
        <Icon className="size-2.5 shrink-0" /> {label}
      </dt>
      <dd className="tabular truncate font-medium">{value}</dd>
    </div>
  );
}
