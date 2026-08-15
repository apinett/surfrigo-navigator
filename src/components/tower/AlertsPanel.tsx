import {
  AlertTriangle,
  CalendarX,
  Clock,
  FileWarning,
  ShieldAlert,
  TruckIcon,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import type { Alert, AlertKind, WeeklyPlan } from "@/domain/types";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { fmtStamp } from "@/lib/week";
import { cn } from "@/lib/utils";

const KIND_ICON: Record<AlertKind, LucideIcon> = {
  riesgo_frontera: ShieldAlert,
  sin_proximo_viaje: CalendarX,
  salida_comprometida: AlertTriangle,
  eta_retrasado: Clock,
  deberia_estar_disponible: TruckIcon,
  documentacion_pendiente: FileWarning,
};

const SEVERITY: Record<Alert["severity"], { ring: string; text: string; label: string }> = {
  critica: { ring: "border-l-st-riesgo", text: "text-st-riesgo", label: "Crítica" },
  alta: { ring: "border-l-st-demorada", text: "text-st-demorada", label: "Alta" },
  media: { ring: "border-l-st-programada", text: "text-st-programada", label: "Media" },
};

export function AlertsPanel({
  plan,
  onSelectUnit,
}: {
  plan: WeeklyPlan;
  onSelectUnit: (unitId: string) => void;
}) {
  return (
    <section className="panel flex min-h-0 flex-col">
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 border-b border-border px-3 py-2.5">
        <h2 className="min-w-0 truncate text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          Alertas operativas
        </h2>
        <span className="tabular shrink-0 rounded bg-st-riesgo/15 px-1.5 py-0.5 font-mono text-[10px] font-bold text-st-riesgo">
          {plan.alerts.length}
        </span>
      </header>
      <ul className="max-h-[420px] divide-y divide-border/60 overflow-y-auto scroll-slim">
        {plan.alerts.map((alert) => {
          const Icon = KIND_ICON[alert.kind];
          const sev = SEVERITY[alert.severity];
          const unit = plan.units.find((u) => u.id === alert.unitId);
          return (
            <li key={alert.id}>
              <button
                type="button"
                disabled={!unit}
                onClick={() => unit && onSelectUnit(unit.id)}
                className={cn(
                  "w-full border-l-2 px-3 py-2.5 text-left transition-colors",
                  sev.ring,
                  unit ? "hover:bg-surface-strong/60" : "cursor-default",
                )}
              >
                <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-2">
                  <Icon className={cn("mt-0.5 size-3.5 shrink-0", sev.text)} />
                  <p className="min-w-0 text-[12.5px] font-medium leading-snug">{alert.title}</p>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span
                        className={cn(
                          "shrink-0 cursor-help rounded border border-current/30 px-1 py-0.5 text-[9px] font-bold uppercase",
                          sev.text,
                        )}
                      >
                        {sev.label}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>Prioridad {sev.label.toLowerCase()} de atención</TooltipContent>
                  </Tooltip>
                </div>
                <p className="mt-1 pl-5.5 text-[11px] leading-relaxed text-muted-foreground">
                  {alert.detail}
                </p>
                <p className="mt-1.5 pl-5.5 text-[11px] text-primary">→ {alert.suggestedAction}</p>
                <p className="tabular mt-1 pl-5.5 text-[10px] text-muted-foreground/70">
                  {fmtStamp(alert.createdAt)}
                </p>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
