-- Reactions table for shoutouts
CREATE TABLE shoutout_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shoutout_id UUID REFERENCES shoutouts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  emoji TEXT NOT NULL CHECK (emoji IN ('celebrate', 'applause', 'love', 'fire')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(shoutout_id, user_id, emoji)
);

-- Enable RLS
ALTER TABLE shoutout_reactions ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can view reactions
CREATE POLICY "Reactions are viewable by authenticated users"
  ON shoutout_reactions FOR SELECT TO authenticated USING (true);

-- Users can add their own reactions
CREATE POLICY "Users can add reactions"
  ON shoutout_reactions FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can remove their own reactions
CREATE POLICY "Users can remove own reactions"
  ON shoutout_reactions FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Index for faster lookups
CREATE INDEX idx_reactions_shoutout ON shoutout_reactions(shoutout_id);
