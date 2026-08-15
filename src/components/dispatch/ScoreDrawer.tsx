import { CheckCircle2, HelpCircle, TriangleAlert } from "lucide-react";

import { Progress } from "@/components/ui/progress";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { locationName } from "@/domain/catalog";
import { RISK_META, SCORE_WEIGHTS } from "@/domain/dispatch";
import type { AssignmentScoreBreakdown, DepositRequest, RiskLevel, Unit } from "@/domain/types";
import { fmtMargin, fmtStamp } from "@/lib/week";

export interface ScoreView {
  unit: Unit;
  request: DepositRequest;
  breakdown: AssignmentScoreBreakdown;
  etaAt: string;
  departureAt: string;
  marginMinutes: number;
  risk: RiskLevel;
  assigned: boolean;
}

const KIND_ICON = {
  positivo: CheckCircle2,
  advertencia: TriangleAlert,
  supuesto: HelpCircle,
} as const;

const KIND_CLASS = {
  positivo: "text-st-disponible",
  advertencia: "text-st-demorada",
  supuesto: "text-muted-foreground",
} as const;

export function ScoreDrawer({ view, onClose }: { view: ScoreView | null; onClose: () => void }) {
  return (
    <Sheet open={Boolean(view)} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full gap-0 overflow-y-auto scroll-slim border-border bg-surface p-0 sm:max-w-md">
        {view && (
          <>
            <SheetHeader className="gap-1.5 border-b border-border px-4 py-4">
              <SheetTitle className="text-base">
                Unidad {view.unit.code} → {locationName(view.request.destinationId)} —{" "}
                <span className="tabular">{view.breakdown.total}/100</span>
              </SheetTitle>
              <SheetDescription className="text-xs">
                Sugerencia explicable del sistema. La decisión y la confirmación son del analista.
              </SheetDescription>
              <Progress value={view.breakdown.total} className="mt-1 h-1.5" />
              <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px]">
                <span
                  className={`rounded border px-1.5 py-0.5 font-medium ${RISK_META[view.risk].chip}`}
                >
                  {RISK_META[view.risk].label}
                </span>
                <span className="text-muted-foreground">Salida {fmtStamp(view.departureAt)}</span>
                <span className="text-muted-foreground">ETA {fmtStamp(view.etaAt)}</span>
                <span className={view.marginMinutes < 0 ? "text-st-riesgo" : "text-st-disponible"}>
                  margen {fmtMargin(view.marginMinutes)}
                </span>
              </div>
              {!view.assigned && (
                <p className="text-[10.5px] text-muted-foreground">
                  Simulación: la unidad todavía no está asignada a esta salida.
                </p>
              )}
            </SheetHeader>

            <ul className="divide-y divide-border/60">
              {view.breakdown.factors.map((f) => {
                const Icon = KIND_ICON[f.kind];
                return (
                  <li key={f.key} className="px-4 py-3">
                    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
                      <p className="flex min-w-0 items-center gap-1.5 text-[12.5px] font-medium">
                        <Icon className={`size-3.5 shrink-0 ${KIND_CLASS[f.kind]}`} />
                        <span className="truncate">{f.label}</span>
                      </p>
                      <p className="tabular shrink-0 text-[11px] text-muted-foreground">
                        {f.points}/{f.max} pts
                      </p>
                    </div>
                    <Progress value={(f.points / f.max) * 100} className="mt-1.5 h-1" />
                    <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground">
                      {f.detail}
                    </p>
                  </li>
                );
              })}
            </ul>

            <p className="border-t border-border px-4 py-3 text-[10.5px] leading-relaxed text-muted-foreground">
              Pesos configurados: disponibilidad {SCORE_WEIGHTS.disponibilidad}, ETA{" "}
              {SCORE_WEIGHTS.cumplimientoEta}, km {SCORE_WEIGHTS.kmAcumulados}, rotación{" "}
              {SCORE_WEIGHTS.destinoAnterior}, provincia {SCORE_WEIGHTS.provincia}, descanso{" "}
              {SCORE_WEIGHTS.descanso}, continuidad {SCORE_WEIGHTS.continuidad}, necesidad{" "}
              {SCORE_WEIGHTS.necesidadOperativa}.
            </p>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
