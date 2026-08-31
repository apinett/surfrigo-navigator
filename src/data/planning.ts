/**
 * Repositorio de planificación: plan semanal, versiones, previsto de Depósito
 * y asignaciones de despacho. Sin dependencias de la UI.
 */
import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

import { qk } from "./keys";

type Tables = Database["public"]["Tables"];
export type WeeklyPlanRow = Tables["weekly_plans"]["Row"];
export type DepositRequestRow = Tables["deposit_requests"]["Row"];
export type DispatchAssignmentRow = Tables["dispatch_assignments"]["Row"];
export type PlanStatus = Database["public"]["Enums"]["plan_status"];

export const weeklyPlanQueryOptions = (weekStart: string) =>
  queryOptions({
    queryKey: qk.plan(weekStart),
    queryFn: async (): Promise<WeeklyPlanRow | null> => {
      const { data, error } = await supabase
        .from("weekly_plans")
        .select("*")
        .eq("week_start", weekStart)
        .maybeSingle();
      if (error) throw error;
      return data ?? null;
    },
  });

export const depositRequestsQueryOptions = (planId: string | undefined) =>
  queryOptions({
    queryKey: qk.requests(planId ?? "none"),
    queryFn: async (): Promise<DepositRequestRow[]> => {
      const { data, error } = await supabase
        .from("deposit_requests")
        .select("*")
        .eq("plan_id", planId!)
        .eq("is_cancelled", false)
        .order("day_index")
        .order("suggested_departure_time");
      if (error) throw error;
      return data ?? [];
    },
    enabled: Boolean(planId),
  });

export const assignmentsQueryOptions = (planId: string | undefined) =>
  queryOptions({
    queryKey: qk.assignments(planId ?? "none"),
    queryFn: async (): Promise<DispatchAssignmentRow[]> => {
      const { data, error } = await supabase
        .from("dispatch_assignments")
        .select("*, deposit_requests!inner(plan_id)")
        .eq("deposit_requests.plan_id", planId!)
        .eq("is_active", true);
      if (error) throw error;
      return (data ?? []) as unknown as DispatchAssignmentRow[];
    },
    enabled: Boolean(planId),
  });

/** Crea el plan de la semana si todavía no existe (idempotente). */
export function useEnsureWeeklyPlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ weekStart, label }: { weekStart: string; label?: string }) => {
      const { data, error } = await supabase
        .from("weekly_plans")
        .upsert({ week_start: weekStart, label: label ?? null }, { onConflict: "week_start" })
        .select("*")
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (plan) =>
      queryClient.invalidateQueries({ queryKey: qk.plan(plan.week_start as string) }),
  });
}

/** Cambia el estado del plan y guarda una versión con snapshot. */
export function useSetPlanStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      plan,
      status,
      comment,
    }: {
      plan: WeeklyPlanRow;
      status: PlanStatus;
      comment?: string;
    }) => {
      const nextVersion = plan.current_version + 1;
      const [{ data: requests }, { data: assignments }] = await Promise.all([
        supabase.from("deposit_requests").select("*").eq("plan_id", plan.id),
        supabase.from("dispatch_assignments").select("*").eq("is_active", true),
      ]);

      const { error: versionError } = await supabase.from("plan_versions").insert({
        plan_id: plan.id,
        version: nextVersion,
        status,
        comment: comment ?? null,
        snapshot: { requests: requests ?? [], assignments: assignments ?? [] } as never,
      });
      if (versionError) throw versionError;

      const { error } = await supabase
        .from("weekly_plans")
        .update({
          status,
          current_version: nextVersion,
          published_at: status === "publicado" ? new Date().toISOString() : plan.published_at,
        })
        .eq("id", plan.id);
      if (error) throw error;
    },
    onSuccess: (_res, vars) =>
      queryClient.invalidateQueries({ queryKey: qk.plan(vars.plan.week_start as string) }),
  });
}

export function useSaveDepositRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: Tables["deposit_requests"]["Insert"] & { id?: string }) => {
      const { data, error } = await supabase
        .from("deposit_requests")
        .upsert(input, { onConflict: "id" })
        .select("*")
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (row) =>
      queryClient.invalidateQueries({ queryKey: qk.requests(row.plan_id as string) }),
  });
}

export function useImportDepositRequests() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (rows: Tables["deposit_requests"]["Insert"][]) => {
      if (!rows.length) return [];
      const { data, error } = await supabase.from("deposit_requests").insert(rows).select("*");
      if (error) throw error;
      return data ?? [];
    },
    onSuccess: (rows) => {
      const planId = rows[0]?.plan_id as string | undefined;
      if (planId) void queryClient.invalidateQueries({ queryKey: qk.requests(planId) });
    },
  });
}

export function useCancelDepositRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, planId }: { id: string; planId: string }) => {
      const { error } = await supabase
        .from("deposit_requests")
        .update({ is_cancelled: true })
        .eq("id", id);
      if (error) throw error;
      return planId;
    },
    onSuccess: (planId) => queryClient.invalidateQueries({ queryKey: qk.requests(planId) }),
  });
}

/**
 * Asigna una unidad a una salida.
 * Valida solapamiento de unidad y chofer antes de persistir: no autodecide,
 * devuelve el conflicto para que el analista confirme o corrija.
 */
export function useAssignUnit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      planId: string;
      requestId: string;
      unitId: string;
      driverId?: string | null;
      departureAt: string;
      etaAt: string | null;
      marginMinutes: number | null;
      risk: Database["public"]["Enums"]["risk_level"] | null;
      score: number | null;
      scoreBreakdown: unknown;
      allowConflict?: boolean;
    }) => {
      const { data: existing, error: existingError } = await supabase
        .from("dispatch_assignments")
        .select("id, request_id, deposit_requests!inner(plan_id, operational_date)")
        .eq("unit_id", input.unitId)
        .eq("is_active", true)
        .eq("deposit_requests.plan_id", input.planId);
      if (existingError) throw existingError;

      const conflicting = (existing ?? []).filter((row) => row.request_id !== input.requestId);
      if (conflicting.length && !input.allowConflict) {
        throw Object.assign(new Error("La unidad ya está asignada a otra salida de esta semana."), {
          code: "conflict",
        });
      }

      // Reemplaza la asignación previa de la unidad en la semana.
      if (conflicting.length) {
        const { error: releaseError } = await supabase
          .from("dispatch_assignments")
          .update({ is_active: false, removed_at: new Date().toISOString() })
          .in(
            "id",
            conflicting.map((row) => row.id),
          );
        if (releaseError) throw releaseError;
      }

      const { data, error } = await supabase
        .from("dispatch_assignments")
        .upsert(
          {
            request_id: input.requestId,
            unit_id: input.unitId,
            driver_id: input.driverId ?? null,
            departure_at: input.departureAt,
            eta_at: input.etaAt,
            margin_minutes: input.marginMinutes,
            risk: input.risk,
            score: input.score,
            score_breakdown: (input.scoreBreakdown ?? {}) as never,
            recommendation_outcome: "manual",
            is_active: true,
            removed_at: null,
          },
          { onConflict: "request_id,unit_id" },
        )
        .select("*")
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_row, vars) => {
      void queryClient.invalidateQueries({ queryKey: qk.assignments(vars.planId) });
      void queryClient.invalidateQueries({ queryKey: qk.units });
    },
  });
}

export function useReleaseAssignment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, planId }: { id: string; planId: string }) => {
      const { error } = await supabase
        .from("dispatch_assignments")
        .update({ is_active: false, removed_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
      return planId;
    },
    onSuccess: (planId) => queryClient.invalidateQueries({ queryKey: qk.assignments(planId) }),
  });
}
