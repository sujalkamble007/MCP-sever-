import { z } from "zod";

export const synthSchema = z.object({
  items: z.array(z.object({
    source: z.string(),
    text: z.string(),
    score: z.number().optional()
  })),
  maxWords: z.number().min(50).max(1000).default(300)
});

export function synthesizeResults({ items, maxWords }:{
  items: {source:string;text:string;score?:number}[];
  maxWords:number;
}) {
  const sorted = [...items].sort((a,b)=>(b.score??0)-(a.score??0));
  const merged = sorted.map(i => `From ${i.source}:\n${i.text}`).join("\n\n");
  const words = merged.split(/\s+/);
  const clipped = words.slice(0, maxWords).join(" ");
  return { summary: clipped, sources: sorted.map(i=>i.source) };
}
