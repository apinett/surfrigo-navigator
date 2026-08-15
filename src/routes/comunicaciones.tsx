import { createFileRoute } from "@tanstack/react-router";
import { MessageSquare } from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { CommsCenter } from "@/components/tower/CommsCenter";
import { buildWeeklyPlan } from "@/domain/demo";

export const Route = createFileRoute("/comunicaciones")({
  head: () => ({
    meta: [
      { title: "Comunicaciones | Surfrigo Control Tower" },
      { name: "description", content: "Borradores automáticos de aviso a cliente, embarcador y SENASA según eventos de viaje y frontera." },
      { property: "og:title", content: "Comunicaciones | Surfrigo Control Tower" },
      { property: "og:description", content: "Borradores de mensajes operativos generados por evento. Nada se envía automáticamente." },
    ],
  }),
  component: ComunicacionesPage,
});

function ComunicacionesPage() {
  const plan = buildWeeklyPlan(0);
  return (
    <AppShell>
      <PageHeader
        icon={MessageSquare}
        title="Centro de comunicaciones"
        subtitle="Borradores generados por evento. El envío real todavía no está habilitado."
      />
      <div className="p-4 lg:p-6">
        <CommsCenter plan={plan} expanded />
      </div>
    </AppShell>
  );
}
