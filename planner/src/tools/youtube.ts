import { z } from "zod";
import { YoutubeTranscript } from "youtube-transcript";
import type { YouTubeTranscriptItem } from "../utils/types.js";

export const youtubeSchema = z.object({
  topic: z.string().min(3).describe("Topic to search for YouTube videos"),
  maxVideos: z.number().min(1).max(5).default(3).describe("Maximum number of videos to analyze")
});

interface YouTubeSearchResult {
  id: { videoId: string };
  snippet: {
    title: string;
    description: string;
    channelTitle: string;
    publishedAt: string;
  };
}

interface YouTubeVideoSummary {
  videoId: string;
  title: string;
  channelTitle: string;
  publishedAt: string;
  url: string;
  summary: string;
  transcriptLength: number;
}

export async function youtubeResearch({ topic, maxVideos }: z.infer<typeof youtubeSchema>) {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    return { 
      videos: [], 
      error: "Missing YOUTUBE_API_KEY. Please set it in your environment variables." 
    };
  }

  try {
    // Search for videos by topic
    const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&q=${encodeURIComponent(topic)}&maxResults=${maxVideos}&key=${apiKey}`;
    const searchResponse = await fetch(searchUrl);
    
    if (!searchResponse.ok) {
      throw new Error(`YouTube API error: ${searchResponse.status} ${searchResponse.statusText}`);
    }
    
    const searchData = await searchResponse.json();
    const videos: YouTubeSearchResult[] = searchData.items || [];
    
    if (videos.length === 0) {
      return { videos: [], error: `No videos found for topic: "${topic}"` };
    }

    // Process each video
    const videoSummaries: YouTubeVideoSummary[] = [];
    
    for (const video of videos) {
      const videoId = video.id.videoId;
      const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
      
      try {
        // Extract transcript
        const transcript = await YoutubeTranscript.fetchTranscript(videoUrl) as YouTubeTranscriptItem[];
        
        if (!transcript || transcript.length === 0) {
          videoSummaries.push({
            videoId,
            title: video.snippet.title,
            channelTitle: video.snippet.channelTitle,
            publishedAt: video.snippet.publishedAt,
            url: videoUrl,
            summary: "No transcript available for this video.",
            transcriptLength: 0
          });
          continue;
        }

        // Create summary from transcript
        const fullText = transcript.map(t => t.text).join(" ");
        const summary = createSummary(fullText, video.snippet.title);
        
        videoSummaries.push({
          videoId,
          title: video.snippet.title,
          channelTitle: video.snippet.channelTitle,
          publishedAt: video.snippet.publishedAt,
          url: videoUrl,
          summary,
          transcriptLength: fullText.length
        });
        
      } catch (transcriptError: any) {
        videoSummaries.push({
          videoId,
          title: video.snippet.title,
          channelTitle: video.snippet.channelTitle,
          publishedAt: video.snippet.publishedAt,
          url: videoUrl,
          summary: `Failed to extract transcript: ${transcriptError?.message || "Unknown error"}`,
          transcriptLength: 0
        });
      }
    }

    return { videos: videoSummaries };
    
  } catch (err: any) {
    return { 
      videos: [], 
      error: `Failed to search YouTube: ${err?.message || String(err)}` 
    };
  }
}

function createSummary(text: string, title: string): string {
  // Simple extractive summarization - take first few sentences and key phrases
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
  const words = text.toLowerCase().split(/\s+/);
  
  // Count word frequency (excluding common words)
  const commonWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them']);
  
  const wordFreq: Record<string, number> = {};
  words.forEach(word => {
    const cleanWord = word.replace(/[^\w]/g, '');
    if (cleanWord.length > 3 && !commonWords.has(cleanWord)) {
      wordFreq[cleanWord] = (wordFreq[cleanWord] || 0) + 1;
    }
  });
  
  // Get top keywords
  const topKeywords = Object.entries(wordFreq)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([word]) => word);
  
  // Take first 2-3 sentences as summary
  const summarySentences = sentences.slice(0, 3);
  const summary = summarySentences.join('. ').trim();
  
  // Add keywords if summary is too short
  if (summary.length < 100 && topKeywords.length > 0) {
    return `${summary} Key topics: ${topKeywords.join(', ')}.`;
  }
  
  return summary || "Summary not available.";
}
