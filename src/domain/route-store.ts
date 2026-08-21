/**
 * Tramos agregados por el usuario en tiempo de ejecución.
 * Se persisten en localStorage y se registran en el catálogo de recorridos.
 */
import { registerRoute, splitStops } from "./route-catalog";

const KEY = "surfrigo.tramos-personalizados.v1";

let version = 0;
let hydrated = false;
let custom: string[] = [];
const listeners = new Set<() => void>();

const emit = () => {
  version += 1;
  listeners.forEach((l) => l());
};

const persist = () => {
  try {
    localStorage.setItem(KEY, JSON.stringify(custom));
  } catch {
    /* almacenamiento no disponible */
  }
};

/** Carga los tramos guardados (sólo en cliente, después de hidratar). */
export function hydrateCustomRoutes(): void {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  try {
    const raw = localStorage.getItem(KEY);
    const saved: unknown = raw ? JSON.parse(raw) : [];
    if (Array.isArray(saved)) {
      custom = saved.filter((r): r is string => typeof r === "string");
      custom.forEach((r) => registerRoute(splitStops(r)));
    }
  } catch {
    custom = [];
  }
  emit();
}

/** Agrega un recorrido/tramo al catálogo válido y lo persiste. */
export function addCustomRoute(label: string): boolean {
  const stops = splitStops(label);
  if (!registerRoute(stops)) return false;
  const normalized = stops.join("-");
  if (!custom.includes(normalized)) {
    custom = [...custom, normalized];
    persist();
  }
  emit();
  return true;
}

export const customRoutes = (): string[] => custom;

export const subscribeRouteCatalog = (listener: () => void): (() => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const routeCatalogVersion = (): number => version;
