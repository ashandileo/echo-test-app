This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- Docker Desktop (untuk Supabase local)
- Supabase CLI (`brew install supabase/tap/supabase`)

### Setup

1. **Install dependencies:**

```bash
npm install
```

2. **Start Supabase local development:**

```bash
npm run supabase:start
```

> 📝 **Note**: Port Supabase dikonfigurasi khusus (54421-54427) agar tidak bentrok dengan project lain.
> Lihat [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) untuk detail lengkap.

3. **Run the development server:**

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

4. **Access Supabase Studio:**

Open [http://127.0.0.1:54423](http://127.0.0.1:54423) to access the Supabase Studio dashboard.

## 📚 Documentation

- **[SUPABASE_SUCCESS.md](./SUPABASE_SUCCESS.md)** - Setup status dan quick reference
- **[SUPABASE_SETUP.md](./SUPABASE_SETUP.md)** - Dokumentasi lengkap Supabase
- **[SUPABASE_QUICKREF.md](./SUPABASE_QUICKREF.md)** - Command reference cepat

## 🛠️ Available Scripts

```bash
# Development
npm run dev              # Start Next.js dev server
npm run build            # Build for production
npm run start            # Start production server

# Supabase
npm run supabase:start   # Start Supabase local
npm run supabase:stop    # Stop Supabase
npm run supabase:status  # Check Supabase status
npm run supabase:reset   # Reset database
npm run supabase:types   # Generate TypeScript types
```

## 🏗️ Tech Stack

- **Frontend**: Next.js 16 (App Router)
- **UI**: Tailwind CSS, Radix UI
- **Backend**: Supabase (Auth, Database, Storage)
- **Database**: PostgreSQL (via Supabase)
- **Language**: TypeScript

## 📁 Project Structure

```
echo-test-app/
├── app/                 # Next.js app directory
├── components/          # React components
├── lib/
│   ├── supabase/       # Supabase clients & utilities
│   └── utils.ts        # Helper functions
├── supabase/           # Supabase config & migrations
└── types/              # TypeScript types
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
