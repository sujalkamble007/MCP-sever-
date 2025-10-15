const DEFAULT_UA = "planner/1.0";

export async function httpJson<T>(url: string, init: RequestInit = {}): Promise<T | null> {
  const headers = {
    "User-Agent": DEFAULT_UA,
    Accept: "application/json",
    ...(init.headers || {}),
  } as Record<string, string>;

  try {
    const res = await fetch(url, { ...init, headers });
    if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
    return (await res.json()) as T;
  } catch (err) {
    console.error("HTTP JSON error:", err);
    return null;
  }
}