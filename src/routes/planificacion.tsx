import { createFileRoute } from "@tanstack/react-router";
import { CalendarRange } from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatusChip } from "@/components/tower/StatusChip";
import { locationName } from "@/domain/catalog";
import { buildWeeklyPlan, driverById } from "@/domain/demo";
import { fmtMargin, fmtStamp } from "@/lib/week";

export const Route = createFileRoute("/planificacion")({
  head: () => ({
    meta: [
      { title: "Planificación semanal | Surfrigo Control Tower" },
      {
        name: "description",
        content:
          "Previsto de salidas desde CD Ezeiza con hora objetivo de descarga, ETA y margen operativo por unidad.",
      },
      { property: "og:title", content: "Planificación semanal | Surfrigo Control Tower" },
      {
        property: "og:description",
        content: "Previsto de salidas, hora objetivo de descarga y margen operativo por unidad.",
      },
    ],
  }),
  component: PlanificacionPage,
});

function PlanificacionPage() {
  const plan = buildWeeklyPlan(0);
  const trips = plan.trips.filter((t) => t.originId === "ezeiza");

  return (
    <AppShell>
      <PageHeader
        icon={CalendarRange}
        title="Planificación semanal"
        subtitle={`Previsto de depósito · salidas desde CD Ezeiza · semana ${plan.weekLabel}`}
      />
      <div className="p-4 lg:p-6">
        <div className="panel overflow-x-auto scroll-slim">
          <table className="w-full min-w-[860px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                <th className="px-3 py-2.5 font-semibold">Unidad</th>
                <th className="px-3 py-2.5 font-semibold">Chofer</th>
                <th className="px-3 py-2.5 font-semibold">Destino</th>
                <th className="px-3 py-2.5 font-semibold">Salida</th>
                <th className="px-3 py-2.5 font-semibold">Objetivo descarga</th>
                <th className="px-3 py-2.5 font-semibold">ETA</th>
                <th className="px-3 py-2.5 font-semibold">Margen</th>
                <th className="px-3 py-2.5 font-semibold">Estado</th>
              </tr>
            </thead>
            <tbody>
              {trips.map((trip) => {
                const unit = plan.units.find((u) => u.id === trip.unitId);
                const late = (trip.marginMinutes ?? 0) < 0;
                return (
                  <tr key={trip.id} className="border-b border-border/60 last:border-0">
                    <td className="px-3 py-2.5 font-mono text-xs font-semibold">{unit?.code}</td>
                    <td className="px-3 py-2.5 text-muted-foreground">
                      {driverById(trip.driverId)?.name}
                    </td>
                    <td className="px-3 py-2.5">{locationName(trip.destinationId)}</td>
                    <td className="px-3 py-2.5 tabular text-muted-foreground">
                      {fmtStamp(trip.departureAt)}
                    </td>
                    <td className="px-3 py-2.5 tabular">{fmtStamp(trip.targetUnloadAt)}</td>
                    <td className="px-3 py-2.5 tabular">{fmtStamp(trip.etaAt)}</td>
                    <td
                      className={`px-3 py-2.5 tabular font-medium ${late ? "text-st-riesgo" : "text-st-disponible"}`}
                    >
                      {fmtMargin(trip.marginMinutes)}
                    </td>
                    <td className="px-3 py-2.5">
                      <StatusChip status={trip.status} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          El previsto de depósito hoy sólo informa destinos. La priorización por distancia y hora
          objetivo la define el analista; el margen operativo es la holgura contra el objetivo.
        </p>
      </div>
    </AppShell>
  );
}
