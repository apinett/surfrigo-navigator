/**
 * Parser de "Previsto de Depósito" pegado como texto libre.
 * Funciones puras: no dependen de React ni de la UI.
 */
import { LOCATIONS, locationById } from "./catalog";
import type { DepositRequest } from "./types";

/** Ventana de salida por defecto solicitada por la operación. */
export const DEFAULT_DEPARTURE_WINDOW = { start: "15:00", end: "18:00" };

export interface ParsedRequestRow {
  ok: boolean;
  raw: string;
  request?: DepositRequest;
  error?: string;
}

const normalize = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

/** Busca destino por nombre, id o alias dentro de una línea. */
function matchDestination(line: string): string | undefined {
  const n = normalize(line);
  const candidates = LOCATIONS.filter((l) => l.kind !== "cd" && l.id !== "taller")
    .map((l) => ({ id: l.id, keys: [normalize(l.name), normalize(l.id)] }))
    .flatMap((c) => c.keys.map((k) => ({ id: c.id, key: k })))
    .sort((a, b) => b.key.length - a.key.length);
  return candidates.find((c) => c.key.length > 2 && n.includes(c.key))?.id;
}

const pad = (n: number) => String(n).padStart(2, "0");

/** Normaliza "8", "8:5", "08.30", "1830" a "HH:mm". */
function toTime(value: string): string | undefined {
  const v = value.trim();
  let m = /^(\d{1,2})[:.h]?(\d{2})$/.exec(v);
  if (m) return `${pad(Number(m[1]))}:${m[2]}`;
  m = /^(\d{1,2})$/.exec(v);
  if (m && Number(m[1]) <= 23) return `${pad(Number(m[1]))}:00`;
  return undefined;
}

/** Resuelve dd/mm o dd/mm/aaaa relativo al año de referencia. */
function toDate(value: string, referenceIso: string): string | undefined {
  const m = /^(\d{1,2})[/-](\d{1,2})(?:[/-](\d{2,4}))?$/.exec(value.trim());
  if (!m) return undefined;
  const year = m[3]
    ? Number(m[3]!.length === 2 ? `20${m[3]}` : m[3])
    : Number(referenceIso.slice(0, 4));
  return `${year}-${pad(Number(m[2]))}-${pad(Number(m[1]))}`;
}

const addDaysIso = (iso: string, days: number) => {
  const d = new Date(`${iso}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
};

/**
 * Parsea una línea del previsto. Formato tolerante, por ejemplo:
 *  "Bahía Blanca | 15:00-18:00 | 20/08 06:00 | Fresco consolidado"
 *  "Neuquén 2 unidades objetivo 21/08 06:00 aéreo consolidado"
 *  "Trelew"  → usa ventana por defecto 15:00-18:00 y objetivo +2 días 06:00
 */
export function parseRequestLine(
  raw: string,
  opts: { dayIndex: number; dateIso: string; index: number },
): ParsedRequestRow {
  const line = raw.trim();
  if (!line) return { ok: false, raw, error: "Línea vacía" };

  const destinationId = matchDestination(line);
  if (!destinationId) return { ok: false, raw, error: "No se reconoció el destino" };

  let rest = line;

  // Ventana de salida: "15:00-18:00" o "15 a 18"
  let start = DEFAULT_DEPARTURE_WINDOW.start;
  let end = DEFAULT_DEPARTURE_WINDOW.end;
  const window = /(\d{1,2}(?:[:.]\d{2})?)\s*(?:-|–|a|hasta)\s*(\d{1,2}(?:[:.]\d{2})?)\s*(?:hs?)?/i.exec(
    rest,
  );
  if (window) {
    const s = toTime(window[1]!);
    const e = toTime(window[2]!);
    if (s && e) {
      start = s;
      end = e;
      rest = rest.replace(window[0], " ");
    }
  }

  // Objetivo de descarga: fecha opcional + hora
  let targetDate = addDaysIso(opts.dateIso, 2);
  let targetTime = "06:00";
  const target = /(\d{1,2}[/-]\d{1,2}(?:[/-]\d{2,4})?)?\s*(?:a\s+las\s+)?(\d{1,2}(?:[:.]\d{2}))\s*(?:hs?)?/i.exec(
    rest,
  );
  if (target) {
    const d = target[1] ? toDate(target[1], opts.dateIso) : undefined;
    const t = toTime(target[2]!);
    if (d) targetDate = d;
    if (t) targetTime = t;
    rest = rest.replace(target[0], " ");
  }

  // Cantidad de unidades: siempre 1 por carga (regla operativa vigente).
  const unitsRequired = 1;

  // Cargo: el texto restante limpio
  const destinationName = locationById(destinationId)?.name ?? "";
  const cargo =
    rest
      .replace(new RegExp(destinationName, "i"), " ")
      .replace(/ezeiza|previsto|dep[oó]sito|salida|objetivo|unidad(es)?|\bx?\d+\b/gi, " ")
      .replace(/[|;·>→\-–]+/g, " ")
      .replace(/\s+/g, " ")
      .trim() || "Carga general";

  return {
    ok: true,
    raw,
    request: {
      id: `imp-${opts.dayIndex}-${destinationId}-${opts.index}-${Date.now().toString(36)}`,
      dayIndex: opts.dayIndex,
      destinationId,
      unitsRequired,
      suggestedDepartureTime: start,
      windowEndTime: end,
      targetUnloadAt: `${targetDate}T${targetTime}:00`,
      cargo: cargo.charAt(0).toUpperCase() + cargo.slice(1),
      km: locationById(destinationId)?.kmFromEzeiza ?? 0,
      notes: "Importado desde previsto pegado.",
    },
  };
}

export function parseRequestsText(
  text: string,
  opts: { dayIndex: number; dateIso: string },
): ParsedRequestRow[] {
  return text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .filter((l) => !/^(destino|previsto)\b.*(ventana|objetivo)/i.test(l))
    .map((l, i) => parseRequestLine(l, { ...opts, index: i }));
}
