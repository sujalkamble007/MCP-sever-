import { z } from "zod";
import Groq from "groq-sdk";

export const youtubeSchema = z
  .object({
    // Provide either a topic (to search) or a direct URL (single video)
    topic: z.string().min(3).optional().describe("Search topic"),
    url: z.string().url().optional().describe("Direct YouTube video URL"),
    maxVideos: z.number().min(1).max(5).default(3).describe("Videos to analyze for a topic search")
  })
  .refine(v => v.topic || v.url, { message: "Provide either topic or url" });

export async function youtubeResearch(input: z.infer<typeof youtubeSchema>) {
  // URL mode: summarize a single video by metadata → Groq
  if (input.url) {
    try {
      const videoId = new URL(input.url).searchParams.get("v") || "";
      const meta = await fetchBasicYouTubeMetadata(input.url);
      const summary = await summarizeWithGroqFromMetadata(meta.title, meta.description, input.url);
      return {
        videos: [
          {
            videoId,
            title: meta.title || "(title unknown)",
            channelTitle: meta.channelTitle || "(channel unknown)",
            publishedAt: meta.publishedAt || "",
            url: input.url,
            summary,
            transcriptLength: 0
          }
        ]
      };
    } catch (err: any) {
      return { videos: [], error: `Failed to summarize via Groq: ${err?.message || String(err)}` };
    }
  }

  // Topic mode: search videos, then summarize each by metadata → Groq
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) return { videos: [], error: "Missing YOUTUBE_API_KEY. Please set it." };

  const topic = input.topic as string;
  const maxVideos = input.maxVideos ?? 3;
  try {
    const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&q=${encodeURIComponent(
      topic
    )}&maxResults=${maxVideos}&key=${apiKey}`;
    const res = await fetch(searchUrl);
    if (!res.ok) throw new Error(`YouTube API error: ${res.status} ${res.statusText}`);

    const data = await res.json();
    const items: any[] = data.items || [];
    if (items.length === 0) return { videos: [], error: `No videos found for topic: "${topic}"` };

    const results = [] as Array<{
      videoId: string;
      title: string;
      channelTitle: string;
      publishedAt: string;
      url: string;
      summary: string;
      transcriptLength: number;
    }>;

    for (const v of items) {
      const videoId = v.id?.videoId as string;
      const url = `https://www.youtube.com/watch?v=${videoId}`;
      const title = v.snippet?.title || "";
      const channelTitle = v.snippet?.channelTitle || "";
      const publishedAt = v.snippet?.publishedAt || "";
      const description = v.snippet?.description || "";

      const summary = await summarizeWithGroqFromMetadata(title, description, url);
      results.push({
        videoId,
        title,
        channelTitle,
        publishedAt,
        url,
        summary,
        transcriptLength: 0
      });
    }

    return { videos: results };
  } catch (err: any) {
    return { videos: [], error: `Failed to search YouTube: ${err?.message || String(err)}` };
  }
}

async function fetchBasicYouTubeMetadata(url: string): Promise<{ title: string; channelTitle: string; publishedAt: string; description: string; }>{
  const apiKey = process.env.YOUTUBE_API_KEY;
  const videoId = new URL(url).searchParams.get("v");

  if (apiKey && videoId) {
    const apiUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${apiKey}`;
    const res = await fetch(apiUrl);
    if (res.ok) {
      const data = await res.json();
      const item = data.items?.[0]?.snippet || {};
      return {
        title: item.title || "",
        channelTitle: item.channelTitle || "",
        publishedAt: item.publishedAt || "",
        description: item.description || ""
      };
    }
  }

  const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
  try {
    const o = await fetch(oembedUrl);
    if (o.ok) {
      const data = await o.json();
      return {
        title: data.title || "",
        channelTitle: data.author_name || "",
        publishedAt: "",
        description: ""
      };
    }
  } catch {}

  return { title: "", channelTitle: "", publishedAt: "", description: "" };
}

async function summarizeWithGroqFromMetadata(title: string, description: string, url: string): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return "Missing GROQ_API_KEY. Please set it.";

  const groq = new Groq({ apiKey });
  const model = "llama-3.3-70b-versatile";

  const prompt = [
    `Summarize this YouTube video. If the description is short, infer likely key points.`,
    `Return a concise 6-10 bullet summary with actionable insights.`,
    ``,
    `Title: ${title || "(unknown)"}`,
    `URL: ${url}`,
    `Description: ${description || "(no description provided)"}`
  ].join("\n");

  const completion = await groq.chat.completions.create({
    model,
    messages: [
      { role: "system", content: "You are an expert YouTube content summarizer." },
      { role: "user", content: prompt }
    ],
    temperature: 0.3,
    max_tokens: 600,
  });

  const out = completion.choices?.[0]?.message?.content?.trim();
  return out || "Summary not available.";
}
