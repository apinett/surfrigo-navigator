# Surfrigo Navigator

Crear un MVP funcional de un sistema interno de gestión de transporte para Surfrigo, llamado “Surfrigo Control Tower”. El objetivo es digitalizar la operación del analista de transporte de gran porte entre CD Ezeiza, bases argentinas (Bahía Blanca, Neuquén, Bariloche, Trelew, Río Gallegos, Río Grande) y retornos/cargas de salmón en Chile (Puerto Montt, Calbuco, Quellón, Puerto Chacabuco, Punta Arenas, Puerto Natales).

PRIORIDAD ABSOLUTA: diseñar la pantalla principal “Torre de Control Semanal”, no un ERP genérico. Debe ser una interfaz desktop-first pero responsive, muy visual, rápida y clara, inspirada en productos como Linear/Uber Freight/modern control towers, usando Tailwind + shadcn/ui, tipografía limpia, alto contraste, semáforos de estado, tarjetas compactas y tablas legibles. No usar una estética genérica de dashboard SaaS.

La operación real a representar:
1) Depósito envía un previsto diario/semanal que por ahora contiene solamente destinos de las salidas desde Ezeiza. El analista prioriza la salida según distancia y hora objetivo de descarga: por ejemplo Bahía Blanca saliendo lunes debe llegar martes 06:00; Neuquén saliendo lunes debe llegar miércoles 06:00. El sistema debe mostrar ETA/fecha objetivo y margen operativo.
2) Cada tractor tiene un chofer titular y un semirremolque asignados de forma estable. Los cambios son excepcionales: descanso, enfermedad o relevo. El analista además considera domicilio/provincia del chofer, destino anterior, kilómetros acumulados y posibilidad de dejarlo un día en casa antes del siguiente viaje cuando la operación lo permite.
3) Se busca equilibrar aproximadamente los kilómetros por chofer, con una meta configurable de referencia (ejemplo 12.000 km por período) y evitando asignar siempre los mismos destinos. La recomendación futura debe ser explicable: km acumulados, destino anterior, domicilio, descanso, disponibilidad y necesidad operativa.
4) Los retornos Chile se planifican principalmente viernes/sábado para la semana siguiente. Una planilla de movimientos muestra día por día qué unidades están en viaje desde Chile y qué día se prevé su llegada a Ezeiza. No hay hora fija inicialmente; la hora de llegada es dinámica según evolución del viaje.
5) En Chile se controlan puntos de carga: Puerto Montt, Calbuco, Quellón, Puerto Chacabuco, Punta Arenas, Puerto Natales. Al salir del puerto se calcula ETA hacia la frontera y Ezeiza/destino. Las fronteras tienen horarios de cierre. Ejemplo: una unidad sale de Puerto Chacabuco a las 17:00, el paso Balmaceda requiere presentar papeles antes de aproximadamente 19:30 y cierra a las 20:00; como el trayecto ronda 3 horas, el sistema debe detectar que tiene pocas probabilidades de cruzar ese día. Si no cruza, el ETA debe recalcularse condicionado a la reapertura/trámite del día siguiente.
6) El analista comunica al cliente cuando la unidad sale de planta/puerto, si el cruce es probable o de riesgo, y cuando llega/libera frontera. También informa a embarcadores del aeropuerto Ezeiza el estado y ETA, y debe enviar documentación/SENASA para el desprecintado y descarga.
7) Una vez vacía, la unidad vuelve al CD Ezeiza y según hora puede ingresar a taller para revisión y puesta a punto antes del siguiente viaje.

PANTALLA PRINCIPAL REQUERIDA:
- Header: logo/nombre “Surfrigo Control Tower”, selector de semana, fecha actual, búsqueda rápida de unidad/chofer, botón “Nueva actualización”.
- KPIs superiores: Unidades operativas, disponibles hoy, en viaje, descargando, retornos Chile, salidas Ezeiza en riesgo.
- Grilla semanal tipo timeline: filas por unidad; columnas Lunes-Domingo. Cada celda/card muestra bloques de operación con estado y destino. Estados: Disponible, Programada, Cargando, En tránsito, Descargando, Retorno Chile, Frontera, Taller, Riesgo, Demorada. Usar semáforos consistentes. Mostrar barras continuas cuando una operación ocupa varios días.
- Una unidad puede tener cadena visual: Ezeiza → Base Argentina → Disponible → Chile → Frontera → Ezeiza → Taller.
- Vista superior/auxiliar “Disponibilidad por día” con totales para Ezeiza y cada base.
- Panel derecho “Alertas operativas”: riesgo de no cruzar frontera, unidad sin próximo viaje, salida de Ezeiza comprometida por falta de unidad, ETA retrasado, unidad que debería quedar disponible pero sigue en viaje, documentación pendiente.
- Panel “Próximos movimientos”: próximas 24/48h con unidad, ubicación, próximo destino, ETA y acción sugerida.
- Al seleccionar una unidad, abrir un drawer/modal con: unidad, tractor, semi, chofer titular/relevo, domicilio/provincia, estado, ubicación, último destino, km período, objetivo km, próximo viaje, ETA, riesgo, historial breve y botones para actualizar estado/asignar próximo movimiento.
- Mostrar un bloque “Recomendación de asignación” aunque sea mock inicialmente: por ejemplo “Unidad 245 → Neuquén. Score 92/100. Motivos: disponibilidad, km por debajo de meta, destino anterior diferente, descanso posible”. Debe quedar claro que es una recomendación y el analista conserva la decisión.
- Agregar un mini “Centro de comunicaciones” que genere borradores de mensajes a cliente/embarcador según eventos: “Unidad 312 salió de Puerto Chacabuco 17:10. ETA frontera Balmaceda 20:10. Riesgo alto de no cruzar hoy.” No enviar mensajes reales todavía.

DATOS DEMO:
Cargar suficientes unidades ficticias (por ejemplo 15-20) y choferes ficticios para que la grilla se vea real, con destinos y estados coherentes. Incluir ejemplos de retornos Chile, una unidad con riesgo de frontera y una unidad en taller. No usar datos personales reales.

NAVEGACIÓN PREPARADA PARA FUTUROS MÓDULOS:
- Torre de Control (principal, funcional)
- Planificación semanal
- Unidades y choferes
- Movimientos Chile
- Fronteras y ETA
- Comunicaciones
- Combustible y rendimiento (placeholder)
- Reportes/KPIs (placeholder)
- Configuración

ARQUITECTURA:
Preparar el proyecto para conectar Supabase/PostgreSQL después. Separar tipos/modelos de dominio de los componentes visuales. Definir modelos TypeScript para Unit, Driver, Trip, Movement, Availability, BorderEvent, Alert, AssignmentRecommendation y WeeklyPlan. Por ahora usar datos demo locales, pero estructurados para reemplazarlos por consultas a Supabase sin rehacer la UI.

IMPORTANTE UX:
- El analista debe entender el estado de la flota en menos de 5 segundos.
- Evitar formularios largos.
- Toda recomendación debe explicar el motivo.
- La grilla debe ser la protagonista.
- Incluir leyenda de estados.
- Agregar tooltips donde un color/ícono pueda generar duda.
- Permitir filtrar por estado, base, destino y chofer.
- Permitir buscar unidad.
- La semana debe poder cambiarse.
- Usar fechas de ejemplo consistentes con una semana laboral ficticia; no afirmar datos reales de Surfrigo.

Construí el MVP completo y navegable, con buen diseño visual, componentes reutilizables y estados interactivos. Primero prioriza calidad de la Torre de Control Semanal sobre cantidad de pantallas.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/ee206fda-f54a-4696-9310-d56b7cd65889).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
