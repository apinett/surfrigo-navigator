/**
 * Funciones puras de despacho: ETA, margen, riesgo, prioridad y score.
 * Sin dependencias de React ni de la UI: testeables y reemplazables.
 */
import { locationById } from "./catalog";
import type {
  AssignmentScoreBreakdown,
  DepositRequest,
  DispatchConfig,
  Driver,
  RiskLevel,
  ScoreFactor,
  Unit,
  UnitAvailability,
} from "./types";

/** Parámetros operativos por defecto (objetivo de km configurable). */
export const DISPATCH_CONFIG: DispatchConfig = {
  kmTarget: 12000,
  lowRiskMarginMinutes: 240,
  mediumRiskMarginMinutes: 0,
  workshopPrepHours: 4,
};

/** Pesos del score 0–100. Visibles y ajustables en un solo lugar. */
export const SCORE_WEIGHTS = {
  disponibilidad: 22,
  cumplimientoEta: 24,
  kmAcumulados: 14,
  destinoAnterior: 10,
  provincia: 8,
  descanso: 8,
  continuidad: 6,
  necesidadOperativa: 8,
} as const;

export const toMs = (iso: string) => Date.parse(iso.endsWith("Z") ? iso : `${iso}Z`);
export const fromMs = (ms: number) => new Date(ms).toISOString().slice(0, 19);
export const addHours = (iso: string, hours: number) => fromMs(toMs(iso) + hours * 3_600_000);
export const addMinutes = (iso: string, minutes: number) => fromMs(toMs(iso) + minutes * 60_000);

/** Salida efectiva: la hora sugerida, o el momento en que la unidad esté lista. */
export function departureFor(
  request: DepositRequest,
  dateIso: string,
  availability: UnitAvailability | undefined,
  config: DispatchConfig = DISPATCH_CONFIG,
): string {
  const suggested = `${dateIso}T${request.suggestedDepartureTime}:00`;
  if (!availability) return suggested;
  let ready = availability.kind === "ahora" ? suggested : (availability.readyAt ?? suggested);
  if (availability.needsWorkshop) ready = addHours(ready, config.workshopPrepHours);
  return toMs(ready) > toMs(suggested) ? ready : suggested;
}

/** ETA de descarga = salida + tránsito del destino (+ 1h de coordinación en destino). */
export function etaFor(destinationId: string, departureAt: string): string {
  const hours = locationById(destinationId)?.transitHours ?? 12;
  return addHours(departureAt, hours + 1);
}

export const marginMinutes = (etaAt: string, targetUnloadAt: string) =>
  Math.round((toMs(targetUnloadAt) - toMs(etaAt)) / 60_000);

export function riskFor(margin: number, config: DispatchConfig = DISPATCH_CONFIG): RiskLevel {
  if (margin >= config.lowRiskMarginMinutes) return "bajo";
  if (margin >= config.mediumRiskMarginMinutes) return "medio";
  return "alto";
}

export const RISK_META: Record<RiskLevel, { label: string; chip: string; text: string; dot: string }> = {
  bajo: {
    label: "Riesgo bajo",
    chip: "border-st-disponible/40 bg-st-disponible/12 text-st-disponible",
    text: "text-st-disponible",
    dot: "bg-st-disponible",
  },
  medio: {
    label: "Riesgo medio",
    chip: "border-st-demorada/40 bg-st-demorada/12 text-st-demorada",
    text: "text-st-demorada",
    dot: "bg-st-demorada",
  },
  alto: {
    label: "Riesgo alto",
    chip: "border-st-riesgo/45 bg-st-riesgo/12 text-st-riesgo",
    text: "text-st-riesgo",
    dot: "bg-st-riesgo",
  },
};

/** Última hora viable de salida para cumplir el objetivo de descarga. */
export function latestViableDeparture(request: DepositRequest): string {
  const hours = locationById(request.destinationId)?.transitHours ?? 12;
  return addHours(request.targetUnloadAt, -(hours + 1));
}

export interface PrioritizedRequest extends DepositRequest {
  priority: number;
  latestDepartureAt: string;
  /** Holgura (min) entre la salida sugerida y la última viable. */
  slackMinutes: number;
  mustGoFirst: boolean;
}

/**
 * Prioridad derivada de la última salida viable (no de la distancia):
 * cuanto menos holgura, más arriba.
 */
export function prioritizeRequests(requests: DepositRequest[], dateIso: string): PrioritizedRequest[] {
  return [...requests]
    .map((r) => {
      const latestDepartureAt = latestViableDeparture(r);
      const suggested = `${dateIso}T${r.suggestedDepartureTime}:00`;
      return {
        ...r,
        latestDepartureAt,
        slackMinutes: Math.round((toMs(latestDepartureAt) - toMs(suggested)) / 60_000),
        priority: 0,
        mustGoFirst: false,
      };
    })
    .sort((a, b) => a.slackMinutes - b.slackMinutes)
    .map((r, i) => ({ ...r, priority: i + 1, mustGoFirst: i === 0 || r.slackMinutes <= 60 }));
}

export interface ScoreInput {
  unit: Unit;
  driver?: Driver | undefined;
  availability?: UnitAvailability | undefined;
  request: DepositRequest;
  dateIso: string;
  config?: DispatchConfig;
}

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

/** Score explicable 0–100. Nunca decide: sugiere con motivos. */
export function scoreAssignment(input: ScoreInput): AssignmentScoreBreakdown {
  const config = input.config ?? DISPATCH_CONFIG;
  const { unit, driver, availability, request, dateIso } = input;
  const departureAt = departureFor(request, dateIso, availability, config);
  const etaAt = etaFor(request.destinationId, departureAt);
  const margin = marginMinutes(etaAt, request.targetUnloadAt);
  const destination = locationById(request.destinationId);
  const factors: ScoreFactor[] = [];

  // 1. Disponibilidad real
  const w1 = SCORE_WEIGHTS.disponibilidad;
  if (availability?.kind === "ahora" && !availability.needsWorkshop) {
    factors.push({ key: "disponibilidad", label: "Disponibilidad real", points: w1, max: w1, kind: "positivo", detail: `Disponible ahora en ${locationById(availability.locationId)?.name ?? "CD Ezeiza"}.` });
  } else if (availability?.kind === "ahora") {
    factors.push({ key: "disponibilidad", label: "Disponibilidad real", points: Math.round(w1 * 0.55), max: w1, kind: "advertencia", detail: `Disponible, pero requiere revisión de taller (~${config.workshopPrepHours} h) antes de salir.` });
  } else if (availability?.readyAt) {
    const hoursAway = (toMs(availability.readyAt) - toMs(`${dateIso}T00:00:00`)) / 3_600_000;
    const pts = clamp(Math.round(w1 * (1 - hoursAway / 48)), 0, w1);
    factors.push({ key: "disponibilidad", label: "Disponibilidad real", points: pts, max: w1, kind: "advertencia", detail: `Arribo previsto a Ezeiza ${availability.readyAt.slice(5, 16).replace("T", " ")}; queda disponible después de la hora sugerida.` });
  } else {
    factors.push({ key: "disponibilidad", label: "Disponibilidad real", points: Math.round(w1 * 0.4), max: w1, kind: "supuesto", detail: "Sin arribo confirmado: se asume disponibilidad en la ventana del día." });
  }

  // 2. Cumplimiento de ETA
  const w2 = SCORE_WEIGHTS.cumplimientoEta;
  const etaPts = clamp(Math.round(w2 * (0.5 + margin / (config.lowRiskMarginMinutes * 2))), 0, w2);
  factors.push({
    key: "eta",
    label: "Cumplimiento de ETA",
    points: etaPts,
    max: w2,
    kind: margin >= config.lowRiskMarginMinutes ? "positivo" : margin >= 0 ? "advertencia" : "advertencia",
    detail:
      margin >= 0
        ? `ETA ${etaAt.slice(11, 16)} con ${Math.floor(margin / 60)} h ${margin % 60} m de holgura contra el objetivo.`
        : `ETA posterior al objetivo por ${Math.floor(-margin / 60)} h ${-margin % 60} m.`,
  });

  // 3. Km acumulados vs objetivo
  const w3 = SCORE_WEIGHTS.kmAcumulados;
  const kmTarget = unit.kmTarget || config.kmTarget;
  const kmPct = unit.kmPeriod / kmTarget;
  const projected = (unit.kmPeriod + request.km) / kmTarget;
  const kmPts = clamp(Math.round(w3 * (1 - Math.max(0, projected - 0.85) / 0.6)), 0, w3);
  factors.push({
    key: "km",
    label: "Km acumulados vs objetivo",
    points: kmPts,
    max: w3,
    kind: projected > 1 ? "advertencia" : "positivo",
    detail: `${unit.kmPeriod.toLocaleString("es-AR")} km (${Math.round(kmPct * 100)}% del objetivo); con este viaje quedaría en ${Math.round(projected * 100)}%.`,
  });

  // 4. Destino anterior (evitar repetición)
  const w4 = SCORE_WEIGHTS.destinoAnterior;
  const repeats = unit.lastDestinationId === request.destinationId;
  factors.push({
    key: "destino_anterior",
    label: "Rotación de destinos",
    points: repeats ? Math.round(w4 * 0.3) : w4,
    max: w4,
    kind: repeats ? "advertencia" : "positivo",
    detail: repeats
      ? `Último destino ya fue ${destination?.name}: repetir concentra el recorrido.`
      : `Último destino ${locationById(unit.lastDestinationId)?.name ?? "sin registro"}: rota el recorrido.`,
  });

  // 5. Provincia / domicilio del chofer
  const w5 = SCORE_WEIGHTS.provincia;
  const sameProvince = Boolean(driver && destination?.province && driver.province === destination.province);
  factors.push({
    key: "provincia",
    label: "Provincia / domicilio",
    points: sameProvince ? w5 : Math.round(w5 * 0.45),
    max: w5,
    kind: sameProvince ? "positivo" : "supuesto",
    detail: driver
      ? sameProvince
        ? `${driver.name} vive en ${driver.homeCity} (${driver.province}), coincide con la zona del destino.`
        : `${driver.name} vive en ${driver.homeCity} (${driver.province}); el destino queda fuera de su zona.`
      : "Sin chofer titular asignado.",
  });

  // 6. Descanso posible
  const w6 = SCORE_WEIGHTS.descanso;
  const rest = driver?.restDaysAvailable ?? 0;
  factors.push({
    key: "descanso",
    label: "Descanso posible",
    points: clamp(Math.round((rest / 3) * w6), 0, w6),
    max: w6,
    kind: rest === 0 ? "advertencia" : "positivo",
    detail: rest === 0 ? "Sin días de descanso disponibles: revisar antes de confirmar." : `${rest} día(s) de descanso disponibles luego del viaje.`,
  });

  // 7. Continuidad del siguiente viaje
  const w7 = SCORE_WEIGHTS.continuidad;
  const continuity = destination?.country === "AR" && (destination.kmFromEzeiza ?? 0) < 1500;
  factors.push({
    key: "continuidad",
    label: "Continuidad siguiente viaje",
    points: continuity ? w7 : Math.round(w7 * 0.5),
    max: w7,
    kind: "supuesto",
    detail: continuity
      ? "Destino con retorno corto: la unidad vuelve a estar disponible dentro de la semana."
      : "Destino largo: la unidad queda comprometida varios días (posible encadenado con retorno Chile).",
  });

  // 8. Necesidad operativa / prioridad
  const w8 = SCORE_WEIGHTS.necesidadOperativa;
  const slack = Math.round((toMs(latestViableDeparture(request)) - toMs(departureAt)) / 60_000);
  factors.push({
    key: "necesidad",
    label: "Necesidad operativa",
    points: clamp(Math.round(w8 * (slack <= 0 ? 1 : slack <= 180 ? 0.85 : 0.6)), 0, w8),
    max: w8,
    kind: slack <= 0 ? "advertencia" : "positivo",
    detail: slack <= 0
      ? "Salida crítica: ya pasó la última hora viable para cumplir el objetivo."
      : `Quedan ${Math.floor(slack / 60)} h de holgura hasta la última salida viable.`,
  });

  const total = clamp(Math.round(factors.reduce((s, f) => s + f.points, 0)), 0, 100);
  return { total, factors };
}

/** Cálculo compacto para pintar una asignación. */
export function evaluateAssignment(input: ScoreInput) {
  const config = input.config ?? DISPATCH_CONFIG;
  const departureAt = departureFor(input.request, input.dateIso, input.availability, config);
  const etaAt = etaFor(input.request.destinationId, departureAt);
  const margin = marginMinutes(etaAt, input.request.targetUnloadAt);
  const breakdown = scoreAssignment(input);
  return { departureAt, etaAt, marginMinutes: margin, risk: riskFor(margin, config), breakdown };
}
