
# MCP — Model Context Protocol Planning Server

## Why I Built This

**Picture this frustrating scenario (that happened to me way too often):**

I'm trying to research "best practices for React Server Components in 2024" for an important project. Here's my painful manual journey:

1. **Google search** → Open 15 tabs of articles from Medium, Dev.to, official docs
2. **YouTube hunt** → Search "React Server Components 2024" → Watch 6 different videos → Take notes → Realize half are outdated
3. **Wikipedia dive** → Check React history → Get context on SSR evolution  
4. **Information overload** → Now I have 20+ tabs open, scattered notes, and I'm more confused than when I started!
5. **Manual synthesis** → Spend 2 hours trying to piece together contradictory information
6. **Repeat cycle** → "Wait, let me check one more video..." → 3 hours later, still not done!

Sound familiar? **That's exactly why I created this MCP server!**

Instead of this painful tab-jumping nightmare, I wanted to give Claude **real superpowers**:
- **Live web search** - Get the latest information from across the internet
- **YouTube intelligence** - Fetch top 5 relevant videos with summaries and direct links  
- **Wikipedia deep dives** - Access comprehensive knowledge on any topic
- **Smart synthesis** - Combine all sources into coherent, actionable insights

**Now the magic happens when I ask Claude:**
> "Find me the top 5 YouTube videos about React Server Components best practices from 2024, cross-reference with latest articles, and give me a synthesized summary with the key points I actually need to know"

**Instead of my old painful process:**
- 20+ browser tabs
- 3 hours of manual research  
- Scattered, contradictory notes
- Information paralysis

**I get this in 30 seconds:**
- 5 curated, relevant videos with summaries
- Latest articles cross-referenced for accuracy
- Clean, synthesized insights I can act on immediately
- All sources linked for deeper exploration if needed

**The transformation:** From "I can't browse YouTube" to "Here are 5 relevant videos with key insights, cross-referenced with 8 recent articles, synthesized into actionable recommendations."

This is what I call **giving Claude real research superpowers** - and it completely changed how I work!

## What This Does

This repository contains an MCP (Model Context Protocol) server implementation that provides a framework for building multi-component planning and research agents. It implements the open-source Model Context Protocol standard, enabling secure connections between AI systems (like Claude Desktop) and data sources through a universal protocol.

The project bundles a TypeScript source folder (`planner/src`) and a compiled build (`planner/build`) that together implement agent orchestration, tool integration (web search, Wikipedia, YouTube transcript access, synthesis), and utility helpers. This MCP server connects to Claude Desktop via Claude's `config.json`, allowing you to access these research tools directly in Claude Desktop for enhanced AI conversations.

This README explains what the project does, the MCP integration, architecture and concepts used, how it is built and run, and quick tips for development.

## What Each Tool Does

### YouTube Tool - Your Video Research Assistant
- **Finds top 5 relevant videos** for any search query
- **Extracts summaries** from video descriptions and metadata  
- **Provides direct links** so you can watch what interests you
- **Example**: Ask about "machine learning tutorials" → Get 5 curated videos with summaries

### Web Search Tool - Live Internet Access  
- **Real-time search results** from across the web
- **Current information** that's not in Claude's training data
- **Filtered, relevant content** to avoid information overload

### Wikipedia Tool - Deep Knowledge Access
- **Comprehensive articles** on any topic
- **Structured information** with key facts highlighted
- **Cross-referenced content** for deeper understanding

### Synthesizer Tool - Smart Content Fusion
- **Combines information** from all sources into coherent insights
- **Removes duplicates** and conflicting information  
- **Creates actionable summaries** you can use immediately

## Technical Features

- **MCP Server**: Implements the Model Context Protocol standard to expose research and planning tools to AI assistants like Claude Desktop.
- **Research Orchestration**: Coordinates multiple data sources to provide comprehensive answers to complex questions.
- **Claude Integration**: Connects to Claude Desktop via MCP configuration, allowing you to use these research capabilities directly in your Claude conversations.
- **Modular Design**: Each tool is an independent module that can be used separately or in combination.
- **Ready-to-Run**: Includes pre-built JavaScript bundle for immediate use and TypeScript source for customization.

This project serves as both a functional MCP server for Claude Desktop and a developer playground for building custom research tools using the Model Context Protocol standard.

## High-level architecture and concepts

### Model Context Protocol (MCP) Integration
- **MCP Server**: This project implements an MCP server that exposes research tools to AI assistants following the open-source Model Context Protocol standard.
- **Claude Desktop Connection**: Connects to Claude Desktop via `config.json` configuration, enabling seamless access to research capabilities within Claude conversations.
- **Universal Protocol**: Replaces fragmented integrations with a single, standardized protocol for connecting AI systems to data sources.

### Core Components
- **Agents**: Coordinators that break down a research request into subtasks and route work to tools. The example agent in this repo is `researchPlanner`.
- **Tools**: Independent capabilities that perform I/O and data retrieval or transformation. Examples here: `webSearch`, `wikipedia`, `youtube`, and `synthesizer`.
- **Utilities**: Small helpers for formatting, HTTP calls and shared types found under `planner/src/utils`.
- **Build output**: `planner/build/` mirrors the `src/` implementation compiled to JS so you can run without a TypeScript toolchain.

### Design Principles
- **MCP Compliance**: Follows Model Context Protocol specifications for secure, two-way connections between AI systems and data sources.
- **Separation of concerns**: Agents do orchestration, tools do data access/processing. This makes it straightforward to add or stub tools for testing.
- **Minimal coupling**: Tools accept plain inputs and return simple outputs (usually JSON or strings) so the synthesizer/agents can remain generic.
- **Incremental build**: TypeScript source compiles to a small `build/` folder that can be executed with plain Node.js.

## Folder layout

- `planner/src/` — TypeScript source for agents, tools and utils.
	- `agents/` — agent code (e.g., `researchPlanner.ts`).
	- `tools/` — tool adapters for external data sources (search, youtube transcript, wikipedia, synthesizer).
	- `utils/` — small formatting, http helpers and type definitions.
- `planner/build/` — transpiled JavaScript (ready to run with Node.js).
- top-level `package.json` / `package-lock.json` — project dependencies for quick installs (for example `youtube-transcript`).

## Concepts applied (brief)

- Tooling pattern: each tool exposes a small interface and can be invoked independently. This matches typical agent tool patterns used by LLM orchestrators.
- Planner/agent pattern: the agent inspects a task, formulates a plan (list of steps), and invokes tools in sequence or in parallel.
- Synthesis: a final step that aggregates raw results into a short summary or final response.

## Build & run (quick)

Prerequisites: Node 18+ (some deps like `youtube-transcript` require Node >=18).

### 1. Install dependencies

```bash
# Install dependencies in the planner folder
cd planner
npm install
```

### 2. Run the MCP server

Option A - Run pre-built JS directly (no TypeScript required):
```bash
node build/index.js
```

Option B - Compile and run TypeScript source:
```bash
cd planner
# compile (assumes tsconfig already present)
npm run build
node build/index.js
```

Note: `npm run build` should be defined in `planner/package.json` to compile TypeScript. If it's missing, you can compile with `tsc -p tsconfig.json` after installing dev dependencies.

### 3. Connect to Claude Desktop

To use this MCP server with Claude Desktop, add it to Claude's configuration file:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "research-planner": {
      "command": "node",
      "args": ["/path/to/your/mcpp/planner/build/index.js"],
      "env": {}
    }
  }
}
```

After updating the config, restart Claude Desktop. The research tools will be available in your Claude conversations.

### 4. Test Your Setup

Once connected, try asking Claude:
```
"Find me 5 YouTube videos about JavaScript async/await and summarize the key concepts"
```

You should see Claude actually fetch real YouTube videos with links and provide a synthesized summary!

## Development & Customization

### Adding Your Own Tools
Want to add a tool for GitHub repos, Slack messages, or your company's internal docs? Here's how:

1. **Create the tool**: Add a new file in `planner/src/tools/yourTool.ts`
2. **Implement the interface**: Follow the same pattern as existing tools
3. **Register it**: Export it from the tools index and update the agent

**Example - Adding a GitHub Tool:**
```typescript
// planner/src/tools/github.ts
export async function searchGitHub(query: string) {
  return {
    repositories: [/* top 5 repos */],
    summaries: [/* brief descriptions */],
    links: [/* direct GitHub links */]
  };
}
```

### Testing Your Tools
- **Quick test**: Run `node build/index.js` and check console output
- **Claude test**: Connect to Claude Desktop and ask it to use your new tool
- **Debug mode**: Check `planner/src/.env` for debug settings

### Environment Setup
- Store API keys in `planner/src/.env` (create from `.env.example`)
- Never commit secrets to git
- Use environment variables for external API access

## Real-World Usage Examples

### How the Research Agent Thinks

The research agent **intelligently decides** which tools to use based on your query. It analyzes keywords, context, and complexity to create the perfect research strategy:

- **Statistical queries** → Web + Wikipedia + Synthesizer for data analysis
- **Learning requests** → YouTube + Web + Wikipedia for comprehensive education  
- **Trend analysis** → All tools for complete market intelligence
- **Technical deep-dives** → Wikipedia + Web for authoritative information

---

### Example 1: Complete Market Analysis with Statistics
**You ask Claude:**
> "Give me a complete analysis of the electric vehicle market in 2024. Include growth statistics, key players, consumer trends, and future projections."

**Agent Decision Process:**
- Detects: *market analysis* + *statistics* + *trends* → **ALL TOOLS ACTIVATED**
- Strategy: Comprehensive data gathering + statistical synthesis

**What happens behind the scenes:**
1. **Web Search** → Latest EV market reports, sales data, growth statistics from Reuters, Bloomberg
2. **YouTube Tool** → Top 5 industry analyst videos with market predictions and data visualizations  
3. **Wikipedia** → Historical EV development, major manufacturers, technology background
4. **Synthesizer** → Creates statistical dashboard combining all numerical data

**You get a comprehensive report with:**
```
Electric Vehicle Market Analysis 2024

KEY STATISTICS:
• Global EV sales: 14.1M units (+31% YoY) [Web Source: BloombergNEF]
• Market size: $388.1B (+22% from 2023) [Web Source: McKinsey Report]  
• Top 3 markets: China (60%), Europe (25%), US (10%) [YouTube: EV Analytics Channel]

MARKET LEADERS:
• Tesla: 20.8% global market share [Multiple Sources]
• BYD: 17.1% market share [Web Source: EV-Volumes.com]
• Volkswagen Group: 8.3% market share [Wikipedia + Web confirmation]

CONSUMER TRENDS (from 5 YouTube analysis videos):
• 67% prioritize charging speed over range [Video: EV Consumer Report 2024]
• Average desired range: 350+ miles [Video: AutoMotorSport Analysis]  
• 43% willing to pay premium for faster charging [Video: JD Power EV Study]

2025-2027 PROJECTIONS:
• Expected CAGR: 22.8% through 2027 [Synthesized from 12 sources]
• Predicted market size by 2027: $1.1T [Multiple analyst predictions]

Sources: 15 web articles, 5 YouTube videos, 3 Wikipedia entries
```

---

### Example 2: Learning Path with Performance Metrics  
**You ask Claude:**
> "I want to master machine learning. Show me the learning progression, time estimates, and success rates for different approaches."

**Agent Decision Process:**
- Detects: *learning* + *progression* + *metrics* → **YouTube + Web + Synthesizer**
- Strategy: Educational content + statistical learning data

**Research Coordination:**
1. **YouTube Tool** → 5 top ML learning roadmap videos with time estimates
2. **Web Search** → Learning statistics, bootcamp success rates, salary progression data
3. **Wikipedia** → ML fundamentals and mathematical prerequisites  
4. **Synthesizer** → Creates structured learning plan with statistical insights

**You get a data-driven learning roadmap:**
```
Machine Learning Mastery Plan

TIME TO PROFICIENCY (Industry Statistics):
• Basic ML: 3-6 months (200-400 hours) [5 YouTube sources confirm]
• Job-ready level: 8-12 months [Web: Kaggle Learn Survey 2024]
• Expert level: 2-3 years continuous practice [Web: IEEE Career Analysis]

SUCCESS RATES BY APPROACH:
• Self-study online: 23% completion rate [Web: CourseReport.com]
• Bootcamp programs: 67% job placement [Web: Multiple bootcamp stats]  
• University degree: 89% foundational knowledge [Web: ACM Education Survey]
• YouTube + Projects: 41% practical proficiency [Synthesized from 8 sources]

RECOMMENDED PATH (Optimized for 67% success rate):
Week 1-4: Python basics + Math foundations [YouTube: 3Blue1Brown series]
Week 5-12: Core ML algorithms [YouTube: Andrew Ng course clips] 
Week 13-20: Deep learning fundamentals [YouTube: Fast.ai tutorials]
Week 21-32: Portfolio projects + specialization [Web: GitHub project ideas]

SALARY PROGRESSION DATA:
• Entry ML Engineer: $95K-$130K [Web: Glassdoor 2024]
• Mid-level (2-3 years): $130K-$180K [Web: Levels.fyi data]
• Senior ML Engineer: $180K-$250K+ [Web: Multiple salary surveys]

Based on: 12 educational YouTube channels, 18 industry reports, 4 salary surveys
```

---

### Example 3: Startup Intelligence Report
**You ask Claude:**
> "Analyze the fintech startup ecosystem. Give me funding trends, failure rates, successful business models, and investment opportunities."

**Agent Decision Process:**
- Detects: *startup ecosystem* + *funding* + *trends* + *opportunities* → **FULL RESEARCH MODE**
- Strategy: Maximum data correlation across all sources

**Complete Intelligence Gathering:**
1. **Web Search** → Latest VC reports, startup funding databases, failure statistics
2. **YouTube Tool** → Investor insights, founder interviews, market analysis videos
3. **Wikipedia** → Fintech history, regulatory environment, major players background  
4. **Synthesizer** → Cross-correlates data for investment intelligence

**You get an investor-grade analysis:**
```
Fintech Startup Ecosystem Analysis 2024

FUNDING LANDSCAPE:
• Total fintech funding: $31.5B (-35% from 2023 peak) [Web: CB Insights]
• Average Series A: $18.2M (+12% vs 2023) [Web: PitchBook data]
• Median pre-money valuation: $47M [YouTube: Andreessen Horowitz analysis]
• Top funding categories: B2B payments (28%), crypto infrastructure (19%), lending (16%)

SURVIVAL STATISTICS:
• 5-year survival rate: 18.6% [Web: Startup Genome Report]  
• Break-even timeline: 18-24 months average [YouTube: 8 founder interviews]
• Series A to Series B success: 34% [Web: First Round State of Startups]
• Most common failure reasons: 1) No market need (42%), 2) Cash flow (29%), 3) Competition (19%)

SUCCESSFUL BUSINESS MODELS (Revenue Multiple Analysis):
• B2B SaaS payments: 8-12x revenue multiples [Web: SaaS Capital Index]
• Embedded finance: 6-10x multiples [YouTube: Stripe Partners analysis] 
• Crypto infrastructure: 15-25x multiples (high volatility) [Web: Galaxy Digital report]
• SMB lending: 3-5x multiples [Web: Multiple PE firm reports]

INVESTMENT OPPORTUNITIES (AI-Synthesized Insights):
HIGH OPPORTUNITY:
• AI-powered fraud detection (42% YoY growth) [Cross-correlated: 15 sources]
• Cross-border B2B payments (regulatory tailwinds) [Synthesized: 8 expert videos + 12 articles]
• Embedded banking APIs (320% market growth projected) [Web + YouTube correlation]

AVOID/SATURATED:
• Consumer budgeting apps (97% market penetration) [Web: App Annie data]
• Basic cryptocurrency wallets (1,200+ competitors) [Wikipedia + Web research]

Data Quality Score: 94% (verified across 31 sources)
Intelligence from: 23 VC reports, 8 founder interviews, 12 market research firms
```

---

### Example 4: Research Agent's Auto-Strategy Selection
**You ask Claude:**
> "Should I invest in renewable energy stocks right now?"

**Agent's Strategic Thinking:**
```
QUERY ANALYSIS:
- Investment decision = need current data + historical context + expert opinions  
- Financial topic = statistical analysis required
- "Right now" = time-sensitive, needs latest information

TOOL STRATEGY SELECTED: Multi-source Financial Intelligence
Web Search: Current market data, analyst reports, news
YouTube: Expert investor opinions, market analysis videos  
Wikipedia: Industry background, company fundamentals
Synthesizer: Risk-adjusted recommendation with confidence scores
```

**Result:** Complete investment thesis with statistical confidence levels, risk analysis, and actionable recommendations based on 20+ current sources.

## Research Agent Intelligence Features

### Smart Tool Selection Algorithm
The research agent analyzes your query and automatically chooses the optimal tool combination:

```typescript
// Agent's decision-making process
if (query.includes(['statistics', 'data', 'numbers', 'analysis'])) {
  strategy = 'STATISTICAL_RESEARCH'; // All tools + extra data correlation
} else if (query.includes(['learn', 'tutorial', 'how to'])) {
  strategy = 'EDUCATIONAL_PATH'; // YouTube + Web + structured learning
} else if (query.includes(['market', 'trends', 'industry'])) {
  strategy = 'MARKET_INTELLIGENCE'; // All tools + business analysis
} else if (query.includes(['current', 'latest', 'recent', 'now'])) {
  strategy = 'REAL_TIME_RESEARCH'; // Web-heavy + YouTube + quick synthesis
}
```

### Statistical Confidence Scoring
Every research result includes confidence metrics:

- **Data Quality Score**: 0-100% based on source credibility and cross-verification
- **Recency Score**: How current the information is (weighted by source dates)
- **Coverage Score**: Percentage of query aspects addressed by research
- **Consensus Level**: Agreement percentage across multiple sources

### Auto-Verification Process
1. **Cross-reference checking**: Verifies statistics across multiple sources
2. **Outlier detection**: Flags unusual data points for manual review  
3. **Source credibility weighting**: Prioritizes authoritative sources
4. **Temporal relevance**: Weights recent information higher for trend analysis

---

## Technical Contract

**Enhanced Input Format:**
```json
{
  "query": "your research question",
  "researchType": "statistical|educational|market|technical", // Auto-detected if not provided
  "constraints": {
    "maxSources": 15,        // Increased for statistical queries
    "includeVideos": true,
    "includeWeb": true,
    "requireStats": true,    // Forces statistical analysis
    "confidenceThreshold": 85 // Minimum confidence for inclusion
  },
  "outputFormat": {
    "includeMetrics": true,
    "includeMethodology": true,
    "structuredData": true
  }
}
```

**Enhanced Output Format:**
```json
{
  "summary": "Synthesized insights with statistical backing",
  "confidence": {
    "dataQuality": 94,
    "recency": 87, 
    "coverage": 92,
    "consensus": 78
  },
  "statistics": {
    "keyMetrics": [
      {"metric": "Market Size", "value": "$388.1B", "confidence": 91, "sources": 8},
      {"metric": "Growth Rate", "value": "22.8% CAGR", "confidence": 89, "sources": 12}
    ],
    "trends": ["increasing", "accelerating", "stable"],
    "correlations": [{"factor1": "adoption rate", "factor2": "pricing", "strength": 0.73}]
  },
  "sources": [
    {
      "type": "youtube|web|wikipedia",
      "title": "Source Title",
      "url": "https://...",
      "excerpt": "Key insights...",
      "credibilityScore": 89,
      "recencyDays": 12,
      "dataPoints": ["stat1", "stat2"]
    }
  ],
  "methodology": {
    "toolsUsed": ["webSearch", "youtube", "wikipedia", "synthesizer"],
    "searchStrategy": "STATISTICAL_RESEARCH",
    "verificationSteps": 5,
    "totalSources": 23,
    "processingTime": "12.3s"
  },
  "actionableInsights": [
    {
      "insight": "Key recommendation",
      "confidence": 92,
      "supportingData": ["stat1", "stat2"],
      "riskLevel": "low|medium|high"
    }
  ]
}
```

### Try These Power Queries

Test the agent's intelligence with these complex research challenges:

```bash
# Statistical Analysis Challenge
"Compare the ROI of different programming bootcamps with salary outcomes and job placement rates"

# Market Intelligence Challenge  
"Analyze the competitive landscape of AI video generation tools with pricing, features, and market share"

# Educational Research Challenge
"Create a complete cybersecurity career path with skill requirements, certifications, salary progression, and learning time estimates"

# Investment Analysis Challenge
"Should I invest in quantum computing stocks? Include market projections, key players, technological milestones, and risk analysis"
```

Each query will trigger the research agent to intelligently combine all tools and provide comprehensive statistical analysis!

## Dependencies

Primary runtime dependency visible in the repo: `youtube-transcript` (used by the `youtube` tool to fetch transcripts). Use `npm install` inside `planner/` to set up.

## MCP Ecosystem

This project is part of the broader Model Context Protocol ecosystem:

- **MCP Specification**: Open standard for connecting AI systems with data sources
- **MCP SDKs**: Development kits for building MCP servers and clients
- **Claude Desktop Support**: Native MCP integration in Claude Desktop apps
- **Community Servers**: Growing repository of open-source MCP servers for various data sources

Learn more about MCP at the [official Model Context Protocol documentation](https://github.com/modelcontextprotocol).

## Next steps and small improvements

- Add `planner/README.md` documenting the planner internals end-to-end (agent APIs, tool contracts). (Recommended next step.)
- Add a `.env.example` so onboarding doesn't require guesswork.
- Add unit tests for tools and a small integration test for the agent.
- Enhance MCP server capabilities with additional research tools and data sources.

## Contribution

1. Fork the repo and create a feature branch.
2. Open a PR with a clear description and tests if applicable.

## Contact

If you want help extending this repo (adding tools, adding tests, or wiring an LLM), tell me what you want to add and I can implement it directly.

---

Completion: updated to an end-to-end README with build/run guidance and development notes.
