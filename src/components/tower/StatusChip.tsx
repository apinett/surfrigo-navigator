import { STATUS_META, STATUS_ORDER } from "@/domain/catalog";
import type { OperationStatus } from "@/domain/types";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export function StatusChip({
  status,
  className,
  withTooltip = true,
}: {
  status: OperationStatus;
  className?: string;
  withTooltip?: boolean;
}) {
  const meta = STATUS_META[status];
  const chip = (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
        meta.chip,
        className,
      )}
    >
      <span className={cn("size-1.5 rounded-full", meta.dot)} />
      {meta.label}
    </span>
  );
  if (!withTooltip) return chip;
  return (
    <Tooltip>
      <TooltipTrigger asChild>{chip}</TooltipTrigger>
      <TooltipContent className="max-w-56">{meta.description}</TooltipContent>
    </Tooltip>
  );
}

export function StatusLegend({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-wrap items-center gap-x-3 gap-y-1.5", className)}>
      <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        Leyenda
      </span>
      {STATUS_ORDER.map((status) => (
        <Tooltip key={status}>
          <TooltipTrigger asChild>
            <span className="flex cursor-help items-center gap-1.5 text-[11px] text-muted-foreground">
              <span className={cn("size-2 rounded-sm", STATUS_META[status].dot)} />
              {STATUS_META[status].label}
            </span>
          </TooltipTrigger>
          <TooltipContent className="max-w-56">{STATUS_META[status].description}</TooltipContent>
        </Tooltip>
      ))}
    </div>
  );
}
