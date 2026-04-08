const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

if (!BASE_URL) {
  throw new Error("NEXT_PUBLIC_API_URL is not set");
}

// In development, route through the local Next.js proxy to avoid CORS.
// In production, call the Railway API directly.
function resolveUrl(path: string): string {
  if (process.env.NODE_ENV === "development") {
    return `/api/proxy${path}`;
  }
  return `${BASE_URL}${path}`;
}

export async function get<T = unknown>(path: string): Promise<T> {
  const res = await fetch(resolveUrl(path));

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`${res.status} ${res.statusText}: ${text}`);
  }

  return res.json() as Promise<T>;
}

export async function post<T = unknown>(path: string, body: object): Promise<T> {
  const res = await fetch(resolveUrl(path), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`${res.status} ${res.statusText}: ${text}`);
  }

  return res.json() as Promise<T>;
}
