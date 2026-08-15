import { AlertTriangle, CheckCircle2, PackageOpen, Ship, Truck, Waypoints } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { WeeklyPlan } from "@/domain/types";
import { cn } from "@/lib/utils";

interface Kpi {
  label: string;
  value: number;
  icon: LucideIcon;
  accent: string;
  help: string;
}

export function KpiRow({ plan }: { plan: WeeklyPlan }) {
  const k = plan.kpis;
  const kpis: Kpi[] = [
    {
      label: "Unidades operativas",
      value: k.operativas,
      icon: Truck,
      accent: "text-foreground",
      help: "Total de unidades de la flota habilitadas para operar esta semana.",
    },
    {
      label: "Disponibles hoy",
      value: k.disponiblesHoy,
      icon: CheckCircle2,
      accent: "text-st-disponible",
      help: "Unidades liberadas hoy en CD Ezeiza o bases, listas para asignar.",
    },
    {
      label: "En viaje",
      value: k.enViaje,
      icon: Waypoints,
      accent: "text-st-transito",
      help: "Unidades en tránsito hoy, incluye retornos desde Chile.",
    },
    {
      label: "Descargando",
      value: k.descargando,
      icon: PackageOpen,
      accent: "text-st-descargando",
      help: "Unidades en destino descargando o esperando desprecintado SENASA.",
    },
    {
      label: "Retornos Chile",
      value: k.retornosChile,
      icon: Ship,
      accent: "text-st-retorno",
      help: "Unidades cargadas en puertos chilenos, en ruta o en trámite de frontera.",
    },
    {
      label: "Salidas en riesgo",
      value: k.salidasEnRiesgo,
      icon: AlertTriangle,
      accent: "text-st-riesgo",
      help: "Operaciones con ETA comprometido, demora o riesgo de no cruzar frontera.",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-6">
      {kpis.map((kpi) => (
        <Tooltip key={kpi.label}>
          <TooltipTrigger asChild>
            <div className="panel cursor-help px-3 py-2.5">
              <div className="flex items-center justify-between gap-2">
                <p className="min-w-0 truncate text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                  {kpi.label}
                </p>
                <kpi.icon className={cn("size-3.5 shrink-0", kpi.accent)} />
              </div>
              <p className={cn("tabular mt-1 text-2xl font-semibold leading-none", kpi.accent)}>
                {kpi.value}
              </p>
            </div>
          </TooltipTrigger>
          <TooltipContent className="max-w-56">{kpi.help}</TooltipContent>
        </Tooltip>
      ))}
    </div>
  );
}
