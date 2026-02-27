# Echo Test App

A Next.js + Supabase starter app for building and testing quiz experiences.

## Tech stack

- Next.js 16 (App Router)
- React
- TypeScript
- Tailwind CSS
- Radix UI
- Supabase (Auth, Database, Storage)
- PostgreSQL

## Features

- Frontend built with Next.js (App Router) and React.
- Supabase for authentication, database, and storage (local dev via Supabase CLI + Docker).
- TypeScript for static type checking.
- Tailwind CSS + Radix UI for rapid, accessible UI components.
- Server and API routes for quiz management, audio upload/playback, and OCR endpoints.
- Pre-configured database migrations and seed data in `supabase/`.

## Getting Started

### Prerequisites

- Node.js 18+
- Docker Desktop (for Supabase local)
- Supabase CLI (`brew install supabase/tap/supabase`)

### Set up Supabase locally

#### Ensure Docker is Running

Make sure Docker is running before starting Supabase. You can download Docker from:

- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [OrbStack](https://orbstack.dev/) (macOS)
- [Rancher Desktop](https://rancherdesktop.io/)
- [Podman](https://podman.io/) (alternative container runtime)

#### Start Supabase

Run the following command to start Supabase locally:

```bash
supabase start
```

After Supabase starts, you should see output similar to this:

```text
╭──────────────────────────────────────╮
│ 🔧 Development Tools                 │
├─────────┬────────────────────────────┤
│ Studio  │ http://127.0.0.1:54423     │
│ Mailpit │ http://127.0.0.1:54424     │
│ MCP     │ http://127.0.0.1:54421/mcp │
╰─────────┴────────────────────────────╯

╭──────────────────────────────────────────────────────╮
│ 🌐 APIs                                              │
├────────────────┬─────────────────────────────────────┤
│ Project URL    │ http://127.0.0.1:54421              │
│ REST           │ http://127.0.0.1:54421/rest/v1      │
│ GraphQL        │ http://127.0.0.1:54421/graphql/v1   │
│ Edge Functions │ http://127.0.0.1:54421/functions/v1 │
╰────────────────┴─────────────────────────────────────╯

╭───────────────────────────────────────────────────────────────╮
│ ⛁ Database                                                    │
├─────┬─────────────────────────────────────────────────────────┤
│ URL │ postgresql://postgres:postgres@127.0.0.1:54422/postgres │
╰─────┴─────────────────────────────────────────────────────────╯

╭──────────────────────────────────────────────────────────────╮
│ 🔑 Authentication Keys                                       │
├─────────────┬────────────────────────────────────────────────┤
│ Publishable │ sb_publishable_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX │
│ Secret      │ sb_secret_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX │
╰─────────────┴────────────────────────────────────────────────╯

╭───────────────────────────────────────────────────────────────────────────────╮
│ 📦 Storage (S3)                                                               │
├────────────┬──────────────────────────────────────────────────────────────────┤
│ URL        │ http://127.0.0.1:54421/storage/v1/s3                             │
│ Access Key │ XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX                         │
│ Secret Key │ XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX │
│ Region     │ local                                                            │
╰────────────┴──────────────────────────────────────────────────────────────────╯
```

#### Configure Environment Variables

Copy `.env.example` to `.env.local` and update the following environment variables with the values from the Supabase output above:

```bash
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54421
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
SUPABASE_SERVICE_ROLE_KEY=sb_secret_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

Additionally, add your API keys for AI services:

```bash
OPENAI_API_KEY=your_openai_api_key
MISTRAL_API_KEY=your_mistral_api_key
```

### Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start Supabase local development:

   ```bash
   npm run supabase:start
   ```

   Note: Supabase ports are configured to 54421-54427 to avoid conflicts. See `SUPABASE_SETUP.md` for full details.

3. Run the development server:

   ```bash
   npm run dev
   # or
   # yarn dev
   # or
   # pnpm dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

4. Access Supabase Studio:

   Open [http://127.0.0.1:54423](http://127.0.0.1:54423) to access the Supabase Studio dashboard.

## Available Scripts

```bash
# Development
pnpm run dev              # Start Next.js dev server
pnpm run build            # Build for production
pnpm run start            # Start production server

# Supabase
pnpm run supabase:start   # Start Supabase local
pnpm run supabase:stop    # Stop Supabase
pnpm run supabase:status  # Check Supabase status
pnpm run supabase:reset   # Reset database
pnpm run supabase:types   # Generate TypeScript types
```

## Project Structure

This project uses the Next.js App Router and a standard layout for components, lib utilities, and Supabase integration.

```text
echo-test-app/
├── app/                 # Next.js app directory (routes, layouts, pages)
│   ├── (authentication)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── register/
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   └── admin/
│   ├── (public)/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   └── ...
├── components/          # Reusable React components and UI primitives
├── lib/                 # Supabase clients, helpers, and server utilities
│   └── supabase/
├── supabase/            # Supabase config, migrations, and seed data
├── public/              # Static assets
├── types/               # TypeScript type definitions
├── hooks/               # React hooks
└── docs/                # Documentation and notes
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs)
- [Learn Next.js](https://nextjs.org/learn)

You can deploy on Vercel or any platform that supports Next.js.

## Demo & Example Accounts

- Live preview: [https://echotest.vercel.app](https://echotest.vercel.app)

Example admin credentials (demo only):

- **Admin Account**
  - Email: `administrator@echotest.com`
  - Password: `Password123`
  - Use the email/password login flow on the app to sign in as the admin user.

- **Student Account**
  - Sign in using your Google account via the login page (OAuth).
