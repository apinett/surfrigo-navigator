import { useEffect, useSyncExternalStore } from "react";

import {
  hydrateCustomRoutes,
  routeCatalogVersion,
  subscribeRouteCatalog,
} from "@/domain/route-store";

/** Versión del catálogo de tramos; cambia al agregar tramos nuevos. */
export function useRouteCatalogVersion(): number {
  useEffect(() => {
    hydrateCustomRoutes();
  }, []);
  return useSyncExternalStore(subscribeRouteCatalog, routeCatalogVersion, () => 0);
}
