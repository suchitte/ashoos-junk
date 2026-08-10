# Ashoo's Junk

A minimal photo journal for regular uploads — timeline by month, tags, captions, search, maps, private entries, camera metadata, stats, mood/song fields, and “on this day” throwbacks.

Built as a gift: quiet to browse, simple to keep.

## Quick start

```bash
npm install
cp .env.example .env
npm run db:push
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Admin: [http://localhost:3000/admin](http://localhost:3000/admin)  
Default password: `changeme` (set `ADMIN_PASSWORD` in `.env`)

## What you get (from the roadmap)

| Feature | Where |
|---|---|
| Timeline / archive by year-month | Home |
| Tags / themes | Home + `/tags/[tag]` |
| Captions | Each entry |
| Search | `/search` |
| Maps (per entry) | Location → Google Maps |
| Full-res originals | Stored as uploaded |
| Private / password entries | Toggle in admin |
| Camera / lens / film metadata | Hover + lightbox |
| Stats + streaks | `/stats` |
| Print / export PDF | Entry → Print button |
| Mood + song of the month | Entry fields |
| On this day | `/on-this-day` |

## Daily admin loop

1. Go to `/admin` and sign in  
2. **New entry**  
3. Pick a date, drop photos, write a short caption, add tags  
4. Publish  

That’s it.

## Customize the gift

In `.env`:

```env
NEXT_PUBLIC_SITE_NAME="Ashoo's Junk"
NEXT_PUBLIC_SITE_TAGLINE="photos worth keeping"
ADMIN_PASSWORD="a-strong-password"
SESSION_SECRET="long-random-string"
```

## Host + custom domain

SQLite + local uploads need a host with a **persistent disk**. Railway is the simplest fit.

### Deploy on Railway

1. Push this repo to GitHub  
2. Create a new Railway project → Deploy from GitHub  
3. Add a **Volume** mounted at `/app/data`  
4. Set environment variables:

```env
DATABASE_URL="file:/app/data/journal.db"
ADMIN_PASSWORD="your-password"
SESSION_SECRET="long-random-secret"
NEXT_PUBLIC_SITE_NAME="Ashoo's Junk"
NEXT_PUBLIC_SITE_TAGLINE="photos worth keeping"
```

5. Add a **Volume** mounted at `/app/data` (covers the database and all photo uploads)  
6. In Railway → Settings → Networking → **Custom Domain** → add your domain and follow the DNS instructions (CNAME / ALIAS).

The container runs `prisma db push` on boot, so the database is created automatically.

### Custom domain checklist

1. Buy a domain (Namecheap, Cloudflare, Google Domains, etc.)  
2. In Railway (or your host), add the custom domain  
3. Create the DNS record they show you  
4. Wait for HTTPS to provision  

### Note on Vercel

Vercel’s filesystem is ephemeral, so SQLite + local uploads won’t persist there as-is. Prefer Railway/Fly/Render with a volume for this gift stack.

## Tech

- Next.js (App Router)
- Prisma + SQLite
- Local full-resolution photo storage
- Cookie-based admin session
