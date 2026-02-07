# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Shoutout is an employee recognition platform where team members send "Shoutouts" — appreciation messages tied to company values with points attached. Employees get 500 points monthly to give, earned points accumulate and can be redeemed for rewards.

## Tech Stack (Strict)

- **Framework:** Next.js 14+ with App Router
- **Language:** JavaScript only (NO TypeScript — no .ts or .tsx files)
- **Styling:** Tailwind CSS + shadcn/ui
- **Backend/DB/Auth:** Supabase (PostgreSQL, Auth, Realtime)
- **Package Manager:** npm

## Commands

```bash
npm run dev          # Start development server
npm run build        # Production build
npm run lint         # Run ESLint
```

## Architecture

```
/app                      # Next.js App Router
  /login                  # Magic link authentication
  /auth/callback          # Supabase auth callback handler
  /onboarding             # First-login profile completion
  /dashboard              # Main hub: feed, leaderboards, quick actions
  /shoutout/new           # Create shoutout (or modal on dashboard)
  /profile                # Own profile
  /profile/[id]           # Colleague public profile
  /rewards                # Rewards store (stretch goal)
/components
  /ui                     # shadcn/ui components
  /shoutout               # Shoutout cards, feed, create dialog
  /leaderboard            # Leaderboard components
  /profile                # Profile header, badges, history
  /rewards                # Reward cards and grid
  /layout                 # Navbar, sidebar
  /auth                   # Auth guard wrapper
/lib
  /supabase
    client.js             # Browser client (createBrowserClient)
    server.js             # Server client (createServerClient with cookies)
    middleware.js         # Middleware helper for session refresh
  constants.js            # Categories, point limits, departments
  utils.js                # Helper functions
/supabase/migrations      # SQL migration files
```

## Key Implementation Rules

1. **Server Components by default** — add `"use client"` only for interactive components
2. **Supabase SSR** — use `@supabase/ssr` package, follow official Next.js + Supabase pattern
3. **No ORMs** — use Supabase client directly for all queries
4. **Protected routes** — middleware redirects unauthenticated users to /login

## Database Tables

- `profiles` — extends auth.users (full_name, job_title, department, points_balance, points_given_this_month)
- `shoutouts` — sender_id, recipient_id, message (10-280 chars), category, points (10-100)
- `badges` / `user_badges` — achievement system
- `rewards` / `reward_redemptions` — points redemption store

## Categories (use consistently)

| Category | Color | Emoji |
|----------|-------|-------|
| teamwork | blue | 🤝 |
| innovation | purple | 💡 |
| above_and_beyond | amber | 🔥 |
| customer_focus | green | 🎯 |
| problem_solving | cyan | 🧠 |
| leadership | rose | 💪 |

## Server Actions

Located in `/app/actions/`:
- `shoutouts.js` — createShoutout (validates, inserts shoutout, updates sender/recipient points)
- `rewards.js` — redeemReward (validates balance, creates redemption, deducts points)

## Database Functions

- `get_leaderboard(department_filter, start_date, limit_count)` — returns top users by points received

## Setup Instructions

1. Create a Supabase project at supabase.com
2. Copy `.env.example` to `.env.local` and fill in your credentials
3. Run the SQL migration from `/supabase/migrations/001_initial_schema.sql` in Supabase SQL editor
4. Run `npm install` then `npm run dev`

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```
