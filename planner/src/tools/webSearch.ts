import axios from "axios";
import { z } from "zod";
import type { WebSearchItem } from "../utils/types.js";

export const webSearchSchema = z.object({
  query: z.string().min(3),
  maxResults: z.number().min(1).max(10).default(5)
});

export async function webSearch({ query, maxResults }: z.infer<typeof webSearchSchema>) {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) {
    return { results: [] as WebSearchItem[], error: "Missing TAVILY_API_KEY" } as const;
  }

  try {
    const { data } = await axios.post("https://api.tavily.com/search", {
      api_key: apiKey,
      query,
      max_results: maxResults
    });

    const results: WebSearchItem[] = (data?.results || []).map((r: any) => ({
      title: r.title,
      url: r.url,
      content: r.content,
      score: typeof r.score === "number" ? r.score : undefined,
    }));

    return { results } as const;
  } catch (err: any) {
    return { results: [] as WebSearchItem[], error: err?.message || "Search failed" } as const;
  }
}
