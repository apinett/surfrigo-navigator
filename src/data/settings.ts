/** Repositorio de configuración operativa (`app_settings`). */
import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import { DISPATCH_CONFIG, SCORE_WEIGHTS } from "@/domain/dispatch";
import type { DispatchConfig } from "@/domain/types";

import { qk } from "./keys";

export type DataMode = "demo" | "real";

export interface AppSettings {
  dispatchConfig: DispatchConfig;
  scoreWeights: Record<string, number>;
  timezone: string;
  dataMode: DataMode;
  integrations: { tracking: boolean; maps: boolean; messaging: boolean };
}

export const DEFAULT_SETTINGS: AppSettings = {
  dispatchConfig: DISPATCH_CONFIG,
  scoreWeights: { ...SCORE_WEIGHTS },
  timezone: "America/Argentina/Buenos_Aires",
  dataMode: "demo",
  integrations: { tracking: false, maps: false, messaging: false },
};

export async function fetchSettings(): Promise<AppSettings> {
  const { data, error } = await supabase.from("app_settings").select("key, value");
  if (error) throw error;
  const map = new Map((data ?? []).map((row) => [row.key, row.value]));
  const pick = <T,>(key: string, fallback: T) => (map.get(key) as T | undefined) ?? fallback;
  return {
    dispatchConfig: pick("dispatch_config", DEFAULT_SETTINGS.dispatchConfig),
    scoreWeights: pick("score_weights", DEFAULT_SETTINGS.scoreWeights),
    timezone: pick("operational_timezone", DEFAULT_SETTINGS.timezone),
    dataMode: pick("data_mode", DEFAULT_SETTINGS.dataMode),
    integrations: pick("integrations", DEFAULT_SETTINGS.integrations),
  };
}

export const settingsQueryOptions = () =>
  queryOptions({
    queryKey: qk.settings,
    queryFn: fetchSettings,
    staleTime: 5 * 60_000,
  });

export function useUpdateSetting() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ key, value }: { key: string; value: unknown }) => {
      const { error } = await supabase
        .from("app_settings")
        .upsert({ key, value: value as never }, { onConflict: "key" });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: qk.settings }),
  });
}
