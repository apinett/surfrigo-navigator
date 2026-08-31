# Surfrigo Control Tower — hoja de ruta hacia sistema operativo

## Estado
- [x] Fase 1 — Infraestructura backend (proyecto conectado, variables validadas, `.env.example`, cliente seguro)
- [x] Fase 2 — Auth, perfiles, roles y RLS (`/auth`, gate `_authenticated`, roles admin/analista/seguimiento/taller/consulta)
- [x] Fase 3 — Esquema y migraciones (catálogos, flota, planificación, viajes, eventos, documentos, alertas, integraciones)
- [x] Fase 4 — Capa de datos (`src/data/*`: settings, catálogos, flota, planificación, viajes, alertas, auditoría)
- [ ] Fase 5 — Flota y choferes reales (UI de `/flota` sobre la base)
- [ ] Fase 6 — Planificación persistente (plan semanal, previsto, asignaciones con conflictos)
- [ ] Fase 7 — Viajes y eventos (workflow + historial inmutable en UI)
- [ ] Fase 8 — Torre de Control con datos reales
- [ ] Fase 9 — Score con pesos persistidos y registro de recomendaciones
- [ ] Fase 10 — Fronteras y ETA planificado
- [ ] Fase 11 — Documentos (Storage) y comunicaciones
- [ ] Fase 12 — Combustible y reportes
- [ ] Fase 13 — Adaptadores GPS, mapas y mensajería (hoy “no conectado”)

## Pendientes de decisión del usuario
- Migrar el catálogo de recorridos (4.463 tramos del TS) a tablas `routes`/`route_stops`.
- Importadores controlados de unidades, choferes y previsto real (formato de planilla).
- Asignación del primer rol `admin` (hoy requiere habilitación manual en la base).
- Zona horaria operativa definitiva y política de retención de datos.

## Sigue con datos demo
- Torre semanal (`/`), planificación diaria (`/planificacion`), flota, Chile, fronteras y comunicaciones
  usan `src/domain/demo.ts` y `dispatch-demo.ts`. La barra de sesión lo marca como “Datos demo”.
