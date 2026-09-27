-- Add the first admin to Catch a Morning
-- Run this in your Supabase SQL editor

-- Step 1: Check existing users
SELECT id, email FROM auth.users;

-- Step 2: Add admin (replace 'your-email@example.com' with your actual email)
INSERT INTO admins (user_id)
SELECT id FROM auth.users WHERE email = 'your-email@example.com';

-- Step 3: Verify
SELECT a.id, a.user_id, u.email
FROM admins a
JOIN auth.users u ON a.user_id = u.id;
