import { createFileRoute } from "@tanstack/react-router";
import { Ship } from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatusChip } from "@/components/tower/StatusChip";
import { CL_PORTS, DAYS_SHORT, borderById, locationName } from "@/domain/catalog";
import { buildWeeklyPlan, driverById } from "@/domain/demo";
import { fmtStamp, weekDates, fmtDay } from "@/lib/week";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/chile")({
  head: () => ({
    meta: [
      { title: "Movimientos Chile | Surfrigo Control Tower" },
      {
        name: "description",
        content:
          "Planilla día por día de unidades en viaje desde puertos chilenos y llegada prevista a CD Ezeiza.",
      },
      { property: "og:title", content: "Movimientos Chile | Surfrigo Control Tower" },
      {
        property: "og:description",
        content:
          "Retornos de salmón desde Puerto Montt, Calbuco, Quellón, Chacabuco, Punta Arenas y Natales.",
      },
    ],
  }),
  component: ChilePage,
});

function ChilePage() {
  const plan = buildWeeklyPlan(0);
  const dates = weekDates(plan.weekStart);
  const chileMovements = plan.movements.filter((m) =>
    ["retorno_chile", "frontera", "riesgo"].includes(m.status),
  );
  const unitsWithChile = plan.units.filter((u) => chileMovements.some((m) => m.unitId === u.id));

  return (
    <AppShell>
      <PageHeader
        icon={Ship}
        title="Movimientos Chile"
        subtitle="Retornos planificados viernes/sábado para la semana siguiente. La hora de llegada es dinámica."
      />
      <div className="grid gap-4 p-4 lg:p-6">
        <div className="panel overflow-x-auto scroll-slim">
          <table className="w-full min-w-[900px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                <th className="sticky left-0 bg-surface px-3 py-2.5 font-semibold">Unidad</th>
                {dates.map((d, i) => (
                  <th key={d} className="px-2 py-2.5 text-center font-semibold">
                    {DAYS_SHORT[i]} <span className="text-muted-foreground/70">{fmtDay(d)}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {unitsWithChile.map((unit) => (
                <tr key={unit.id} className="border-b border-border/60 last:border-0">
                  <td className="sticky left-0 bg-surface px-3 py-2 font-mono text-xs font-semibold">
                    {unit.code}
                    <span className="ml-2 font-sans text-[11px] font-normal text-muted-foreground">
                      {driverById(unit.driverId)?.name}
                    </span>
                  </td>
                  {dates.map((_, day) => {
                    const m = chileMovements.find(
                      (mv) =>
                        mv.unitId === unit.id && day >= mv.dayIndex && day < mv.dayIndex + mv.span,
                    );
                    return (
                      <td key={day} className="px-1.5 py-2 text-center align-middle">
                        {m ? (
                          <span
                            className={cn(
                              "block truncate rounded px-1.5 py-1 text-[10px] font-medium",
                              m.status === "riesgo"
                                ? "bg-st-riesgo/20 text-st-riesgo"
                                : m.status === "frontera"
                                  ? "bg-st-frontera/18 text-st-frontera"
                                  : "bg-st-retorno/18 text-st-retorno",
                            )}
                          >
                            {m.status === "frontera"
                              ? "Frontera"
                              : m.status === "riesgo"
                                ? "Riesgo cruce"
                                : "En viaje"}
                          </span>
                        ) : (
                          <span className="text-muted-foreground/40">·</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
          <section className="panel p-4">
            <h2 className="text-sm font-semibold">Eventos de puerto y frontera</h2>
            <ul className="mt-3 space-y-2.5">
              {plan.borderEvents.map((ev) => {
                const unit = plan.units.find((u) => u.id === ev.unitId);
                return (
                  <li
                    key={ev.id}
                    className="rounded-md border border-border bg-surface-strong/60 p-3"
                  >
                    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
                      <p className="min-w-0 truncate text-sm font-medium">
                        <span className="font-mono">{unit?.code}</span> ·{" "}
                        {locationName(ev.departedFromId)} → {borderById(ev.borderCrossingId)?.name}
                      </p>
                      <StatusChip
                        status={
                          ev.outcome === "riesgo"
                            ? "riesgo"
                            : ev.outcome === "cruzo"
                              ? "transito"
                              : "frontera"
                        }
                      />
                    </div>
                    <p className="mt-1.5 text-xs text-muted-foreground">
                      Salida {fmtStamp(ev.departedAt)} · ETA paso {fmtStamp(ev.etaBorderAt)} ·
                      probabilidad de cruce{" "}
                      <span
                        className={
                          ev.crossProbability < 0.5 ? "text-st-riesgo" : "text-st-disponible"
                        }
                      >
                        {Math.round(ev.crossProbability * 100)}%
                      </span>
                      {ev.recalculatedEtaAt &&
                        ` · ETA recalculado ${fmtStamp(ev.recalculatedEtaAt)}`}
                    </p>
                    {ev.comment && (
                      <p className="mt-1 text-xs text-muted-foreground/80">{ev.comment}</p>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>

          <section className="panel p-4">
            <h2 className="text-sm font-semibold">Puntos de carga en Chile</h2>
            <ul className="mt-3 space-y-1.5 text-sm">
              {CL_PORTS.map((port) => (
                <li
                  key={port.id}
                  className="flex items-center justify-between gap-3 rounded-md border border-border/70 px-3 py-2"
                >
                  <span className="truncate">{port.name}</span>
                  <span className="tabular shrink-0 text-xs text-muted-foreground">
                    {port.kmFromEzeiza?.toLocaleString("es-AR")} km · {port.transitHours} h
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </AppShell>
  );
}
