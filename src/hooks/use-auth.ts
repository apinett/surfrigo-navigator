/**
 * Sesión, perfil y roles de aplicación del usuario actual.
 * Los roles nunca se guardan en el perfil: viven en `user_roles` con RLS.
 */
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { Session, User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";

import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type AppRole = Database["public"]["Enums"]["app_role"];
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export const ROLE_LABEL: Record<AppRole, string> = {
  admin: "Administrador",
  analista: "Analista",
  seguimiento: "Seguimiento",
  taller: "Taller",
  consulta: "Consulta",
};

export function useSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => setSession(next));
    return () => sub.subscription.unsubscribe();
  }, []);

  return { session, user: session?.user ?? null, ready };
}

async function fetchIdentity(userId: string) {
  const [profileRes, rolesRes] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
    supabase.from("user_roles").select("role").eq("user_id", userId),
  ]);
  if (profileRes.error) throw profileRes.error;
  if (rolesRes.error) throw rolesRes.error;
  return {
    profile: profileRes.data as Profile | null,
    roles: (rolesRes.data ?? []).map((r) => r.role),
  };
}

/** Permisos derivados de los roles (la UI nunca es la única barrera: RLS manda). */
export function permissionsFor(roles: AppRole[]) {
  const has = (...list: AppRole[]) => list.some((r) => roles.includes(r));
  return {
    isMember: roles.length > 0,
    isAdmin: has("admin"),
    canManageFleet: has("admin", "analista"),
    canPlan: has("admin", "analista"),
    canTrack: has("admin", "analista", "seguimiento"),
    canWorkshop: has("admin", "taller"),
    readOnly: roles.length > 0 && !has("admin", "analista", "seguimiento", "taller"),
  };
}

export function useAuth() {
  const { session, user, ready } = useSession();
  const query = useQuery({
    queryKey: ["identity", user?.id],
    queryFn: () => fetchIdentity(user!.id),
    enabled: Boolean(user?.id),
    staleTime: 60_000,
  });

  const roles = query.data?.roles ?? [];
  return {
    ready: ready && (!user || !query.isLoading),
    session,
    user: user as User | null,
    profile: query.data?.profile ?? null,
    roles,
    permissions: permissionsFor(roles),
    error: query.error as Error | null,
  };
}

export function useSignOut() {
  const queryClient = useQueryClient();
  return async () => {
    await supabase.auth.signOut();
    queryClient.clear();
    window.location.assign("/auth");
  };
}
