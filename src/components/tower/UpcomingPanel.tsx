import { ArrowRight } from "lucide-react";
import { useState } from "react";

import { locationName } from "@/domain/catalog";
import type { WeeklyPlan } from "@/domain/types";
import { StatusChip } from "@/components/tower/StatusChip";
import { fmtStamp } from "@/lib/week";
import { cn } from "@/lib/utils";

export function UpcomingPanel({
  plan,
  onSelectUnit,
}: {
  plan: WeeklyPlan;
  onSelectUnit: (unitId: string) => void;
}) {
  const [window, setWindow] = useState<"24h" | "48h">("48h");
  const items = plan.upcoming.filter((u) => (window === "24h" ? u.window === "24h" : true));

  return (
    <section className="panel flex min-h-0 flex-col">
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 border-b border-border px-3 py-2">
        <h2 className="min-w-0 truncate text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          Próximos movimientos
        </h2>
        <div className="flex shrink-0 gap-1 rounded-md border border-border p-0.5">
          {(["24h", "48h"] as const).map((w) => (
            <button
              key={w}
              type="button"
              onClick={() => setWindow(w)}
              className={cn(
                "rounded px-2 py-0.5 font-mono text-[10px] font-semibold transition-colors",
                window === w
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {w}
            </button>
          ))}
        </div>
      </header>
      <ul className="max-h-[320px] divide-y divide-border/60 overflow-y-auto scroll-slim">
        {items.map((item) => {
          const unit = plan.units.find((u) => u.id === item.unitId);
          return (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => unit && onSelectUnit(item.unitId)}
                className="w-full px-3 py-2.5 text-left transition-colors hover:bg-surface-strong/60"
              >
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
                  <p className="flex min-w-0 items-center gap-1.5 text-[12.5px] font-medium">
                    <span className="tabular font-mono">{unit?.code}</span>
                    <span className="truncate text-muted-foreground">
                      {locationName(item.locationId)}
                    </span>
                    <ArrowRight className="size-3 shrink-0 text-muted-foreground" />
                    <span className="truncate">{locationName(item.nextDestinationId)}</span>
                  </p>
                  <StatusChip status={item.status} withTooltip={false} />
                </div>
                <p className="tabular mt-1 text-[11px] text-muted-foreground">
                  ETA {fmtStamp(item.etaAt)}
                </p>
                <p className="mt-0.5 text-[11px] text-primary">→ {item.suggestedAction}</p>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
