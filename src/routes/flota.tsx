import { createFileRoute } from "@tanstack/react-router";
import { Truck } from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatusChip } from "@/components/tower/StatusChip";
import { Progress } from "@/components/ui/progress";
import { locationName } from "@/domain/catalog";
import { buildWeeklyPlan, driverById } from "@/domain/demo";

export const Route = createFileRoute("/flota")({
  head: () => ({
    meta: [
      { title: "Unidades y choferes | Surfrigo Control Tower" },
      {
        name: "description",
        content:
          "Tractores, semirremolques, chofer titular y relevo, domicilio, km del período y meta de equilibrio.",
      },
      { property: "og:title", content: "Unidades y choferes | Surfrigo Control Tower" },
      {
        property: "og:description",
        content: "Asignaciones estables de tractor, semi y chofer titular con km del período.",
      },
    ],
  }),
  component: FlotaPage,
});

function FlotaPage() {
  const plan = buildWeeklyPlan(0);

  return (
    <AppShell>
      <PageHeader
        icon={Truck}
        title="Unidades y choferes"
        subtitle="Asignación estable de tractor, semirremolque y chofer titular. Los cambios son excepcionales."
      />
      <div className="grid gap-4 p-4 lg:p-6">
        <div className="panel overflow-x-auto scroll-slim">
          <table className="w-full min-w-[980px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                <th className="px-3 py-2.5 font-semibold">Unidad</th>
                <th className="px-3 py-2.5 font-semibold">Tractor / Semi</th>
                <th className="px-3 py-2.5 font-semibold">Chofer titular</th>
                <th className="px-3 py-2.5 font-semibold">Domicilio</th>
                <th className="px-3 py-2.5 font-semibold">Relevo</th>
                <th className="px-3 py-2.5 font-semibold">Ubicación</th>
                <th className="px-3 py-2.5 font-semibold">Estado</th>
                <th className="px-3 py-2.5 font-semibold w-[190px]">Km período / meta</th>
              </tr>
            </thead>
            <tbody>
              {plan.units.map((unit) => {
                const driver = driverById(unit.driverId);
                const pct = Math.min(100, Math.round((unit.kmPeriod / unit.kmTarget) * 100));
                return (
                  <tr key={unit.id} className="border-b border-border/60 last:border-0">
                    <td className="px-3 py-2.5 font-mono text-xs font-semibold">{unit.code}</td>
                    <td className="px-3 py-2.5 font-mono text-[11px] text-muted-foreground">
                      {unit.tractorPlate} · {unit.trailerPlate}
                    </td>
                    <td className="px-3 py-2.5">{driver?.name}</td>
                    <td className="px-3 py-2.5 text-muted-foreground">
                      {driver?.homeCity}, {driver?.province}
                    </td>
                    <td className="px-3 py-2.5 text-muted-foreground">
                      {driverById(unit.reliefDriverId)?.name ?? "—"}
                    </td>
                    <td className="px-3 py-2.5">{locationName(unit.currentLocationId)}</td>
                    <td className="px-3 py-2.5">
                      <StatusChip status={unit.status} />
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-2">
                        <Progress value={pct} className="h-1.5 w-24" />
                        <span className="tabular text-[11px] text-muted-foreground">
                          {unit.kmPeriod.toLocaleString("es-AR")} / {unit.kmTarget.toLocaleString("es-AR")}
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}
