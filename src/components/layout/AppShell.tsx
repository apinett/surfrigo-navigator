import { Link } from "@tanstack/react-router";
import {
  BarChart3,
  CalendarRange,
  Fuel,
  Gauge,
  MessageSquare,
  Settings,
  Ship,
  SignpostBig,
  Truck,
} from "lucide-react";
import type { ReactNode } from "react";

import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Torre de Control", icon: Gauge, ready: true },
  { to: "/planificacion", label: "Planificación semanal", icon: CalendarRange, ready: true },
  { to: "/flota", label: "Unidades y choferes", icon: Truck, ready: true },
  { to: "/chile", label: "Movimientos Chile", icon: Ship, ready: true },
  { to: "/fronteras", label: "Fronteras y ETA", icon: SignpostBig, ready: true },
  { to: "/comunicaciones", label: "Comunicaciones", icon: MessageSquare, ready: true },
  { to: "/combustible", label: "Combustible", icon: Fuel, ready: false },
  { to: "/reportes", label: "Reportes / KPIs", icon: BarChart3, ready: false },
  { to: "/configuracion", label: "Configuración", icon: Settings, ready: true },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <TooltipProvider delayDuration={120}>
      <div className="min-h-screen bg-background text-foreground">
        <div className="flex min-h-screen">
          <aside className="hidden w-[236px] shrink-0 flex-col border-r border-border bg-sidebar lg:flex">
            <div className="flex items-center gap-2.5 px-4 py-4">
              <span className="grid size-9 shrink-0 place-items-center rounded-md bg-primary font-mono text-sm font-bold text-primary-foreground">
                SC
              </span>
              <div className="min-w-0 leading-tight">
                <p className="truncate text-sm font-semibold tracking-tight">Surfrigo</p>
                <p className="truncate text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                  Control Tower
                </p>
              </div>
            </div>
            <nav className="flex-1 space-y-0.5 px-2 pb-4">
              {NAV.map(({ to, label, icon: Icon, ready }) => (
                <Link
                  key={to}
                  to={to}
                  activeOptions={{ exact: to === "/" }}
                  activeProps={{
                    className: "bg-sidebar-accent text-sidebar-accent-foreground border-l-primary",
                  }}
                  inactiveProps={{ className: "text-muted-foreground border-l-transparent" }}
                  className="flex items-center gap-2.5 rounded-md border-l-2 px-2.5 py-2 text-[13px] font-medium transition-colors hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
                >
                  <Icon className="size-4 shrink-0" />
                  <span className="min-w-0 flex-1 truncate">{label}</span>
                  {!ready && (
                    <span className="shrink-0 rounded bg-muted px-1 py-0.5 font-mono text-[9px] uppercase text-muted-foreground">
                      soon
                    </span>
                  )}
                </Link>
              ))}
            </nav>
            <p className="border-t border-sidebar-border px-4 py-3 text-[10px] leading-relaxed text-muted-foreground">
              MVP con datos demo ficticios. No refleja operaciones reales.
            </p>
          </aside>

          <div className="flex min-w-0 flex-1 flex-col">
            <MobileNav />
            <main className="min-w-0 flex-1">{children}</main>
          </div>
        </div>
        <Toaster position="bottom-right" />
      </div>
    </TooltipProvider>
  );
}

function MobileNav() {
  return (
    <div className="flex gap-1 overflow-x-auto border-b border-border bg-sidebar px-3 py-2 lg:hidden scroll-slim">
      {NAV.map(({ to, label, icon: Icon }) => (
        <Link
          key={to}
          to={to}
          activeOptions={{ exact: to === "/" }}
          activeProps={{ className: "bg-sidebar-accent text-sidebar-accent-foreground" }}
          inactiveProps={{ className: "text-muted-foreground" }}
          className={cn(
            "flex shrink-0 items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium",
          )}
        >
          <Icon className="size-3.5" />
          {label}
        </Link>
      ))}
    </div>
  );
}
