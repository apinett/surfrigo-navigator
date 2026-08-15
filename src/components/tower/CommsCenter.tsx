import { Copy, Send } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import type { CommunicationDraft, WeeklyPlan } from "@/domain/types";
import { fmtStamp } from "@/lib/week";
import { cn } from "@/lib/utils";

const AUDIENCE: Record<CommunicationDraft["audience"], { label: string; className: string }> = {
  cliente: { label: "Cliente", className: "bg-st-transito/15 text-st-transito border-st-transito/35" },
  embarcador: { label: "Embarcador EZE", className: "bg-st-descargando/15 text-st-descargando border-st-descargando/35" },
  senasa: { label: "SENASA / Despachante", className: "bg-st-frontera/15 text-st-frontera border-st-frontera/35" },
  interno: { label: "Interno", className: "bg-muted text-muted-foreground border-border" },
};

export function CommsCenter({
  plan,
  expanded = false,
  unitId,
}: {
  plan: WeeklyPlan;
  expanded?: boolean;
  unitId?: string | undefined;
}) {
  const drafts = unitId ? plan.communications.filter((c) => c.unitId === unitId) : plan.communications;

  const copy = async (draft: CommunicationDraft) => {
    try {
      await navigator.clipboard.writeText(`${draft.subject}\n\n${draft.body}`);
      toast.success("Borrador copiado al portapapeles");
    } catch {
      toast.error("No se pudo copiar el borrador");
    }
  };

  return (
    <section className="panel flex min-h-0 flex-col">
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 border-b border-border px-3 py-2.5">
        <h2 className="min-w-0 truncate text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          Centro de comunicaciones
        </h2>
        <span className="shrink-0 rounded border border-border px-1.5 py-0.5 text-[9px] font-bold uppercase text-muted-foreground">
          borradores
        </span>
      </header>
      <ul
        className={cn(
          "divide-y divide-border/60 overflow-y-auto scroll-slim",
          expanded ? "" : "max-h-[340px]",
        )}
      >
        {drafts.length === 0 && (
          <li className="px-3 py-6 text-center text-xs text-muted-foreground">
            Sin borradores para esta unidad.
          </li>
        )}
        {drafts.map((draft) => {
          const unit = plan.units.find((u) => u.id === draft.unitId);
          const audience = AUDIENCE[draft.audience];
          return (
            <li key={draft.id} className="px-3 py-3">
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
                <p className="min-w-0 truncate text-[12.5px] font-semibold">
                  <span className="font-mono">{unit?.code}</span> · {draft.subject}
                </p>
                <span
                  className={cn(
                    "shrink-0 rounded border px-1.5 py-0.5 text-[9px] font-bold uppercase",
                    audience.className,
                  )}
                >
                  {audience.label}
                </span>
              </div>
              <p className="mt-0.5 text-[10px] uppercase tracking-wide text-muted-foreground/70">
                Disparador: {draft.trigger} · {fmtStamp(draft.createdAt)}
              </p>
              <p className="mt-2 rounded-md border border-border bg-surface-strong/60 p-2.5 text-[11.5px] leading-relaxed text-muted-foreground">
                {draft.body}
              </p>
              <div className="mt-2 flex gap-2">
                <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => copy(draft)}>
                  <Copy className="size-3" /> Copiar
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  className="h-7 text-[11px]"
                  onClick={() =>
                    toast("Envío no habilitado en el MVP", {
                      description: "El borrador queda listo para copiar y enviar manualmente.",
                    })
                  }
                >
                  <Send className="size-3" /> Enviar
                </Button>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
