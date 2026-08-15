import type { BorderCrossing, LocationNode, OperationStatus } from "./types";

export const LOCATIONS: LocationNode[] = [
  {
    id: "ezeiza",
    name: "CD Ezeiza",
    kind: "cd",
    country: "AR",
    province: "Buenos Aires",
    kmFromEzeiza: 0,
    transitHours: 0,
  },
  {
    id: "bahia",
    name: "Bahía Blanca",
    kind: "base",
    country: "AR",
    province: "Buenos Aires",
    kmFromEzeiza: 640,
    transitHours: 9,
  },
  {
    id: "neuquen",
    name: "Neuquén",
    kind: "base",
    country: "AR",
    province: "Neuquén",
    kmFromEzeiza: 1160,
    transitHours: 16,
  },
  {
    id: "bariloche",
    name: "Bariloche",
    kind: "base",
    country: "AR",
    province: "Río Negro",
    kmFromEzeiza: 1620,
    transitHours: 22,
  },
  {
    id: "trelew",
    name: "Trelew",
    kind: "base",
    country: "AR",
    province: "Chubut",
    kmFromEzeiza: 1380,
    transitHours: 19,
  },
  {
    id: "gallegos",
    name: "Río Gallegos",
    kind: "base",
    country: "AR",
    province: "Santa Cruz",
    kmFromEzeiza: 2620,
    transitHours: 36,
  },
  {
    id: "grande",
    name: "Río Grande",
    kind: "base",
    country: "AR",
    province: "Tierra del Fuego",
    kmFromEzeiza: 3060,
    transitHours: 44,
  },
  {
    id: "montt",
    name: "Puerto Montt",
    kind: "puerto",
    country: "CL",
    kmFromEzeiza: 1980,
    transitHours: 28,
  },
  {
    id: "calbuco",
    name: "Calbuco",
    kind: "puerto",
    country: "CL",
    kmFromEzeiza: 2030,
    transitHours: 29,
  },
  {
    id: "quellon",
    name: "Quellón",
    kind: "puerto",
    country: "CL",
    kmFromEzeiza: 2210,
    transitHours: 32,
  },
  {
    id: "chacabuco",
    name: "Puerto Chacabuco",
    kind: "puerto",
    country: "CL",
    kmFromEzeiza: 2460,
    transitHours: 34,
  },
  {
    id: "arenas",
    name: "Punta Arenas",
    kind: "puerto",
    country: "CL",
    kmFromEzeiza: 2890,
    transitHours: 40,
  },
  {
    id: "natales",
    name: "Puerto Natales",
    kind: "puerto",
    country: "CL",
    kmFromEzeiza: 2740,
    transitHours: 38,
  },
  {
    id: "taller",
    name: "Taller CD Ezeiza",
    kind: "taller",
    country: "AR",
    province: "Buenos Aires",
    kmFromEzeiza: 0,
  },
];

export const BORDERS: BorderCrossing[] = [
  {
    id: "balmaceda",
    name: "Paso Balmaceda / Coyhaique Alto",
    pairs: ["chacabuco", "gallegos"],
    opensAt: "08:00",
    closesAt: "20:00",
    paperworkCutoff: "19:30",
    avgProcessMinutes: 75,
    notes: "Trayecto Chacabuco → paso ~3 h. Salidas después de 16:30 quedan en riesgo.",
  },
  {
    id: "cardenal",
    name: "Cardenal Samoré",
    pairs: ["montt", "bariloche"],
    opensAt: "08:00",
    closesAt: "22:00",
    paperworkCutoff: "21:00",
    avgProcessMinutes: 90,
    notes: "Alta congestión de cargas refrigeradas entre 10:00 y 14:00.",
  },
  {
    id: "integracion",
    name: "Integración Austral",
    pairs: ["arenas", "gallegos"],
    opensAt: "07:00",
    closesAt: "23:00",
    paperworkCutoff: "22:00",
    avgProcessMinutes: 60,
  },
  {
    id: "dorotea",
    name: "Río Don Guillermo (Dorotea)",
    pairs: ["natales", "gallegos"],
    opensAt: "08:00",
    closesAt: "20:00",
    paperworkCutoff: "19:00",
    avgProcessMinutes: 55,
  },
];

export const locationById = (id?: string) => LOCATIONS.find((l) => l.id === id);
export const locationName = (id?: string) => locationById(id)?.name ?? "—";
export const borderById = (id?: string) => BORDERS.find((b) => b.id === id);

export const AR_BASES = LOCATIONS.filter((l) => l.kind === "base");
export const CL_PORTS = LOCATIONS.filter((l) => l.kind === "puerto");

export interface StatusMeta {
  label: string;
  short: string;
  /** Clases utilitarias derivadas de tokens semánticos. */
  chip: string;
  bar: string;
  dot: string;
  text: string;
  description: string;
}

export const STATUS_META: Record<OperationStatus, StatusMeta> = {
  disponible: {
    label: "Disponible",
    short: "DISP",
    chip: "bg-st-disponible/15 text-st-disponible border-st-disponible/35",
    bar: "bg-st-disponible/18 border-l-2 border-l-st-disponible hover:bg-st-disponible/26",
    dot: "bg-st-disponible",
    text: "text-st-disponible",
    description: "Unidad en base o CD, lista para asignar próximo viaje.",
  },
  programada: {
    label: "Programada",
    short: "PROG",
    chip: "bg-st-programada/15 text-st-programada border-st-programada/35",
    bar: "bg-st-programada/18 border-l-2 border-l-st-programada hover:bg-st-programada/26",
    dot: "bg-st-programada",
    text: "text-st-programada",
    description: "Salida confirmada según previsto de depósito, aún no cargó.",
  },
  cargando: {
    label: "Cargando",
    short: "CARG",
    chip: "bg-st-cargando/15 text-st-cargando border-st-cargando/35",
    bar: "bg-st-cargando/18 border-l-2 border-l-st-cargando hover:bg-st-cargando/26",
    dot: "bg-st-cargando",
    text: "text-st-cargando",
    description: "En muelle de carga (CD Ezeiza o puerto chileno).",
  },
  transito: {
    label: "En tránsito",
    short: "TRAN",
    chip: "bg-st-transito/15 text-st-transito border-st-transito/35",
    bar: "bg-st-transito/18 border-l-2 border-l-st-transito hover:bg-st-transito/26",
    dot: "bg-st-transito",
    text: "text-st-transito",
    description: "Viaje en curso con ETA activo hacia destino.",
  },
  descargando: {
    label: "Descargando",
    short: "DESC",
    chip: "bg-st-descargando/15 text-st-descargando border-st-descargando/35",
    bar: "bg-st-descargando/18 border-l-2 border-l-st-descargando hover:bg-st-descargando/26",
    dot: "bg-st-descargando",
    text: "text-st-descargando",
    description: "En destino, descargando o esperando desprecintado SENASA.",
  },
  retorno_chile: {
    label: "Retorno Chile",
    short: "RET",
    chip: "bg-st-retorno/15 text-st-retorno border-st-retorno/35",
    bar: "bg-st-retorno/18 border-l-2 border-l-st-retorno hover:bg-st-retorno/26",
    dot: "bg-st-retorno",
    text: "text-st-retorno",
    description: "Carga de salmón desde puerto chileno hacia Ezeiza.",
  },
  frontera: {
    label: "Frontera",
    short: "FRON",
    chip: "bg-st-frontera/15 text-st-frontera border-st-frontera/35",
    bar: "bg-st-frontera/18 border-l-2 border-l-st-frontera hover:bg-st-frontera/26",
    dot: "bg-st-frontera",
    text: "text-st-frontera",
    description: "En paso fronterizo: trámite, espera de apertura o liberación.",
  },
  taller: {
    label: "Taller",
    short: "TALL",
    chip: "bg-st-taller/18 text-st-taller border-st-taller/35",
    bar: "bg-st-taller/14 border-l-2 border-l-st-taller hover:bg-st-taller/22",
    dot: "bg-st-taller",
    text: "text-st-taller",
    description: "Revisión y puesta a punto antes del próximo viaje.",
  },
  riesgo: {
    label: "Riesgo",
    short: "RISK",
    chip: "bg-st-riesgo/15 text-st-riesgo border-st-riesgo/40",
    bar: "bg-st-riesgo/20 border-l-2 border-l-st-riesgo hover:bg-st-riesgo/28",
    dot: "bg-st-riesgo",
    text: "text-st-riesgo",
    description: "Operación comprometida: cierre de frontera, falta de unidad o ETA inviable.",
  },
  demorada: {
    label: "Demorada",
    short: "DEM",
    chip: "bg-st-demorada/15 text-st-demorada border-st-demorada/35",
    bar: "bg-st-demorada/18 border-l-2 border-l-st-demorada hover:bg-st-demorada/26",
    dot: "bg-st-demorada",
    text: "text-st-demorada",
    description: "ETA posterior al objetivo de descarga informado.",
  },
};

export const STATUS_ORDER: OperationStatus[] = [
  "disponible",
  "programada",
  "cargando",
  "transito",
  "descargando",
  "retorno_chile",
  "frontera",
  "taller",
  "riesgo",
  "demorada",
];

export const DAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
export const DAYS_SHORT = ["LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB", "DOM"];
