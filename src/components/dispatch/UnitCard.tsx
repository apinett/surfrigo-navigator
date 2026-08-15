import { useDraggable } from "@dnd-kit/core";
import { GripVertical, MapPin, Clock, Wrench, BedDouble } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { StatusChip } from "@/components/tower/StatusChip";
import { locationName } from "@/domain/catalog";
import type { Driver, Unit, UnitAvailability } from "@/domain/types";
import type { PrioritizedRequest } from "@/domain/dispatch";

export interface UnitCardData {
  unit: Unit;
  driver?: Driver | undefined;
  relief?: Driver | undefined;
  availability: UnitAvailability;
  score?: number | undefined;
}

export function UnitCard({
  data,
  requests,
  onAssign,
  onInspect,
  draggable = true,
}: {
  data: UnitCardData;
  requests: PrioritizedRequest[];
  onAssign: (requestId: string) => void;
  onInspect: () => void;
  draggable?: boolean;
}) {
  const { unit, driver, relief, availability, score } = data;
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: unit.id,
    disabled: !draggable,
  });
  const kmTarget = unit.kmTarget;
  const kmPct = Math.min(100, Math.round((unit.kmPeriod / kmTarget) * 100));
  const activeDriver = relief ?? driver;

  return (
    <article
      ref={setNodeRef}
      className={`rounded-md border border-border bg-surface-strong/60 p-2.5 transition-colors hover:border-primary/40 ${
        isDragging ? "opacity-40" : ""
      }`}
    >
      <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-2">
        <button
          type="button"
          aria-label={`Arrastrar unidad ${unit.code}`}
          className="mt-0.5 cursor-grab touch-none rounded p-0.5 text-muted-foreground hover:text-foreground active:cursor-grabbing"
          {...listeners}
          {...attributes}
        >
          <GripVertical className="size-4" />
        </button>
        <button type="button" onClick={onInspect} className="min-w-0 text-left">
          <p className="flex min-w-0 items-center gap-1.5">
            <span className="tabular font-mono text-sm font-bold">{unit.code}</span>
            <span className="truncate text-[10.5px] text-muted-foreground">
              {unit.tractorPlate} · semi {unit.trailerPlate}
            </span>
          </p>
          <p className="mt-0.5 flex min-w-0 items-center gap-1 text-[11.5px]">
            <span className="truncate">{activeDriver?.name ?? "Sin chofer"}</span>
            {relief && (
              <span className="shrink-0 rounded border border-st-demorada/40 bg-st-demorada/12 px-1 text-[9px] uppercase text-st-demorada">
                relevo
              </span>
            )}
          </p>
          <p className="truncate text-[10.5px] text-muted-foreground">
            {activeDriver ? `${activeDriver.homeCity}, ${activeDriver.province}` : "—"} ·{" "}
            {unit.trailerType}
          </p>
        </button>
        {score !== undefined && (
          <span className="tabular shrink-0 rounded border border-primary/40 bg-primary/10 px-1.5 py-0.5 text-[11px] font-semibold text-primary">
            {score}
          </span>
        )}
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        <StatusChip status={unit.status} />
        <span className="flex items-center gap-1 text-[10.5px] text-muted-foreground">
          <MapPin className="size-3" /> {locationName(availability.locationId)}
        </span>
        {availability.kind === "ahora" ? (
          <span className="rounded border border-st-disponible/40 bg-st-disponible/12 px-1.5 py-0.5 text-[10px] font-medium text-st-disponible">
            Disponible ahora
          </span>
        ) : (
          <span className="flex items-center gap-1 rounded border border-st-transito/40 bg-st-transito/12 px-1.5 py-0.5 text-[10px] font-medium text-st-transito">
            <Clock className="size-2.5" /> ETA{" "}
            {availability.readyAt?.slice(5, 16).replace("T", " ")}
          </span>
        )}
        {availability.needsWorkshop && (
          <span className="flex items-center gap-1 rounded border border-st-taller/40 bg-st-taller/12 px-1.5 py-0.5 text-[10px] font-medium text-st-taller">
            <Wrench className="size-2.5" /> Revisión taller
          </span>
        )}
        {(activeDriver?.restDaysAvailable ?? 0) > 0 && (
          <span className="flex items-center gap-1 text-[10.5px] text-muted-foreground">
            <BedDouble className="size-3" /> descanso {activeDriver?.restDaysAvailable} d
          </span>
        )}
      </div>

      <div className="mt-2">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
          <span className="truncate text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
            Último destino: {locationName(unit.lastDestinationId)}
          </span>
          <span className="tabular shrink-0 text-[10.5px] text-muted-foreground">
            {unit.kmPeriod.toLocaleString("es-AR")} / {kmTarget.toLocaleString("es-AR")} km
          </span>
        </div>
        <Progress value={kmPct} className="mt-1 h-1" />
      </div>

      <div className="mt-2 flex items-center justify-between gap-2">
        <span className="truncate text-[10px] text-muted-foreground">{availability.note}</span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="outline" className="h-6 shrink-0 px-2 text-[11px]">
              Asignar
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            <DropdownMenuLabel className="text-[11px]">
              Asignar unidad {unit.code} a…
            </DropdownMenuLabel>
            {requests.map((r) => (
              <DropdownMenuItem key={r.id} onSelect={() => onAssign(r.id)} className="text-xs">
                <span className="tabular mr-1 font-mono text-[10px] text-muted-foreground">
                  #{r.priority}
                </span>
                {locationName(r.destinationId)} · salida {r.suggestedDepartureTime}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </article>
  );
}
