/** Repositorio de flota: tractores, semirremolques, choferes y unidades. */
import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

import { qk } from "./keys";

type Tables = Database["public"]["Tables"];
export type TractorRow = Tables["tractors"]["Row"];
export type TrailerRow = Tables["trailers"]["Row"];
export type DriverRow = Tables["drivers"]["Row"];
export type UnitRow = Tables["units"]["Row"];
export type MaintenanceOrderRow = Tables["maintenance_orders"]["Row"];

export type UnitWithRelations = UnitRow & {
  tractor: TractorRow | null;
  trailer: TrailerRow | null;
  driver: DriverRow | null;
  relief_driver: DriverRow | null;
};

const UNIT_SELECT =
  "*, tractor:tractors!units_tractor_id_fkey(*), trailer:trailers!units_trailer_id_fkey(*), driver:drivers!units_driver_id_fkey(*), relief_driver:drivers!units_relief_driver_id_fkey(*)";

export const unitsQueryOptions = () =>
  queryOptions({
    queryKey: qk.units,
    queryFn: async (): Promise<UnitWithRelations[]> => {
      const { data, error } = await supabase
        .from("units")
        .select(UNIT_SELECT)
        .eq("is_active", true)
        .order("code");
      if (error) throw error;
      return (data ?? []) as unknown as UnitWithRelations[];
    },
  });

export const unitQueryOptions = (id: string) =>
  queryOptions({
    queryKey: qk.unit(id),
    queryFn: async (): Promise<UnitWithRelations | null> => {
      const { data, error } = await supabase
        .from("units")
        .select(UNIT_SELECT)
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return (data ?? null) as unknown as UnitWithRelations | null;
    },
  });

export const driversQueryOptions = () =>
  queryOptions({
    queryKey: qk.drivers,
    queryFn: async (): Promise<DriverRow[]> => {
      const { data, error } = await supabase
        .from("drivers")
        .select("*")
        .eq("is_active", true)
        .order("full_name");
      if (error) throw error;
      return data ?? [];
    },
  });

export const tractorsQueryOptions = () =>
  queryOptions({
    queryKey: qk.tractors,
    queryFn: async (): Promise<TractorRow[]> => {
      const { data, error } = await supabase
        .from("tractors")
        .select("*")
        .eq("is_active", true)
        .order("plate");
      if (error) throw error;
      return data ?? [];
    },
  });

export const trailersQueryOptions = () =>
  queryOptions({
    queryKey: qk.trailers,
    queryFn: async (): Promise<TrailerRow[]> => {
      const { data, error } = await supabase
        .from("trailers")
        .select("*")
        .eq("is_active", true)
        .order("plate");
      if (error) throw error;
      return data ?? [];
    },
  });

export const maintenanceOrdersQueryOptions = () =>
  queryOptions({
    queryKey: qk.maintenance,
    queryFn: async (): Promise<MaintenanceOrderRow[]> => {
      const { data, error } = await supabase
        .from("maintenance_orders")
        .select("*")
        .order("opened_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return data ?? [];
    },
  });

/* ─────────── Mutaciones ─────────── */

function useFleetMutation<TInput, TResult>(
  fn: (input: TInput) => Promise<TResult>,
  keys: readonly (readonly unknown[])[],
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => {
      keys.forEach((key) => void queryClient.invalidateQueries({ queryKey: [...key] }));
    },
  });
}

export const useSaveUnit = () =>
  useFleetMutation(
    async (input: Tables["units"]["Insert"] & { id?: string }) => {
      const { data, error } = await supabase
        .from("units")
        .upsert(input, { onConflict: "id" })
        .select("id")
        .single();
      if (error) throw error;
      return data.id;
    },
    [qk.units],
  );

export const useSaveDriver = () =>
  useFleetMutation(
    async (input: Tables["drivers"]["Insert"] & { id?: string }) => {
      const { data, error } = await supabase
        .from("drivers")
        .upsert(input, { onConflict: "id" })
        .select("id")
        .single();
      if (error) throw error;
      return data.id;
    },
    [qk.drivers, qk.units],
  );

export const useSaveTractor = () =>
  useFleetMutation(
    async (input: Tables["tractors"]["Insert"] & { id?: string }) => {
      const { data, error } = await supabase
        .from("tractors")
        .upsert(input, { onConflict: "id" })
        .select("id")
        .single();
      if (error) throw error;
      return data.id;
    },
    [qk.tractors, qk.units],
  );

export const useSaveTrailer = () =>
  useFleetMutation(
    async (input: Tables["trailers"]["Insert"] & { id?: string }) => {
      const { data, error } = await supabase
        .from("trailers")
        .upsert(input, { onConflict: "id" })
        .select("id")
        .single();
      if (error) throw error;
      return data.id;
    },
    [qk.trailers, qk.units],
  );

/** Baja lógica: nunca borrar historial operativo. */
export const useDeactivate = () =>
  useFleetMutation(
    async ({
      table,
      id,
    }: {
      table: "units" | "drivers" | "tractors" | "trailers";
      id: string;
    }) => {
      const { error } = await supabase.from(table).update({ is_active: false }).eq("id", id);
      if (error) throw error;
    },
    [qk.units, qk.drivers, qk.tractors, qk.trailers],
  );

/** Cambia el estado de una unidad y deja el evento inmutable correspondiente. */
export const useSetUnitStatus = () =>
  useFleetMutation(
    async (input: {
      unitId: string;
      previousStatus: Database["public"]["Enums"]["operation_status"] | null;
      newStatus: Database["public"]["Enums"]["operation_status"];
      locationId?: string | null;
      comment?: string;
    }) => {
      const { error } = await supabase
        .from("units")
        .update({ status: input.newStatus, current_location_id: input.locationId ?? null })
        .eq("id", input.unitId);
      if (error) throw error;
      const { error: eventError } = await supabase.from("unit_status_events").insert({
        unit_id: input.unitId,
        previous_status: input.previousStatus,
        new_status: input.newStatus,
        location_id: input.locationId ?? null,
        comment: input.comment ?? null,
        source: "manual",
      });
      if (eventError) throw eventError;
    },
    [qk.units],
  );
