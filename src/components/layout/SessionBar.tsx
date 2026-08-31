import { useQuery } from "@tanstack/react-query";
import { Database, FlaskConical, LogOut, ShieldAlert, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { settingsQueryOptions } from "@/data/settings";
import { ROLE_LABEL, useAuth, useSignOut } from "@/hooks/use-auth";

/**
 * Barra de sesión: usuario responsable, roles y fuente de datos vigente.
 * Los datos demo nunca se presentan como operación real.
 */
export function SessionBar() {
  const { user, profile, roles, permissions } = useAuth();
  const signOut = useSignOut();
  const settings = useQuery(settingsQueryOptions());
  const mode = settings.data?.dataMode ?? "demo";

  const name = profile?.full_name ?? user?.email ?? "Usuario";
  const roleText = roles.length ? roles.map((r) => ROLE_LABEL[r]).join(" · ") : "Sin rol asignado";

  return (
    <div className="flex items-center justify-between gap-3 border-b border-border bg-background/80 px-4 py-2 backdrop-blur">
      <div className="flex min-w-0 items-center gap-2">
        {mode === "demo" ? (
          <span className="flex items-center gap-1.5 rounded border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-amber-400">
            <FlaskConical className="size-3" />
            Datos demo
          </span>
        ) : (
          <span className="flex items-center gap-1.5 rounded border border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-emerald-400">
            <Database className="size-3" />
            Datos reales
          </span>
        )}
        {!permissions.isMember && (
          <span className="flex items-center gap-1.5 truncate rounded border border-destructive/40 bg-destructive/10 px-2 py-0.5 text-[10px] font-medium text-destructive">
            <ShieldAlert className="size-3 shrink-0" />
            Sin rol: pedí a un administrador que te habilite
          </span>
        )}
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 gap-2 px-2">
            <User className="size-4" />
            <span className="max-w-[180px] truncate text-xs font-medium">{name}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuLabel className="space-y-0.5">
            <p className="truncate text-xs font-semibold">{name}</p>
            <p className="truncate text-[11px] font-normal text-muted-foreground">{user?.email}</p>
            <p className="text-[11px] font-normal text-muted-foreground">{roleText}</p>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => void signOut()}>
            <LogOut className="size-4" />
            Cerrar sesión
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
