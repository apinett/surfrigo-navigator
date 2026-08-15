import { DAYS_SHORT, locationName } from "@/domain/catalog";
import type { Availability } from "@/domain/types";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { SIMULATED_TODAY_INDEX } from "@/lib/week";
import { cn } from "@/lib/utils";

export function AvailabilityStrip({ availability }: { availability: Availability[] }) {
  return (
    <section className="panel p-3">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
        <h2 className="min-w-0 truncate text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          Disponibilidad por día
        </h2>
        <p className="shrink-0 text-[10px] text-muted-foreground">unidades libres por nodo</p>
      </div>
      <div className="mt-2.5 overflow-x-auto scroll-slim">
        <table className="w-full min-w-[620px] border-separate border-spacing-x-1 border-spacing-y-1 text-xs">
          <thead>
            <tr>
              <th className="w-32 text-left font-medium text-muted-foreground" />
              {DAYS_SHORT.map((d, i) => (
                <th
                  key={d}
                  className={cn(
                    "px-1 py-0.5 text-center text-[10px] font-semibold tracking-wide",
                    i === SIMULATED_TODAY_INDEX ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  {d}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {availability.map((row) => (
              <tr key={row.locationId}>
                <td className="truncate pr-2 text-[11px] text-muted-foreground">
                  {locationName(row.locationId)}
                </td>
                {row.perDay.map((value, day) => (
                  <td key={day} className="text-center">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span
                          className={cn(
                            "tabular block cursor-help rounded py-1 text-[11px] font-semibold",
                            value === 0
                              ? "bg-surface-strong/50 text-muted-foreground/50"
                              : value === 1
                                ? "bg-st-disponible/12 text-st-disponible"
                                : "bg-st-disponible/25 text-st-disponible",
                            day === SIMULATED_TODAY_INDEX && "ring-1 ring-primary/40",
                          )}
                        >
                          {value}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        {value} unidad{value === 1 ? "" : "es"} disponible{value === 1 ? "" : "s"}{" "}
                        en {locationName(row.locationId)} el {DAYS_SHORT[day]}
                      </TooltipContent>
                    </Tooltip>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
