/**
 * Surfrigo Control Tower — domain models.
 *
 * These types describe the operation independently of the UI and of the data
 * source. Today they are fed by local demo data (`src/domain/demo.ts`); later
 * they can be fed by Supabase/PostgreSQL queries without touching components.
 */

export type OperationStatus =
  | "disponible"
  | "programada"
  | "cargando"
  | "transito"
  | "descargando"
  | "retorno_chile"
  | "frontera"
  | "taller"
  | "riesgo"
  | "demorada";

export type Country = "AR" | "CL";

/** Nodo logístico: CD, base argentina o puerto chileno. */
export interface LocationNode {
  id: string;
  name: string;
  kind: "cd" | "base" | "puerto" | "frontera" | "taller";
  country: Country;
  province?: string | undefined;
  /** Km de referencia desde CD Ezeiza (planificación / equilibrio de km). */
  kmFromEzeiza?: number | undefined;
  /** Horas de tránsito estimadas desde CD Ezeiza. */
  transitHours?: number | undefined;
}

/** Paso fronterizo con ventana de atención y corte documental. */
export interface BorderCrossing {
  id: string;
  name: string;
  pairs: [string, string];
  opensAt: string;
  closesAt: string;
  /** Hora límite para presentar documentación antes del cierre. */
  paperworkCutoff: string;
  avgProcessMinutes: number;
  notes?: string | undefined;
}

export interface Driver {
  id: string;
  name: string;
  homeCity: string;
  province: string;
  phone: string;
  role: "titular" | "relevo";
  /** Km acumulados en el período vigente. */
  kmPeriod: number;
  kmTarget: number;
  restDaysAvailable: number;
  lastDestinationId?: string | undefined;
  status: "activo" | "descanso" | "licencia";
}

export interface Unit {
  id: string;
  /** Número interno visible para el analista, ej. "245". */
  code: string;
  tractorPlate: string;
  trailerPlate: string;
  trailerType: "Frigorífico 30 pallets" | "Frigorífico 28 pallets" | "Isotérmico";
  driverId: string;
  reliefDriverId?: string | undefined;
  status: OperationStatus;
  currentLocationId: string;
  lastDestinationId?: string | undefined;
  kmPeriod: number;
  kmTarget: number;
  nextTripId?: string | undefined;
  workshopDue: boolean;
  notes?: string | undefined;
}

/** Viaje planificado o en curso (Ezeiza → base, o retorno Chile → Ezeiza). */
export interface Trip {
  id: string;
  unitId: string;
  driverId: string;
  originId: string;
  destinationId: string;
  status: OperationStatus;
  departureAt: string;
  /** Hora objetivo de descarga fijada por el previsto de depósito. */
  targetUnloadAt?: string | undefined;
  etaAt: string;
  /** Margen operativo en minutos respecto del objetivo (negativo = tarde). */
  marginMinutes?: number | undefined;
  cargo: string;
  km: number;
  borderCrossingId?: string | undefined;
  documentationReady: boolean;
}

/** Bloque de la grilla semanal: ocupa 1..n días de una unidad. */
export interface Movement {
  id: string;
  unitId: string;
  tripId?: string | undefined;
  status: OperationStatus;
  /** Índice de día 0 = lunes … 6 = domingo. */
  dayIndex: number;
  /** Días que ocupa el bloque (barra continua). */
  span: number;
  title: string;
  subtitle?: string | undefined;
  fromId?: string | undefined;
  toId?: string | undefined;
  etaAt?: string | undefined;
  riskLevel?: "bajo" | "medio" | "alto" | undefined;
  tooltip?: string | undefined;
}

/** Totales de disponibilidad por nodo y por día de la semana. */
export interface Availability {
  locationId: string;
  /** 7 valores, lunes → domingo. */
  perDay: number[];
}

export interface BorderEvent {
  id: string;
  unitId: string;
  borderCrossingId: string;
  departedFromId: string;
  departedAt: string;
  etaBorderAt: string;
  paperworkSentAt?: string | undefined;
  crossProbability: number;
  outcome: "pendiente" | "cruzo" | "no_cruzo" | "riesgo";
  /** ETA recalculado si no cruza y debe esperar la reapertura. */
  recalculatedEtaAt?: string | undefined;
  comment?: string | undefined;
}

export type AlertKind =
  | "riesgo_frontera"
  | "sin_proximo_viaje"
  | "salida_comprometida"
  | "eta_retrasado"
  | "deberia_estar_disponible"
  | "documentacion_pendiente";

export interface Alert {
  id: string;
  kind: AlertKind;
  severity: "critica" | "alta" | "media";
  unitId?: string | undefined;
  title: string;
  detail: string;
  createdAt: string;
  suggestedAction: string;
}

export interface AssignmentRecommendation {
  id: string;
  unitId: string;
  destinationId: string;
  score: number;
  /** Motivos explicables — nunca mostrar un score sin razones. */
  reasons: string[];
  warnings?: string[] | undefined;
  suggestedDepartureAt: string;
}

export interface UpcomingMovement {
  id: string;
  unitId: string;
  locationId: string;
  nextDestinationId: string;
  etaAt: string;
  window: "24h" | "48h";
  suggestedAction: string;
  status: OperationStatus;
}

export interface CommunicationDraft {
  id: string;
  unitId: string;
  audience: "cliente" | "embarcador" | "senasa" | "interno";
  trigger: string;
  subject: string;
  body: string;
  createdAt: string;
}

export interface WeeklyPlan {
  /** ISO date del lunes de la semana. */
  weekStart: string;
  weekLabel: string;
  units: Unit[];
  drivers: Driver[];
  trips: Trip[];
  movements: Movement[];
  availability: Availability[];
  borderEvents: BorderEvent[];
  alerts: Alert[];
  recommendations: AssignmentRecommendation[];
  upcoming: UpcomingMovement[];
  communications: CommunicationDraft[];
  kpis: {
    operativas: number;
    disponiblesHoy: number;
    enViaje: number;
    descargando: number;
    retornosChile: number;
    salidasEnRiesgo: number;
  };
}

/* ─────────────────────────────────────────────────────────────
 * Planificación diaria de despacho (previsto de Depósito)
 * Modelado para reemplazarse por tablas Supabase sin tocar la UI.
 * ───────────────────────────────────────────────────────────── */

export type RiskLevel = "bajo" | "medio" | "alto";

/** Parámetros operativos configurables (hoy locales, luego tabla `config`). */
export interface DispatchConfig {
  /** Objetivo de km por período para unidades y choferes. */
  kmTarget: number;
  /** Margen mínimo (min) para considerar riesgo bajo. */
  lowRiskMarginMinutes: number;
  /** Margen mínimo (min) para considerar riesgo medio. */
  mediumRiskMarginMinutes: number;
  /** Horas de preparación en taller antes de volver a estar disponible. */
  workshopPrepHours: number;
}

/** Salida solicitada por Depósito para un día concreto. */
export interface DepositRequest {
  id: string;
  dayIndex: number;
  destinationId: string;
  unitsRequired: number;
  /** Hora sugerida de salida desde CD Ezeiza, "HH:mm". */
  suggestedDepartureTime: string;
  /** Cierre de la ventana de salida, "HH:mm". */
  windowEndTime: string;
  /** Objetivo de descarga informado por el previsto (ISO). */
  targetUnloadAt: string;
  cargo: string;
  km: number;
  /** Itinerario completo validado contra el catálogo de tramos. */
  routeLabel?: string | undefined;
  /** Paradas canónicas del itinerario (Ezeiza → … → destino final). */
  routeStops?: string[] | undefined;
  /** El recorrido figura tal cual en la planilla de complementos. */
  routeExact?: boolean | undefined;
  notes?: string | undefined;
}


/** Disponibilidad de una unidad para el día en foco. */
export interface UnitAvailability {
  unitId: string;
  kind: "ahora" | "proxima";
  locationId: string;
  /** ISO en que la unidad queda operativa (para "próximas"). */
  readyAt?: string | undefined;
  /** Requiere revisión de taller antes de salir. */
  needsWorkshop: boolean;
  note?: string | undefined;
}

/** Factor explicable del score de asignación. */
export interface ScoreFactor {
  key: string;
  label: string;
  points: number;
  max: number;
  detail: string;
  kind: "positivo" | "advertencia" | "supuesto";
}

export interface AssignmentScoreBreakdown {
  total: number;
  factors: ScoreFactor[];
}

/** Asignación unidad → salida solicitada, decidida por el analista. */
export interface DispatchAssignment {
  id: string;
  requestId: string;
  unitId: string;
  createdAt: string;
  departureAt: string;
  etaAt: string;
  marginMinutes: number;
  risk: RiskLevel;
  score: number;
}

export interface DailyPlan {
  weekStart: string;
  weekLabel: string;
  dayIndex: number;
  date: string;
  requests: DepositRequest[];
  availability: UnitAvailability[];
}
