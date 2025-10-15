import { z } from "zod";

export const ragSchema = z.object({
  query: z.string().min(3),
  topK: z.number().min(1).max(10).default(3)
});

const memory: Array<{id:string, text:string, embedding:number[]}> = [];

async function embed(text: string) {
  // Placeholder embedding (hash-based) to avoid OpenAI dep for now
  const arr = new Array(128).fill(0);
  for (let i = 0; i < text.length; i++) {
    arr[i % arr.length] += text.charCodeAt(i) / 255;
  }
  return arr as number[];
}

function cosine(a:number[], b:number[]) {
  let dot=0, na=0, nb=0;
  for (let i=0;i<a.length;i++){ dot+=a[i]*b[i]; na+=a[i]*a[i]; nb+=b[i]*b[i]; }
  return dot/(Math.sqrt(na)*Math.sqrt(nb));
}

export async function indexDocument(id: string, text: string) {
  memory.push({ id, text, embedding: await embed(text) });
}

export async function documentRag({ query, topK }:{query:string; topK:number}) {
  const q = await embed(query);
  const scored = memory.map(d => ({...d, score: cosine(q, d.embedding)}))
                       .sort((a,b)=>b.score-a.score)
                       .slice(0, topK);
  return { hits: scored.map(s => ({ id: s.id, text: s.text, score: s.score })) };
}