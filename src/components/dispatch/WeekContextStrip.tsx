import { DAYS_SHORT } from "@/domain/catalog";
import type { WeekDaySummary } from "@/domain/dispatch-demo";
import { fmtDay } from "@/lib/week";

export function WeekContextStrip({
  week,
  assignedByDay,
  dayIndex,
  onSelect,
}: {
  week: WeekDaySummary[];
  assignedByDay: number[];
  dayIndex: number;
  onSelect: (day: number) => void;
}) {
  const max = Math.max(...week.map((d) => Math.max(d.availableNow, d.required, d.arrivals)), 1);
  return (
    <section className="panel p-3">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
        <h2 className="truncate text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          Contexto semanal · disponibilidad prevista en Ezeiza
        </h2>
        <p className="flex shrink-0 items-center gap-2.5 text-[10px] text-muted-foreground">
          <Legend className="bg-st-disponible" label="Disponibles" />
          <Legend className="bg-st-transito" label="Arribos" />
          <Legend className="bg-st-programada" label="Salidas pendientes" />
        </p>
      </div>
      <div className="mt-2.5 grid grid-cols-7 gap-1.5">
        {week.map((d) => {
          const pending = Math.max(0, d.required - (assignedByDay[d.dayIndex] ?? 0));
          return (
            <button
              key={d.dayIndex}
              type="button"
              onClick={() => onSelect(d.dayIndex)}
              className={`rounded border px-1.5 pb-1.5 pt-1 text-left transition-colors ${
                d.dayIndex === dayIndex
                  ? "border-primary bg-primary/8"
                  : "border-border hover:border-primary/40"
              }`}
            >
              <p className="flex items-center justify-between text-[10px] text-muted-foreground">
                <span className="font-semibold text-foreground">{DAYS_SHORT[d.dayIndex]}</span>
                <span className="tabular">{fmtDay(d.date)}</span>
              </p>
              <div className="mt-1.5 flex h-14 items-end gap-1">
                <Bar
                  value={d.availableNow}
                  max={max}
                  className="bg-st-disponible/70"
                  title={`${d.availableNow} disponibles`}
                />
                <Bar
                  value={d.arrivals}
                  max={max}
                  className="bg-st-transito/70"
                  title={`${d.arrivals} arribos previstos`}
                />
                <Bar
                  value={pending}
                  max={max}
                  className="bg-st-programada/70"
                  title={`${pending} salidas pendientes`}
                />
              </div>
              <p className="tabular mt-1 text-[10px] text-muted-foreground">
                {d.availableNow} · {d.arrivals} · {pending}
              </p>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function Bar({
  value,
  max,
  className,
  title,
}: {
  value: number;
  max: number;
  className: string;
  title: string;
}) {
  return (
    <span
      title={title}
      className={`min-h-[2px] flex-1 rounded-sm ${className}`}
      style={{ height: `${Math.round((value / max) * 100)}%` }}
    />
  );
}

function Legend({ className, label }: { className: string; label: string }) {
  return (
    <span className="flex items-center gap-1">
      <span className={`size-2 rounded-sm ${className}`} /> {label}
    </span>
  );
}
