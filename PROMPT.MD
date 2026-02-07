# Shoutout — Claude Code Implementation Prompt

## Project Overview

Build **Shoutout**, an employee recognition platform where team members send each other "Shoutouts" — short messages of appreciation tied to company values, with points attached. Each employee gets 500 points per month to give out. Points received accumulate and can be redeemed for rewards.

## Tech Stack (strict — do not deviate)

- **Framework:** Next.js 14+ (App Router)
- **Language:** JavaScript (NOT TypeScript)
- **Styling:** Tailwind CSS + shadcn/ui components
- **Backend/DB/Auth:** Supabase (PostgreSQL, Auth, Realtime)
- **Package manager:** npm

## Project Setup

1. Create a new Next.js project with App Router, JavaScript, Tailwind CSS
2. Install and configure shadcn/ui (use the default theme, slate base colour)
3. Install `@supabase/supabase-js` and `@supabase/ssr`
4. Create a `.env.local` file with placeholders:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
5. Set up Supabase client utilities:
   - `/lib/supabase/client.js` — browser client using `createBrowserClient`
   - `/lib/supabase/server.js` — server client using `createServerClient` with cookies
   - `/lib/supabase/middleware.js` — middleware helper for session refresh

## Database Schema

Create a Supabase SQL migration file at `/supabase/migrations/001_initial_schema.sql` with the following:

```sql
-- Profiles table (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  job_title TEXT,
  department TEXT,
  avatar_url TEXT,
  birthday DATE,
  join_date DATE DEFAULT CURRENT_DATE,
  points_balance INTEGER DEFAULT 0,
  points_given_this_month INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Shoutouts table
CREATE TABLE shoutouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  recipient_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  message TEXT NOT NULL CHECK (char_length(message) BETWEEN 10 AND 280),
  category TEXT NOT NULL CHECK (category IN ('teamwork', 'innovation', 'above_and_beyond', 'customer_focus', 'problem_solving', 'leadership')),
  points INTEGER NOT NULL CHECK (points BETWEEN 10 AND 100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT no_self_shoutout CHECK (sender_id != recipient_id)
);

-- Badges table
CREATE TABLE badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT NOT NULL,
  criteria TEXT
);

-- User badges (many-to-many)
CREATE TABLE user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  badge_id UUID REFERENCES badges(id) ON DELETE CASCADE NOT NULL,
  awarded_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

-- Rewards catalogue
CREATE TABLE rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  cost INTEGER NOT NULL,
  icon TEXT,
  active BOOLEAN DEFAULT TRUE
);

-- Reward redemptions
CREATE TABLE reward_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  reward_id UUID REFERENCES rewards(id) ON DELETE CASCADE NOT NULL,
  points_spent INTEGER NOT NULL,
  redeemed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE shoutouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE reward_redemptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Profiles: anyone authenticated can read all profiles, users can update their own
CREATE POLICY "Profiles are viewable by authenticated users" ON profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- Shoutouts: anyone authenticated can read, authenticated users can insert
CREATE POLICY "Shoutouts are viewable by authenticated users" ON shoutouts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can create shoutouts" ON shoutouts FOR INSERT TO authenticated WITH CHECK (auth.uid() = sender_id);

-- Badges: anyone authenticated can read
CREATE POLICY "Badges are viewable by authenticated users" ON badges FOR SELECT TO authenticated USING (true);

-- User badges: anyone authenticated can read
CREATE POLICY "User badges are viewable by authenticated users" ON user_badges FOR SELECT TO authenticated USING (true);

-- Rewards: anyone authenticated can read
CREATE POLICY "Rewards are viewable by authenticated users" ON rewards FOR SELECT TO authenticated USING (true);

-- Reward redemptions: users can see their own, insert their own
CREATE POLICY "Users can view own redemptions" ON reward_redemptions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can redeem rewards" ON reward_redemptions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Function: auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Seed: badges
INSERT INTO badges (name, description, icon, criteria) VALUES
  ('First Shoutout Sent', 'Sent your very first Shoutout', '🌟', 'Send 1 shoutout'),
  ('High Five', 'Sent 5 Shoutouts', '🖐️', 'Send 5 shoutouts'),
  ('Shoutout Star', 'Received 10 Shoutouts', '⭐', 'Receive 10 shoutouts'),
  ('Top Recognised', 'Most recognised employee of the month', '🏆', 'Top points received in a month'),
  ('Team Player', 'Sent 5+ Shoutouts in a single month', '🤝', 'Send 5+ shoutouts in one month'),
  ('Birthday Badge', 'Happy Birthday!', '🎂', 'Auto-awarded on birthday'),
  ('Work Anniversary', 'Celebrating another year!', '📅', 'Auto-awarded on join date anniversary');

-- Seed: rewards
INSERT INTO rewards (name, description, cost, icon) VALUES
  ('Coffee for the team', 'Treat your team to a round of coffees', 200, '☕'),
  ('Breakfast for the team', 'Breakfast is on you!', 500, '🥐'),
  ('£10 Amazon Voucher', 'A little something for yourself', 750, '🎁'),
  ('£25 Amazon Voucher', 'Treat yourself', 1500, '🎁'),
  ('Half Day Off', 'Take an afternoon off, you earned it', 2000, '🏖️'),
  ('Full Day Off', 'A whole day to recharge', 3500, '🏖️');

-- Seed: demo profiles (these will need matching auth.users — for demo, create via Supabase dashboard or seed script)
-- We'll handle demo data seeding separately
```

## Folder Structure

```
/app
  /login
    page.js                  — Magic link login page
  /auth
    /callback
      route.js               — Supabase auth callback handler
  /onboarding
    page.js                  — Profile completion after first login
  /dashboard
    page.js                  — Main dashboard (feed, leaderboards)
  /shoutout
    /new
      page.js                — Create new shoutout (or use modal on dashboard)
  /profile
    page.js                  — Own profile
    /[id]
      page.js                — Colleague public profile
  /rewards
    page.js                  — Rewards store (stretch goal)
  layout.js                  — Root layout with Supabase provider
  page.js                    — Redirect to /dashboard or /login
/components
  /ui                        — shadcn/ui components
  /shoutout
    shoutout-card.js         — Single shoutout display card
    shoutout-feed.js         — Scrollable feed of shoutout cards
    create-shoutout-dialog.js — Modal dialog for creating a shoutout
  /leaderboard
    leaderboard.js           — Reusable leaderboard component
    leaderboard-item.js      — Single leaderboard row
  /profile
    profile-header.js        — Avatar, name, title, department
    badge-grid.js            — Grid of earned badges
    points-summary.js        — Points balance + given this month
    shoutout-history.js      — List of sent/received shoutouts
  /rewards
    reward-card.js           — Single reward display
    rewards-grid.js          — Grid of available rewards
  /layout
    navbar.js                — Top navigation bar
    sidebar.js               — Optional sidebar nav
  /auth
    auth-guard.js            — Protected route wrapper
/lib
  /supabase
    client.js                — Browser Supabase client
    server.js                — Server Supabase client
    middleware.js             — Middleware helper
  constants.js               — Categories, point limits, etc.
  utils.js                   — Helper functions
/middleware.js               — Next.js middleware for auth session refresh
```

## Page Specifications

### 1. Login Page (`/login`)

- Clean, centred card layout
- App logo/name "Shoutout" with a tagline like "Celebrate your team"
- Email input field
- "Send Magic Link" button
- On submit: call `supabase.auth.signInWithOtp({ email })` with `emailRedirectTo` pointing to `/auth/callback`
- Show success state: "Check your email for a login link!"
- No password fields, no sign-up form — magic link only
- If user is already authenticated, redirect to `/dashboard`

### 2. Auth Callback (`/auth/callback/route.js`)

- Exchange the auth code for a session
- Check if the user's profile has `full_name` set
- If profile is incomplete → redirect to `/onboarding`
- If profile is complete → redirect to `/dashboard`

### 3. Onboarding (`/onboarding`)

- Shown only on first login when profile is incomplete
- Form fields:
  - Full name (required)
  - Job title (required)
  - Department (required) — select from: Engineering, Design, Marketing, Sales, Operations, HR, Finance, Support
  - Birthday (optional, date picker)
- On submit: update the `profiles` table, then redirect to `/dashboard`
- Protected route — must be authenticated

### 4. Dashboard (`/dashboard`)

This is the main screen. Layout: two-column on desktop (feed left, leaderboards right), single column stacked on mobile.

**Left Column — Shoutout Feed:**
- Fetch recent shoutouts from `shoutouts` table, joined with `profiles` for sender and recipient info
- Order by `created_at` DESC, limit 20
- Each shoutout card shows:
  - Sender avatar (initials-based using first letter of first and last name, coloured background) + name
  - "→" or "shouted out" text
  - Recipient avatar + name
  - Category badge (colour-coded pill, e.g. 🤝 Teamwork in a blue pill)
  - Message text
  - Points awarded (e.g. "+25 pts")
  - Relative timestamp (e.g. "2 hours ago")
- Card styling: shadcn Card with subtle left border colour matching the category

**Right Column — Leaderboards:**
- **Team Leaderboard** — top 5 in the user's department by points received this month
  - Query: sum of points from shoutouts received this month, filtered by department
  - Show rank, avatar, name, total points
  - Gold/silver/bronze accent for top 3
- **Company Leaderboard** — top 5 across all departments
  - Same format, no department filter
  - Toggle: "This Month" / "All Time" tabs

**Top Bar / Quick Actions:**
- Greeting: "Hey [first_name] 👋"
- Points remaining pill: "🎯 320 / 500 points left to give"
- Prominent "Send a Shoutout" button (opens create dialog)

**Category colour mapping (use consistently everywhere):**
```
teamwork:         blue    (bg-blue-100 text-blue-700)
innovation:       purple  (bg-purple-100 text-purple-700)
above_and_beyond: amber   (bg-amber-100 text-amber-700)
customer_focus:   green   (bg-green-100 text-green-700)
problem_solving:  cyan    (bg-cyan-100 text-cyan-700)
leadership:       rose    (bg-rose-100 text-rose-700)
```

### 5. Create Shoutout (`create-shoutout-dialog.js`)

- Trigger: "Send a Shoutout" button on dashboard opens a shadcn Dialog/Sheet
- Step-by-step or single form:
  1. **Recipient** — Combobox/searchable select populated from `profiles` table (exclude current user)
  2. **Category** — Grid of 6 category cards, each with emoji + label, click to select (highlight selected)
  3. **Message** — Textarea, placeholder "What did they do that deserves recognition?", character counter showing x/280, minimum 10 chars
  4. **Points** — Slider from 10 to 100 (step of 5), with current value displayed. Show remaining monthly balance. Slider max capped at remaining balance.
  5. **Send button** — disabled until all fields valid

**On submit:**
- Insert into `shoutouts` table
- Update sender's `points_given_this_month` (+points)
- Update recipient's `points_balance` (+points)
- Close dialog
- Show success toast: "🎉 Shoutout sent to [name]!"
- Refresh the feed

**Validation:**
- All fields required
- Cannot select self as recipient
- Points must be between 10–100 and not exceed remaining monthly allowance
- Message 10–280 characters

### 6. Profile Page (`/profile`)

**Own profile view:**
- Large avatar (initials-based, coloured circle, 80px)
- Full name, job title, department
- Birthday and join date displayed with icons
- **Points Summary Card:**
  - Points balance (redeemable): large number with "pts" label
  - Points given this month: progress bar showing x / 500
- **Badges Section:**
  - Grid of badge cards (icon + name + awarded date)
  - Unearned badges shown greyed out / locked with a lock icon
  - Query `badges` left joined with `user_badges` for the current user
- **Shoutout History:**
  - Two tabs: "Received" and "Sent"
  - List of shoutout cards (compact version — no avatars, just names + message + points + date)
  - Ordered by most recent

### 7. Colleague Profile (`/profile/[id]`)

- Same layout as own profile but:
  - No points balance shown
  - No "Sent" tab in history (only show received shoutouts)
  - No edit capabilities
  - Add a "Send a Shoutout" button that opens the create dialog pre-filled with this recipient
- 404 page if profile ID doesn't exist

### 8. Rewards Store (`/rewards`) — STRETCH GOAL

- Grid of reward cards
- Each card: icon, name, description, cost in points
- "Redeem" button — disabled if user doesn't have enough points
- On redeem: confirm dialog → insert into `reward_redemptions` → deduct from `points_balance` → success toast
- Show user's current points balance at the top

## Navbar Component

- Sticky top navbar
- Left: "Shoutout" logo/text (link to /dashboard)
- Right: Points balance pill, avatar dropdown with:
  - "My Profile" → `/profile`
  - "Rewards" → `/rewards`
  - "Sign Out" → call `supabase.auth.signOut()` then redirect to `/login`
- Mobile: hamburger menu

## Middleware (`/middleware.js`)

- Refresh Supabase auth session on every request
- Protect all routes except `/login` and `/auth/callback`
- Redirect unauthenticated users to `/login`
- Redirect authenticated users away from `/login` to `/dashboard`

## Constants (`/lib/constants.js`)

```javascript
export const MONTHLY_POINTS_ALLOWANCE = 500;
export const MIN_SHOUTOUT_POINTS = 10;
export const MAX_SHOUTOUT_POINTS = 100;
export const SHOUTOUT_POINTS_STEP = 5;
export const MIN_MESSAGE_LENGTH = 10;
export const MAX_MESSAGE_LENGTH = 280;

export const CATEGORIES = [
  { value: 'teamwork', label: 'Teamwork', emoji: '🤝', color: 'blue' },
  { value: 'innovation', label: 'Innovation', emoji: '💡', color: 'purple' },
  { value: 'above_and_beyond', label: 'Going Above & Beyond', emoji: '🔥', color: 'amber' },
  { value: 'customer_focus', label: 'Customer Focus', emoji: '🎯', color: 'green' },
  { value: 'problem_solving', label: 'Problem Solving', emoji: '🧠', color: 'cyan' },
  { value: 'leadership', label: 'Leadership', emoji: '💪', color: 'rose' },
];

export const DEPARTMENTS = [
  'Engineering', 'Design', 'Marketing', 'Sales', 'Operations', 'HR', 'Finance', 'Support'
];
```

## Seed Data Script

Create `/scripts/seed.js` that inserts demo data directly into Supabase (run manually). Include:

- 10 demo profiles across 3 departments (Engineering, Marketing, Design) with varied join dates and birthdays
- 20 shoutouts with a mix of categories, points (10–100), and timestamps spread over the last 30 days
- Badge awards: give some users the "First Shoutout Sent" and "Team Player" badges
- All seed data should make the dashboard look alive and populated for demo purposes

## Design Guidelines

- **Colour scheme:** Clean white/slate base. Gold/amber as the primary accent colour (celebration theme). Category colours as defined above for pills and borders.
- **Typography:** Use the default shadcn/Tailwind font stack. Headings bold, body regular.
- **Spacing:** Generous padding. Cards should breathe — don't cram content.
- **Avatars:** Generate initials-based avatars with consistent coloured backgrounds derived from the user's name (hash the name to pick from a preset palette).
- **Animations:** Subtle — use Tailwind transitions on hover states. No heavy animation libraries.
- **Mobile:** Fully responsive. Dashboard columns stack on mobile. Navbar collapses to hamburger.
- **shadcn components to use:** Card, Button, Dialog, Input, Textarea, Select, Slider, Avatar, Badge, Tabs, Toast, DropdownMenu, Command (for searchable select), Progress

## Important Implementation Notes

1. **JavaScript only** — do not use TypeScript. No `.ts` or `.tsx` files. All files should be `.js` or `.jsx`.
2. **App Router** — use Next.js App Router with `app/` directory. Server components by default, add `"use client"` only where needed (interactive components, hooks).
3. **Supabase SSR** — use `@supabase/ssr` package for server-side Supabase client. Follow the official Next.js + Supabase SSR pattern.
4. **No ORMs** — use Supabase client directly for all queries.
5. **Error handling** — wrap Supabase calls in try/catch, show user-friendly error toasts.
6. **Loading states** — use shadcn Skeleton components for loading states on the dashboard and profile pages.
7. **Relative timestamps** — use a simple helper function, no external date library needed. Format as "just now", "2 minutes ago", "3 hours ago", "2 days ago", etc.
8. **Avatar colours** — hash the user's name to deterministically pick a background colour from a preset array of 8 colours so the same user always gets the same colour.

## Build Priority Order

Build in this order to have a working demo as fast as possible:

1. **Project setup** — Next.js, Tailwind, shadcn, Supabase client config, middleware
2. **Auth flow** — Login page, magic link, callback, session handling, protected routes
3. **Database** — Run migration SQL in Supabase, seed badges and rewards
4. **Dashboard** — Feed + leaderboards + quick actions (use mock data initially if needed)
5. **Create Shoutout** — Dialog with full flow, database insert, feed refresh
6. **Profile page** — Own profile with badges, points, history
7. **Colleague profiles** — Public view at `/profile/[id]`
8. **Onboarding** — First-login profile completion
9. **Seed data** — Populate demo data for presentation
10. **Polish** — Loading states, error handling, responsive tweaks, toast notifications
11. **Stretch: Rewards store** — Browse and redeem
12. **Stretch: Discord webhook** — Post shoutouts to a Discord channel