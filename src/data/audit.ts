/** Repositorio de auditoría e integraciones (estado de conexión). */
import { queryOptions } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

import { qk } from "./keys";

export type AuditLogRow = Database["public"]["Tables"]["audit_log"]["Row"];
export type TrackingProviderRow = Database["public"]["Tables"]["tracking_providers"]["Row"];

export const auditLogQueryOptions = (table?: string) =>
  queryOptions({
    queryKey: qk.audit(table),
    queryFn: async (): Promise<AuditLogRow[]> => {
      let q = supabase
        .from("audit_log")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);
      if (table) q = q.eq("table_name", table);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });

export const trackingProvidersQueryOptions = () =>
  queryOptions({
    queryKey: qk.providers,
    queryFn: async (): Promise<TrackingProviderRow[]> => {
      const { data, error } = await supabase.from("tracking_providers").select("*").order("name");
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 5 * 60_000,
  });
