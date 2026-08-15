import { Check, Sparkles, TriangleAlert } from "lucide-react";
import { toast } from "sonner";

import { locationName } from "@/domain/catalog";
import { driverById } from "@/domain/demo";
import type { WeeklyPlan } from "@/domain/types";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { fmtStamp } from "@/lib/week";
import { cn } from "@/lib/utils";

export function RecommendationPanel({
  plan,
  onSelectUnit,
}: {
  plan: WeeklyPlan;
  onSelectUnit: (unitId: string) => void;
}) {
  return (
    <section className="panel flex min-h-0 flex-col">
      <header className="flex items-center gap-2 border-b border-border px-3 py-2.5">
        <Sparkles className="size-3.5 shrink-0 text-primary" />
        <h2 className="min-w-0 flex-1 truncate text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          Recomendación de asignación
        </h2>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="shrink-0 cursor-help rounded border border-primary/40 bg-primary/10 px-1.5 py-0.5 text-[9px] font-bold uppercase text-primary">
              sugerencia
            </span>
          </TooltipTrigger>
          <TooltipContent className="max-w-56">
            Sugerencia del sistema con motivos explicados. La decisión final siempre es del
            analista.
          </TooltipContent>
        </Tooltip>
      </header>
      <ul className="max-h-[420px] divide-y divide-border/60 overflow-y-auto scroll-slim">
        {plan.recommendations.map((rec) => {
          const unit = plan.units.find((u) => u.id === rec.unitId);
          const driver = driverById(unit?.driverId);
          return (
            <li key={rec.id} className="px-3 py-3">
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2">
                <button
                  type="button"
                  onClick={() => unit && onSelectUnit(rec.unitId)}
                  className="min-w-0 text-left"
                >
                  <p className="truncate text-[13px] font-semibold">
                    Unidad {unit?.code} → {locationName(rec.destinationId)}
                  </p>
                  <p className="truncate text-[11px] text-muted-foreground">
                    {driver?.name} · salida sugerida {fmtStamp(rec.suggestedDepartureAt)}
                  </p>
                </button>
                <span
                  className={cn(
                    "tabular shrink-0 rounded-md border px-1.5 py-1 font-mono text-[11px] font-bold",
                    rec.score >= 90
                      ? "border-st-disponible/40 bg-st-disponible/12 text-st-disponible"
                      : rec.score >= 80
                        ? "border-st-programada/40 bg-st-programada/12 text-st-programada"
                        : "border-st-demorada/40 bg-st-demorada/12 text-st-demorada",
                  )}
                >
                  {rec.score}/100
                </span>
              </div>
              <ul className="mt-2 space-y-1">
                {rec.reasons.map((reason) => (
                  <li
                    key={reason}
                    className="flex gap-1.5 text-[11px] leading-relaxed text-muted-foreground"
                  >
                    <Check className="mt-0.5 size-3 shrink-0 text-st-disponible" />
                    {reason}
                  </li>
                ))}
                {rec.warnings?.map((warning) => (
                  <li
                    key={warning}
                    className="flex gap-1.5 text-[11px] leading-relaxed text-st-demorada"
                  >
                    <TriangleAlert className="mt-0.5 size-3 shrink-0" />
                    {warning}
                  </li>
                ))}
              </ul>
              <div className="mt-2.5 flex gap-2">
                <Button
                  size="sm"
                  className="h-7 text-[11px]"
                  onClick={() =>
                    toast.success(`Asignación aceptada (demo)`, {
                      description: `Unidad ${unit?.code} → ${locationName(rec.destinationId)}. Queda pendiente de confirmación de carga.`,
                    })
                  }
                >
                  Aceptar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-[11px]"
                  onClick={() =>
                    toast("Recomendación descartada (demo)", {
                      description: "El analista mantiene la decisión manual.",
                    })
                  }
                >
                  Descartar
                </Button>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
