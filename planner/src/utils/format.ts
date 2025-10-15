import { WebSearchItem, YouTubeTranscriptItem, WikiSummary, RagHit } from "./types.js";

export function formatWebResults(items: WebSearchItem[]): string {
  if (!items?.length) return "No web results.";
  return items.map((i, idx) => [
    `#${idx + 1} ${i.title || "(no title)"}`,
    i.url ? `URL: ${i.url}` : undefined,
    i.score != null ? `Score: ${i.score.toFixed(3)}` : undefined,
    i.content || "",
    "---",
  ].filter(Boolean).join("\n")).join("\n");
}

export function formatYouTubeTranscript(tr: YouTubeTranscriptItem[], maxChars = 2000): string {
  if (!tr?.length) return "No transcript available for this video.";
  const text = tr.map(t => t.text).join(" ");
  return text.length > maxChars ? text.slice(0, maxChars) + "..." : text;
}

export function formatWikiSummary(s: WikiSummary): string {
  const lines = [
    `Title: ${s.title}`,
    s.url ? `URL: ${s.url}` : undefined,
    "",
    s.extract || "No summary.",
  ].filter(Boolean);
  return lines.join("\n");
}

export function formatRagHits(hits: RagHit[]): string {
  if (!hits?.length) return "No matching documents.";
  return hits.map((h, i) => [
    `#${i + 1} (${h.score.toFixed(3)}) id=${h.id}`,
    h.text,
    "---",
  ].join("\n")).join("\n");
}