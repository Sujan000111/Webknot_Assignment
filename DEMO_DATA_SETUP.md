# Demo Data Setup

To test the sign-in functionality, you need to create a demo student account in your Supabase database.

## Option 1: Using Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **Authentication** → **Users**
3. Click **Add user**
4. Create a user with:
   - **Email**: `student@mvjce.edu.in`
   - **Password**: `password123`
   - **Auto Confirm User**: ✅ (checked)

5. Go to **Table Editor** → **students**
6. Add a new row with:
   - **id**: Copy the user ID from the auth.users table
   - **student_id**: `MVJCE2021CS001`
   - **first_name**: `Demo`
   - **last_name**: `Student`
   - **email**: `student@mvjce.edu.in`
   - **department**: `Computer Science`
   - **year_of_study**: `3`
   - **college_id**: (you can leave this null for now)

## Option 2: Using SQL

Run this SQL in your Supabase SQL Editor:

```sql
-- First, create the user in auth.users (this is usually done through Supabase Auth)
-- Then insert the student profile
INSERT INTO students (
  id,
  student_id,
  first_name,
  last_name,
  email,
  department,
  year_of_study
) VALUES (
  'your-user-id-here', -- Replace with actual user ID from auth.users
  'MVJCE2021CS001',
  'Demo',
  'Student',
  'student@mvjce.edu.in',
  'Computer Science',
  3
);
```

## Option 3: Add Sample Events

To see events in the app, add some sample events:

```sql
-- First, add an event type
INSERT INTO event_types (name, description) VALUES 
('Workshop', 'Educational workshops and training sessions'),
('Hackathon', 'Coding competitions and hackathons'),
('Tech Talk', 'Technical presentations and discussions');

-- Add a venue
INSERT INTO venues (college_id, name, capacity, location) VALUES 
(null, 'Main Auditorium', 200, 'Main Campus Building');

-- Add sample events
INSERT INTO events (
  title,
  description,
  event_type_id,
  venue_id,
  start_date,
  end_date,
  registration_start,
  registration_end,
  max_capacity,
  is_featured
) VALUES 
(
  'React Native Workshop',
  'Learn mobile app development with React Native',
  (SELECT id FROM event_types WHERE name = 'Workshop'),
  (SELECT id FROM venues WHERE name = 'Main Auditorium'),
  NOW() + INTERVAL '7 days',
  NOW() + INTERVAL '7 days' + INTERVAL '3 hours',
  NOW(),
  NOW() + INTERVAL '6 days',
  50,
  true
),
(
  'AI & ML Hackathon 2024',
  'Build innovative AI solutions in 48 hours',
  (SELECT id FROM event_types WHERE name = 'Hackathon'),
  (SELECT id FROM venues WHERE name = 'Main Auditorium'),
  NOW() + INTERVAL '14 days',
  NOW() + INTERVAL '16 days',
  NOW(),
  NOW() + INTERVAL '13 days',
  100,
  true
);
```

## Testing the App

1. Start the App_Students application
2. You should see the sign-in screen
3. Use the demo credentials:
   - **Email**: `student@mvjce.edu.in`
   - **Password**: `password123`
4. After signing in, you should see the home screen with events

## Troubleshooting

- If you get "User not found" error, make sure the student record exists in the `students` table
- If you get "Invalid credentials" error, check that the user exists in `auth.users`
- If events don't show up, make sure you've added sample events to the `events` table
