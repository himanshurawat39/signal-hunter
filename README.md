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

## Git workflow

This repo uses a simple commit format to keep history easy to scan:

```text
type(scope): short summary
```

Common `type` values:

- `feat`: new functionality
- `fix`: bug fix
- `docs`: documentation only
- `refactor`: code cleanup without behavior change
- `style`: visual or formatting-only changes
- `chore`: tooling or maintenance work

Examples:

```text
feat(api): rank leads with Gemini
fix(ui): prevent empty search submissions
docs(readme): add deployment notes
```

This repository includes a local Git commit template in `.gitmessage.txt`. To enable it for this clone:

```bash
git config commit.template .gitmessage.txt
```

Then `git commit` will open with a starter structure you can fill in.

## Deployment

Deploy directly to Vercel. The `/api/leads` route runs as a serverless function, so you do not need a separate backend server.
