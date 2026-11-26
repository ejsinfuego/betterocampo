# Citizen reporting (server API + Firebase Admin)

Community **Report a problem** intake. The browser talks only to `/api/*`. Firebase Admin SDK runs on Vercel serverless functions. Firestore/Storage rules deny all direct client access.

## Enable locally

1. Create a Firebase project with **Firestore**. Storage is optional (Blaze).
2. Create a **service account** (Project settings → Service accounts → Generate new private key).
3. Create a **Google OAuth Web Client ID** (Google Cloud Console → APIs & Services → Credentials). Add authorized JavaScript origins for `http://localhost:3000` (Vercel CLI) and your production domain.
4. Copy `.env.example` → `.env.local` and set:

   - `FIREBASE_PROJECT_ID`
   - `FIREBASE_CLIENT_EMAIL`
   - `FIREBASE_PRIVATE_KEY` (keep `\n` escaped)
   - `SESSION_SECRET` (random 16+ chars)
   - `GOOGLE_CLIENT_ID` and `VITE_GOOGLE_CLIENT_ID` (same client id)
   - Optional: `FIREBASE_STORAGE_BUCKET`, `FIREBASE_STORAGE_ENABLED=true`

5. Seed an admin allowlist doc in Firestore: collection `admins`, document ID = your Google email (empty fields OK). Google subject id also works.
6. Deploy locked rules: `firebase deploy --only firestore:rules` (and `storage` when Storage is on).
7. Run API + SPA together: `npx vercel dev` (plain `npm run dev` does not serve `/api`).
8. Add the same server env vars in the Vercel project dashboard for production.

## Routes

| Path                          | Purpose                                      |
| ----------------------------- | -------------------------------------------- |
| `/report`                     | Report a problem                             |
| `/report/track`               | Track by Reference ID (no contact fields)    |
| `/reports`                    | Published (redacted) board                   |
| `/admin/reports`              | Google-gated triage desk                     |
| `/admin/reports/:referenceId` | Full Report record (contact, photos, manage) |

## API

| Method            | Path                                        | Auth                               |
| ----------------- | ------------------------------------------- | ---------------------------------- |
| `GET`             | `/api/health`                               | public                             |
| `POST`            | `/api/reports`                              | public + rate limit                |
| `GET`             | `/api/reports/published`                    | public                             |
| `GET`             | `/api/reports/:referenceId`                 | public (capability id; no contact) |
| `GET`             | `/api/reports/:referenceId/photos`          | public signed URLs                 |
| `GET/POST/DELETE` | `/api/admin/session`                        | Google ID token → httpOnly cookie  |
| `GET`             | `/api/admin/reports`                        | admin cookie                       |
| `GET/PATCH`       | `/api/admin/reports/:referenceId`           | admin cookie                       |
| `POST`            | `/api/admin/reports/:referenceId/publish`   | admin cookie                       |
| `POST`            | `/api/admin/reports/:referenceId/unpublish` | admin cookie                       |
| `POST`            | `/api/admin/reports/:referenceId/delete`    | admin cookie                       |

## Data

- `reports/{referenceId}` — full Report (including contact). Written only by Admin SDK.
- `publishedReports/{referenceId}` — redacted projection for the public board (no contact).
- Storage `reports/{referenceId}/*` — optional images via Admin SDK + signed read URLs.
- `admins/{email|googleSub}` — allowlist for operators.

## Cost notes

- Stay on **Vercel Hobby** to avoid Vercel charges; overages typically throttle.
- Set a **Google Cloud budget alert** for Firestore/Storage.
- Keep `FIREBASE_STORAGE_ENABLED=false` until you accept Blaze billing for Storage.
