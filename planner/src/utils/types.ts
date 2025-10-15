export interface WebSearchItem {
    title?: string;
    url?: string;
    content?: string;
    score?: number;
  }
  
  export interface YouTubeTranscriptItem {
    text: string;
    offset?: number;
    duration?: number;
  }
  
  export interface WikiSummary {
    title: string;
    extract: string;
    url?: string;
  }
  
  export interface RagHit {
    id: string;
    text: string;
    score: number;
  }
  
  export interface ToolTextBlock {
    type: "text";
    text: string;
  }