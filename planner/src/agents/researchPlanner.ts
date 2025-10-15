import { webSearch } from "../tools/webSearch.js";
import { youtubeResearch } from "../tools/youtube.js";
import { wikipediaSearch } from "../tools/wikipedia.js";
import { documentRag } from "../tools/documentRag.js";
import { synthesizeResults } from "../tools/synthesizer.js";

export async function researchPlanner(intent: {
  query: string;
  sources?: Array<"web"|"youtube"|"wikipedia"|"rag">;
}) {
  const sources = intent.sources ?? ["web","wikipedia"];
  const outputs: {source:string;text:string;score?:number}[] = [];

  if (sources.includes("web")) {
    const r = await webSearch({ query: intent.query, maxResults: 3 } as any);
    r.results?.forEach((x:any)=>outputs.push({ source: `web:${x.url}`, text: x.content || x.title, score: x.score }));
  }
  if (sources.includes("wikipedia")) {
    const r = await wikipediaSearch({ title: intent.query });
    outputs.push({ source: `wiki:${r.title}`, text: r.extract, score: 0.7 });
  }
  // optionally include youtube/rag based on heuristics…

  const final = synthesizeResults({ items: outputs, maxWords: 300 });
  return final;
}
