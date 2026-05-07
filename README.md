# Employee Service Portal

An internal **Employee Service Portal** built with **Next.js 16 (App Router)**, **TypeScript (strict)**, **Tailwind CSS**, and **Auth.js v5 (NextAuth)** — gated behind **Google Workspace SSO**.

Only employees whose email belongs to the configured Google Workspace domain (e.g. `@yourcompany.com`) can sign in. Personal `@gmail.com` accounts or any other domain are rejected and shown a friendly access-denied page.

---

## Features

- 🔐 **Google Workspace SSO** via Auth.js v5 + Google OAuth 2.0
- 🛡️ **Domain restriction** enforced server-side in the `signIn` callback (the client-side `hd` hint alone is *not* trusted)
- 🚧 **Edge middleware** (`middleware.ts`) protects every portal route and redirects unauthenticated users to `/login`
- 👤 **Dashboard** with Google profile picture, display name, and verified Workspace email
- 🧱 **Service placeholder cards** for Leave Request, Payroll, IT Support, Benefits, Directory, Learning
- ❌ **Friendly auth error page** at `/auth/error` for `AccessDenied` and other Auth.js error codes
- ⌨️ **Strict TypeScript** with Auth.js module augmentation for typed `session.user.id`

## Project Structure

```
.
├── app/
│   ├── api/auth/[...nextauth]/route.ts   # Auth.js GET/POST handlers
│   ├── auth/error/page.tsx               # Friendly access-denied page
│   ├── login/page.tsx                    # Sign-in page (Sign in with Google)
│   ├── globals.css                       # Tailwind base + small global styles
│   ├── layout.tsx                        # Root layout
│   └── page.tsx                          # Protected dashboard
├── components/
│   ├── ServiceCard.tsx                   # Placeholder service tile
│   ├── SignInButton.tsx                  # Client component — starts Google SSO
│   └── SignOutButton.tsx                 # Server-action sign-out form
├── lib/                                  # Reserved for future helpers
├── types/
│   └── next-auth.d.ts                    # Augments Session / JWT types
├── auth.ts                               # Auth.js v5 config (Google + domain check)
├── middleware.ts                         # Route protection
├── tailwind.config.ts
├── postcss.config.js
├── next.config.js
├── tsconfig.json
├── .env.local.example
└── README.md
```

---

## Running Locally

### 1. Prerequisites

- Node.js **20.x or newer** (Next.js 16 requires Node 20+)
- A Google Workspace tenant you control (to set up the OAuth client below)
- npm, pnpm, or yarn

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy the example file and fill in real values:

```bash
cp .env.local.example .env.local
```

Then edit `.env.local`:

| Variable                   | Description                                                                                  |
| -------------------------- | -------------------------------------------------------------------------------------------- |
| `GOOGLE_CLIENT_ID`         | OAuth 2.0 **Client ID** from Google Cloud Console                                            |
| `GOOGLE_CLIENT_SECRET`     | OAuth 2.0 **Client Secret** from Google Cloud Console                                        |
| `AUTH_SECRET`              | Random string used by Auth.js to sign sessions. Generate with `openssl rand -base64 32`      |
| `NEXTAUTH_URL`             | Base URL of the app — `http://localhost:3000` for local dev                                  |
| `ALLOWED_WORKSPACE_DOMAIN` | The Workspace domain you want to allow, **without** the leading `@` (e.g. `yourcompany.com`) |

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). You'll be redirected to `/login` and prompted to sign in with Google. After a successful sign-in, you land on the protected dashboard.

### Useful scripts

| Script              | What it does                                |
| ------------------- | ------------------------------------------- |
| `npm run dev`       | Start Next.js in development mode           |
| `npm run build`     | Build the production bundle                 |
| `npm run start`     | Start the production server (after `build`) |
| `npm run lint`      | Run ESLint via `next lint`                  |
| `npm run typecheck` | Run `tsc --noEmit` for strict type checking |

---

## Google Cloud Console Setup

You need a Google OAuth 2.0 client to obtain `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`. Follow these steps **once** as a Workspace admin (or have your admin do it).

### Step 1 — Create / select a project

1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. In the top bar, click the project dropdown → **New Project**.
3. Name it (e.g. `Employee Service Portal`) and choose your organization. Click **Create**.
4. Wait for the project to be created, then make sure it is selected in the project dropdown.

### Step 2 — Configure the OAuth Consent Screen

1. From the left nav, choose **APIs & Services → OAuth consent screen**.
2. **User Type**: select **Internal**.
   - ⚠️ This is the critical step: *Internal* means only users in your Google Workspace organization can sign in. Choosing *External* would allow any Google account (including personal `@gmail.com` accounts) to attempt sign-in.
3. Click **Create**.
4. Fill in the required app information:
   - **App name**: `Employee Service Portal`
   - **User support email**: an address in your Workspace
   - **App logo**: optional
   - **Application home page**: `http://localhost:3000` (for dev) — update later for production
   - **Developer contact information**: a Workspace email
5. Click **Save and Continue**.
6. **Scopes**: the defaults (`openid`, `email`, `profile`) are sufficient. Click **Save and Continue**.
7. Review the summary and click **Back to Dashboard**.

### Step 3 — Create OAuth client ID credentials

1. Go to **APIs & Services → Credentials**.
2. Click **+ Create Credentials → OAuth client ID**.
3. **Application type**: **Web application**.
4. **Name**: e.g. `Employee Service Portal — Local Dev`.
5. **Authorized JavaScript origins** — add:
   - `http://localhost:3000`
6. **Authorized redirect URIs** — add **exactly**:
   - `http://localhost:3000/api/auth/callback/google`
   - ⚠️ The path must be `/api/auth/callback/google` — this is the convention Auth.js expects for the Google provider. If it doesn't match, sign-in will fail with `redirect_uri_mismatch`.
7. Click **Create**.
8. A modal shows your **Client ID** and **Client Secret**. Copy both into `.env.local` as `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`.

### Step 4 — Set the allowed Workspace domain

In `.env.local`, set:

```
ALLOWED_WORKSPACE_DOMAIN=yourcompany.com
```

Use your real Workspace primary domain (no leading `@`). The `signIn` callback in `auth.ts` will reject any verified email that does not end with `@<this domain>`.

### Step 5 — Restart the dev server

After editing `.env.local`, stop and restart `npm run dev` so Next.js picks up the new variables.

### Going to production

When you deploy:

1. Update `NEXTAUTH_URL` to your production URL (e.g. `https://portal.yourcompany.com`).
2. In the Google Cloud Console OAuth client, add the production URL to **Authorized JavaScript origins** and add `https://portal.yourcompany.com/api/auth/callback/google` to **Authorized redirect URIs**.
3. Set `AUTH_SECRET` to a fresh, strong random value in your production secret store (do **not** reuse the dev value).

---

## How the Domain Restriction Works

The `signIn` callback in [`auth.ts`](./auth.ts) is the source of truth:

1. Confirms the OAuth provider is `google`.
2. Reads `email` and `email_verified` from the **verified Google ID token** (so they cannot be spoofed by the client).
3. Rejects sign-in if `email_verified !== true` or the email does not end with `@<ALLOWED_WORKSPACE_DOMAIN>`.
4. Returning `false` causes Auth.js to redirect to `/auth/error?error=AccessDenied`, which renders a friendly message.

The `hd` parameter we pass to Google is only a *hint* to surface the right account chooser — it's never trusted on its own.

## License

Internal prototype. Adapt and license as needed for your organization.
