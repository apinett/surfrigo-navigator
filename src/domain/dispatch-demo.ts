/**
 * Datos DEMO de planificación diaria (ficticios).
 * Cada builder puede reemplazarse por una consulta a Supabase que devuelva
 * exactamente los mismos tipos de `./types`.
 */
import { addDays, weekLabel, weekStartForOffset } from "@/lib/week";
import { locationById } from "./catalog";
import { buildWeeklyPlan } from "./demo";
import { DISPATCH_CONFIG, addHours } from "./dispatch";
import type { DailyPlan, DepositRequest, UnitAvailability, Unit } from "./types";

interface RequestSeed {
  destinationId: string;
  unitsRequired: number;
  departure: string;
  windowEnd: string;
  /** Días después de la salida en que vence el objetivo de descarga. */
  targetDayOffset: number;
  targetTime: string;
  cargo: string;
  notes?: string;
}

/** Previsto de Depósito por día de la semana (lunes = 0). */
const REQUESTS_BY_DAY: RequestSeed[][] = [
  [
    { destinationId: "bahia", unitsRequired: 2, departure: "14:00", windowEnd: "17:00", targetDayOffset: 1, targetTime: "06:00", cargo: "Aéreo consolidado + fresco", notes: "Descarga con turno fijo en base." },
    { destinationId: "neuquen", unitsRequired: 2, departure: "12:00", windowEnd: "16:00", targetDayOffset: 2, targetTime: "06:00", cargo: "Consolidado supermercados" },
    { destinationId: "trelew", unitsRequired: 1, departure: "10:00", windowEnd: "13:00", targetDayOffset: 2, targetTime: "10:00", cargo: "Fresco + congelado" },
    { destinationId: "gallegos", unitsRequired: 1, departure: "08:00", windowEnd: "11:00", targetDayOffset: 3, targetTime: "08:00", cargo: "Congelado pallets altos", notes: "Tramo largo: confirmar relevo." },
  ],
  [
    { destinationId: "bahia", unitsRequired: 1, departure: "13:00", windowEnd: "16:00", targetDayOffset: 1, targetTime: "07:00", cargo: "Fresco diario" },
    { destinationId: "bariloche", unitsRequired: 2, departure: "09:00", windowEnd: "12:00", targetDayOffset: 2, targetTime: "09:00", cargo: "Consolidado hotelería" },
    { destinationId: "neuquen", unitsRequired: 1, departure: "11:30", windowEnd: "15:00", targetDayOffset: 2, targetTime: "08:00", cargo: "Aéreo consolidado" },
  ],
  [
    { destinationId: "neuquen", unitsRequired: 2, departure: "12:30", windowEnd: "16:00", targetDayOffset: 2, targetTime: "06:00", cargo: "Consolidado supermercados" },
    { destinationId: "bahia", unitsRequired: 2, departure: "15:00", windowEnd: "18:00", targetDayOffset: 1, targetTime: "06:00", cargo: "Fresco diario" },
    { destinationId: "trelew", unitsRequired: 1, departure: "09:30", windowEnd: "12:30", targetDayOffset: 2, targetTime: "08:00", cargo: "Congelado" },
    { destinationId: "grande", unitsRequired: 1, departure: "07:00", windowEnd: "10:00", targetDayOffset: 4, targetTime: "10:00", cargo: "Congelado TDF", notes: "Cruce por Integración Austral." },
  ],
  [
    { destinationId: "bahia", unitsRequired: 2, departure: "14:30", windowEnd: "18:00", targetDayOffset: 1, targetTime: "06:30", cargo: "Fresco + aéreo" },
    { destinationId: "gallegos", unitsRequired: 1, departure: "08:30", windowEnd: "11:30", targetDayOffset: 3, targetTime: "09:00", cargo: "Congelado pallets altos" },
    { destinationId: "neuquen", unitsRequired: 1, departure: "12:00", windowEnd: "15:30", targetDayOffset: 2, targetTime: "07:00", cargo: "Consolidado" },
  ],
  [
    { destinationId: "bahia", unitsRequired: 2, departure: "13:30", windowEnd: "17:00", targetDayOffset: 1, targetTime: "06:00", cargo: "Fresco fin de semana" },
    { destinationId: "bariloche", unitsRequired: 1, departure: "09:00", windowEnd: "12:00", targetDayOffset: 2, targetTime: "10:00", cargo: "Consolidado hotelería" },
    { destinationId: "trelew", unitsRequired: 2, departure: "10:30", windowEnd: "14:00", targetDayOffset: 2, targetTime: "09:00", cargo: "Congelado + fresco" },
    { destinationId: "neuquen", unitsRequired: 1, departure: "11:00", windowEnd: "14:30", targetDayOffset: 2, targetTime: "06:00", cargo: "Aéreo consolidado", notes: "Objetivo ajustado: prioridad alta." },
  ],
  [
    { destinationId: "bahia", unitsRequired: 1, departure: "12:00", windowEnd: "15:00", targetDayOffset: 1, targetTime: "08:00", cargo: "Fresco" },
    { destinationId: "neuquen", unitsRequired: 1, departure: "10:00", windowEnd: "13:00", targetDayOffset: 2, targetTime: "09:00", cargo: "Consolidado" },
  ],
  [
    { destinationId: "bahia", unitsRequired: 1, departure: "16:00", windowEnd: "19:00", targetDayOffset: 1, targetTime: "07:00", cargo: "Fresco lunes temprano" },
    { destinationId: "trelew", unitsRequired: 1, departure: "09:00", windowEnd: "12:00", targetDayOffset: 2, targetTime: "10:00", cargo: "Congelado" },
  ],
];

export function buildDepositRequests(weekStart: string, dayIndex: number): DepositRequest[] {
  const seeds = REQUESTS_BY_DAY[dayIndex] ?? [];
  const date = addDays(weekStart, dayIndex);
  return seeds.map((s, i) => ({
    id: `req-${dayIndex}-${s.destinationId}-${i}`,
    dayIndex,
    destinationId: s.destinationId,
    unitsRequired: s.unitsRequired,
    suggestedDepartureTime: s.departure,
    windowEndTime: s.windowEnd,
    targetUnloadAt: `${addDays(date, s.targetDayOffset)}T${s.targetTime}:00`,
    cargo: s.cargo,
    km: locationById(s.destinationId)?.kmFromEzeiza ?? 0,
    notes: s.notes,
  }));
}

/** Día en que la unidad queda liberada (determinístico, no aleatorio). */
const readyDayFor = (index: number, offset: number) => (index * 3 + offset * 2) % 7;

export function buildAvailability(units: Unit[], weekStart: string, dayIndex: number, offset: number): UnitAvailability[] {
  const date = addDays(weekStart, dayIndex);
  const out: UnitAvailability[] = [];

  units.forEach((unit, i) => {
    const readyDay = readyDayFor(i, offset);
    const hour = 5 + ((i * 5) % 14);
    const readyAt = `${addDays(weekStart, readyDay)}T${String(hour).padStart(2, "0")}:${i % 2 ? "30" : "00"}:00`;
    const needsWorkshop = unit.workshopDue;
    const diff = readyDay - dayIndex;

    if (diff <= 0 && diff >= -2) {
      out.push({
        unitId: unit.id,
        kind: "ahora",
        locationId: "ezeiza",
        needsWorkshop,
        note: needsWorkshop
          ? `Requiere revisión de taller (~${DISPATCH_CONFIG.workshopPrepHours} h) antes de salir.`
          : diff === 0
            ? `Liberada hoy ${readyAt.slice(11, 16)} en CD Ezeiza.`
            : `Disponible en CD Ezeiza desde ${readyAt.slice(5, 10).split("-").reverse().join("/")}.`,
      });
    } else if (diff === 1 || diff === 2) {
      out.push({
        unitId: unit.id,
        kind: "proxima",
        locationId: unit.currentLocationId,
        readyAt,
        needsWorkshop,
        note: `Arribo previsto a CD Ezeiza ${readyAt.slice(5, 16).replace("T", " ")} desde ${locationById(unit.currentLocationId)?.name ?? "ruta"}.`,
      });
    } else if (diff === -3) {
      // Unidad liberada hace días: se asume ya reasignada, queda fuera del pool.
      out.push({
        unitId: unit.id,
        kind: "proxima",
        locationId: unit.currentLocationId,
        readyAt: addHours(`${date}T18:00:00`, 24),
        needsWorkshop,
        note: "Retorno estimado sin confirmación de puerto.",
      });
    }
  });

  return out;
}

export function buildDailyPlan(offset: number, dayIndex: number): DailyPlan {
  const weekStart = weekStartForOffset(offset);
  const plan = buildWeeklyPlan(offset);
  return {
    weekStart,
    weekLabel: weekLabel(weekStart),
    dayIndex,
    date: addDays(weekStart, dayIndex),
    requests: buildDepositRequests(weekStart, dayIndex),
    availability: buildAvailability(plan.units, weekStart, dayIndex, offset),
  };
}

export interface WeekDaySummary {
  dayIndex: number;
  date: string;
  required: number;
  availableNow: number;
  arrivals: number;
}

/** Franja semanal compacta de contexto (disponibles, arribos, salidas pendientes). */
export function buildWeekContext(offset: number, units: Unit[]): WeekDaySummary[] {
  const weekStart = weekStartForOffset(offset);
  return Array.from({ length: 7 }, (_, d) => {
    const availability = buildAvailability(units, weekStart, d, offset);
    return {
      dayIndex: d,
      date: addDays(weekStart, d),
      required: buildDepositRequests(weekStart, d).reduce((s, r) => s + r.unitsRequired, 0),
      availableNow: availability.filter((a) => a.kind === "ahora").length,
      arrivals: availability.filter((a) => a.kind === "proxima").length,
    };
  });
}
