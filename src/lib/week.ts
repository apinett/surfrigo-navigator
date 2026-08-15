/** Utilidades de semana operativa (lunes → domingo) para la Torre de Control. */

/** Lunes de la semana operativa ficticia de referencia del MVP. */
export const BASE_WEEK_START = "2026-03-02";

export const addDays = (iso: string, days: number) => {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
};

export const weekStartForOffset = (offset: number) => addDays(BASE_WEEK_START, offset * 7);

/** ISO datetime a partir del lunes + índice de día + hora "HH:mm". */
export const at = (weekStart: string, dayIndex: number, time: string) =>
  `${addDays(weekStart, dayIndex)}T${time}:00`;

export const fmtDay = (iso: string) => {
  const d = new Date(`${iso}T00:00:00Z`);
  return `${String(d.getUTCDate()).padStart(2, "0")}/${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
};

export const fmtDayLong = (iso: string) => {
  const d = new Date(`${iso}T00:00:00Z`);
  const months = [
    "enero",
    "febrero",
    "marzo",
    "abril",
    "mayo",
    "junio",
    "julio",
    "agosto",
    "septiembre",
    "octubre",
    "noviembre",
    "diciembre",
  ];
  return `${d.getUTCDate()} de ${months[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
};

export const fmtTime = (isoDateTime?: string) => (isoDateTime ? isoDateTime.slice(11, 16) : "—");

export const fmtStamp = (isoDateTime?: string) =>
  isoDateTime ? `${fmtDay(isoDateTime.slice(0, 10))} ${fmtTime(isoDateTime)}` : "—";

export const weekLabel = (weekStart: string) =>
  `${fmtDay(weekStart)} — ${fmtDay(addDays(weekStart, 6))}`;

export const weekDates = (weekStart: string) =>
  Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

/** Día "actual" simulado dentro de la semana de referencia (miércoles). */
export const SIMULATED_TODAY_INDEX = 2;

export const fmtMargin = (minutes?: number) => {
  if (minutes === undefined) return "—";
  const sign = minutes < 0 ? "-" : "+";
  const abs = Math.abs(minutes);
  return `${sign}${Math.floor(abs / 60)}h ${String(abs % 60).padStart(2, "0")}m`;
};
