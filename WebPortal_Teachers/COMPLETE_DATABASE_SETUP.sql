-- ================================================
-- COMPLETE DATABASE SETUP FOR CAMPUS EVENTS MANAGEMENT
-- This is the single, comprehensive SQL file for the entire system
-- ================================================

-- ================================================
-- 1. MAIN DATABASE SCHEMA
-- ================================================

-- Enable Row Level Security
-- This will be configured through Supabase dashboard for each table

-- ================================================
-- COLLEGES TABLE
-- ================================================
CREATE TABLE IF NOT EXISTS colleges (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(10) UNIQUE NOT NULL, -- e.g., 'MVJCE', 'PESIT'
    address TEXT,
    contact_email VARCHAR(255),
    contact_phone VARCHAR(20),
    admin_user_id UUID, -- Reference to auth.users
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================================
-- EVENT TYPES TABLE
-- ================================================
CREATE TABLE IF NOT EXISTS event_types (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    color VARCHAR(7) DEFAULT '#3B82F6', -- Hex color for UI
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================================
-- VENUES TABLE
-- ================================================
CREATE TABLE IF NOT EXISTS venues (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    location TEXT,
    capacity INTEGER,
    amenities TEXT[], -- Array of amenities
    college_id UUID REFERENCES colleges(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================================
-- ADMIN PROFILES TABLE
-- ================================================
CREATE TABLE IF NOT EXISTS admin_profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'admin',
    college_id UUID REFERENCES colleges(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================================
-- STUDENTS TABLE
-- ================================================
CREATE TABLE IF NOT EXISTS students (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id VARCHAR(20) NOT NULL UNIQUE, -- e.g., 'STU001', 'MVJ2024001'
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20),
    department VARCHAR(100),
    year_of_study INTEGER CHECK (year_of_study >= 1 AND year_of_study <= 4),
    college_id UUID REFERENCES colleges(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================================
-- EVENTS TABLE
-- ================================================
CREATE TABLE IF NOT EXISTS events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    event_type_id UUID REFERENCES event_types(id) ON DELETE SET NULL,
    venue_id UUID REFERENCES venues(id) ON DELETE SET NULL,
    college_id UUID REFERENCES colleges(id) ON DELETE CASCADE,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    max_capacity INTEGER DEFAULT 100,
    current_registrations INTEGER DEFAULT 0,
    registration_start TIMESTAMP WITH TIME ZONE,
    registration_end TIMESTAMP WITH TIME ZONE,
    is_featured BOOLEAN DEFAULT false,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'active', 'completed', 'cancelled')),
    created_by UUID REFERENCES admin_profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================================
-- REGISTRATIONS TABLE
-- ================================================
CREATE TABLE IF NOT EXISTS registrations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    registration_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR(20) DEFAULT 'registered' CHECK (status IN ('registered', 'waitlist', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(event_id, student_id)
);

-- ================================================
-- ATTENDANCE TABLE
-- ================================================
CREATE TABLE IF NOT EXISTS attendance (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    registration_id UUID REFERENCES registrations(id) ON DELETE CASCADE,
    checked_in_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR(20) DEFAULT 'present' CHECK (status IN ('present', 'absent', 'late')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================================
-- FEEDBACK TABLE
-- ================================================
CREATE TABLE IF NOT EXISTS feedback (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    registration_id UUID REFERENCES registrations(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comments TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================================
-- 2. ROW LEVEL SECURITY POLICIES
-- ================================================

-- Enable RLS on all tables
ALTER TABLE colleges ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Enable read access for all users" ON colleges;
DROP POLICY IF EXISTS "Enable read access for all users" ON event_types;
DROP POLICY IF EXISTS "Enable read access for all users" ON venues;
DROP POLICY IF EXISTS "Enable read access for all users" ON admin_profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON students;
DROP POLICY IF EXISTS "Enable read access for all users" ON events;
DROP POLICY IF EXISTS "Enable read access for all users" ON registrations;
DROP POLICY IF EXISTS "Enable read access for all users" ON attendance;
DROP POLICY IF EXISTS "Enable read access for all users" ON feedback;

-- Create permissive policies for development/testing
CREATE POLICY "Enable read access for all users" ON colleges FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON event_types FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON venues FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON admin_profiles FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON students FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON events FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON registrations FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON attendance FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON feedback FOR SELECT USING (true);

-- Insert/Update/Delete policies
CREATE POLICY "Enable insert for all users" ON colleges FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable insert for all users" ON event_types FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable insert for all users" ON venues FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable insert for all users" ON admin_profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable insert for all users" ON students FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable insert for all users" ON events FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable insert for all users" ON registrations FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable insert for all users" ON attendance FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable insert for all users" ON feedback FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for all users" ON colleges FOR UPDATE USING (true);
CREATE POLICY "Enable update for all users" ON event_types FOR UPDATE USING (true);
CREATE POLICY "Enable update for all users" ON venues FOR UPDATE USING (true);
CREATE POLICY "Enable update for all users" ON admin_profiles FOR UPDATE USING (true);
CREATE POLICY "Enable update for all users" ON students FOR UPDATE USING (true);
CREATE POLICY "Enable update for all users" ON events FOR UPDATE USING (true);
CREATE POLICY "Enable update for all users" ON registrations FOR UPDATE USING (true);
CREATE POLICY "Enable update for all users" ON attendance FOR UPDATE USING (true);
CREATE POLICY "Enable update for all users" ON feedback FOR UPDATE USING (true);

CREATE POLICY "Enable delete for all users" ON colleges FOR DELETE USING (true);
CREATE POLICY "Enable delete for all users" ON event_types FOR DELETE USING (true);
CREATE POLICY "Enable delete for all users" ON venues FOR DELETE USING (true);
CREATE POLICY "Enable delete for all users" ON admin_profiles FOR DELETE USING (true);
CREATE POLICY "Enable delete for all users" ON students FOR DELETE USING (true);
CREATE POLICY "Enable delete for all users" ON events FOR DELETE USING (true);
CREATE POLICY "Enable delete for all users" ON registrations FOR DELETE USING (true);
CREATE POLICY "Enable delete for all users" ON attendance FOR DELETE USING (true);
CREATE POLICY "Enable delete for all users" ON feedback FOR DELETE USING (true);

-- ================================================
-- 3. REPORT VIEWS
-- ================================================

-- Drop existing views if they exist
DROP VIEW IF EXISTS event_popularity_report;
DROP VIEW IF EXISTS student_participation_report;
DROP VIEW IF EXISTS top_active_students;

-- Create event popularity report view
CREATE OR REPLACE VIEW event_popularity_report AS
SELECT 
    e.id,
    e.title,
    et.name as event_type,
    e.start_date,
    e.current_registrations,
    COALESCE(a.total_attendance, 0) as total_attendance,
    CASE 
        WHEN e.current_registrations > 0 
        THEN ROUND((COALESCE(a.total_attendance, 0)::DECIMAL / e.current_registrations) * 100, 2)
        ELSE 0 
    END as attendance_percentage,
    COALESCE(f.average_rating, 0) as average_rating,
    c.name as college_name
FROM events e
JOIN colleges c ON e.college_id = c.id
JOIN event_types et ON e.event_type_id = et.id
LEFT JOIN (
    SELECT 
        r.event_id,
        COUNT(CASE WHEN att.status = 'present' THEN 1 END) as total_attendance
    FROM registrations r
    LEFT JOIN attendance att ON r.id = att.registration_id
    GROUP BY r.event_id
) a ON e.id = a.event_id
LEFT JOIN (
    SELECT 
        r.event_id,
        ROUND(AVG(f.rating), 2) as average_rating
    FROM registrations r
    JOIN feedback f ON r.id = f.registration_id
    GROUP BY r.event_id
) f ON e.id = f.event_id
WHERE e.status != 'draft'
ORDER BY e.current_registrations DESC;

-- Create student participation report view
CREATE OR REPLACE VIEW student_participation_report AS
SELECT 
    s.id,
    s.first_name || ' ' || s.last_name as full_name,
    s.student_id,
    s.email,
    s.department,
    c.name as college_name,
    COUNT(r.id) as total_registrations,
    COUNT(CASE WHEN att.status = 'present' THEN 1 END) as events_attended,
    CASE 
        WHEN COUNT(r.id) > 0 
        THEN ROUND((COUNT(CASE WHEN att.status = 'present' THEN 1 END)::DECIMAL / COUNT(r.id)) * 100, 2)
        ELSE 0 
    END as attendance_rate,
    ROUND(AVG(f.rating), 2) as average_feedback_given
FROM students s
JOIN colleges c ON s.college_id = c.id
LEFT JOIN registrations r ON s.id = r.student_id
LEFT JOIN attendance att ON r.id = att.registration_id
LEFT JOIN feedback f ON r.id = f.registration_id
GROUP BY s.id, s.first_name, s.last_name, s.student_id, s.email, s.department, c.name
ORDER BY events_attended DESC, attendance_rate DESC;

-- Create top active students view
CREATE OR REPLACE VIEW top_active_students AS
SELECT 
    s.id,
    s.first_name || ' ' || s.last_name as full_name,
    s.student_id,
    c.name as college_name,
    COUNT(CASE WHEN att.status = 'present' THEN 1 END) as events_attended,
    COUNT(r.id) as total_registrations,
    ROUND(AVG(f.rating), 2) as average_feedback_given,
    RANK() OVER (ORDER BY COUNT(CASE WHEN att.status = 'present' THEN 1 END) DESC) as rank
FROM students s
JOIN colleges c ON s.college_id = c.id
LEFT JOIN registrations r ON s.id = r.student_id
LEFT JOIN attendance att ON r.id = att.registration_id
LEFT JOIN feedback f ON r.id = f.registration_id
GROUP BY s.id, s.first_name, s.last_name, s.student_id, c.name
HAVING COUNT(CASE WHEN att.status = 'present' THEN 1 END) > 0
ORDER BY events_attended DESC
LIMIT 3;

-- ================================================
-- 4. EVENT TYPE ANALYSIS FUNCTION
-- ================================================

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS get_event_type_analysis();

-- Create function for Event Type Analysis
CREATE OR REPLACE FUNCTION get_event_type_analysis()
RETURNS TABLE (
    type TEXT,
    count BIGINT,
    avg_attendance DECIMAL,
    avg_feedback DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        et.name as type,
        COUNT(e.id) as count,
        ROUND(
            (COUNT(CASE WHEN att.status = 'present' THEN 1 END)::DECIMAL / 
             NULLIF(SUM(e.current_registrations), 0)) * 100, 2
        ) as avg_attendance,
        ROUND(AVG(f.rating), 2) as avg_feedback
    FROM event_types et
    LEFT JOIN events e ON et.id = e.event_type_id
    LEFT JOIN registrations r ON e.id = r.event_id
    LEFT JOIN attendance att ON r.id = att.registration_id
    LEFT JOIN feedback f ON r.id = f.registration_id
    WHERE e.status = 'completed' OR e.status = 'active' OR e.status = 'published'
    GROUP BY et.id, et.name
    ORDER BY count DESC;
END;
$$ LANGUAGE plpgsql;

-- ================================================
-- 5. SAMPLE DATA
-- ================================================

-- Insert sample colleges
INSERT INTO colleges (id, name, code, address, contact_email, contact_phone) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'MVJ College of Engineering', 'MVJCE', 'Near ITPB, Whitefield, Bangalore', 'admin@mvjce.edu.in', '+91-80-2846-1234'),
('550e8400-e29b-41d4-a716-446655440002', 'PES University', 'PES', '100 Feet Ring Road, BSK 3rd Stage, Bangalore', 'admin@pes.edu', '+91-80-2672-1999'),
('550e8400-e29b-41d4-a716-446655440003', 'BMS College of Engineering', 'BMSCE', 'Bull Temple Road, Basavanagudi, Bangalore', 'admin@bmsce.ac.in', '+91-80-2662-2130')
ON CONFLICT (id) DO NOTHING;

-- Insert sample event types
INSERT INTO event_types (id, name, description, color) VALUES
('660e8400-e29b-41d4-a716-446655440001', 'Workshop', 'Hands-on learning sessions', '#3B82F6'),
('660e8400-e29b-41d4-a716-446655440002', 'Seminar', 'Educational presentations and discussions', '#10B981'),
('660e8400-e29b-41d4-a716-446655440003', 'Conference', 'Large-scale professional gatherings', '#F59E0B'),
('660e8400-e29b-41d4-a716-446655440004', 'Competition', 'Contests and challenges', '#EF4444'),
('660e8400-e29b-41d4-a716-446655440005', 'Hackathon', 'Coding and development competitions', '#8B5CF6')
ON CONFLICT (id) DO NOTHING;

-- Insert sample venues
INSERT INTO venues (id, name, location, capacity, amenities, college_id) VALUES
('770e8400-e29b-41d4-a716-446655440001', 'Main Auditorium', 'Ground Floor, Main Building', 500, ARRAY['Projector', 'Sound System', 'Air Conditioning'], '550e8400-e29b-41d4-a716-446655440001'),
('770e8400-e29b-41d4-a716-446655440002', 'Computer Lab 1', 'First Floor, CS Department', 50, ARRAY['Computers', 'Projector', 'Whiteboard'], '550e8400-e29b-41d4-a716-446655440001'),
('770e8400-e29b-41d4-a716-446655440003', 'Seminar Hall', 'Second Floor, Library Building', 100, ARRAY['Projector', 'Sound System'], '550e8400-e29b-41d4-a716-446655440001'),
('770e8400-e29b-41d4-a716-446655440004', 'Open Air Theater', 'Central Campus', 200, ARRAY['Sound System', 'Lighting'], '550e8400-e29b-41d4-a716-446655440001'),
('770e8400-e29b-41d4-a716-446655440005', 'Conference Room', 'Admin Block', 30, ARRAY['Projector', 'Whiteboard', 'Air Conditioning'], '550e8400-e29b-41d4-a716-446655440001')
ON CONFLICT (id) DO NOTHING;

-- Insert sample admin profile (using a dummy UUID for created_by)
INSERT INTO admin_profiles (id, first_name, last_name, email, role, college_id) VALUES
('880e8400-e29b-41d4-a716-446655440001', 'Admin', 'User', 'admin@mvjce.edu.in', 'admin', '550e8400-e29b-41d4-a716-446655440001')
ON CONFLICT (id) DO NOTHING;

-- Insert sample students
INSERT INTO students (id, student_id, first_name, last_name, email, department, year_of_study, college_id) VALUES
('990e8400-e29b-41d4-a716-446655440001', 'STU001', 'Aarav', 'Sharma', 'aarav.sharma@student.mvjce.edu.in', 'Computer Science', 3, '550e8400-e29b-41d4-a716-446655440001'),
('990e8400-e29b-41d4-a716-446655440002', 'STU002', 'Vihaan', 'Patel', 'vihaan.patel@student.mvjce.edu.in', 'Information Technology', 2, '550e8400-e29b-41d4-a716-446655440001'),
('990e8400-e29b-41d4-a716-446655440003', 'STU003', 'Aditya', 'Reddy', 'aditya.reddy@student.mvjce.edu.in', 'Electronics and Communication', 4, '550e8400-e29b-41d4-a716-446655440001'),
('990e8400-e29b-41d4-a716-446655440004', 'STU004', 'Arjun', 'Kumar', 'arjun.kumar@student.mvjce.edu.in', 'Mechanical Engineering', 3, '550e8400-e29b-41d4-a716-446655440001'),
('990e8400-e29b-41d4-a716-446655440005', 'STU005', 'Sai', 'Iyer', 'sai.iyer@student.mvjce.edu.in', 'Computer Science', 2, '550e8400-e29b-41d4-a716-446655440001')
ON CONFLICT (id) DO NOTHING;

-- Insert sample events
INSERT INTO events (id, title, description, event_type_id, venue_id, college_id, start_date, end_date, max_capacity, current_registrations, registration_start, registration_end, is_featured, status, created_by) VALUES
('aa0e8400-e29b-41d4-a716-446655440001', 'Tech Conference 2024', 'Annual technology conference featuring latest trends', '660e8400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', '2024-12-20 09:00:00+05:30', '2024-12-20 17:00:00+05:30', 500, 45, '2024-12-01 00:00:00+05:30', '2024-12-19 23:59:59+05:30', true, 'published', '880e8400-e29b-41d4-a716-446655440001'),
('aa0e8400-e29b-41d4-a716-446655440002', 'Python Workshop', 'Hands-on Python programming workshop', '660e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', '2024-12-18 10:00:00+05:30', '2024-12-18 16:00:00+05:30', 50, 32, '2024-12-01 00:00:00+05:30', '2024-12-17 23:59:59+05:30', false, 'published', '880e8400-e29b-41d4-a716-446655440001'),
('aa0e8400-e29b-41d4-a716-446655440003', 'AI Seminar', 'Artificial Intelligence and Machine Learning seminar', '660e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', '2024-12-22 14:00:00+05:30', '2024-12-22 17:00:00+05:30', 100, 28, '2024-12-01 00:00:00+05:30', '2024-12-21 23:59:59+05:30', true, 'published', '880e8400-e29b-41d4-a716-446655440001')
ON CONFLICT (id) DO NOTHING;

-- Insert sample registrations
INSERT INTO registrations (id, event_id, student_id, registration_date, status) VALUES
('bb0e8400-e29b-41d4-a716-446655440001', 'aa0e8400-e29b-41d4-a716-446655440001', '990e8400-e29b-41d4-a716-446655440001', '2024-12-15 10:30:00+05:30', 'registered'),
('bb0e8400-e29b-41d4-a716-446655440002', 'aa0e8400-e29b-41d4-a716-446655440001', '990e8400-e29b-41d4-a716-446655440002', '2024-12-15 11:15:00+05:30', 'registered'),
('bb0e8400-e29b-41d4-a716-446655440003', 'aa0e8400-e29b-41d4-a716-446655440002', '990e8400-e29b-41d4-a716-446655440001', '2024-12-16 09:45:00+05:30', 'registered'),
('bb0e8400-e29b-41d4-a716-446655440004', 'aa0e8400-e29b-41d4-a716-446655440002', '990e8400-e29b-41d4-a716-446655440003', '2024-12-16 14:20:00+05:30', 'registered'),
('bb0e8400-e29b-41d4-a716-446655440005', 'aa0e8400-e29b-41d4-a716-446655440003', '990e8400-e29b-41d4-a716-446655440002', '2024-12-17 16:10:00+05:30', 'registered')
ON CONFLICT (id) DO NOTHING;

-- Insert sample attendance
INSERT INTO attendance (id, registration_id, checked_in_at, status) VALUES
('cc0e8400-e29b-41d4-a716-446655440001', 'bb0e8400-e29b-41d4-a716-446655440001', '2024-12-20 08:45:00+05:30', 'present'),
('cc0e8400-e29b-41d4-a716-446655440002', 'bb0e8400-e29b-41d4-a716-446655440002', '2024-12-20 09:10:00+05:30', 'present'),
('cc0e8400-e29b-41d4-a716-446655440003', 'bb0e8400-e29b-41d4-a716-446655440003', '2024-12-18 09:55:00+05:30', 'present'),
('cc0e8400-e29b-41d4-a716-446655440004', 'bb0e8400-e29b-41d4-a716-446655440004', '2024-12-18 10:05:00+05:30', 'present'),
('cc0e8400-e29b-41d4-a716-446655440005', 'bb0e8400-e29b-41d4-a716-446655440005', '2024-12-22 13:50:00+05:30', 'present')
ON CONFLICT (id) DO NOTHING;

-- Insert sample feedback
INSERT INTO feedback (id, registration_id, rating, comments) VALUES
('dd0e8400-e29b-41d4-a716-446655440001', 'bb0e8400-e29b-41d4-a716-446655440001', 5, 'Excellent conference with great speakers!'),
('dd0e8400-e29b-41d4-a716-446655440002', 'bb0e8400-e29b-41d4-a716-446655440002', 4, 'Very informative and well organized'),
('dd0e8400-e29b-41d4-a716-446655440003', 'bb0e8400-e29b-41d4-a716-446655440003', 5, 'Great hands-on experience with Python'),
('dd0e8400-e29b-41d4-a716-446655440004', 'bb0e8400-e29b-41d4-a716-446655440004', 4, 'Good workshop, learned a lot'),
('dd0e8400-e29b-41d4-a716-446655440005', 'bb0e8400-e29b-41d4-a716-446655440005', 5, 'Amazing insights into AI and ML')
ON CONFLICT (id) DO NOTHING;

-- ================================================
-- 6. INDEXES FOR PERFORMANCE
-- ================================================

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_events_college_id ON events(college_id);
CREATE INDEX IF NOT EXISTS idx_events_start_date ON events(start_date);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_registrations_event_id ON registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_registrations_student_id ON registrations(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_registration_id ON attendance(registration_id);
CREATE INDEX IF NOT EXISTS idx_feedback_registration_id ON feedback(registration_id);
CREATE INDEX IF NOT EXISTS idx_students_college_id ON students(college_id);
CREATE INDEX IF NOT EXISTS idx_students_email ON students(email);

-- ================================================
-- SETUP COMPLETE
-- ================================================

-- Display completion message
DO $$
BEGIN
    RAISE NOTICE '===============================================';
    RAISE NOTICE 'CAMPUS EVENTS MANAGEMENT DATABASE SETUP COMPLETE';
    RAISE NOTICE '===============================================';
    RAISE NOTICE 'Tables created: colleges, event_types, venues, admin_profiles, students, events, registrations, attendance, feedback';
    RAISE NOTICE 'Views created: event_popularity_report, student_participation_report, top_active_students';
    RAISE NOTICE 'Function created: get_event_type_analysis()';
    RAISE NOTICE 'Sample data inserted for testing';
    RAISE NOTICE 'Row Level Security policies configured';
    RAISE NOTICE 'Performance indexes created';
    RAISE NOTICE '===============================================';
END $$;
