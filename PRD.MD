# Shoutout — Product Requirements Document

## Overview

**Shoutout** is an employee recognition and celebration platform where team members can recognise each other by sending "Shoutouts" — short, meaningful messages of appreciation tied to company values. Each employee receives **500 points per month** to distribute, and earned points can be redeemed for real rewards.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js (JavaScript) |
| UI | shadcn/ui + Tailwind CSS |
| Backend / DB | Supabase (Auth, Database, Realtime) |
| Auth | Supabase Magic Link (email-based, passwordless) |

---

## Core Concept

Every month, each employee receives **500 points** to give away to colleagues via Shoutouts. Points received accumulate and can be spent in the **Rewards Store** on real perks. Points given reset monthly; points earned carry over.

### Points Economy

| Action | Points |
|--------|--------|
| Monthly allowance to give | 500 pts |
| Minimum per Shoutout | 10 pts |
| Maximum per Shoutout | 100 pts |

### Rewards Store (Examples)

| Reward | Cost |
|--------|------|
| Coffee for the team ☕ | 200 pts |
| Breakfast for the team 🥐 | 500 pts |
| £10 Amazon voucher 🎁 | 750 pts |
| £25 Amazon voucher 🎁 | 1,500 pts |
| Half day off 🏖️ | 2,000 pts |
| Full day off 🏖️ | 3,500 pts |

---

## MVP Features

### 1. Authentication (Magic Link)

**Route:** `/login`

- Email-based magic link authentication via Supabase Auth
- No passwords — user enters work email, receives a login link
- On first login, user is prompted to complete their profile (name, job title, birthday, department)
- Session persisted across browser sessions
- Protected routes redirect unauthenticated users to `/login`

**Supabase tables involved:** `auth.users` (built-in), `profiles`

---

### 2. Dashboard

**Route:** `/dashboard`

The main hub after login. Displays:

#### Recent Shoutouts Feed
- Chronological feed of recent Shoutouts across the company
- Each Shoutout card shows:
  - Sender name + avatar
  - Recipient name + avatar
  - Shoutout message
  - Category/value tag (e.g. "Teamwork", "Innovation", "Going Above & Beyond")
  - Points awarded
  - Timestamp
- Emoji reactions on Shoutouts (stretch goal)

#### Team Leaderboard
- Top recognised employees within the user's team/department
- Shows name, avatar, total points received this month
- Highlights top 3

#### Company Leaderboard
- Top recognised employees across the whole company
- Same format as team leaderboard
- Toggle between "This Month" and "All Time"

#### Quick Actions
- **"Send a Shoutout"** button — opens the create Shoutout flow
- Points remaining this month (e.g. "320 / 500 points left to give")
- Link to profile

---

### 3. Create Shoutout

**Route:** `/dashboard` (modal or slide-over) or `/shoutout/new`

Flow:
1. **Select recipient** — search/select from employee list
2. **Choose category** — select a company value or recognition type:
   - 🤝 Teamwork
   - 💡 Innovation
   - 🔥 Going Above & Beyond
   - 🎯 Customer Focus
   - 🧠 Problem Solving
   - 💪 Leadership
3. **Write message** — short text explaining why (required, 10–280 characters)
4. **Assign points** — slider or input, 10–100 pts (shows remaining monthly balance)
5. **Send** — confirms and posts to the feed

**Validation:**
- Cannot send a Shoutout to yourself
- Cannot exceed monthly points allowance
- Message must be between 10–280 characters
- Must select a category

**On success:**
- Shoutout appears in the dashboard feed
- Recipient's points balance increases
- Sender's monthly allowance decreases
- Toast notification confirms the send

---

### 4. Profile Page

**Route:** `/profile` (own) and `/profile/[id]` (colleagues)

#### Own Profile
- Avatar (initials-based or uploaded)
- Name, job title, department
- Birthday and join date
- **Points balance** (redeemable points earned)
- **Points given this month** (x / 500)
- **Badges earned** — visual badge cards:
  - 🌟 First Shoutout Sent
  - 🏆 10 Shoutouts Received
  - 🔥 Top Recognised This Month
  - 🎂 Birthday Badge (auto-awarded)
  - 📅 Work Anniversary (auto-awarded yearly)
  - 🤝 Team Player (5+ Shoutouts sent in a month)
- **Shoutout history** — list of Shoutouts sent and received with timestamps

#### Colleague Profile (public view)
- Name, job title, department
- Badges earned
- Recent Shoutouts received (public)
- No points balance visible

---

## Database Schema (Supabase / PostgreSQL)

### `profiles`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | FK to auth.users |
| full_name | text | |
| job_title | text | |
| department | text | |
| avatar_url | text | nullable |
| birthday | date | nullable |
| join_date | date | |
| points_balance | integer | Earned points (redeemable) |
| points_given_this_month | integer | Resets monthly |
| created_at | timestamptz | |

### `shoutouts`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| sender_id | uuid | FK to profiles |
| recipient_id | uuid | FK to profiles |
| message | text | 10–280 chars |
| category | text | enum: teamwork, innovation, above_and_beyond, customer_focus, problem_solving, leadership |
| points | integer | 10–100 |
| created_at | timestamptz | |

### `badges`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| name | text | e.g. "First Shoutout Sent" |
| description | text | |
| icon | text | Emoji or icon reference |
| criteria | text | Logic description for awarding |

### `user_badges`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| user_id | uuid | FK to profiles |
| badge_id | uuid | FK to badges |
| awarded_at | timestamptz | |

### `rewards`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| name | text | e.g. "Coffee for the team" |
| description | text | |
| cost | integer | Points cost |
| icon | text | Emoji |
| active | boolean | Is reward available |

### `reward_redemptions`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| user_id | uuid | FK to profiles |
| reward_id | uuid | FK to rewards |
| points_spent | integer | |
| redeemed_at | timestamptz | |

---

## Page Map

```
/login              → Magic link auth
/dashboard          → Main feed, leaderboards, quick actions
/shoutout/new       → Create Shoutout (or modal on dashboard)
/profile            → Own profile, badges, history, points
/profile/[id]       → Colleague's public profile
/rewards            → Rewards store (stretch goal)
```

---

## Stretch Goals (if time permits)

1. **Rewards Store** (`/rewards`) — browse and redeem points for perks
2. **Discord Webhook** — post Shoutouts to a Discord channel when sent (great demo moment)
3. **Emoji reactions** on Shoutouts (🎉 👏 🔥)
4. **Monthly points reset** via Supabase cron/edge function
5. **Birthday & anniversary auto-celebrations** — auto-post Shoutouts on special dates
6. **Dark mode** toggle
7. **Confetti animation** when receiving a Shoutout

---

## Seed Data

For demo purposes, pre-populate:
- 8–10 fake employees across 2–3 departments
- 15–20 existing Shoutouts with varied categories and point values
- Badge awards for some users
- A few rewards in the store

---

## Design Notes

- Use shadcn/ui components: Card, Avatar, Badge, Button, Dialog, Input, Select, Slider, Toast
- Colour palette: warm, celebratory — consider gold/amber accents on a clean white/slate base
- Leaderboard should feel like a podium — emphasise top 3 with size/colour
- Shoutout cards should feel like mini celebrations, not boring list items
- Mobile-responsive — dashboard should stack cleanly on smaller screens