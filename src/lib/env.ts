/**
 * Validación centralizada de variables de entorno del navegador.
 * Nunca leer aquí claves de servidor (service-role) ni secretos.
 */
type BrowserEnv = {
  supabaseUrl: string;
  supabasePublishableKey: string;
  projectId: string | undefined;
};

let cached: BrowserEnv | undefined;
let lastError: string | undefined;

function read(): BrowserEnv | undefined {
  if (cached) return cached;
  const url = import.meta.env['VITE_SUPABASE_URL'] as string | undefined;
  const key = (import.meta.env['VITE_SUPABASE_PUBLISHABLE_KEY'] ??
    import.meta.env['VITE_SUPABASE_ANON_KEY']) as string | undefined;

  const missing: string[] = [];
  if (!url) missing.push('VITE_SUPABASE_URL');
  if (!key) missing.push('VITE_SUPABASE_PUBLISHABLE_KEY');
  if (missing.length) {
    lastError = `Faltan variables de entorno: ${missing.join(', ')}`;
    return undefined;
  }

  cached = {
    supabaseUrl: url!,
    supabasePublishableKey: key!,
    projectId: import.meta.env['VITE_SUPABASE_PROJECT_ID'] as string | undefined,
  };
  return cached;
}

/** Entorno válido o `undefined` cuando falta configuración. */
export function browserEnv(): BrowserEnv | undefined {
  return read();
}

/** Mensaje accionable para mostrar en pantalla si falta configuración. */
export function browserEnvError(): string | undefined {
  read();
  return cached ? undefined : lastError;
}

export const isBackendConfigured = () => read() !== undefined;
