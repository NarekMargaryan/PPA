# Pen & Paper Accounting Website

React + Vite single-page application (SPA) for `ppa.am`.

## Tech Stack

- Vite
- React 18
- TypeScript
- Tailwind CSS
- shadcn/ui + Radix UI
- React Router

## Local Development

```bash
npm install
npm run dev
```

Default dev URL: `http://localhost:8080`

## Reset Demo Content

If you already edited content in admin before, browser `localStorage` can override new default seed data.

To reload the latest EN/HY demo texts, announcements, and images:

1. Open browser devtools -> Application -> Local Storage
2. Remove key: `ppa-content-data`
3. Refresh the site

## Production Build

```bash
npm run build
npm run preview
```

Build output: `dist/`

## SPA Fallback (Netlify)

SPA routing fallback is configured in `public/_redirects`:

```txt
/*    /index.html   200
```

Vite copies `public/` assets to `dist/` during build, so `dist/_redirects` is generated automatically.

## Environment Variables

Google Analytics is configured via:

- `VITE_GA_MEASUREMENT_ID`

Example:

```bash
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

The app reads it from `import.meta.env.VITE_GA_MEASUREMENT_ID` in `src/components/GoogleAnalytics.tsx`.
GA scripts load only after user consent via the cookie banner.

## Admin Backup & Cleanup

In `/admin` -> `Export`, you can now:

- Export full **portable** backup JSON (tries to embed image assets as data URLs)
- Import backup JSON (restores full admin-managed data)
- Run cleanup (resets saved content data and clears activity log)

Cleanup requires current admin password confirmation.

Note: if an external image URL blocks browser fetch/CORS, that specific image may remain as URL in backup.

## Netlify Deployment

### Option A: Manual deploy

1. Build locally: `npm run build`
2. Netlify -> Add new site -> Deploy manually
3. Upload the full `dist/` folder

### Option B: Git-based deploy (recommended)

1. Push repo to GitHub
2. Netlify -> Import from Git
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Add env var in Netlify project settings:
   - `VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX`

`netlify.toml` is included with:
- build command: `npm run build`
- publish directory: `dist`

## Production Hardening Checklist

- No console errors on public pages
- SPA refresh works on nested routes (`/about`, `/courses/...`)
- HTTPS enabled
- Build succeeds with `npm run build`
- Evaluate bundle size warnings from Vite and split large chunks if needed

## Known Limitations

- Admin and content management currently store data in browser `localStorage`.
- Data is not shared across devices/users.
- Clearing browser storage/cache can remove admin/content data.
- First admin account is created on first visit to `/admin` (no backend auth service).
