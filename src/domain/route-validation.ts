/**
 * Validación y combinación de tramos contra el catálogo de recorridos.
 * Funciones puras: no dependen de React ni de la UI.
 */
import { LOCATIONS } from "./catalog";
import { isKnownLeg, isKnownRoute, nextStops, normalizeStop, resolveStop } from "./route-catalog";

export interface ItineraryLeg {
  from: string;
  to: string;
  known: boolean;
}

export interface ItineraryValidation {
  /** Todas las paradas se reconocen y todos los tramos existen en el catálogo. */
  ok: boolean;
  /** Paradas canónicas resueltas contra el catálogo. */
  stops: string[];
  legs: ItineraryLeg[];
  /** Textos que no se pudieron resolver a una parada del catálogo. */
  unknownStops: string[];
  /** El recorrido completo figura tal cual en la planilla de complementos. */
  exact: boolean;
  /** Etiqueta normalizada, ej. "EZEIZA-BAHIA-SANTA ROSA-PELLEGRINI". */
  label: string;
  /** Continuaciones sugeridas desde la última parada válida. */
  suggestions: string[];
  error?: string | undefined;
}

const splitInput = (text: string): string[] =>
  text
    .replace(/[→>]/g, "-")
    .split(/[-–/]/)
    .map((s) => s.trim())
    .filter(Boolean);

/** ¿El texto parece un itinerario (2+ paradas encadenadas)? */
export function looksLikeItinerary(text: string): boolean {
  const parts = splitInput(text);
  if (parts.length < 2) return false;
  const resolved = parts.filter((p) => resolveStop(p));
  return resolved.length >= 2 && resolved.length >= parts.length - 1;
}

/**
 * Valida un itinerario escrito libremente, combinando tramos del catálogo.
 * Ej.: "EZEIZA-BAHIA-SANTA ROSA-PELLEGRINI" se acepta si cada tramo consecutivo
 * existe en algún recorrido conocido, aunque el recorrido completo no figure.
 */
export function validateItinerary(text: string): ItineraryValidation {
  const parts = splitInput(text);
  const stops: string[] = [];
  const unknownStops: string[] = [];

  for (const part of parts) {
    const canonical = resolveStop(part);
    if (canonical) {
      if (normalizeStop(canonical) !== normalizeStop(stops.at(-1) ?? "")) stops.push(canonical);
    } else {
      unknownStops.push(part);
    }
  }

  const legs: ItineraryLeg[] = stops.slice(0, -1).map((from, i) => {
    const to = stops[i + 1]!;
    return { from, to, known: isKnownLeg(from, to) };
  });

  const brokenAt = legs.findIndex((l) => !l.known);
  const suggestions =
    brokenAt >= 0
      ? nextStops(legs[brokenAt]!.from).slice(0, 8)
      : nextStops(stops.at(-1) ?? "").slice(0, 8);

  const ok = stops.length >= 2 && unknownStops.length === 0 && brokenAt < 0;
  const error = !ok
    ? stops.length < 2
      ? "Indicá al menos dos paradas"
      : unknownStops.length > 0
        ? `Parada desconocida: ${unknownStops.join(", ")}`
        : `Tramo inexistente: ${legs[brokenAt]!.from}-${legs[brokenAt]!.to}`
    : undefined;

  return {
    ok,
    stops,
    legs,
    unknownStops,
    exact: stops.length >= 2 && isKnownRoute(stops),
    label: stops.join("-"),
    suggestions,
    error,
  };
}

/** Mapea una parada del catálogo a un nodo logístico conocido (si existe). */
export function stopToLocationId(stop: string): string | undefined {
  const key = normalizeStop(stop);
  const nodes = LOCATIONS.filter((l) => l.id !== "taller").map((l) => ({
    id: l.id,
    keys: [
      normalizeStop(l.name),
      normalizeStop(l.id),
      normalizeStop(l.name.replace(/^CD |^Puerto /i, "")),
    ],
  }));
  return (
    nodes.find((n) => n.keys.some((k) => k === key))?.id ??
    nodes.find((n) => n.keys.some((k) => k.length > 2 && (k.includes(key) || key.includes(k))))?.id
  );
}

/** Última parada del itinerario que corresponde a un nodo del sistema. */
export function itineraryDestination(
  stops: string[],
): { stop: string; locationId: string } | undefined {
  for (let i = stops.length - 1; i >= 0; i--) {
    const locationId = stopToLocationId(stops[i]!);
    if (locationId && locationId !== "ezeiza") return { stop: stops[i]!, locationId };
  }
  return undefined;
}
