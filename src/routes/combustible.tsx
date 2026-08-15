import { createFileRoute } from "@tanstack/react-router";
import { Fuel } from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { Placeholder } from "@/components/layout/Placeholder";

export const Route = createFileRoute("/combustible")({
  head: () => ({
    meta: [
      { title: "Combustible y rendimiento | Surfrigo Control Tower" },
      { name: "description", content: "Módulo previsto para litros cargados, rendimiento por unidad y consumo por ruta." },
      { property: "og:title", content: "Combustible y rendimiento | Surfrigo Control Tower" },
      { property: "og:description", content: "Próximo módulo: litros, rendimiento por unidad y consumo por ruta." },
    ],
  }),
  component: () => (
    <AppShell>
      <PageHeader icon={Fuel} title="Combustible y rendimiento" subtitle="Módulo planificado para la siguiente iteración" />
      <Placeholder
        title="Combustible y rendimiento"
        items={[
          "Litros cargados por unidad y estación",
          "Rendimiento km/l por tractor y por ruta",
          "Desvíos de consumo contra promedio histórico",
          "Costo estimado por viaje Ezeiza / Chile",
        ]}
      />
    </AppShell>
  ),
});
