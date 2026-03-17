# Signal Hunter

Signal Hunter is a lead discovery app built with Next.js, Supabase Auth, Tailwind CSS, Lucide, and a Vercel-friendly serverless API route. It searches Reddit and X for recent pain-point posts, then asks Gemini to rank the highest-intent opportunities.

## Environment variables

Copy `.env.example` to `.env.local` and set:

```bash
TAVILY_API_KEY=...
FIRECRAWL_API_KEY=...
GEMINI_API_KEY=...
GEMINI_MODEL=gemini-2.5-flash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

Use either `TAVILY_API_KEY` or `FIRECRAWL_API_KEY` for the search layer. If both are present, the app prefers Tavily.

## Supabase setup

1. Create a Supabase project.
2. In Supabase SQL Editor, run the SQL in `supabase/schema.sql`.
3. In Supabase Authentication:
   - enable Google provider if you want Google login
   - keep Email provider enabled for magic links
4. Add your app URL and callback URL to Supabase Auth settings.
   - Local callback: `http://localhost:3000/auth/callback`
   - Production callback: `https://your-domain.com/auth/callback`
5. Add the Supabase project URL, anon key, and service role key to `.env.local` and Vercel.

## Local development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Plans and limits

Current plan limits:

- Free: `2/day`, `40/month`
- Pro: `120/month`
- Agency: `500/month`

These limits are enforced server-side per authenticated user through Supabase-backed usage tracking.

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
feat(auth): add supabase login flow
fix(api): block over-limit searches
docs(readme): add deployment notes
```

This repository includes a local Git commit template in `.gitmessage.txt`. To enable it for this clone:

```bash
git config commit.template .gitmessage.txt
```

Then `git commit` will open with a starter structure you can fill in.

## Deployment

Deploy directly to Vercel. The `/api/leads` and `/api/account` routes run as serverless functions, so you do not need a separate backend server.
