import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { LOCATIONS, locationById } from "@/domain/catalog";
import { itineraryDestination, validateItinerary } from "@/domain/route-validation";
import type { DepositRequest } from "@/domain/types";

const DESTINATIONS = LOCATIONS.filter((l) => l.kind !== "cd" && l.id !== "taller");


export function RequestEditDialog({
  request,
  onClose,
  onSave,
  onDelete,
}: {
  request: DepositRequest | null;
  onClose: () => void;
  onSave: (request: DepositRequest) => void;
  onDelete: (requestId: string) => void;
}) {
  const [draft, setDraft] = useState<DepositRequest | null>(request);
  const [routeText, setRouteText] = useState(request?.routeLabel ?? "");

  useEffect(() => {
    setDraft(request);
    setRouteText(request?.routeLabel ?? "");
  }, [request]);

  const validation = useMemo(
    () => (routeText.trim() ? validateItinerary(routeText) : null),
    [routeText],
  );

  if (!draft) return null;
  const targetDate = draft.targetUnloadAt.slice(0, 10);
  const targetTime = draft.targetUnloadAt.slice(11, 16);
  const set = (patch: Partial<DepositRequest>) => setDraft({ ...draft, ...patch });

  const applyItinerary = () => {
    if (!validation?.ok) return;
    const dest = itineraryDestination(validation.stops);
    set({
      routeLabel: validation.label,
      routeStops: validation.stops,
      routeExact: validation.exact,
      ...(dest
        ? {
            destinationId: dest.locationId,
            km: locationById(dest.locationId)?.kmFromEzeiza ?? draft.km,
          }
        : {}),
    });
  };


  return (
    <Dialog open={!!request} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Editar salida</DialogTitle>
          <DialogDescription>
            Ajustá destino, ventana de salida, objetivo de descarga y carga. Cada salida toma una
            sola unidad.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3">
          <Field label="Destino">
            <Select
              value={draft.destinationId}
              onValueChange={(v) =>
                set({ destinationId: v, km: locationById(v)?.kmFromEzeiza ?? draft.km })
              }
            >
              <SelectTrigger className="h-9 text-xs" aria-label="Destino">
                <SelectValue placeholder="Destino" />
              </SelectTrigger>
              <SelectContent>
                {DESTINATIONS.map((l) => (
                  <SelectItem key={l.id} value={l.id} className="text-xs">
                    {l.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Salida desde">
              <Input
                type="time"
                value={draft.suggestedDepartureTime}
                onChange={(e) => set({ suggestedDepartureTime: e.target.value })}
                className="h-9 text-xs"
              />
            </Field>
            <Field label="Salida hasta">
              <Input
                type="time"
                value={draft.windowEndTime}
                onChange={(e) => set({ windowEndTime: e.target.value })}
                className="h-9 text-xs"
              />
            </Field>
            <Field label="Fecha objetivo">
              <Input
                type="date"
                value={targetDate}
                onChange={(e) => set({ targetUnloadAt: `${e.target.value}T${targetTime}:00` })}
                className="h-9 text-xs"
              />
            </Field>
            <Field label="Hora objetivo">
              <Input
                type="time"
                value={targetTime}
                onChange={(e) => set({ targetUnloadAt: `${targetDate}T${e.target.value}:00` })}
                className="h-9 text-xs"
              />
            </Field>
          </div>

          <Field label="Carga">
            <Input
              value={draft.cargo}
              onChange={(e) => set({ cargo: e.target.value })}
              className="h-9 text-xs"
            />
          </Field>

          <Field label="Distancia (km)">
            <Input
              type="number"
              min={0}
              value={draft.km}
              onChange={(e) => set({ km: Number(e.target.value) })}
              className="h-9 text-xs"
            />
          </Field>

          <Field label="Notas">
            <Textarea
              value={draft.notes ?? ""}
              onChange={(e) => set({ notes: e.target.value })}
              className="min-h-16 text-xs"
            />
          </Field>
        </div>

        <DialogFooter className="gap-2 sm:justify-between">
          <Button size="sm" variant="ghost" onClick={() => onDelete(draft.id)}>
            Eliminar salida
          </Button>
          <span className="flex gap-2">
            <Button size="sm" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button size="sm" onClick={() => onSave({ ...draft, unitsRequired: 1 })}>
              Guardar cambios
            </Button>
          </span>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1">
      <Label className="text-[10.5px] uppercase tracking-[0.08em] text-muted-foreground">
        {label}
      </Label>
      {children}
    </div>
  );
}
