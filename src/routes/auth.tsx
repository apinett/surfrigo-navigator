import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Loader2, LogIn, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Toaster } from "@/components/ui/sonner";
import { lovable } from "@/integrations/lovable";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Acceso | Surfrigo Control Tower" },
      {
        name: "description",
        content:
          "Acceso al sistema interno de gestión de transporte Surfrigo: torre de control, planificación diaria y seguimiento.",
      },
      { property: "og:title", content: "Acceso | Surfrigo Control Tower" },
      {
        property: "og:description",
        content: "Ingreso restringido al personal operativo de Surfrigo.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

/** Devuelve una ruta interna segura para volver después de autenticarse. */
function safeNext(raw: string | null): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return "/";
  return raw;
}

function AuthPage() {
  const navigate = useNavigate();
  const [busy, setBusy] = useState<null | "login" | "signup" | "reset" | "google">(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [next, setNext] = useState("/");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setNext(safeNext(params.get("next")));
  }, []);

  useEffect(() => {
    let active = true;
    void supabase.auth.getSession().then(({ data }) => {
      if (active && data.session) void navigate({ to: next });
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) void navigate({ to: next });
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, [navigate, next]);

  async function signIn(e: React.FormEvent) {
    e.preventDefault();
    setBusy("login");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(null);
    if (error) {
      toast.error("No pudimos iniciar sesión", { description: error.message });
      return;
    }
    toast.success("Sesión iniciada");
    void navigate({ to: next });
  }

  async function signUp(e: React.FormEvent) {
    e.preventDefault();
    setBusy("signup");
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${window.location.origin}${next}`,
      },
    });
    setBusy(null);
    if (error) {
      toast.error("No pudimos crear la cuenta", { description: error.message });
      return;
    }
    toast.success("Cuenta creada", {
      description:
        "Un administrador debe asignarte un rol antes de que puedas operar el sistema.",
    });
  }

  async function resetPassword() {
    if (!email) {
      toast.error("Ingresá tu email para recuperar la contraseña");
      return;
    }
    setBusy("reset");
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth`,
    });
    setBusy(null);
    if (error) {
      toast.error("No pudimos enviar el correo", { description: error.message });
      return;
    }
    toast.success("Te enviamos un correo para restablecer la contraseña");
  }

  async function google() {
    setBusy("google");
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      setBusy(null);
      toast.error("No pudimos continuar con Google", {
        description: result.error.message ?? "Intentá nuevamente.",
      });
      return;
    }
    if (result.redirected) return;
    void navigate({ to: next });
  }

  return (
    <div className="grid min-h-screen bg-background text-foreground lg:grid-cols-[1.1fr_1fr]">
      <section className="hidden flex-col justify-between border-r border-border bg-sidebar p-10 lg:flex">
        <div className="flex items-center gap-2.5">
          <span className="grid size-9 place-items-center rounded-md bg-primary font-mono text-sm font-bold text-primary-foreground">
            SC
          </span>
          <div className="leading-tight">
            <p className="text-sm font-semibold tracking-tight">Surfrigo</p>
            <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
              Control Tower
            </p>
          </div>
        </div>
        <div className="max-w-md space-y-4">
          <h1 className="text-3xl font-semibold tracking-tight">
            Torre de control de la operación de gran porte
          </h1>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Planificación diaria, previsto de Depósito, asignación explicable, retornos desde Chile
            y seguimiento de fronteras en una sola pantalla.
          </p>
          <p className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" />
            Acceso restringido. Cada acción operativa queda registrada con autor y fecha.
          </p>
        </div>
        <p className="text-[10px] text-muted-foreground">
          Uso interno. No compartas tus credenciales.
        </p>
      </section>

      <section className="flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="mb-6 lg:hidden">
            <p className="text-lg font-semibold tracking-tight">Surfrigo Control Tower</p>
            <p className="text-xs text-muted-foreground">Acceso al sistema interno</p>
          </div>

          <Tabs defaultValue="login">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Ingresar</TabsTrigger>
              <TabsTrigger value="signup">Crear cuenta</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="mt-5">
              <form className="space-y-4" onSubmit={signIn}>
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email corporativo</Label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nombre@surfrigo.com"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="password">Contraseña</Label>
                  <Input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={busy !== null}>
                  {busy === "login" ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <LogIn className="size-4" />
                  )}
                  Ingresar
                </Button>
                <button
                  type="button"
                  onClick={() => void resetPassword()}
                  className="w-full text-xs text-muted-foreground underline-offset-2 hover:underline"
                  disabled={busy !== null}
                >
                  Olvidé mi contraseña
                </button>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="mt-5">
              <form className="space-y-4" onSubmit={signUp}>
                <div className="space-y-1.5">
                  <Label htmlFor="full-name">Nombre y apellido</Label>
                  <Input
                    id="full-name"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Analista de transporte"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="signup-email">Email corporativo</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="signup-password">Contraseña</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    autoComplete="new-password"
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={busy !== null}>
                  {busy === "signup" && <Loader2 className="size-4 animate-spin" />}
                  Crear cuenta
                </Button>
                <p className="text-[11px] leading-relaxed text-muted-foreground">
                  La cuenta queda sin permisos hasta que un administrador asigne un rol
                  (analista, seguimiento, taller o consulta).
                </p>
              </form>
            </TabsContent>
          </Tabs>

          <div className="my-5 flex items-center gap-3">
            <span className="h-px flex-1 bg-border" />
            <span className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">o</span>
            <span className="h-px flex-1 bg-border" />
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => void google()}
            disabled={busy !== null}
          >
            {busy === "google" && <Loader2 className="size-4 animate-spin" />}
            Continuar con Google
          </Button>
        </div>
      </section>
      <Toaster position="bottom-right" />
    </div>
  );
}
