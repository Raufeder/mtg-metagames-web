const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

if (!BASE_URL) {
  throw new Error("NEXT_PUBLIC_API_URL is not set");
}

async function authHeaders(): Promise<Record<string, string>> {
  // Lazy import so the Supabase client is never instantiated during server-side
  // build of pages that only use get() — avoids "supabaseUrl is required" at build time
  if (typeof window === "undefined") return {};
  const { supabase } = await import("@/lib/supabase/client");
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function get<T = unknown>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`);

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`${res.status} ${res.statusText}: ${text}`);
  }

  return res.json() as Promise<T>;
}

export async function post<T = unknown>(path: string, body: object): Promise<T> {
  const headers = await authHeaders();
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`${res.status} ${res.statusText}: ${text}`);
  }

  return res.json() as Promise<T>;
}

export async function patch<T = unknown>(path: string, body: object): Promise<T> {
  const headers = await authHeaders();
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`${res.status} ${res.statusText}: ${text}`);
  }

  return res.json() as Promise<T>;
}

export async function del(path: string): Promise<void> {
  const headers = await authHeaders();
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "DELETE",
    headers,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`${res.status} ${res.statusText}: ${text}`);
  }
}
