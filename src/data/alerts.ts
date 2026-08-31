/** Repositorio de alertas y borradores de comunicación. */
import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

import { qk } from "./keys";

type Tables = Database["public"]["Tables"];
export type AlertRow = Tables["alerts"]["Row"];
export type CommunicationDraftRow = Tables["communication_drafts"]["Row"];

export const alertsQueryOptions = () =>
  queryOptions({
    queryKey: qk.alerts,
    queryFn: async (): Promise<AlertRow[]> => {
      const { data, error } = await supabase
        .from("alerts")
        .select("*")
        .in("status", ["abierta", "reconocida"])
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return data ?? [];
    },
  });

export const communicationDraftsQueryOptions = () =>
  queryOptions({
    queryKey: qk.drafts,
    queryFn: async (): Promise<CommunicationDraftRow[]> => {
      const { data, error } = await supabase
        .from("communication_drafts")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return data ?? [];
    },
  });

export function useUpdateAlertStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: string;
      status: "abierta" | "reconocida" | "resuelta" | "descartada";
    }) => {
      const patch: Tables["alerts"]["Update"] = { status };
      if (status === "reconocida") patch.acknowledged_at = new Date().toISOString();
      if (status === "resuelta") patch.resolved_at = new Date().toISOString();
      const { error } = await supabase.from("alerts").update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: qk.alerts }),
  });
}

/** Registra el uso de un borrador. El envío real requiere proveedor configurado. */
export function useRecordDelivery() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      draftId,
      channel,
      recipient,
    }: {
      draftId: string;
      channel: "copiado" | "email" | "whatsapp";
      recipient?: string;
    }) => {
      const { error } = await supabase.from("communication_deliveries").insert({
        draft_id: draftId,
        channel,
        recipient: recipient ?? null,
        status: channel === "copiado" ? "enviado" : "no_configurado",
        sent_at: channel === "copiado" ? new Date().toISOString() : null,
      });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: qk.drafts }),
  });
}
