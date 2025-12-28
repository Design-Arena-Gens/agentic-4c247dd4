## Public Instagram Comment Finder

Discover public Instagram comments left by specific accounts across a curated cache of public profiles. The app highlights transparent data usage, enforces rate limiting, and surfaces only comment activity sourced from publicly-visible posts or reels captured in the local dataset.

### Key Features
- **Targeted scans** against up to 10 public Instagram profile URLs per request
- **Niche scans** backed by a curated list of public profiles (cafes, restaurants, influencers, fitness, travel)
- **Live progress feedback** and post-scan summaries detailing scope, runtime, and skipped profiles
- **Result cards** featuring post thumbnails, URLs, comment text, and timestamps
- **CSV export** for matched comments plus a **dark mode** toggle
- **Safety messaging** and a persistent disclaimer—no private APIs, no credential prompts, limited cached scope

### Local Dataset
Mock data lives in `src/data/mockScanData.ts`. It represents a rotating cache of public profiles and recent posts for prototyping. Swap this dataset for your own ingestion pipeline or scraping layer when connecting to real data sources.

### Getting Started
```bash
npm install
npm run dev
```
Visit `http://localhost:3000` and try sample usernames like `socialsleuth`, `lattehunter`, or `trendmapper` to see matched comments from the bundled dataset.

### Production Build
```bash
npm run build
npm start
```

### Quality Checks
- `npm run lint` – Next.js/TypeScript linting with the default config.

### Deployment
Optimized for Vercel. Remote image domains used in the sample dataset are whitelisted in `next.config.ts`.

### Disclaimer
This tool **only** processes public content from the cached dataset. It does **not** interface with Instagram’s private APIs, request credentials, or guarantee complete comment history coverage. Update messaging and data sources to meet your compliance requirements before production use.
