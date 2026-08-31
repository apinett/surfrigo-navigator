/** Repositorio de catálogos: nodos logísticos, recorridos y pasos fronterizos. */
import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

import { qk } from "./keys";

export type LocationRow = Database["public"]["Tables"]["locations"]["Row"];
export type RouteRow = Database["public"]["Tables"]["routes"]["Row"];
export type RouteStopRow = Database["public"]["Tables"]["route_stops"]["Row"];
export type BorderCrossingRow = Database["public"]["Tables"]["border_crossings"]["Row"];

export const locationsQueryOptions = () =>
  queryOptions({
    queryKey: qk.locations,
    queryFn: async (): Promise<LocationRow[]> => {
      const { data, error } = await supabase
        .from("locations")
        .select("*")
        .eq("is_active", true)
        .order("km_from_ezeiza", { ascending: true, nullsFirst: true });
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 5 * 60_000,
  });

export const routesQueryOptions = (search?: string) =>
  queryOptions({
    queryKey: [...qk.routes, search ?? ""],
    queryFn: async (): Promise<(RouteRow & { route_stops: RouteStopRow[] })[]> => {
      let q = supabase
        .from("routes")
        .select("*, route_stops(*)")
        .eq("is_active", true)
        .order("label")
        .limit(200);
      if (search) q = q.ilike("normalized_label", `%${search.toUpperCase()}%`);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as (RouteRow & { route_stops: RouteStopRow[] })[];
    },
    staleTime: 60_000,
  });

export const borderCrossingsQueryOptions = () =>
  queryOptions({
    queryKey: qk.borderCrossings,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("border_crossings")
        .select("*, border_schedules(*)")
        .eq("is_active", true)
        .order("name");
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 5 * 60_000,
  });

/** Registra un recorrido validado por el analista (alta de tramo). */
export function useCreateRoute() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { label: string; stops: string[]; totalKm?: number }) => {
      const normalized = input.label.trim().toUpperCase();
      const { data, error } = await supabase
        .from("routes")
        .upsert(
          {
            label: input.label.trim(),
            normalized_label: normalized,
            total_km: input.totalKm ?? null,
            is_exact: false,
            source: "usuario",
          },
          { onConflict: "normalized_label" },
        )
        .select("id")
        .single();
      if (error) throw error;

      if (input.stops.length) {
        const rows = input.stops.map((stop, index) => ({
          route_id: data.id,
          position: index,
          stop_name: stop,
          normalized_name: stop.trim().toUpperCase(),
        }));
        const { error: stopsError } = await supabase
          .from("route_stops")
          .upsert(rows, { onConflict: "route_id,position" });
        if (stopsError) throw stopsError;
      }
      return data.id;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: qk.routes }),
  });
}
