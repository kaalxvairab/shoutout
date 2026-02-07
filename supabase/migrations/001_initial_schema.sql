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

-- Function: get leaderboard
CREATE OR REPLACE FUNCTION get_leaderboard(
  department_filter TEXT DEFAULT NULL,
  start_date TIMESTAMPTZ DEFAULT NULL,
  limit_count INTEGER DEFAULT 5
)
RETURNS TABLE (
  user_id UUID,
  full_name TEXT,
  total_points BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id AS user_id,
    p.full_name,
    COALESCE(SUM(s.points), 0)::BIGINT AS total_points
  FROM profiles p
  LEFT JOIN shoutouts s ON s.recipient_id = p.id
    AND (start_date IS NULL OR s.created_at >= start_date)
  WHERE p.full_name IS NOT NULL
    AND (department_filter IS NULL OR p.department = department_filter)
  GROUP BY p.id, p.full_name
  HAVING COALESCE(SUM(s.points), 0) > 0
  ORDER BY total_points DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
