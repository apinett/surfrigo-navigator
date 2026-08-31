import { createFileRoute } from "@tanstack/react-router";
import { SignpostBig } from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { BORDERS, locationName } from "@/domain/catalog";
import { buildWeeklyPlan } from "@/domain/demo";
import { fmtStamp } from "@/lib/week";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/_authenticated/fronteras")({
  head: () => ({
    meta: [
      { title: "Fronteras y ETA | Surfrigo Control Tower" },
      {
        name: "description",
        content:
          "Ventanas de atención, corte documental y probabilidad de cruce por paso fronterizo con ETA recalculado.",
      },
      { property: "og:title", content: "Fronteras y ETA | Surfrigo Control Tower" },
      {
        property: "og:description",
        content:
          "Cierres de frontera, corte de papeles y recálculo de ETA condicionado a la reapertura.",
      },
    ],
  }),
  component: FronterasPage,
});

function FronterasPage() {
  const plan = buildWeeklyPlan(0);

  return (
    <AppShell>
      <PageHeader
        icon={SignpostBig}
        title="Fronteras y ETA"
        subtitle="Al salir del puerto se calcula ETA al paso. Si no cruza, el ETA se recalcula a la reapertura."
      />
      <div className="grid gap-4 p-4 lg:p-6 xl:grid-cols-2">
        {BORDERS.map((border) => {
          const events = plan.borderEvents.filter((e) => e.borderCrossingId === border.id);
          return (
            <section key={border.id} className="panel p-4">
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                <h2 className="min-w-0 text-sm font-semibold">{border.name}</h2>
                <span className="tabular shrink-0 rounded border border-border bg-surface-strong px-2 py-0.5 font-mono text-[11px] text-muted-foreground">
                  {border.opensAt}–{border.closesAt}
                </span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Corte documental {border.paperworkCutoff} · trámite promedio{" "}
                {border.avgProcessMinutes} min
              </p>
              {border.notes && <p className="mt-1 text-xs text-st-frontera">{border.notes}</p>}
              <ul className="mt-3 space-y-2">
                {events.length === 0 && (
                  <li className="rounded-md border border-dashed border-border px-3 py-3 text-xs text-muted-foreground">
                    Sin unidades previstas esta semana.
                  </li>
                )}
                {events.map((ev) => {
                  const unit = plan.units.find((u) => u.id === ev.unitId);
                  const pct = Math.round(ev.crossProbability * 100);
                  return (
                    <li
                      key={ev.id}
                      className="rounded-md border border-border bg-surface-strong/60 p-3"
                    >
                      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
                        <p className="min-w-0 truncate text-sm">
                          <span className="font-mono font-semibold">{unit?.code}</span> desde{" "}
                          {locationName(ev.departedFromId)}
                        </p>
                        <span
                          className={`tabular shrink-0 text-xs font-semibold ${pct < 50 ? "text-st-riesgo" : "text-st-disponible"}`}
                        >
                          {pct}%
                        </span>
                      </div>
                      <Progress value={pct} className="mt-2 h-1.5" />
                      <p className="mt-2 text-xs text-muted-foreground">
                        Salida {fmtStamp(ev.departedAt)} · ETA paso {fmtStamp(ev.etaBorderAt)}
                        {ev.recalculatedEtaAt &&
                          ` · si no cruza: ${fmtStamp(ev.recalculatedEtaAt)}`}
                      </p>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>
    </AppShell>
  );
}
