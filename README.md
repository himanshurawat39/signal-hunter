# Signal Hunter

Signal Hunter is a dark-themed lead discovery app built with Next.js, Tailwind CSS, Lucide, and a Vercel-friendly serverless API route. It searches Reddit and X for recent pain-point posts, then asks Gemini to rank the highest-intent opportunities.

## Environment variables

Copy `.env.example` to `.env.local` and set:

```bash
TAVILY_API_KEY=...
FIRECRAWL_API_KEY=...
GEMINI_API_KEY=...
GEMINI_MODEL=gemini-2.5-flash
```

Use either `TAVILY_API_KEY` or `FIRECRAWL_API_KEY` for the search layer. If both are present, the app prefers Tavily.

## Local development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Deployment

Deploy directly to Vercel. The `/api/leads` route runs as a serverless function, so you do not need a separate backend server.
