import { Sparkles } from "lucide-react";

export function Placeholder({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="p-4 lg:p-6">
      <div className="panel mx-auto max-w-2xl p-6">
        <span className="inline-flex items-center gap-2 rounded border border-border bg-surface-strong px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          <Sparkles className="size-3" /> Módulo futuro
        </span>
        <h2 className="mt-3 text-lg font-semibold tracking-tight">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          La navegación ya está preparada. Cuando se conecte la base de datos, este módulo mostrará:
        </p>
        <ul className="mt-4 space-y-2">
          {items.map((item) => (
            <li key={item} className="flex gap-2.5 text-sm text-muted-foreground">
              <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
