-- Run this in your Supabase SQL editor to add the first admin
-- Replace 'your-user-id' with the actual user ID from auth.users

-- First, sign up via the login page, then run:
-- SELECT id FROM auth.users WHERE email = 'your-email@example.com';

-- Then insert the admin record:
INSERT INTO admins (user_id)
VALUES ('your-user-id');

-- Verify:
SELECT * FROM admins;
