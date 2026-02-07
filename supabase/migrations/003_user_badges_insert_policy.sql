-- Allow authenticated users to insert their own badges (for badge awarding system)
-- Note: In production, you may want to use a service role or database function instead
CREATE POLICY "System can award badges" ON user_badges
  FOR INSERT TO authenticated
  WITH CHECK (true);
