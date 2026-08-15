import { ArrowRight, History, MapPin, Phone, Truck, User } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { CommsCenter } from "@/components/tower/CommsCenter";
import { StatusChip } from "@/components/tower/StatusChip";
import { STATUS_META, locationName } from "@/domain/catalog";
import { driverById } from "@/domain/demo";
import type { WeeklyPlan } from "@/domain/types";
import { DAYS, fmtStamp } from "@/lib/week";

export function UnitDrawer({
  plan,
  unitId,
  onClose,
}: {
  plan: WeeklyPlan;
  unitId?: string;
  onClose: () => void;
}) {
  const unit = plan.units.find((u) => u.id === unitId);
  const driver = driverById(unit?.driverId);
  const relief = driverById(unit?.reliefDriverId);
  const movements = plan.movements
    .filter((m) => m.unitId === unitId)
    .sort((a, b) => a.dayIndex - b.dayIndex);
  const nextTrip = plan.trips.find((t) => t.unitId === unitId);
  const recommendation = plan.recommendations.find((r) => r.unitId === unitId);
  const kmPct = unit ? Math.min(100, Math.round((unit.kmPeriod / unit.kmTarget) * 100)) : 0;

  return (
    <Sheet open={Boolean(unit)} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full gap-0 overflow-y-auto scroll-slim border-border bg-surface p-0 sm:max-w-md">
        {unit && driver && (
          <>
            <SheetHeader className="gap-2 border-b border-border px-4 py-4">
              <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3">
                <span className="tabular grid size-11 shrink-0 place-items-center rounded-lg border border-border bg-surface-strong font-mono text-base font-bold">
                  {unit.code}
                </span>
                <div className="min-w-0">
                  <SheetTitle className="truncate text-base">Unidad {unit.code}</SheetTitle>
                  <SheetDescription className="truncate text-xs">
                    {unit.tractorPlate} · {unit.trailerPlate} · {unit.trailerType}
                  </SheetDescription>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <StatusChip status={unit.status} />
                <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                  <MapPin className="size-3" /> {locationName(unit.currentLocationId)}
                </span>
              </div>
            </SheetHeader>

            <div className="space-y-4 px-4 py-4">
              <div className="grid gap-2 rounded-md border border-border bg-surface-strong/50 p-3">
                <p className="flex items-center gap-2 text-[13px] font-medium">
                  <User className="size-3.5 shrink-0 text-primary" /> {driver.name}
                  <span className="rounded border border-border px-1 text-[9px] uppercase text-muted-foreground">
                    titular
                  </span>
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {driver.homeCity}, {driver.province} · descanso disponible: {driver.restDaysAvailable} día(s)
                </p>
                <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <Phone className="size-3" /> {driver.phone}
                </p>
                {relief && (
                  <p className="border-t border-border/60 pt-2 text-[11px] text-muted-foreground">
                    Relevo asignado: <span className="text-foreground">{relief.name}</span>
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Metric label="Último destino" value={locationName(unit.lastDestinationId)} />
                <Metric label="Próximo destino" value={locationName(nextTrip?.destinationId)} />
                <Metric label="ETA" value={fmtStamp(nextTrip?.etaAt)} />
                <Metric
                  label="Riesgo"
                  value={movements.some((m) => m.riskLevel === "alto") ? "Alto" : movements.some((m) => m.riskLevel === "medio") ? "Medio" : "Bajo"}
                />
              </div>

              <div className="rounded-md border border-border p-3">
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
                  <p className="min-w-0 truncate text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                    Km del período
                  </p>
                  <p className="tabular shrink-0 text-xs">
                    {unit.kmPeriod.toLocaleString("es-AR")} / {unit.kmTarget.toLocaleString("es-AR")} km
                  </p>
                </div>
                <Progress value={kmPct} className="mt-2 h-1.5" />
                <p className="mt-1.5 text-[11px] text-muted-foreground">
                  {kmPct >= 100
                    ? "Por encima de la meta: priorizar destinos cortos o descanso."
                    : `${100 - kmPct}% por debajo de la meta de referencia del período.`}
                </p>
              </div>

              {recommendation && (
                <div className="rounded-md border border-primary/40 bg-primary/8 p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-primary">
                    Recomendación · score {recommendation.score}/100
                  </p>
                  <p className="mt-1 text-[13px] font-medium">
                    Unidad {unit.code} → {locationName(recommendation.destinationId)}
                  </p>
                  <ul className="mt-2 space-y-1">
                    {recommendation.reasons.map((r) => (
                      <li key={r} className="text-[11px] leading-relaxed text-muted-foreground">• {r}</li>
                    ))}
                  </ul>
                  <p className="mt-2 text-[10px] text-muted-foreground/80">
                    Sugerencia del sistema. La decisión final es del analista.
                  </p>
                </div>
              )}

              <div>
                <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                  <History className="size-3" /> Cadena de la semana
                </p>
                <ol className="mt-2 space-y-1.5">
                  {movements.map((m) => (
                    <li key={m.id} className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-2">
                      <span className="tabular mt-0.5 w-14 shrink-0 font-mono text-[10px] uppercase text-muted-foreground">
                        {DAYS[m.dayIndex]?.slice(0, 3)}
                        {m.span > 1 ? `+${m.span - 1}` : ""}
                      </span>
                      <span className="min-w-0">
                        <span className="flex min-w-0 items-center gap-1.5">
                          <span className={`size-1.5 shrink-0 rounded-full ${STATUS_META[m.status].dot}`} />
                          <span className="truncate text-[12px]">{m.title}</span>
                        </span>
                        {m.subtitle && (
                          <span className="block truncate text-[10.5px] text-muted-foreground">
                            {m.subtitle}
                          </span>
                        )}
                      </span>
                    </li>
                  ))}
                </ol>
              </div>

              <CommsCenter plan={plan} unitId={unit.id} expanded />

              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={() =>
                    toast.success("Estado actualizado (demo)", {
                      description: `Unidad ${unit.code} marcada con novedad de seguimiento.`,
                    })
                  }
                >
                  <Truck className="size-3.5" /> Actualizar estado
                </Button>
                <Button
                  variant="outline"
                  onClick={() =>
                    toast("Asignar próximo movimiento (demo)", {
                      description: "En la versión conectada, esto crea el viaje en la base de datos.",
                    })
                  }
                >
                  Asignar movimiento <ArrowRight className="size-3.5" />
                </Button>
              </div>
              {unit.notes && (
                <p className="text-[11px] italic text-muted-foreground">Nota: {unit.notes}</p>
              )}
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border px-2.5 py-2">
      <p className="truncate text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
        {label}
      </p>
      <p className="tabular mt-0.5 truncate text-[12.5px] font-medium">{value}</p>
    </div>
  );
}
