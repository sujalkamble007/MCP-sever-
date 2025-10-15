import { z } from "zod";

export const wikipediaSchema = z.object({ title: z.string().min(2) });

export async function wikipediaSearch({ title }: { title: string }) {
  const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
  const res = await fetch(url, { headers: { "accept": "application/json" } });
  if (!res.ok) {
    return { title, extract: `Failed to fetch Wikipedia summary: HTTP ${res.status}`, url: undefined };
  }
  const data = await res.json() as any;
  return { title: data.title, extract: data.extract, url: data.content_urls?.desktop?.page };
}
