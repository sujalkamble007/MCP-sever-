import { webSearch } from "../tools/webSearch.js";
import { youtubeResearch } from "../tools/youtube.js";
import { wikipediaSearch } from "../tools/wikipedia.js";
import { synthesizeResults } from "../tools/synthesizer.js";

export async function researchPlanner(intent: { query: string; sources?: Array<"web"|"wikipedia"|"youtube"> }) {
  const outputs: { source: string; text: string; score?: number }[] = [];

  const q = intent.query.toLowerCase();
  const wantsDefinition = /(what is|overview|summary|define|definition|wikipedia)/.test(q);
  const wantsVideo = /(youtube|video|watch|playlist|tutorial|walkthrough)/.test(q);
  const wantsBroad = /(news|latest|trends|compare|top|best|list|review)/.test(q);

  const selected: Array<"web"|"wikipedia"|"youtube"> = [];
  if (wantsDefinition) selected.push("wikipedia");
  if (wantsVideo) selected.push("youtube");
  if (wantsBroad) selected.push("web");
  if (selected.length === 0) selected.push("web");

  // Execute chosen tools in parallel
  await Promise.all(selected.map(async (s) => {
    if (s === "web") {
      const web = await webSearch({ query: intent.query, maxResults: 3 } as any);
      web.results?.forEach((x: any) => {
        outputs.push({ source: `web:${x.url ?? "result"}`, text: x.content || x.title || "", score: x.score });
      });
      return;
    }
    if (s === "wikipedia") {
      const r = await wikipediaSearch({ title: intent.query });
      if (r?.extract) outputs.push({ source: `wiki:${r.title}`, text: r.extract, score: 0.8 });
      return;
    }
    if (s === "youtube") {
      const r = await youtubeResearch({ topic: intent.query, maxVideos: 2 } as any);
      const videos = (r as any)?.videos ?? [];
      videos.forEach((v: any) => {
        const text = [
          `Title: ${v.title}`,
          v.url ? `URL: ${v.url}` : undefined,
          v.summary ? `Summary: ${v.summary}` : undefined,
        ].filter(Boolean).join("\n");
        outputs.push({ source: `youtube:${v.videoId ?? "video"}`, text, score: 0.75 });
      });
      return;
    }
  }));

  if (outputs.length === 0) {
    return { summary: "No relevant information found.", sources: [] };
  }

  const final = synthesizeResults({ items: outputs, maxWords: 350 });
  return final;
}
