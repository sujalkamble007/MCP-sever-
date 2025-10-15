import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { youtubeResearch, youtubeSchema } from "./tools/youtube.js";
import { webSearch, webSearchSchema } from "./tools/webSearch.js";
import { wikipediaSearch, wikipediaSchema } from "./tools/wikipedia.js";
import { documentRag, ragSchema } from "./tools/documentRag.js";
import { synthesizeResults, synthSchema } from "./tools/synthesizer.js";
import { httpJson } from "./utils/http.js";
import { WebSearchItem, YouTubeTranscriptItem, WikiSummary, RagHit, ToolTextBlock } from "./utils/types.js";
import { formatWebResults, formatYouTubeTranscript, formatWikiSummary, formatRagHits } from "./utils/format.js";
import { researchPlanner } from "./agents/researchPlanner.js";


const NWS_API_BASE = "https://api.weather.gov";
const USER_AGENT = "weather-app/1.0";

// Create server instance
const server = new McpServer({
  name: "Planner",
  version: "1.0.0",
  capabilities: {
    resources: {},
    tools: {
      youtube: (youtubeSchema as any).shape ?? { topic: z.string().optional(), url: z.string().url().optional(), maxVideos: z.number().optional() },
      webSearch: webSearchSchema.shape,
    },
  },
});


// research_planner
server.tool(
    "research_planner",
    "Orchestrates sub-agents based on intent",
    { query: z.string().min(3), sources: z.array(z.enum(["web","youtube","wikipedia","rag"])).optional() },
    async ({ query, sources }, _extra) => {
      const res = await researchPlanner({ query, sources });
      return { content: [{ type: "text", text: JSON.stringify(res, null, 2) }] };
    }
  );
  
  //done 
  // web_search
  server.tool("web_search","Web search using Tavily", webSearchSchema.shape as any, async (args:any, _extra)=>{
    const parsed = webSearchSchema.parse(args);
    const r = await webSearch(parsed);
    return { content: [{ type: "text", text: JSON.stringify(r, null, 2) }] };
  });
  
  // youtube_research
  server.tool("youtube_research","Searches and summarizes YouTube videos by topic", ((youtubeSchema as any).shape ?? { topic: z.string().optional(), url: z.string().url().optional(), maxVideos: z.number().optional() }) as any, async (args:any, _extra)=>{
    const parsed = youtubeSchema.parse(args);
    const r = await youtubeResearch(parsed);
    
    if ((r as any).error) {
      return { content: [{ type: "text", text: `Error: ${(r as any).error}` }] };
    }
    
    const videos = (r as any).videos || [];
    if (videos.length === 0) {
      return { content: [{ type: "text", text: "No videos found for the given topic." }] };
    }
    
    const formattedResults = videos.map((video: any, index: number) => [
      `#${index + 1} ${video.title}`,
      `Channel: ${video.channelTitle}`,
      `Published: ${new Date(video.publishedAt).toLocaleDateString()}`,
      `URL: ${video.url}`,
      // `Transcript Length: ${video.transcriptLength} characters`,
      `Summary:`,
      video.summary,
      `---`
    ].join('\n')).join('\n\n');
    
    return { content: [{ type: "text", text: formattedResults }] };
  });
  

  //done
  // wikipedia_search
server.tool("wikipedia_search","Extracts summaries from Wikipedia pages", wikipediaSchema.shape as any, async (args:any, _extra)=>{
    const parsed = wikipediaSchema.parse(args);
    const r = await wikipediaSearch(parsed);
    return { content: [{ type: "text", text: JSON.stringify(r, null, 2) }] };
  });
  
  // // document_rag
  // server.tool("document_rag","Retrieves content from document vector DB", ragSchema.shape as any, async (args:any, _extra)=>{
  //   const parsed = ragSchema.parse(args);
  //   const r = await documentRag(parsed);
  //   return { content: [{ type: "text", text: JSON.stringify(r, null, 2) }] };
  // });
  
  // // synthesize_results
  // server.tool("synthesize_results","Combines outputs into a final answer", synthSchema.shape as any, async (args:any, _extra)=>{
  //   const parsed = synthSchema.parse(args);
  //   const r = await synthesizeResults(parsed);
  //   return { content: [{ type: "text", text: JSON.stringify(r, null, 2) }] };
  // });



  async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Planner MCP Server running on stdio");
  }
  
  main().catch((error) => {
    console.error("Fatal error in main():", error);
    process.exit(1);
  });

