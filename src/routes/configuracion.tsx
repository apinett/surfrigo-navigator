import { createFileRoute } from "@tanstack/react-router";
import { Settings } from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { BORDERS, AR_BASES } from "@/domain/catalog";

export const Route = createFileRoute("/configuracion")({
  head: () => ({
    meta: [
      { title: "Configuración | Surfrigo Control Tower" },
      { name: "description", content: "Meta de km por período, horas objetivo de descarga por base y ventanas de frontera." },
      { property: "og:title", content: "Configuración | Surfrigo Control Tower" },
      { property: "og:description", content: "Parámetros operativos: metas de km, objetivos de descarga y ventanas de frontera." },
    ],
  }),
  component: ConfiguracionPage,
});

function ConfiguracionPage() {
  return (
    <AppShell>
      <PageHeader icon={Settings} title="Configuración" subtitle="Parámetros de referencia del planificador (demo, sin persistencia)" />
      <div className="grid gap-4 p-4 lg:p-6 xl:grid-cols-3">
        <section className="panel p-4">
          <h2 className="text-sm font-semibold">Equilibrio de kilómetros</h2>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between gap-3"><dt className="text-muted-foreground">Meta por período</dt><dd className="tabular font-medium">12.000 km</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-muted-foreground">Tolerancia</dt><dd className="tabular font-medium">± 10%</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-muted-foreground">Repetición de destino</dt><dd className="tabular font-medium">máx. 2 seguidos</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-muted-foreground">Día en domicilio</dt><dd className="tabular font-medium">sugerido si la operación lo permite</dd></div>
          </dl>
        </section>
        <section className="panel p-4">
          <h2 className="text-sm font-semibold">Objetivos de descarga por base</h2>
          <ul className="mt-3 space-y-1.5 text-sm">
            {AR_BASES.map((b) => (
              <li key={b.id} className="flex items-center justify-between gap-3 rounded-md border border-border/70 px-3 py-2">
                <span className="truncate">{b.name}</span>
                <span className="tabular shrink-0 text-xs text-muted-foreground">{b.transitHours} h · 06:00</span>
              </li>
            ))}
          </ul>
        </section>
        <section className="panel p-4">
          <h2 className="text-sm font-semibold">Ventanas de frontera</h2>
          <ul className="mt-3 space-y-1.5 text-sm">
            {BORDERS.map((b) => (
              <li key={b.id} className="rounded-md border border-border/70 px-3 py-2">
                <p className="truncate text-[13px]">{b.name}</p>
                <p className="tabular text-xs text-muted-foreground">{b.opensAt}–{b.closesAt} · papeles {b.paperworkCutoff}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </AppShell>
  );
}
