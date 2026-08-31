-- ============ ENUMS ============
CREATE TYPE public.operation_status AS ENUM (
  'disponible','programada','cargando','transito','descargando',
  'retorno_chile','frontera','taller','riesgo','demorada','cancelada'
);
CREATE TYPE public.trip_status AS ENUM (
  'programado','confirmado','cargando','salio_origen','transito','llego_destino',
  'descargando','descargado','disponible','retorno','frontera','taller','finalizado','cancelado'
);
CREATE TYPE public.plan_status AS ENUM ('borrador','publicado','cerrado','cancelado');
CREATE TYPE public.risk_level AS ENUM ('bajo','medio','alto');
CREATE TYPE public.event_source AS ENUM ('manual','integracion','sistema');

-- ============ CATÁLOGOS ============
CREATE TABLE public.locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  name text NOT NULL,
  kind text NOT NULL CHECK (kind IN ('cd','base','puerto','frontera','taller')),
  country text NOT NULL CHECK (country IN ('AR','CL')),
  province text,
  km_from_ezeiza integer,
  transit_hours numeric,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid DEFAULT auth.uid(),
  updated_by uuid
);

CREATE TABLE public.routes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label text NOT NULL,
  normalized_label text UNIQUE NOT NULL,
  total_km integer,
  is_exact boolean NOT NULL DEFAULT true,
  source text NOT NULL DEFAULT 'planilla',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid DEFAULT auth.uid(),
  updated_by uuid
);

CREATE TABLE public.route_stops (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id uuid NOT NULL REFERENCES public.routes(id) ON DELETE CASCADE,
  position integer NOT NULL,
  stop_name text NOT NULL,
  normalized_name text NOT NULL,
  location_id uuid REFERENCES public.locations(id) ON DELETE SET NULL,
  alias text[] NOT NULL DEFAULT '{}',
  UNIQUE (route_id, position)
);
CREATE INDEX route_stops_normalized_idx ON public.route_stops (normalized_name);

CREATE TABLE public.border_crossings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  name text NOT NULL,
  side_ar text,
  side_cl text,
  notes text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid DEFAULT auth.uid(),
  updated_by uuid
);

CREATE TABLE public.border_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  border_crossing_id uuid NOT NULL REFERENCES public.border_crossings(id) ON DELETE CASCADE,
  opens_at time NOT NULL,
  closes_at time NOT NULL,
  paperwork_cutoff time,
  avg_process_minutes integer NOT NULL DEFAULT 90,
  valid_from date NOT NULL DEFAULT current_date,
  valid_to date,
  season text,
  exceptions jsonb NOT NULL DEFAULT '[]',
  source text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid DEFAULT auth.uid(),
  updated_by uuid
);
CREATE INDEX border_schedules_crossing_idx ON public.border_schedules (border_crossing_id, valid_from DESC);

-- ============ FLOTA ============
CREATE TABLE public.tractors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plate text UNIQUE NOT NULL,
  brand text,
  model text,
  year integer,
  odometer_km integer NOT NULL DEFAULT 0,
  status public.operation_status NOT NULL DEFAULT 'disponible',
  is_active boolean NOT NULL DEFAULT true,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid DEFAULT auth.uid(),
  updated_by uuid
);

CREATE TABLE public.trailers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plate text UNIQUE NOT NULL,
  trailer_type text NOT NULL,
  pallet_capacity integer,
  is_reefer boolean NOT NULL DEFAULT true,
  is_active boolean NOT NULL DEFAULT true,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid DEFAULT auth.uid(),
  updated_by uuid
);

CREATE TABLE public.drivers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE,
  full_name text NOT NULL,
  phone text,
  home_city text,
  province text,
  driver_role text NOT NULL DEFAULT 'titular' CHECK (driver_role IN ('titular','relevo')),
  work_status text NOT NULL DEFAULT 'activo' CHECK (work_status IN ('activo','descanso','licencia','inactivo')),
  rest_days_available integer NOT NULL DEFAULT 0,
  km_period integer NOT NULL DEFAULT 0,
  km_target integer NOT NULL DEFAULT 12000,
  last_destination_id uuid REFERENCES public.locations(id) ON DELETE SET NULL,
  is_active boolean NOT NULL DEFAULT true,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid DEFAULT auth.uid(),
  updated_by uuid
);

CREATE TABLE public.units (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  tractor_id uuid REFERENCES public.tractors(id) ON DELETE SET NULL,
  trailer_id uuid REFERENCES public.trailers(id) ON DELETE SET NULL,
  driver_id uuid REFERENCES public.drivers(id) ON DELETE SET NULL,
  relief_driver_id uuid REFERENCES public.drivers(id) ON DELETE SET NULL,
  status public.operation_status NOT NULL DEFAULT 'disponible',
  current_location_id uuid REFERENCES public.locations(id) ON DELETE SET NULL,
  last_destination_id uuid REFERENCES public.locations(id) ON DELETE SET NULL,
  km_period integer NOT NULL DEFAULT 0,
  km_target integer NOT NULL DEFAULT 12000,
  workshop_due boolean NOT NULL DEFAULT false,
  available_at timestamptz,
  is_active boolean NOT NULL DEFAULT true,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid DEFAULT auth.uid(),
  updated_by uuid
);
CREATE INDEX units_status_idx ON public.units (status) WHERE is_active;

CREATE TABLE public.unit_driver_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id uuid NOT NULL REFERENCES public.units(id) ON DELETE CASCADE,
  driver_id uuid NOT NULL REFERENCES public.drivers(id) ON DELETE CASCADE,
  driver_role text NOT NULL DEFAULT 'titular' CHECK (driver_role IN ('titular','relevo')),
  valid_from timestamptz NOT NULL DEFAULT now(),
  valid_to timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid DEFAULT auth.uid()
);
CREATE INDEX unit_driver_assignments_unit_idx ON public.unit_driver_assignments (unit_id, valid_from DESC);

CREATE TABLE public.unit_trailer_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id uuid NOT NULL REFERENCES public.units(id) ON DELETE CASCADE,
  trailer_id uuid NOT NULL REFERENCES public.trailers(id) ON DELETE CASCADE,
  valid_from timestamptz NOT NULL DEFAULT now(),
  valid_to timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid DEFAULT auth.uid()
);
CREATE INDEX unit_trailer_assignments_unit_idx ON public.unit_trailer_assignments (unit_id, valid_from DESC);

CREATE TABLE public.driver_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id uuid NOT NULL REFERENCES public.drivers(id) ON DELETE CASCADE,
  doc_type text NOT NULL,
  number text,
  issued_at date,
  expires_at date,
  storage_path text,
  status text NOT NULL DEFAULT 'vigente' CHECK (status IN ('vigente','por_vencer','vencido','faltante')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid DEFAULT auth.uid(),
  updated_by uuid
);
CREATE INDEX driver_documents_expiry_idx ON public.driver_documents (expires_at);

CREATE TABLE public.vehicle_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tractor_id uuid REFERENCES public.tractors(id) ON DELETE CASCADE,
  trailer_id uuid REFERENCES public.trailers(id) ON DELETE CASCADE,
  doc_type text NOT NULL,
  number text,
  issued_at date,
  expires_at date,
  storage_path text,
  status text NOT NULL DEFAULT 'vigente' CHECK (status IN ('vigente','por_vencer','vencido','faltante')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid DEFAULT auth.uid(),
  updated_by uuid,
  CONSTRAINT vehicle_documents_target_chk CHECK (num_nulls(tractor_id, trailer_id) = 1)
);
CREATE INDEX vehicle_documents_expiry_idx ON public.vehicle_documents (expires_at);

CREATE TABLE public.maintenance_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id uuid REFERENCES public.units(id) ON DELETE SET NULL,
  tractor_id uuid REFERENCES public.tractors(id) ON DELETE SET NULL,
  trailer_id uuid REFERENCES public.trailers(id) ON DELETE SET NULL,
  order_type text NOT NULL DEFAULT 'preventivo' CHECK (order_type IN ('preventivo','correctivo','revision')),
  status text NOT NULL DEFAULT 'abierta' CHECK (status IN ('abierta','en_taller','esperando_repuesto','cerrada','cancelada')),
  description text,
  opened_at timestamptz NOT NULL DEFAULT now(),
  scheduled_at timestamptz,
  closed_at timestamptz,
  estimated_hours numeric,
  location_id uuid REFERENCES public.locations(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid DEFAULT auth.uid(),
  updated_by uuid
);
CREATE INDEX maintenance_orders_status_idx ON public.maintenance_orders (status, opened_at DESC);

-- ============ PLANIFICACIÓN ============
CREATE TABLE public.weekly_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  week_start date NOT NULL UNIQUE,
  label text,
  status public.plan_status NOT NULL DEFAULT 'borrador',
  current_version integer NOT NULL DEFAULT 1,
  published_at timestamptz,
  published_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid DEFAULT auth.uid(),
  updated_by uuid
);

CREATE TABLE public.plan_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id uuid NOT NULL REFERENCES public.weekly_plans(id) ON DELETE CASCADE,
  version integer NOT NULL,
  status public.plan_status NOT NULL,
  snapshot jsonb NOT NULL DEFAULT '{}',
  comment text,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid DEFAULT auth.uid(),
  UNIQUE (plan_id, version)
);

CREATE TABLE public.deposit_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id uuid NOT NULL REFERENCES public.weekly_plans(id) ON DELETE CASCADE,
  day_index integer NOT NULL CHECK (day_index BETWEEN 0 AND 6),
  operational_date date NOT NULL,
  destination_id uuid REFERENCES public.locations(id) ON DELETE SET NULL,
  destination_label text NOT NULL,
  units_required integer NOT NULL DEFAULT 1 CHECK (units_required >= 1),
  suggested_departure_time time NOT NULL DEFAULT '15:00',
  window_end_time time NOT NULL DEFAULT '18:00',
  target_unload_at timestamptz,
  cargo text,
  km integer,
  route_id uuid REFERENCES public.routes(id) ON DELETE SET NULL,
  route_label text,
  route_stops text[] NOT NULL DEFAULT '{}',
  route_exact boolean,
  priority integer,
  notes text,
  source text NOT NULL DEFAULT 'manual',
  is_cancelled boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid DEFAULT auth.uid(),
  updated_by uuid
);
CREATE INDEX deposit_requests_plan_day_idx ON public.deposit_requests (plan_id, day_index);

CREATE TABLE public.dispatch_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL REFERENCES public.deposit_requests(id) ON DELETE CASCADE,
  unit_id uuid NOT NULL REFERENCES public.units(id) ON DELETE CASCADE,
  driver_id uuid REFERENCES public.drivers(id) ON DELETE SET NULL,
  departure_at timestamptz NOT NULL,
  eta_at timestamptz,
  margin_minutes integer,
  risk public.risk_level,
  score integer CHECK (score BETWEEN 0 AND 100),
  score_breakdown jsonb NOT NULL DEFAULT '{}',
  recommendation_outcome text CHECK (recommendation_outcome IN ('aceptada','descartada','manual')),
  is_active boolean NOT NULL DEFAULT true,
  removed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid DEFAULT auth.uid(),
  updated_by uuid
);
CREATE UNIQUE INDEX dispatch_assignments_unit_request_active_idx
  ON public.dispatch_assignments (request_id, unit_id) WHERE is_active;
CREATE INDEX dispatch_assignments_request_idx ON public.dispatch_assignments (request_id) WHERE is_active;

-- ============ VIAJES Y EVENTOS ============
CREATE TABLE public.trips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE,
  unit_id uuid NOT NULL REFERENCES public.units(id) ON DELETE RESTRICT,
  driver_id uuid REFERENCES public.drivers(id) ON DELETE SET NULL,
  assignment_id uuid REFERENCES public.dispatch_assignments(id) ON DELETE SET NULL,
  origin_id uuid REFERENCES public.locations(id) ON DELETE SET NULL,
  destination_id uuid REFERENCES public.locations(id) ON DELETE SET NULL,
  route_id uuid REFERENCES public.routes(id) ON DELETE SET NULL,
  status public.trip_status NOT NULL DEFAULT 'programado',
  cargo text,
  km integer,
  departure_at timestamptz,
  target_unload_at timestamptz,
  eta_at timestamptz,
  eta_kind text NOT NULL DEFAULT 'planificado' CHECK (eta_kind IN ('planificado','integracion')),
  eta_confidence text CHECK (eta_confidence IN ('baja','media','alta')),
  eta_calculated_at timestamptz,
  margin_minutes integer,
  risk public.risk_level,
  border_crossing_id uuid REFERENCES public.border_crossings(id) ON DELETE SET NULL,
  documentation_ready boolean NOT NULL DEFAULT false,
  is_cancelled boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid DEFAULT auth.uid(),
  updated_by uuid
);
CREATE INDEX trips_unit_status_idx ON public.trips (unit_id, status);
CREATE INDEX trips_departure_idx ON public.trips (departure_at DESC);

CREATE TABLE public.trip_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id uuid NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  unit_id uuid REFERENCES public.units(id) ON DELETE SET NULL,
  previous_status public.trip_status,
  new_status public.trip_status NOT NULL,
  operational_at timestamptz NOT NULL DEFAULT now(),
  recorded_at timestamptz NOT NULL DEFAULT now(),
  location_id uuid REFERENCES public.locations(id) ON DELETE SET NULL,
  comment text,
  source public.event_source NOT NULL DEFAULT 'manual',
  document_id uuid,
  actor_id uuid DEFAULT auth.uid()
);
CREATE INDEX trip_events_trip_idx ON public.trip_events (trip_id, operational_at DESC);

CREATE TABLE public.unit_status_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id uuid NOT NULL REFERENCES public.units(id) ON DELETE CASCADE,
  previous_status public.operation_status,
  new_status public.operation_status NOT NULL,
  operational_at timestamptz NOT NULL DEFAULT now(),
  recorded_at timestamptz NOT NULL DEFAULT now(),
  location_id uuid REFERENCES public.locations(id) ON DELETE SET NULL,
  comment text,
  source public.event_source NOT NULL DEFAULT 'manual',
  actor_id uuid DEFAULT auth.uid()
);
CREATE INDEX unit_status_events_unit_idx ON public.unit_status_events (unit_id, operational_at DESC);

CREATE TABLE public.border_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id uuid NOT NULL REFERENCES public.units(id) ON DELETE CASCADE,
  trip_id uuid REFERENCES public.trips(id) ON DELETE SET NULL,
  border_crossing_id uuid NOT NULL REFERENCES public.border_crossings(id) ON DELETE RESTRICT,
  departed_from_id uuid REFERENCES public.locations(id) ON DELETE SET NULL,
  departed_at timestamptz,
  eta_border_at timestamptz,
  paperwork_sent_at timestamptz,
  outcome text NOT NULL DEFAULT 'pendiente' CHECK (outcome IN ('pendiente','cruzo','no_cruzo','riesgo')),
  recalculated_eta_at timestamptz,
  comment text,
  source public.event_source NOT NULL DEFAULT 'manual',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid DEFAULT auth.uid(),
  updated_by uuid
);
CREATE INDEX border_events_crossing_idx ON public.border_events (border_crossing_id, eta_border_at DESC);

-- ============ DOCUMENTOS, ALERTAS, COMUNICACIONES ============
CREATE TABLE public.documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  storage_path text NOT NULL,
  file_name text NOT NULL,
  mime_type text,
  size_bytes bigint,
  doc_kind text NOT NULL,
  unit_id uuid REFERENCES public.units(id) ON DELETE SET NULL,
  driver_id uuid REFERENCES public.drivers(id) ON DELETE SET NULL,
  trip_id uuid REFERENCES public.trips(id) ON DELETE SET NULL,
  border_event_id uuid REFERENCES public.border_events(id) ON DELETE SET NULL,
  maintenance_order_id uuid REFERENCES public.maintenance_orders(id) ON DELETE SET NULL,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid DEFAULT auth.uid()
);

CREATE TABLE public.alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text NOT NULL,
  severity text NOT NULL DEFAULT 'media' CHECK (severity IN ('critica','alta','media','baja')),
  unit_id uuid REFERENCES public.units(id) ON DELETE CASCADE,
  trip_id uuid REFERENCES public.trips(id) ON DELETE CASCADE,
  title text NOT NULL,
  detail text,
  suggested_action text,
  status text NOT NULL DEFAULT 'abierta' CHECK (status IN ('abierta','reconocida','resuelta','descartada')),
  acknowledged_by uuid,
  acknowledged_at timestamptz,
  resolved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid DEFAULT auth.uid(),
  updated_by uuid
);
CREATE INDEX alerts_status_idx ON public.alerts (status, created_at DESC);

CREATE TABLE public.communication_drafts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id uuid REFERENCES public.units(id) ON DELETE SET NULL,
  trip_id uuid REFERENCES public.trips(id) ON DELETE SET NULL,
  audience text NOT NULL CHECK (audience IN ('cliente','embarcador','senasa','interno')),
  trigger text NOT NULL,
  subject text NOT NULL,
  body text NOT NULL,
  status text NOT NULL DEFAULT 'borrador' CHECK (status IN ('borrador','aprobado','descartado','enviado')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid DEFAULT auth.uid(),
  updated_by uuid
);

CREATE TABLE public.communication_deliveries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  draft_id uuid NOT NULL REFERENCES public.communication_drafts(id) ON DELETE CASCADE,
  channel text NOT NULL CHECK (channel IN ('copiado','email','whatsapp')),
  provider text,
  recipient text,
  status text NOT NULL DEFAULT 'pendiente' CHECK (status IN ('pendiente','enviado','fallido','no_configurado')),
  error_detail text,
  sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid DEFAULT auth.uid()
);

-- ============ INTEGRACIONES (PREPARADAS, NO CONECTADAS) ============
CREATE TABLE public.tracking_providers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  name text NOT NULL,
  kind text NOT NULL DEFAULT 'gps' CHECK (kind IN ('gps','maps','messaging')),
  is_configured boolean NOT NULL DEFAULT false,
  config jsonb NOT NULL DEFAULT '{}',
  last_sync_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid DEFAULT auth.uid(),
  updated_by uuid
);

CREATE TABLE public.tracking_devices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid NOT NULL REFERENCES public.tracking_providers(id) ON DELETE CASCADE,
  external_id text NOT NULL,
  unit_id uuid REFERENCES public.units(id) ON DELETE SET NULL,
  tractor_id uuid REFERENCES public.tractors(id) ON DELETE SET NULL,
  connection_status text NOT NULL DEFAULT 'desconocido' CHECK (connection_status IN ('conectado','desconectado','desconocido')),
  last_seen_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (provider_id, external_id)
);

CREATE TABLE public.vehicle_positions (
  id bigserial PRIMARY KEY,
  device_id uuid REFERENCES public.tracking_devices(id) ON DELETE CASCADE,
  unit_id uuid REFERENCES public.units(id) ON DELETE CASCADE,
  recorded_at timestamptz NOT NULL,
  received_at timestamptz NOT NULL DEFAULT now(),
  latitude double precision NOT NULL,
  longitude double precision NOT NULL,
  speed_kmh numeric,
  heading numeric,
  temperature_c numeric,
  is_stale boolean NOT NULL DEFAULT false,
  raw jsonb
);
CREATE INDEX vehicle_positions_unit_idx ON public.vehicle_positions (unit_id, recorded_at DESC);

CREATE TABLE public.geofence_events (
  id bigserial PRIMARY KEY,
  unit_id uuid REFERENCES public.units(id) ON DELETE CASCADE,
  location_id uuid REFERENCES public.locations(id) ON DELETE SET NULL,
  event_type text NOT NULL CHECK (event_type IN ('entrada','salida')),
  occurred_at timestamptz NOT NULL,
  received_at timestamptz NOT NULL DEFAULT now(),
  source public.event_source NOT NULL DEFAULT 'integracion'
);

CREATE TABLE public.fuel_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id uuid NOT NULL REFERENCES public.units(id) ON DELETE CASCADE,
  filled_at timestamptz NOT NULL,
  odometer_km integer,
  liters numeric NOT NULL,
  cost numeric,
  currency text NOT NULL DEFAULT 'ARS',
  supplier text,
  location_id uuid REFERENCES public.locations(id) ON DELETE SET NULL,
  document_id uuid REFERENCES public.documents(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid DEFAULT auth.uid(),
  updated_by uuid
);
CREATE INDEX fuel_entries_unit_idx ON public.fuel_entries (unit_id, filled_at DESC);

-- ============ GRANTS + RLS ============
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'locations','routes','route_stops','border_crossings','border_schedules',
    'tractors','trailers','drivers','units','unit_driver_assignments','unit_trailer_assignments',
    'driver_documents','vehicle_documents','maintenance_orders',
    'weekly_plans','plan_versions','deposit_requests','dispatch_assignments',
    'trips','trip_events','unit_status_events','border_events',
    'documents','alerts','communication_drafts','communication_deliveries',
    'tracking_providers','tracking_devices','vehicle_positions','geofence_events','fuel_entries'
  ] LOOP
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON public.%I TO authenticated', t);
    EXECUTE format('GRANT ALL ON public.%I TO service_role', t);
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    -- Lectura: cualquier usuario con rol asignado.
    EXECUTE format($f$CREATE POLICY "%1$s_select_member" ON public.%1$I FOR SELECT TO authenticated USING (public.is_member(auth.uid()))$f$, t);
    EXECUTE format('CREATE TRIGGER %1$s_set_updated_at BEFORE UPDATE ON public.%1$I FOR EACH ROW EXECUTE FUNCTION public.set_updated_at()', t);
  END LOOP;
END $$;

GRANT USAGE, SELECT ON SEQUENCE public.vehicle_positions_id_seq TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE public.geofence_events_id_seq TO authenticated;

-- Escritura: catálogos y flota → admin + analista
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'locations','routes','route_stops','border_crossings','border_schedules',
    'tractors','trailers','drivers','units','unit_driver_assignments','unit_trailer_assignments',
    'weekly_plans','plan_versions','deposit_requests','dispatch_assignments','tracking_providers','tracking_devices'
  ] LOOP
    EXECUTE format($f$CREATE POLICY "%1$s_write_planner" ON public.%1$I FOR ALL TO authenticated
      USING (public.has_any_role(auth.uid(), ARRAY['admin','analista']::public.app_role[]))
      WITH CHECK (public.has_any_role(auth.uid(), ARRAY['admin','analista']::public.app_role[]))$f$, t);
  END LOOP;
END $$;

-- Escritura operativa: admin + analista + seguimiento
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'trips','border_events','driver_documents','vehicle_documents','documents','alerts',
    'communication_drafts','communication_deliveries','fuel_entries'
  ] LOOP
    EXECUTE format($f$CREATE POLICY "%1$s_write_ops" ON public.%1$I FOR ALL TO authenticated
      USING (public.has_any_role(auth.uid(), ARRAY['admin','analista','seguimiento']::public.app_role[]))
      WITH CHECK (public.has_any_role(auth.uid(), ARRAY['admin','analista','seguimiento']::public.app_role[]))$f$, t);
  END LOOP;
END $$;

-- Taller
CREATE POLICY "maintenance_write_workshop" ON public.maintenance_orders FOR ALL TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['admin','analista','taller']::public.app_role[]))
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['admin','analista','taller']::public.app_role[]));

-- Historial inmutable: solo se agrega.
CREATE POLICY "trip_events_insert_ops" ON public.trip_events FOR INSERT TO authenticated
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['admin','analista','seguimiento']::public.app_role[]));
CREATE POLICY "unit_status_events_insert_ops" ON public.unit_status_events FOR INSERT TO authenticated
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['admin','analista','seguimiento','taller']::public.app_role[]));
CREATE POLICY "vehicle_positions_insert_admin" ON public.vehicle_positions FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "geofence_events_insert_admin" ON public.geofence_events FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Auditoría de tablas críticas
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'units','tractors','trailers','drivers','weekly_plans','deposit_requests',
    'dispatch_assignments','trips','maintenance_orders','user_roles'
  ] LOOP
    EXECUTE format('CREATE TRIGGER %1$s_audit AFTER INSERT OR UPDATE OR DELETE ON public.%1$I FOR EACH ROW EXECUTE FUNCTION public.audit_row_change()', t);
  END LOOP;
END $$;