-- ================================================
-- AUTHENTICATION FIXES FOR SUPABASE INTEGRATION
-- ================================================

-- 1. Fix the students table to use auth.users.id as primary key
-- First, drop the existing students table and recreate it properly

DROP TABLE IF EXISTS students CASCADE;

-- Recreate students table with proper auth integration
CREATE TABLE students (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    college_id UUID REFERENCES colleges(id) ON DELETE CASCADE,
    student_id VARCHAR(50) NOT NULL, -- College-specific student ID
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    department VARCHAR(100),
    year_of_study INTEGER CHECK (year_of_study >= 1 AND year_of_study <= 4),
    profile_image TEXT, -- Add profile image field
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(college_id, student_id), -- Ensure unique student ID per college
    UNIQUE(college_id, email) -- Ensure unique email per college
);

-- Recreate the indexes
CREATE INDEX idx_students_college_id ON students(college_id);
CREATE INDEX idx_students_email ON students(email);
CREATE INDEX idx_students_student_id ON students(student_id);

-- Recreate the updated_at trigger
CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON students FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 2. Update RLS policies for students table
ALTER TABLE students ENABLE ROW LEVEL SECURITY;

-- Allow students to view and update their own profile
CREATE POLICY "Students can view own profile" ON students
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Students can update own profile" ON students
    FOR UPDATE USING (auth.uid() = id);

-- Allow admins to manage students in their college
CREATE POLICY "Admins can manage college students" ON students
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin_profiles ap 
            WHERE ap.id = auth.uid() 
            AND ap.college_id = students.college_id
        )
    );

-- 3. Update registrations table to reference students properly
-- The registrations table already references students(id) correctly, so no changes needed

-- 4. Create a function to automatically create student profile on signup
CREATE OR REPLACE FUNCTION handle_new_student()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert into students table when a new user signs up
    INSERT INTO students (
        id,
        email,
        first_name,
        last_name,
        student_id,
        college_id
    ) VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'first_name', 'Student'),
        COALESCE(NEW.raw_user_meta_data->>'last_name', 'User'),
        COALESCE(NEW.raw_user_meta_data->>'student_id', 'TEMP-' || EXTRACT(EPOCH FROM NOW())::TEXT),
        (SELECT id FROM colleges WHERE code = 'MVJCE' LIMIT 1) -- Default to MVJCE
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for automatic student profile creation
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_student();

-- 5. Add some sample data for testing
-- Insert a demo student user (you'll need to create this user in Supabase Auth first)
-- The trigger will automatically create the student profile

-- 6. Create a view for easy student data access
CREATE OR REPLACE VIEW student_profiles AS
SELECT 
    s.id,
    s.student_id,
    s.first_name,
    s.last_name,
    s.email,
    s.phone,
    s.department,
    s.year_of_study,
    s.profile_image,
    s.is_active,
    s.created_at,
    s.updated_at,
    c.name as college_name,
    c.code as college_code
FROM students s
JOIN colleges c ON s.college_id = c.id;

-- 7. Grant necessary permissions
GRANT SELECT ON student_profiles TO authenticated;
GRANT SELECT, UPDATE ON students TO authenticated;

-- ================================================
-- DEMO DATA SETUP
-- ================================================

-- Insert sample event types if they don't exist
INSERT INTO event_types (name, description, color, icon) VALUES
('Hackathon', 'Coding competitions and innovation challenges', '#ef4444', 'code'),
('Workshop', 'Hands-on learning sessions and skill development', '#3b82f6', 'wrench'),
('Tech Talk', 'Expert presentations and knowledge sharing', '#8b5cf6', 'mic'),
('Fest', 'Cultural events and celebrations', '#f59e0b', 'star'),
('Seminar', 'Academic discussions and lectures', '#10b981', 'book')
ON CONFLICT (name) DO NOTHING;

-- Insert sample college if it doesn't exist
INSERT INTO colleges (name, code, address, contact_email, contact_phone) VALUES
('MVJ College of Engineering', 'MVJCE', 'Near ITPB, Whitefield, Bangalore, Karnataka 560067', 'admin@mvjce.edu.in', '+91-80-28476234')
ON CONFLICT (code) DO NOTHING;

-- Insert sample venue
INSERT INTO venues (college_id, name, capacity, location, facilities) VALUES
((SELECT id FROM colleges WHERE code = 'MVJCE'), 'Main Auditorium', 200, 'Main Campus Building', ARRAY['Projector', 'AC', 'Whiteboard', 'Sound System'])
ON CONFLICT DO NOTHING;

-- Insert sample events
INSERT INTO events (
    college_id,
    event_type_id,
    venue_id,
    title,
    description,
    start_date,
    end_date,
    registration_start,
    registration_end,
    max_capacity,
    is_featured,
    status
) VALUES 
(
    (SELECT id FROM colleges WHERE code = 'MVJCE'),
    (SELECT id FROM event_types WHERE name = 'Workshop'),
    (SELECT id FROM venues WHERE name = 'Main Auditorium'),
    'React Native Workshop',
    'Learn mobile app development with React Native. This hands-on workshop will cover the basics of React Native development, including components, navigation, and state management.',
    NOW() + INTERVAL '7 days',
    NOW() + INTERVAL '7 days' + INTERVAL '3 hours',
    NOW(),
    NOW() + INTERVAL '6 days',
    50,
    true,
    'published'
),
(
    (SELECT id FROM colleges WHERE code = 'MVJCE'),
    (SELECT id FROM event_types WHERE name = 'Hackathon'),
    (SELECT id FROM venues WHERE name = 'Main Auditorium'),
    'AI & ML Hackathon 2024',
    'Build innovative AI solutions in 48 hours. Teams of 2-4 members will work on real-world problems using machine learning and artificial intelligence.',
    NOW() + INTERVAL '14 days',
    NOW() + INTERVAL '16 days',
    NOW(),
    NOW() + INTERVAL '13 days',
    100,
    true,
    'published'
),
(
    (SELECT id FROM colleges WHERE code = 'MVJCE'),
    (SELECT id FROM event_types WHERE name = 'Tech Talk'),
    (SELECT id FROM venues WHERE name = 'Main Auditorium'),
    'Future of Web Development',
    'Join us for an insightful talk about the latest trends in web development, including modern frameworks, performance optimization, and best practices.',
    NOW() + INTERVAL '21 days',
    NOW() + INTERVAL '21 days' + INTERVAL '2 hours',
    NOW(),
    NOW() + INTERVAL '20 days',
    75,
    false,
    'published'
)
ON CONFLICT DO NOTHING;
