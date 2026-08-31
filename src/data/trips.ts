/** Repositorio de viajes y eventos operativos (historial inmutable). */
import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

import { qk } from "./keys";

type Tables = Database["public"]["Tables"];
export type TripRow = Tables["trips"]["Row"];
export type TripEventRow = Tables["trip_events"]["Row"];
export type TripStatus = Database["public"]["Enums"]["trip_status"];

export const tripsQueryOptions = (filters?: { unitId?: string; active?: boolean }) =>
  queryOptions({
    queryKey: qk.trips(JSON.stringify(filters ?? {})),
    queryFn: async (): Promise<TripRow[]> => {
      let q = supabase.from("trips").select("*").order("departure_at", { ascending: false });
      if (filters?.unitId) q = q.eq("unit_id", filters.unitId);
      if (filters?.active)
        q = q.not("status", "in", '("finalizado","cancelado")').eq("is_cancelled", false);
      const { data, error } = await q.limit(500);
      if (error) throw error;
      return data ?? [];
    },
  });

export const tripEventsQueryOptions = (tripId: string) =>
  queryOptions({
    queryKey: qk.tripEvents(tripId),
    queryFn: async (): Promise<TripEventRow[]> => {
      const { data, error } = await supabase
        .from("trip_events")
        .select("*")
        .eq("trip_id", tripId)
        .order("operational_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

export function useSaveTrip() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: Tables["trips"]["Insert"] & { id?: string }) => {
      const { data, error } = await supabase
        .from("trips")
        .upsert(input, { onConflict: "id" })
        .select("*")
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["trips"] }),
  });
}

/**
 * Cambia el estado del viaje y agrega el evento inmutable.
 * El estado actual se actualiza; el historial nunca se reemplaza.
 */
export function useAdvanceTrip() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      trip: TripRow;
      newStatus: TripStatus;
      operationalAt?: string;
      locationId?: string | null;
      comment?: string;
      source?: Database["public"]["Enums"]["event_source"];
    }) => {
      const { error: eventError } = await supabase.from("trip_events").insert({
        trip_id: input.trip.id,
        unit_id: input.trip.unit_id,
        previous_status: input.trip.status,
        new_status: input.newStatus,
        operational_at: input.operationalAt ?? new Date().toISOString(),
        location_id: input.locationId ?? null,
        comment: input.comment ?? null,
        source: input.source ?? "manual",
      });
      if (eventError) throw eventError;

      const { error } = await supabase
        .from("trips")
        .update({
          status: input.newStatus,
          is_cancelled: input.newStatus === "cancelado" ? true : input.trip.is_cancelled,
        })
        .eq("id", input.trip.id);
      if (error) throw error;
    },
    onSuccess: (_res, vars) => {
      void queryClient.invalidateQueries({ queryKey: ["trips"] });
      void queryClient.invalidateQueries({ queryKey: qk.tripEvents(vars.trip.id) });
      void queryClient.invalidateQueries({ queryKey: qk.units });
    },
  });
}
