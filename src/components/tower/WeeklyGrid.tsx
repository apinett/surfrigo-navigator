import { ArrowRight, Home, Wrench } from "lucide-react";

import { DAYS_SHORT, STATUS_META, locationName } from "@/domain/catalog";
import { driverById } from "@/domain/demo";
import type { Movement, Unit } from "@/domain/types";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { SIMULATED_TODAY_INDEX, fmtDay, weekDates } from "@/lib/week";
import { cn } from "@/lib/utils";

export function WeeklyGrid({
  units,
  movements,
  weekStart,
  selectedUnitId,
  onSelectUnit,
}: {
  units: Unit[];
  movements: Movement[];
  weekStart: string;
  selectedUnitId?: string | undefined;
  onSelectUnit: (unitId: string) => void;
}) {
  const dates = weekDates(weekStart);

  return (
    <section className="panel overflow-hidden">
      <div className="overflow-x-auto scroll-slim">
        <table className="w-full min-w-[1080px] border-collapse">
          <thead>
            <tr className="border-b border-border">
              <th className="sticky left-0 z-20 w-[216px] min-w-[216px] bg-surface px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                Unidad / Chofer
              </th>
              {dates.map((date, i) => (
                <th
                  key={date}
                  className={cn(
                    "w-[1%] border-l border-grid-line/60 px-2 py-2 text-center text-[10px] font-semibold uppercase tracking-[0.12em]",
                    i === SIMULATED_TODAY_INDEX
                      ? "bg-primary/8 text-primary"
                      : "text-muted-foreground",
                  )}
                >
                  {DAYS_SHORT[i]}
                  <span className="ml-1.5 font-mono font-normal text-muted-foreground/70">
                    {fmtDay(date)}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {units.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-sm text-muted-foreground">
                  Ninguna unidad coincide con los filtros aplicados.
                </td>
              </tr>
            )}
            {units.map((unit) => {
              const driver = driverById(unit.driverId);
              const rowMovements = movements
                .filter((m) => m.unitId === unit.id)
                .sort((a, b) => a.dayIndex - b.dayIndex);
              const cells: Array<{ day: number; movement?: Movement; span: number }> = [];
              let day = 0;
              while (day < 7) {
                const movement = rowMovements.find((m) => m.dayIndex === day);
                if (movement) {
                  cells.push({ day, movement, span: movement.span });
                  day += movement.span;
                } else {
                  const covered = rowMovements.find(
                    (m) => day > m.dayIndex && day < m.dayIndex + m.span,
                  );
                  if (covered) {
                    day += 1;
                  } else {
                    cells.push({ day, span: 1 });
                    day += 1;
                  }
                }
              }
              const isSelected = selectedUnitId === unit.id;

              return (
                <tr
                  key={unit.id}
                  className={cn(
                    "border-b border-grid-line/40 transition-colors last:border-0",
                    isSelected ? "bg-primary/8" : "hover:bg-surface-strong/50",
                  )}
                >
                  <th
                    scope="row"
                    className="sticky left-0 z-10 w-[216px] min-w-[216px] bg-surface p-0 text-left"
                  >
                    <button
                      type="button"
                      onClick={() => onSelectUnit(unit.id)}
                      className={cn(
                        "grid w-[216px] grid-cols-[auto_minmax(0,1fr)] items-center gap-2.5 border-l-2 px-3 py-2 text-left transition-colors",
                        isSelected
                          ? "border-l-primary bg-primary/10"
                          : "border-l-transparent hover:bg-surface-strong/60",
                      )}
                    >
                      <span className="tabular grid size-8 shrink-0 place-items-center rounded-md border border-border bg-surface-strong font-mono text-xs font-bold">
                        {unit.code}
                      </span>
                      <span className="min-w-0">
                        <span className="flex items-center gap-1.5">
                          <span className="truncate text-[13px] font-medium">{driver?.name}</span>
                          {unit.workshopDue && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Wrench className="size-3 shrink-0 text-st-taller" />
                              </TooltipTrigger>
                              <TooltipContent>Service programado pendiente</TooltipContent>
                            </Tooltip>
                          )}
                        </span>
                        <span className="flex items-center gap-1 truncate text-[10px] text-muted-foreground">
                          <Home className="size-2.5 shrink-0" />
                          {driver?.province} · {unit.kmPeriod.toLocaleString("es-AR")} km
                        </span>
                      </span>
                    </button>
                  </th>
                  {cells.map(({ day: cellDay, movement, span }) => (
                    <td
                      key={cellDay}
                      colSpan={span}
                      className={cn(
                        "border-l border-grid-line/50 p-1 align-middle",
                        !movement && cellDay === SIMULATED_TODAY_INDEX && "bg-primary/5",
                      )}
                    >
                      {movement ? (
                        <MovementBar movement={movement} onClick={() => onSelectUnit(unit.id)} />
                      ) : (
                        <div className="h-11 rounded-md border border-dashed border-grid-line/50" />
                      )}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function MovementBar({ movement, onClick }: { movement: Movement; onClick: () => void }) {
  const meta = STATUS_META[movement.status];
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          onClick={onClick}
          className={cn(
            "flex h-11 w-full flex-col justify-center gap-0.5 rounded-md px-2 text-left transition-colors",
            meta.bar,
          )}
        >
          <span className="flex min-w-0 items-center gap-1.5">
            <span className={cn("size-1.5 shrink-0 rounded-full", meta.dot)} />
            <span className="truncate text-[11.5px] font-semibold leading-tight">
              {movement.title}
            </span>
            {movement.span > 1 && (
              <span className="shrink-0 rounded bg-background/40 px-1 font-mono text-[9px] text-muted-foreground">
                {movement.span}d
              </span>
            )}
          </span>
          {movement.subtitle && (
            <span className="truncate text-[10px] leading-tight text-muted-foreground">
              {movement.subtitle}
            </span>
          )}
        </button>
      </TooltipTrigger>
      <TooltipContent className="max-w-64">
        <p className="font-semibold">{meta.label}</p>
        <p className="mt-0.5 text-muted-foreground">{movement.tooltip}</p>
        {movement.fromId && movement.toId && (
          <p className="mt-1 flex items-center gap-1 text-muted-foreground">
            {locationName(movement.fromId)} <ArrowRight className="size-3" />{" "}
            {locationName(movement.toId)}
          </p>
        )}
      </TooltipContent>
    </Tooltip>
  );
}
