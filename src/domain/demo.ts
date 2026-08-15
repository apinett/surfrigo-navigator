/**
 * Datos DEMO locales (ficticios) para la Torre de Control.
 * No representan datos reales de Surfrigo ni personas reales.
 *
 * Reemplazo futuro: cada builder de este archivo puede pasar a ser una consulta
 * a Supabase que devuelva exactamente los mismos tipos de `./types`.
 */
import { at, weekLabel, weekStartForOffset, SIMULATED_TODAY_INDEX } from "@/lib/week";
import { BORDERS, LOCATIONS, locationName } from "./catalog";
import type {
  Alert,
  AssignmentRecommendation,
  Availability,
  BorderEvent,
  CommunicationDraft,
  Driver,
  Movement,
  OperationStatus,
  Trip,
  Unit,
  UpcomingMovement,
  WeeklyPlan,
} from "./types";

export const DRIVERS: Driver[] = [
  { id: "d01", name: "Ramiro Vega", homeCity: "Cañuelas", province: "Buenos Aires", phone: "+54 9 11 4000 0101", role: "titular", kmPeriod: 9840, kmTarget: 12000, restDaysAvailable: 2, lastDestinationId: "bahia", status: "activo" },
  { id: "d02", name: "Hernán Quiroga", homeCity: "Neuquén", province: "Neuquén", phone: "+54 9 299 400 0102", role: "titular", kmPeriod: 7420, kmTarget: 12000, restDaysAvailable: 1, lastDestinationId: "neuquen", status: "activo" },
  { id: "d03", name: "Damián Ledesma", homeCity: "Bahía Blanca", province: "Buenos Aires", phone: "+54 9 291 400 0103", role: "titular", kmPeriod: 11380, kmTarget: 12000, restDaysAvailable: 0, lastDestinationId: "trelew", status: "activo" },
  { id: "d04", name: "Sergio Bermúdez", homeCity: "Trelew", province: "Chubut", phone: "+54 9 280 400 0104", role: "titular", kmPeriod: 12960, kmTarget: 12000, restDaysAvailable: 2, lastDestinationId: "montt", status: "activo" },
  { id: "d05", name: "Nicolás Ferrari", homeCity: "Luján", province: "Buenos Aires", phone: "+54 9 11 4000 0105", role: "titular", kmPeriod: 6120, kmTarget: 12000, restDaysAvailable: 3, lastDestinationId: "bahia", status: "activo" },
  { id: "d06", name: "Marcos Ibarra", homeCity: "Bariloche", province: "Río Negro", phone: "+54 9 294 400 0106", role: "titular", kmPeriod: 10240, kmTarget: 12000, restDaysAvailable: 1, lastDestinationId: "bariloche", status: "activo" },
  { id: "d07", name: "Julián Peralta", homeCity: "Río Gallegos", province: "Santa Cruz", phone: "+54 9 2966 40 0107", role: "titular", kmPeriod: 13480, kmTarget: 12000, restDaysAvailable: 0, lastDestinationId: "gallegos", status: "activo" },
  { id: "d08", name: "Emiliano Sosa", homeCity: "Zárate", province: "Buenos Aires", phone: "+54 9 3487 40 0108", role: "titular", kmPeriod: 8360, kmTarget: 12000, restDaysAvailable: 2, lastDestinationId: "chacabuco", status: "activo" },
  { id: "d09", name: "Fabián Correa", homeCity: "Río Grande", province: "Tierra del Fuego", phone: "+54 9 2964 40 0109", role: "titular", kmPeriod: 12140, kmTarget: 12000, restDaysAvailable: 1, lastDestinationId: "grande", status: "activo" },
  { id: "d10", name: "Leandro Arce", homeCity: "Merlo", province: "Buenos Aires", phone: "+54 9 11 4000 0110", role: "titular", kmPeriod: 5480, kmTarget: 12000, restDaysAvailable: 3, lastDestinationId: "neuquen", status: "activo" },
  { id: "d11", name: "Cristian Duarte", homeCity: "Bahía Blanca", province: "Buenos Aires", phone: "+54 9 291 400 0111", role: "titular", kmPeriod: 9020, kmTarget: 12000, restDaysAvailable: 2, lastDestinationId: "quellon", status: "activo" },
  { id: "d12", name: "Gonzalo Ríos", homeCity: "Esquel", province: "Chubut", phone: "+54 9 2945 40 0112", role: "titular", kmPeriod: 10680, kmTarget: 12000, restDaysAvailable: 1, lastDestinationId: "bariloche", status: "activo" },
  { id: "d13", name: "Iván Molina", homeCity: "Ezeiza", province: "Buenos Aires", phone: "+54 9 11 4000 0113", role: "titular", kmPeriod: 4260, kmTarget: 12000, restDaysAvailable: 3, lastDestinationId: "bahia", status: "activo" },
  { id: "d14", name: "Rodrigo Salas", homeCity: "Neuquén", province: "Neuquén", phone: "+54 9 299 400 0114", role: "titular", kmPeriod: 11760, kmTarget: 12000, restDaysAvailable: 0, lastDestinationId: "arenas", status: "activo" },
  { id: "d15", name: "Pablo Cáceres", homeCity: "Comodoro Rivadavia", province: "Chubut", phone: "+54 9 297 400 0115", role: "titular", kmPeriod: 8890, kmTarget: 12000, restDaysAvailable: 2, lastDestinationId: "trelew", status: "activo" },
  { id: "d16", name: "Matías Aguirre", homeCity: "San Justo", province: "Buenos Aires", phone: "+54 9 11 4000 0116", role: "titular", kmPeriod: 7310, kmTarget: 12000, restDaysAvailable: 2, lastDestinationId: "natales", status: "activo" },
  { id: "d17", name: "Diego Villalba", homeCity: "Cipolletti", province: "Río Negro", phone: "+54 9 299 400 0117", role: "titular", kmPeriod: 12520, kmTarget: 12000, restDaysAvailable: 1, lastDestinationId: "montt", status: "descanso" },
  { id: "d18", name: "Ariel Godoy", homeCity: "Pilar", province: "Buenos Aires", phone: "+54 9 230 400 0118", role: "titular", kmPeriod: 6740, kmTarget: 12000, restDaysAvailable: 3, lastDestinationId: "calbuco", status: "activo" },
  { id: "r01", name: "Walter Núñez", homeCity: "Ezeiza", province: "Buenos Aires", phone: "+54 9 11 4000 0201", role: "relevo", kmPeriod: 3120, kmTarget: 12000, restDaysAvailable: 4, status: "activo" },
  { id: "r02", name: "Facundo Ojeda", homeCity: "Cañuelas", province: "Buenos Aires", phone: "+54 9 11 4000 0202", role: "relevo", kmPeriod: 2480, kmTarget: 12000, restDaysAvailable: 4, status: "activo" },
];

export const driverById = (id?: string) => DRIVERS.find((d) => d.id === id);

/** Plantilla de cadena operativa por unidad (se despliega sobre la grilla). */
interface Segment {
  status: OperationStatus;
  span: number;
  title: string;
  subtitle?: string;
  fromId?: string;
  toId?: string;
  time?: string;
  risk?: "bajo" | "medio" | "alto";
  tooltip?: string;
}

interface UnitSeed {
  code: string;
  tractorPlate: string;
  trailerPlate: string;
  driverId: string;
  reliefDriverId?: string;
  trailerType: Unit["trailerType"];
  currentLocationId: string;
  lastDestinationId: string;
  kmPeriod: number;
  workshopDue?: boolean;
  startDay: number;
  chain: Segment[];
  notes?: string;
}

const cargaEzeiza = (toId: string, time: string): Segment => ({
  status: "cargando",
  span: 1,
  title: `Carga CD Ezeiza`,
  subtitle: `Destino ${locationName(toId)} · ${time}`,
  fromId: "ezeiza",
  toId,
  time,
  tooltip: `Carga de aéreo/consolidado en CD Ezeiza con salida ${time}.`,
});

const transito = (fromId: string, toId: string, span: number, eta: string, status: OperationStatus = "transito"): Segment => ({
  status,
  span,
  title: `${locationName(fromId)} → ${locationName(toId)}`,
  subtitle: `ETA ${eta}`,
  fromId,
  toId,
  time: eta,
  tooltip: `Tránsito ${locationName(fromId)} → ${locationName(toId)}. ETA objetivo ${eta}.`,
});

const descarga = (atId: string, time: string): Segment => ({
  status: "descargando",
  span: 1,
  title: `Descarga ${locationName(atId)}`,
  subtitle: `Desde ${time} · SENASA`,
  toId: atId,
  time,
  tooltip: "Desprecintado y descarga. Requiere documentación SENASA enviada.",
});

const disponible = (atId: string, span = 1, subtitle = "Sin próximo viaje"): Segment => ({
  status: "disponible",
  span,
  title: `Disponible ${locationName(atId)}`,
  subtitle,
  toId: atId,
  tooltip: "Unidad liberada, puede recibir asignación.",
});

const UNIT_SEEDS: UnitSeed[] = [
  {
    code: "201", tractorPlate: "AF 412 KL", trailerPlate: "SR 118 TR", driverId: "d01", trailerType: "Frigorífico 30 pallets",
    currentLocationId: "bahia", lastDestinationId: "bahia", kmPeriod: 9840, startDay: 0,
    chain: [
      cargaEzeiza("bahia", "14:00"),
      transito("ezeiza", "bahia", 1, "Mar 06:00"),
      descarga("bahia", "06:00"),
      disponible("bahia", 1, "Chofer domiciliado en zona"),
      cargaEzeiza("neuquen", "13:00"),
      transito("ezeiza", "neuquen", 2, "Dom 06:00"),
    ],
  },
  {
    code: "204", tractorPlate: "AE 776 QP", trailerPlate: "SR 121 TR", driverId: "d02", trailerType: "Frigorífico 30 pallets",
    currentLocationId: "neuquen", lastDestinationId: "neuquen", kmPeriod: 7420, startDay: 0,
    chain: [
      cargaEzeiza("neuquen", "12:30"),
      transito("ezeiza", "neuquen", 2, "Mié 06:00"),
      descarga("neuquen", "06:00"),
      disponible("neuquen", 1, "Día en casa autorizado"),
      transito("neuquen", "ezeiza", 2, "Dom 10:00"),
    ],
  },
  {
    code: "207", tractorPlate: "AD 093 MN", trailerPlate: "SR 130 TR", driverId: "d03", trailerType: "Frigorífico 28 pallets",
    currentLocationId: "trelew", lastDestinationId: "trelew", kmPeriod: 11380, startDay: 0,
    chain: [
      transito("ezeiza", "trelew", 2, "Mar 18:00"),
      descarga("trelew", "08:00"),
      disponible("trelew", 1),
      transito("trelew", "ezeiza", 2, "Sáb 12:00"),
      { status: "taller", span: 1, title: "Taller CD Ezeiza", subtitle: "Service 90.000 km", toId: "taller", tooltip: "Puesta a punto antes del próximo viaje." },
    ],
  },
  {
    code: "212", tractorPlate: "AG 552 RT", trailerPlate: "SR 142 TR", driverId: "d04", reliefDriverId: "r01", trailerType: "Frigorífico 30 pallets",
    currentLocationId: "montt", lastDestinationId: "montt", kmPeriod: 12960, startDay: 0,
    chain: [
      { status: "cargando", span: 1, title: "Carga Puerto Montt", subtitle: "Salmón fresco · 26 pallets", fromId: "montt", toId: "ezeiza", tooltip: "Carga en planta de proceso. Se comunica al cliente al salir." },
      { status: "retorno_chile", span: 2, title: "Puerto Montt → Cardenal Samoré", subtitle: "ETA paso Mié 11:00", fromId: "montt", toId: "cardenal", tooltip: "Retorno Chile con ETA dinámico." },
      { status: "frontera", span: 1, title: "Cardenal Samoré", subtitle: "Trámite ~90 min", toId: "cardenal", risk: "bajo", tooltip: "Paso abierto 08:00–22:00. Corte documental 21:00." },
      transito("cardenal", "ezeiza", 2, "Sáb 09:00", "retorno_chile"),
      disponible("ezeiza", 1, "Liberada tras descarga aeropuerto"),
    ],
  },
  {
    code: "215", tractorPlate: "AC 318 BZ", trailerPlate: "SR 149 TR", driverId: "d05", trailerType: "Isotérmico",
    currentLocationId: "ezeiza", lastDestinationId: "bahia", kmPeriod: 6120, startDay: 0,
    chain: [
      disponible("ezeiza", 1, "Km por debajo de meta"),
      cargaEzeiza("bahia", "15:30"),
      transito("ezeiza", "bahia", 1, "Mié 06:00"),
      descarga("bahia", "06:30"),
      disponible("bahia", 1),
      transito("bahia", "ezeiza", 1, "Sáb 20:00"),
      disponible("ezeiza", 1),
    ],
  },
  {
    code: "218", tractorPlate: "AF 901 HK", trailerPlate: "SR 155 TR", driverId: "d06", trailerType: "Frigorífico 30 pallets",
    currentLocationId: "bariloche", lastDestinationId: "bariloche", kmPeriod: 10240, startDay: 0,
    chain: [
      cargaEzeiza("bariloche", "09:00"),
      transito("ezeiza", "bariloche", 2, "Mié 08:00"),
      descarga("bariloche", "08:00"),
      disponible("bariloche", 1, "Chofer domiciliado en Bariloche"),
      { status: "cargando", span: 1, title: "Reposicionamiento a Puerto Montt", subtitle: "Vacío · cruce Samoré", fromId: "bariloche", toId: "montt" },
      transito("bariloche", "montt", 1, "Dom 14:00"),
    ],
  },
  {
    code: "221", tractorPlate: "AD 447 CV", trailerPlate: "SR 160 TR", driverId: "d07", trailerType: "Frigorífico 30 pallets",
    currentLocationId: "gallegos", lastDestinationId: "gallegos", kmPeriod: 13480, startDay: 0,
    chain: [
      transito("ezeiza", "gallegos", 2, "Mar 22:00"),
      descarga("gallegos", "07:00"),
      disponible("gallegos", 1, "Chofer sobre meta de km"),
      { status: "demorada", span: 2, title: "Río Gallegos → Ezeiza", subtitle: "Demora por viento en RN3", fromId: "gallegos", toId: "ezeiza", risk: "medio", tooltip: "ETA original Sáb 08:00, revisado Dom 04:00." },
      disponible("ezeiza", 1),
    ],
  },
  {
    code: "224", tractorPlate: "AG 205 DF", trailerPlate: "SR 166 TR", driverId: "d08", trailerType: "Frigorífico 30 pallets",
    currentLocationId: "chacabuco", lastDestinationId: "chacabuco", kmPeriod: 8360, startDay: 0,
    chain: [
      disponible("chacabuco", 1, "Esperando embarque de planta"),
      { status: "cargando", span: 1, title: "Carga Puerto Chacabuco", subtitle: "Salida 17:00", fromId: "chacabuco", toId: "ezeiza" },
      { status: "riesgo", span: 1, title: "Riesgo cruce Balmaceda", subtitle: "ETA paso 20:10 · cierre 20:00", fromId: "chacabuco", toId: "balmaceda", risk: "alto", tooltip: "Trayecto ~3 h. Presentación de papeles hasta 19:30. Probabilidad de cruce 18%." },
      { status: "frontera", span: 1, title: "Balmaceda — reapertura 08:00", subtitle: "Trámite estimado 09:15", toId: "balmaceda", risk: "medio", tooltip: "ETA recalculado por no cruce: liberación Vie 09:15." },
      transito("balmaceda", "ezeiza", 2, "Dom 16:00", "retorno_chile"),
    ],
    notes: "Unidad testigo del caso de riesgo de frontera.",
  },
  {
    code: "227", tractorPlate: "AE 660 JN", trailerPlate: "SR 171 TR", driverId: "d09", trailerType: "Frigorífico 28 pallets",
    currentLocationId: "grande", lastDestinationId: "grande", kmPeriod: 12140, startDay: 0,
    chain: [
      transito("ezeiza", "grande", 3, "Jue 10:00"),
      descarga("grande", "10:00"),
      disponible("grande", 1),
      transito("grande", "gallegos", 2, "Dom 18:00"),
    ],
  },
  {
    code: "230", tractorPlate: "AF 128 SW", trailerPlate: "SR 178 TR", driverId: "d10", trailerType: "Frigorífico 30 pallets",
    currentLocationId: "ezeiza", lastDestinationId: "neuquen", kmPeriod: 5480, startDay: 0,
    chain: [
      { status: "taller", span: 2, title: "Taller CD Ezeiza", subtitle: "Equipo de frío · termostato", toId: "taller", tooltip: "Reparación de equipo de frío. Sale del taller miércoles." },
      disponible("ezeiza", 1, "Liberada por taller"),
      cargaEzeiza("trelew", "11:00"),
      transito("ezeiza", "trelew", 2, "Sáb 12:00"),
      descarga("trelew", "12:00"),
    ],
  },
  {
    code: "233", tractorPlate: "AC 774 PL", trailerPlate: "SR 184 TR", driverId: "d11", trailerType: "Frigorífico 30 pallets",
    currentLocationId: "quellon", lastDestinationId: "quellon", kmPeriod: 9020, startDay: 0,
    chain: [
      { status: "cargando", span: 1, title: "Carga Quellón", subtitle: "Salmón congelado · 28 pallets", fromId: "quellon", toId: "ezeiza" },
      { status: "retorno_chile", span: 2, title: "Quellón → Cardenal Samoré", subtitle: "ETA paso Mié 16:00", fromId: "quellon", toId: "cardenal" },
      { status: "frontera", span: 1, title: "Cardenal Samoré", subtitle: "Liberado 18:40", toId: "cardenal", risk: "bajo" },
      transito("cardenal", "ezeiza", 2, "Sáb 06:00", "retorno_chile"),
      descarga("ezeiza", "08:00"),
    ],
  },
  {
    code: "236", tractorPlate: "AG 019 XT", trailerPlate: "SR 190 TR", driverId: "d12", trailerType: "Frigorífico 30 pallets",
    currentLocationId: "bariloche", lastDestinationId: "bariloche", kmPeriod: 10680, startDay: 1,
    chain: [
      disponible("ezeiza", 1),
      cargaEzeiza("bariloche", "10:00"),
      transito("ezeiza", "bariloche", 2, "Vie 08:00"),
      descarga("bariloche", "08:00"),
      disponible("bariloche", 2, "Descanso programado"),
    ],
  },
  {
    code: "239", tractorPlate: "AD 583 GH", trailerPlate: "SR 195 TR", driverId: "d13", trailerType: "Isotérmico",
    currentLocationId: "ezeiza", lastDestinationId: "bahia", kmPeriod: 4260, startDay: 0,
    chain: [
      disponible("ezeiza", 2, "Km muy por debajo de meta"),
      cargaEzeiza("bahia", "16:00"),
      transito("ezeiza", "bahia", 1, "Jue 06:00"),
      descarga("bahia", "06:00"),
      transito("bahia", "ezeiza", 1, "Sáb 18:00"),
      disponible("ezeiza", 1),
    ],
  },
  {
    code: "242", tractorPlate: "AF 337 NB", trailerPlate: "SR 201 TR", driverId: "d14", reliefDriverId: "r02", trailerType: "Frigorífico 30 pallets",
    currentLocationId: "arenas", lastDestinationId: "arenas", kmPeriod: 11760, startDay: 0,
    chain: [
      { status: "cargando", span: 1, title: "Carga Punta Arenas", subtitle: "Salmón fresco · 24 pallets", fromId: "arenas", toId: "ezeiza" },
      { status: "retorno_chile", span: 1, title: "Punta Arenas → Integración Austral", subtitle: "ETA paso Mar 14:00", fromId: "arenas", toId: "integracion" },
      { status: "frontera", span: 1, title: "Integración Austral", subtitle: "Liberado 15:20", toId: "integracion", risk: "bajo" },
      transito("integracion", "ezeiza", 3, "Sáb 20:00", "retorno_chile"),
      descarga("ezeiza", "07:00"),
    ],
  },
  {
    code: "245", tractorPlate: "AE 245 KD", trailerPlate: "SR 208 TR", driverId: "d15", trailerType: "Frigorífico 30 pallets",
    currentLocationId: "ezeiza", lastDestinationId: "trelew", kmPeriod: 8890, startDay: 0,
    chain: [
      transito("trelew", "ezeiza", 1, "Lun 21:00"),
      { status: "taller", span: 1, title: "Taller — revisión rápida", subtitle: "Neumáticos y frío", toId: "taller" },
      disponible("ezeiza", 2, "Candidata recomendada a Neuquén"),
      { status: "programada", span: 1, title: "Programada → Neuquén", subtitle: "Salida Vie 13:00", fromId: "ezeiza", toId: "neuquen", tooltip: "Recomendación del sistema aceptada por el analista." },
      transito("ezeiza", "neuquen", 2, "Dom 06:00"),
    ],
  },
  {
    code: "248", tractorPlate: "AC 902 VR", trailerPlate: "SR 214 TR", driverId: "d16", trailerType: "Frigorífico 28 pallets",
    currentLocationId: "natales", lastDestinationId: "natales", kmPeriod: 7310, startDay: 0,
    chain: [
      disponible("natales", 1, "Esperando confirmación de planta"),
      { status: "cargando", span: 1, title: "Carga Puerto Natales", subtitle: "22 pallets", fromId: "natales", toId: "ezeiza" },
      { status: "retorno_chile", span: 1, title: "Natales → Dorotea", subtitle: "ETA paso Mié 15:30", fromId: "natales", toId: "dorotea" },
      { status: "frontera", span: 1, title: "Dorotea", subtitle: "Documentación pendiente", toId: "dorotea", risk: "medio", tooltip: "Falta remito SENASA para liberar el trámite." },
      transito("dorotea", "ezeiza", 3, "Dom 22:00", "retorno_chile"),
    ],
  },
  {
    code: "251", tractorPlate: "AG 671 LM", trailerPlate: "SR 219 TR", driverId: "d17", reliefDriverId: "r01", trailerType: "Frigorífico 30 pallets",
    currentLocationId: "ezeiza", lastDestinationId: "montt", kmPeriod: 12520, workshopDue: true, startDay: 0,
    chain: [
      disponible("ezeiza", 1, "Titular en descanso · relevo asignado"),
      { status: "taller", span: 2, title: "Taller CD Ezeiza", subtitle: "Service mayor programado", toId: "taller" },
      disponible("ezeiza", 1),
      cargaEzeiza("calbuco", "07:00"),
      transito("ezeiza", "calbuco", 3, "Dom 12:00"),
    ],
  },
  {
    code: "254", tractorPlate: "AF 088 TQ", trailerPlate: "SR 226 TR", driverId: "d18", trailerType: "Frigorífico 30 pallets",
    currentLocationId: "calbuco", lastDestinationId: "calbuco", kmPeriod: 6740, startDay: 0,
    chain: [
      transito("ezeiza", "calbuco", 3, "Mié 12:00"),
      { status: "cargando", span: 1, title: "Carga Calbuco", subtitle: "Salmón fresco · 27 pallets", fromId: "calbuco", toId: "ezeiza" },
      { status: "retorno_chile", span: 2, title: "Calbuco → Cardenal Samoré", subtitle: "ETA paso Sáb 20:00", fromId: "calbuco", toId: "cardenal" },
      { status: "frontera", span: 1, title: "Cardenal Samoré", subtitle: "Trámite nocturno", toId: "cardenal", risk: "medio" },
    ],
  },
];

/** Rotación determinística de destinos según la semana seleccionada. */
const rotateDestination = (id: string | undefined, offset: number) => {
  if (!id || offset === 0) return id;
  const rotables = ["bahia", "neuquen", "bariloche", "trelew"];
  const idx = rotables.indexOf(id);
  if (idx === -1) return id;
  return rotables[(idx + offset + rotables.length * 4) % rotables.length];
};

const buildUnitsAndMovements = (weekStart: string, offset: number) => {
  const units: Unit[] = [];
  const movements: Movement[] = [];
  const trips: Trip[] = [];

  UNIT_SEEDS.forEach((seed, seedIndex) => {
    const unitId = `u-${seed.code}`;
    let day = seed.startDay;
    let currentStatus: OperationStatus = "disponible";
    let currentLocation = seed.currentLocationId;

    seed.chain.forEach((segment, i) => {
      if (day > 6) return;
      const span = Math.min(segment.span, 7 - day);
      const toId = rotateDestination(segment.toId, offset);
      const fromId = rotateDestination(segment.fromId, offset);
      const title =
        segment.toId && toId !== segment.toId
          ? segment.title.replace(locationName(segment.toId), locationName(toId))
          : segment.title;

      movements.push({
        id: `${unitId}-m${i}`,
        unitId,
        tripId: `${unitId}-t${i}`,
        status: segment.status,
        dayIndex: day,
        span,
        title,
        subtitle: segment.subtitle,
        fromId,
        toId,
        etaAt: segment.time ? at(weekStart, Math.min(day + span - 1, 6), "06:00") : undefined,
        riskLevel: segment.risk,
        tooltip: segment.tooltip ?? `${title}${segment.subtitle ? ` · ${segment.subtitle}` : ""}`,
      });

      if (day <= SIMULATED_TODAY_INDEX && day + span - 1 >= SIMULATED_TODAY_INDEX) {
        currentStatus = segment.status;
        currentLocation = toId ?? fromId ?? currentLocation;
      }

      if (["transito", "retorno_chile", "programada"].includes(segment.status) && fromId && toId) {
        const km = Math.abs(
          (LOCATIONS.find((l) => l.id === toId)?.kmFromEzeiza ?? 0) -
            (LOCATIONS.find((l) => l.id === fromId)?.kmFromEzeiza ?? 0),
        );
        trips.push({
          id: `${unitId}-t${i}`,
          unitId,
          driverId: seed.driverId,
          originId: fromId,
          destinationId: toId,
          status: segment.status,
          departureAt: at(weekStart, day, "13:00"),
          targetUnloadAt: at(weekStart, Math.min(day + span, 6), "06:00"),
          etaAt: at(weekStart, Math.min(day + span, 6), segment.status === "demorada" ? "10:30" : "06:00"),
          marginMinutes: segment.status === "demorada" ? -270 : 60 + ((seedIndex * 37) % 180),
          cargo: segment.status === "retorno_chile" ? "Salmón refrigerado" : "Consolidado aéreo Ezeiza",
          km: km || 620,
          documentationReady: segment.status !== "retorno_chile" || i % 3 !== 0,
        });
      }

      day += span;
    });

    units.push({
      id: unitId,
      code: seed.code,
      tractorPlate: seed.tractorPlate,
      trailerPlate: seed.trailerPlate,
      trailerType: seed.trailerType,
      driverId: seed.driverId,
      reliefDriverId: seed.reliefDriverId,
      status: currentStatus,
      currentLocationId: currentLocation,
      lastDestinationId: rotateDestination(seed.lastDestinationId, offset),
      kmPeriod: seed.kmPeriod,
      kmTarget: 12000,
      workshopDue: seed.workshopDue ?? false,
      notes: seed.notes,
    });
  });

  return { units, movements, trips };
};

const buildAvailability = (movements: Movement[]): Availability[] => {
  const nodes = LOCATIONS.filter((l) => l.kind === "cd" || l.kind === "base");
  return nodes.map((node) => {
    const perDay = Array.from({ length: 7 }, (_, day) =>
      movements.filter(
        (m) =>
          m.status === "disponible" &&
          m.toId === node.id &&
          day >= m.dayIndex &&
          day < m.dayIndex + m.span,
      ).length,
    );
    return { locationId: node.id, perDay };
  });
};

const buildAlerts = (weekStart: string): Alert[] => [
  {
    id: "a1", kind: "riesgo_frontera", severity: "critica", unitId: "u-224",
    title: "Unidad 224 · riesgo alto de no cruzar Balmaceda",
    detail: "Salida Puerto Chacabuco 17:00, trayecto ~3 h. ETA paso 20:10 y cierre 20:00 (papeles hasta 19:30). Probabilidad de cruce 18%.",
    createdAt: at(weekStart, 2, "17:12"),
    suggestedAction: "Avisar al cliente riesgo alto y recalcular ETA a reapertura 08:00 del jueves.",
  },
  {
    id: "a2", kind: "salida_comprometida", severity: "critica",
    title: "Salida Ezeiza → Neuquén del viernes sin unidad firme",
    detail: "El previsto de depósito pide salida viernes 13:00 con llegada domingo 06:00. Hoy no hay unidad confirmada en CD.",
    createdAt: at(weekStart, 2, "09:40"),
    suggestedAction: "Aceptar recomendación: Unidad 245 (score 92).",
  },
  {
    id: "a3", kind: "eta_retrasado", severity: "alta", unitId: "u-221",
    title: "Unidad 221 · ETA retrasado 4h 30m",
    detail: "Viento fuerte en RN3. ETA revisado de sábado 08:00 a domingo 04:00.",
    createdAt: at(weekStart, 3, "18:05"),
    suggestedAction: "Informar al embarcador de Ezeiza y reprogramar turno de descarga.",
  },
  {
    id: "a4", kind: "documentacion_pendiente", severity: "alta", unitId: "u-248",
    title: "Unidad 248 · documentación SENASA pendiente",
    detail: "Falta remito y certificado para liberar trámite en paso Dorotea.",
    createdAt: at(weekStart, 2, "11:20"),
    suggestedAction: "Enviar documentación al despachante antes del corte de 19:00.",
  },
  {
    id: "a5", kind: "deberia_estar_disponible", severity: "media", unitId: "u-227",
    title: "Unidad 227 debería estar disponible y sigue en viaje",
    detail: "Planificada como disponible en Río Grande el jueves; el tránsito ocupa hasta jueves 10:00.",
    createdAt: at(weekStart, 3, "07:30"),
    suggestedAction: "Confirmar hora real de descarga antes de comprometer el retorno.",
  },
  {
    id: "a6", kind: "sin_proximo_viaje", severity: "media", unitId: "u-239",
    title: "Unidad 239 sin próximo viaje asignado",
    detail: "Disponible en CD Ezeiza desde el lunes. Chofer 4.260 km, muy por debajo de la meta del período.",
    createdAt: at(weekStart, 1, "08:15"),
    suggestedAction: "Asignar salida a Bahía Blanca del miércoles para equilibrar km.",
  },
];

const buildRecommendations = (weekStart: string): AssignmentRecommendation[] => [
  {
    id: "r1", unitId: "u-245", destinationId: "neuquen", score: 92,
    reasons: [
      "Disponible en CD Ezeiza desde el miércoles 18:00",
      "Chofer con 8.890 km sobre meta de 12.000 km del período",
      "Destino anterior distinto (Trelew): evita repetir ruta",
      "Permite un día en domicilio antes de salir el viernes",
      "Semi con service al día tras revisión de taller",
    ],
    warnings: ["Requiere confirmar turno de carga viernes 13:00 en muelle 4"],
    suggestedDepartureAt: at(weekStart, 4, "13:00"),
  },
  {
    id: "r2", unitId: "u-239", destinationId: "bahia", score: 86,
    reasons: [
      "Chofer con 4.260 km: el más rezagado del período",
      "Domicilio en Ezeiza, sin costo de reposicionamiento",
      "Bahía Blanca sale lunes/miércoles y llega 06:00 del día siguiente",
    ],
    warnings: ["Unidad isotérmica: sólo apta para carga con ventana corta"],
    suggestedDepartureAt: at(weekStart, 2, "16:00"),
  },
  {
    id: "r3", unitId: "u-215", destinationId: "trelew", score: 78,
    reasons: [
      "Disponible tras descarga en Bahía Blanca",
      "Destino anterior distinto y chofer con descanso cumplido",
    ],
    warnings: ["Suma 1.380 km: quedaría cerca del tope del período"],
    suggestedDepartureAt: at(weekStart, 5, "09:00"),
  },
];

const buildUpcoming = (weekStart: string): UpcomingMovement[] => [
  { id: "n1", unitId: "u-224", locationId: "chacabuco", nextDestinationId: "balmaceda", etaAt: at(weekStart, 2, "20:10"), window: "24h", status: "riesgo", suggestedAction: "Comunicar riesgo de cruce y preparar ETA alternativo 08:00." },
  { id: "n2", unitId: "u-212", locationId: "montt", nextDestinationId: "cardenal", etaAt: at(weekStart, 2, "11:00"), window: "24h", status: "retorno_chile", suggestedAction: "Enviar documentación al despachante del paso." },
  { id: "n3", unitId: "u-245", locationId: "ezeiza", nextDestinationId: "neuquen", etaAt: at(weekStart, 4, "13:00"), window: "48h", status: "programada", suggestedAction: "Confirmar carga en muelle 4 y notificar al chofer." },
  { id: "n4", unitId: "u-233", locationId: "cardenal", nextDestinationId: "ezeiza", etaAt: at(weekStart, 3, "07:30"), window: "24h", status: "retorno_chile", suggestedAction: "Avisar a embarcadores de Ezeiza ETA sábado 06:00." },
  { id: "n5", unitId: "u-230", locationId: "taller", nextDestinationId: "ezeiza", etaAt: at(weekStart, 2, "16:00"), window: "24h", status: "taller", suggestedAction: "Verificar salida de taller para liberar la unidad." },
  { id: "n6", unitId: "u-221", locationId: "gallegos", nextDestinationId: "ezeiza", etaAt: at(weekStart, 6, "04:00"), window: "48h", status: "demorada", suggestedAction: "Reprogramar turno de descarga por demora de 4h 30m." },
];

const buildBorderEvents = (weekStart: string): BorderEvent[] => [
  {
    id: "b1", unitId: "u-224", borderCrossingId: "balmaceda", departedFromId: "chacabuco",
    departedAt: at(weekStart, 2, "17:10"), etaBorderAt: at(weekStart, 2, "20:10"),
    crossProbability: 0.18, outcome: "riesgo",
    recalculatedEtaAt: at(weekStart, 3, "09:15"),
    comment: "Papeles deben presentarse antes de 19:30; cierre 20:00.",
  },
  {
    id: "b2", unitId: "u-212", borderCrossingId: "cardenal", departedFromId: "montt",
    departedAt: at(weekStart, 1, "22:00"), etaBorderAt: at(weekStart, 2, "11:00"),
    paperworkSentAt: at(weekStart, 2, "08:20"), crossProbability: 0.94, outcome: "pendiente",
  },
  {
    id: "b3", unitId: "u-233", borderCrossingId: "cardenal", departedFromId: "quellon",
    departedAt: at(weekStart, 1, "06:30"), etaBorderAt: at(weekStart, 2, "16:00"),
    paperworkSentAt: at(weekStart, 2, "12:10"), crossProbability: 0.88, outcome: "cruzo",
    comment: "Liberado 18:40.",
  },
  {
    id: "b4", unitId: "u-248", borderCrossingId: "dorotea", departedFromId: "natales",
    departedAt: at(weekStart, 2, "12:00"), etaBorderAt: at(weekStart, 2, "15:30"),
    crossProbability: 0.55, outcome: "pendiente", comment: "Documentación SENASA pendiente.",
  },
  {
    id: "b5", unitId: "u-242", borderCrossingId: "integracion", departedFromId: "arenas",
    departedAt: at(weekStart, 1, "09:00"), etaBorderAt: at(weekStart, 1, "14:00"),
    paperworkSentAt: at(weekStart, 1, "10:30"), crossProbability: 0.96, outcome: "cruzo",
    comment: "Liberado 15:20.",
  },
];

const buildCommunications = (weekStart: string): CommunicationDraft[] => [
  {
    id: "c1", unitId: "u-224", audience: "cliente", trigger: "Salida de puerto con riesgo de cruce",
    subject: "Unidad 224 — salida Puerto Chacabuco / riesgo de cruce",
    body: "Unidad 224 salió de Puerto Chacabuco 17:10. ETA frontera Balmaceda 20:10. Riesgo alto de no cruzar hoy (cierre 20:00, papeles hasta 19:30). Si no cruza, ETA estimado de liberación jueves 09:15 y arribo a Ezeiza domingo 16:00.",
    createdAt: at(weekStart, 2, "17:15"),
  },
  {
    id: "c2", unitId: "u-212", audience: "embarcador", trigger: "ETA a Ezeiza confirmado",
    subject: "Unidad 212 — ETA CD Ezeiza sábado 09:00",
    body: "Unidad 212 con salmón fresco de Puerto Montt cruzó trámite en Cardenal Samoré. ETA CD Ezeiza sábado 09:00. Se coordina turno de desprecintado y descarga a partir de las 10:00.",
    createdAt: at(weekStart, 3, "07:40"),
  },
  {
    id: "c3", unitId: "u-248", audience: "senasa", trigger: "Documentación pendiente",
    subject: "Unidad 248 — envío de documentación para desprecintado",
    body: "Se adjunta documentación de la unidad 248 (paso Dorotea) para gestionar el desprecintado y la descarga. Se solicita confirmación antes del corte documental de las 19:00.",
    createdAt: at(weekStart, 2, "11:25"),
  },
  {
    id: "c4", unitId: "u-221", audience: "cliente", trigger: "ETA retrasado",
    subject: "Unidad 221 — actualización de ETA",
    body: "Unidad 221 registra demora por viento fuerte en RN3. Nuevo ETA a CD Ezeiza: domingo 04:00 (antes sábado 08:00). Mantenemos seguimiento y confirmamos al liberar el tramo.",
    createdAt: at(weekStart, 3, "18:10"),
  },
];

export const buildWeeklyPlan = (offset: number): WeeklyPlan => {
  const weekStart = weekStartForOffset(offset);
  const { units, movements, trips } = buildUnitsAndMovements(weekStart, offset);
  const today = SIMULATED_TODAY_INDEX;
  const activeToday = (status: OperationStatus) =>
    movements.filter((m) => m.status === status && today >= m.dayIndex && today < m.dayIndex + m.span).length;

  return {
    weekStart,
    weekLabel: weekLabel(weekStart),
    units,
    drivers: DRIVERS,
    trips,
    movements,
    availability: buildAvailability(movements),
    borderEvents: buildBorderEvents(weekStart),
    alerts: buildAlerts(weekStart),
    recommendations: buildRecommendations(weekStart),
    upcoming: buildUpcoming(weekStart),
    communications: buildCommunications(weekStart),
    kpis: {
      operativas: units.length,
      disponiblesHoy: activeToday("disponible"),
      enViaje: activeToday("transito") + activeToday("retorno_chile"),
      descargando: activeToday("descargando"),
      retornosChile: activeToday("retorno_chile") + activeToday("frontera"),
      salidasEnRiesgo: activeToday("riesgo") + activeToday("demorada"),
    },
  };
};

export const BORDER_CATALOG = BORDERS;
