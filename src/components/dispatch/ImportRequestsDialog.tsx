import { ClipboardPaste, Check, AlertTriangle } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { locationName } from "@/domain/catalog";
import { DEFAULT_DEPARTURE_WINDOW, parseRequestsText } from "@/domain/dispatch-import";
import type { DepositRequest } from "@/domain/types";
import { fmtStamp } from "@/lib/week";

const EXAMPLE = `EZEIZA-BAHIA-SANTA ROSA-PELLEGRINI | 15:00-18:00 | 20/08 06:00 | Fresco consolidado
Neuquén | objetivo 21/08 06:00 | Aéreo consolidado
Trelew`;


export function ImportRequestsDialog({
  dayIndex,
  dateIso,
  onApply,
}: {
  dayIndex: number;
  dateIso: string;
  onApply: (requests: DepositRequest[], mode: "replace" | "append") => void;
}) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");

  const rows = useMemo(
    () => (text.trim() ? parseRequestsText(text, { dayIndex, dateIso }) : []),
    [text, dayIndex, dateIso],
  );
  const valid = rows.filter((r) => r.ok && r.request).map((r) => r.request!);

  const apply = (mode: "replace" | "append") => {
    if (valid.length === 0) return;
    onApply(valid, mode);
    setOpen(false);
    setText("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <ClipboardPaste className="size-3.5" /> Cargar salidas
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Cargar salidas del previsto</DialogTitle>
          <DialogDescription>
            Pegá el previsto de Depósito (una salida por línea). Cada carga toma una sola unidad y,
            si no indicás horario, la ventana de salida por defecto es{" "}
            {DEFAULT_DEPARTURE_WINDOW.start}–{DEFAULT_DEPARTURE_WINDOW.end}.
          </DialogDescription>
        </DialogHeader>

        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={EXAMPLE}
          className="min-h-32 font-mono text-xs"
          aria-label="Previsto pegado"
        />

        {rows.length > 0 && (
          <div className="scroll-slim max-h-56 space-y-1.5 overflow-y-auto rounded-md border border-border p-2">
            {rows.map((row, i) => (
              <div
                key={i}
                className={`grid grid-cols-[auto_minmax(0,1fr)] items-start gap-2 rounded border px-2 py-1.5 text-[11px] ${
                  row.ok ? "border-border" : "border-st-riesgo/50 bg-st-riesgo/10"
                }`}
              >
                {row.ok ? (
                  <Check className="mt-0.5 size-3.5 shrink-0 text-st-disponible" />
                ) : (
                  <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-st-riesgo" />
                )}
                {row.ok && row.request ? (
                  <p className="min-w-0">
                    <span className="font-semibold">
                      Ezeiza → {locationName(row.request.destinationId)}
                    </span>{" "}
                    <span className="text-muted-foreground">
                      · salida {row.request.suggestedDepartureTime}–{row.request.windowEndTime} ·
                      objetivo {fmtStamp(row.request.targetUnloadAt)} · {row.request.cargo} · 1
                      unidad
                    </span>
                  </p>
                ) : (
                  <p className="min-w-0 truncate text-muted-foreground">
                    {row.error}: “{row.raw}”
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        <DialogFooter className="gap-2 sm:justify-between">
          <p className="text-[11px] text-muted-foreground">
            {valid.length} salida{valid.length === 1 ? "" : "s"} lista
            {valid.length === 1 ? "" : "s"} para procesar
          </p>
          <span className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => apply("append")}
              disabled={valid.length === 0}
            >
              Agregar al día
            </Button>
            <Button size="sm" onClick={() => apply("replace")} disabled={valid.length === 0}>
              Reemplazar el día
            </Button>
          </span>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
