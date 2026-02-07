-- Seed Demo Data for Shoutout
-- Run this in the Supabase SQL editor AFTER creating test users via the Auth dashboard

-- First, create demo users via Supabase Auth dashboard with these emails:
-- 1. john.smith@demo.com
-- 2. sarah.johnson@demo.com
-- 3. mike.williams@demo.com
-- 4. emma.brown@demo.com
-- 5. david.taylor@demo.com
-- 6. lisa.anderson@demo.com
-- 7. james.martinez@demo.com
-- 8. amy.garcia@demo.com
-- 9. chris.wilson@demo.com
-- 10. jennifer.lee@demo.com

-- Then update the profiles for these users (replace UUIDs with actual user IDs from auth.users):

-- Example updates (run after creating users):
/*
UPDATE profiles SET
  full_name = 'John Smith',
  job_title = 'Senior Software Engineer',
  department = 'Engineering',
  birthday = '1990-03-15',
  join_date = '2022-01-10',
  points_balance = 450,
  points_given_this_month = 150
WHERE id = '<john-user-id>';

UPDATE profiles SET
  full_name = 'Sarah Johnson',
  job_title = 'Product Designer',
  department = 'Design',
  birthday = '1988-07-22',
  join_date = '2021-06-01',
  points_balance = 820,
  points_given_this_month = 200
WHERE id = '<sarah-user-id>';

-- ... repeat for other users
*/

-- Sample Shoutouts (run after profiles are set up):
/*
INSERT INTO shoutouts (sender_id, recipient_id, message, category, points, created_at) VALUES
  ('<john-id>', '<sarah-id>', 'Sarah did an amazing job redesigning our dashboard! The new UI is so much cleaner and more intuitive. Really appreciate the attention to detail.', 'innovation', 75, NOW() - INTERVAL '2 hours'),
  ('<sarah-id>', '<mike-id>', 'Thanks Mike for staying late to help fix that critical production bug. Your dedication to the team is inspiring!', 'above_and_beyond', 100, NOW() - INTERVAL '5 hours'),
  ('<mike-id>', '<emma-id>', 'Emma helped onboard our new team members brilliantly. She made everyone feel welcome and got them up to speed quickly.', 'teamwork', 50, NOW() - INTERVAL '1 day'),
  ('<emma-id>', '<david-id>', 'David solved a complex customer issue that had been open for weeks. His problem-solving skills are exceptional!', 'problem_solving', 80, NOW() - INTERVAL '1 day'),
  ('<david-id>', '<lisa-id>', 'Lisa went above and beyond to close the biggest deal of the quarter. Her customer focus is unmatched!', 'customer_focus', 90, NOW() - INTERVAL '2 days'),
  ('<lisa-id>', '<james-id>', 'James has been a fantastic mentor to the junior developers. His leadership is making a real difference.', 'leadership', 65, NOW() - INTERVAL '2 days'),
  ('<james-id>', '<amy-id>', 'Amy streamlined our marketing campaigns and increased engagement by 40%. Incredible work!', 'innovation', 85, NOW() - INTERVAL '3 days'),
  ('<amy-id>', '<chris-id>', 'Chris helped coordinate across 4 different teams to launch the new feature on time. Amazing teamwork!', 'teamwork', 70, NOW() - INTERVAL '3 days'),
  ('<chris-id>', '<jennifer-id>', 'Jennifer resolved a tricky escalation with grace and turned an upset customer into a fan. Well done!', 'customer_focus', 55, NOW() - INTERVAL '4 days'),
  ('<jennifer-id>', '<john-id>', 'John wrote comprehensive documentation that saved the team countless hours. Thank you!', 'problem_solving', 45, NOW() - INTERVAL '4 days');

-- Award some badges to demo users:
INSERT INTO user_badges (user_id, badge_id, awarded_at)
SELECT '<sarah-id>', id, NOW() - INTERVAL '30 days'
FROM badges WHERE name = 'First Shoutout Sent';

INSERT INTO user_badges (user_id, badge_id, awarded_at)
SELECT '<mike-id>', id, NOW() - INTERVAL '15 days'
FROM badges WHERE name = 'Team Player';

INSERT INTO user_badges (user_id, badge_id, awarded_at)
SELECT '<john-id>', id, NOW() - INTERVAL '7 days'
FROM badges WHERE name = 'High Five';
*/

-- Quick start demo data (if you want pre-populated data without real auth users):
-- This creates profiles directly, but won't work with auth - use only for UI testing

-- To properly seed, follow these steps:
-- 1. Go to Supabase Dashboard > Authentication > Users
-- 2. Click "Add User" and create 5-10 demo users with fake emails
-- 3. Copy each user's UUID from the users list
-- 4. Run UPDATE statements above with real UUIDs
-- 5. Run INSERT statements for shoutouts with real UUIDs
-- 6. Run INSERT statements for user_badges with real UUIDs
