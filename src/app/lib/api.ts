export const API_BASE_URL = "";
export async function apiRequest<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const r = await fetch(path, {
    ...init,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
  });
  if (!r.ok) throw new Error(`API request failed (${r.status})`);
  return r.json() as Promise<T>;
}
