import { createFileRoute } from "@tanstack/react-router";
import { BarChart3 } from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { Placeholder } from "@/components/layout/Placeholder";

export const Route = createFileRoute("/reportes")({
  head: () => ({
    meta: [
      { title: "Reportes y KPIs | Surfrigo Control Tower" },
      {
        name: "description",
        content:
          "Módulo previsto para cumplimiento de ETA, equilibrio de km por chofer y performance de cruces.",
      },
      { property: "og:title", content: "Reportes y KPIs | Surfrigo Control Tower" },
      {
        property: "og:description",
        content: "Próximo módulo: cumplimiento de ETA, km por chofer y performance de fronteras.",
      },
    ],
  }),
  component: () => (
    <AppShell>
      <PageHeader
        icon={BarChart3}
        title="Reportes / KPIs"
        subtitle="Módulo planificado para la siguiente iteración"
      />
      <Placeholder
        title="Reportes y KPIs"
        items={[
          "Cumplimiento de hora objetivo de descarga por base",
          "Equilibrio de km por chofer contra meta del período",
          "Tasa de cruce en primer intento por paso fronterizo",
          "Tiempo de unidad disponible sin viaje asignado",
        ]}
      />
    </AppShell>
  ),
});
