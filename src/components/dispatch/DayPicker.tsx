import { DAYS_SHORT } from "@/domain/catalog";
import type { WeekDaySummary } from "@/domain/dispatch-demo";
import { fmtDay } from "@/lib/week";

export function DayPicker({
  week,
  assignedByDay,
  alertsByDay,
  dayIndex,
  todayIndex,
  onSelect,
}: {
  week: WeekDaySummary[];
  assignedByDay: number[];
  alertsByDay: number[];
  dayIndex: number;
  todayIndex: number;
  onSelect: (day: number) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4 lg:grid-cols-7">
      {week.map((d) => {
        const active = d.dayIndex === dayIndex;
        const assigned = assignedByDay[d.dayIndex] ?? 0;
        const alerts = alertsByDay[d.dayIndex] ?? 0;
        return (
          <button
            key={d.dayIndex}
            type="button"
            aria-pressed={active}
            onClick={() => onSelect(d.dayIndex)}
            className={`rounded-md border px-2.5 py-2 text-left transition-colors ${
              active
                ? "border-primary bg-primary/10"
                : "border-border bg-surface-strong/50 hover:border-primary/40"
            }`}
          >
            <p className="flex items-center justify-between gap-1">
              <span className="text-[11px] font-semibold uppercase tracking-[0.1em]">
                {DAYS_SHORT[d.dayIndex]}
              </span>
              <span className="tabular text-[10.5px] text-muted-foreground">{fmtDay(d.date)}</span>
            </p>
            <p className="tabular mt-1 text-[11px]">
              <span className="font-semibold">{assigned}</span>
              <span className="text-muted-foreground">/{d.required} asignadas</span>
            </p>
            <p className="mt-0.5 flex items-center gap-1.5 text-[10px]">
              {alerts > 0 ? (
                <span className="rounded border border-st-riesgo/40 bg-st-riesgo/12 px-1 text-st-riesgo">
                  {alerts} alerta{alerts > 1 ? "s" : ""}
                </span>
              ) : (
                <span className="text-muted-foreground">sin alertas</span>
              )}
              {d.dayIndex === todayIndex && (
                <span className="rounded border border-primary/40 px-1 text-primary">hoy</span>
              )}
            </p>
          </button>
        );
      })}
    </div>
  );
}
