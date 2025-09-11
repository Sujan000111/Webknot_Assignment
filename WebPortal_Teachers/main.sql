-- ================================================
-- MVJCE Campus Event Management Platform
-- Supabase Database Schema & Queries
-- ================================================

-- Enable Row Level Security
-- This will be configured through Supabase dashboard for each table

-- ================================================
-- 1. COLLEGES TABLE
-- ================================================
CREATE TABLE colleges (
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
-- 2. ADMIN USERS TABLE (extends Supabase auth.users)
-- ================================================
CREATE TABLE admin_profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    college_id UUID REFERENCES colleges(id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(50) DEFAULT 'admin', -- 'super_admin', 'admin', 'staff'
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================================
-- 3. STUDENTS TABLE
-- ================================================
CREATE TABLE students (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    college_id UUID REFERENCES colleges(id) ON DELETE CASCADE,
    student_id VARCHAR(50) NOT NULL, -- College-specific student ID
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    department VARCHAR(100),
    year_of_study INTEGER CHECK (year_of_study >= 1 AND year_of_study <= 4),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(college_id, student_id), -- Ensure unique student ID per college
    UNIQUE(college_id, email) -- Ensure unique email per college
);

-- ================================================
-- 4. EVENT TYPES TABLE
-- ================================================
CREATE TABLE event_types (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE, -- 'Hackathon', 'Workshop', 'Tech Talk', 'Fest', 'Seminar'
    description TEXT,
    color VARCHAR(7) DEFAULT '#1e3a8a', -- Hex color for UI
    icon VARCHAR(50), -- Icon name for UI
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================================
-- 5. VENUES TABLE
-- ================================================
CREATE TABLE venues (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    college_id UUID REFERENCES colleges(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    capacity INTEGER NOT NULL CHECK (capacity > 0),
    location TEXT,
    facilities TEXT[], -- Array of facilities like 'Projector', 'AC', 'Whiteboard'
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================================
-- 6. EVENTS TABLE
-- ================================================
CREATE TABLE events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    college_id UUID REFERENCES colleges(id) ON DELETE CASCADE,
    event_type_id UUID REFERENCES event_types(id),
    venue_id UUID REFERENCES venues(id),
    created_by UUID REFERENCES admin_profiles(id),
    
    -- Event Details
    title VARCHAR(255) NOT NULL,
    description TEXT,
    event_code VARCHAR(20) UNIQUE, -- Auto-generated unique code
    
    -- Scheduling
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    registration_start TIMESTAMP WITH TIME ZONE NOT NULL,
    registration_end TIMESTAMP WITH TIME ZONE NOT NULL,
    
    -- Capacity & Limits
    max_capacity INTEGER NOT NULL CHECK (max_capacity > 0),
    current_registrations INTEGER DEFAULT 0,
    
    -- Event Status
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'active', 'completed', 'cancelled')),
    
    -- Additional Info
    image_url TEXT,
    requirements TEXT,
    contact_info JSONB, -- Store contact details as JSON
    tags TEXT[], -- Array of tags for filtering
    
    -- Metadata
    is_featured BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT valid_dates CHECK (end_date > start_date),
    CONSTRAINT valid_registration CHECK (registration_end < start_date)
);

-- ================================================
-- 7. REGISTRATIONS TABLE
-- ================================================
CREATE TABLE registrations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    
    -- Registration Details
    registration_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR(20) DEFAULT 'registered' CHECK (status IN ('registered', 'cancelled', 'waitlist')),
    
    -- Additional Data
    registration_source VARCHAR(50) DEFAULT 'web', -- 'web', 'mobile', 'admin'
    notes TEXT,
    metadata JSONB, -- Store additional registration data
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(event_id, student_id) -- Prevent duplicate registrations
);

-- ================================================
-- 8. ATTENDANCE TABLE
-- ================================================
CREATE TABLE attendance (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    registration_id UUID REFERENCES registrations(id) ON DELETE CASCADE UNIQUE,
    
    -- Attendance Details
    checked_in_at TIMESTAMP WITH TIME ZONE,
    checked_out_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) DEFAULT 'absent' CHECK (status IN ('present', 'absent', 'late')),
    
    -- Check-in Method
    check_in_method VARCHAR(20) DEFAULT 'manual' CHECK (check_in_method IN ('qr_code', 'manual', 'bulk_import')),
    checked_in_by UUID REFERENCES admin_profiles(id), -- Admin who marked attendance
    
    -- Additional Data
    notes TEXT,
    late_minutes INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================================
-- 9. FEEDBACK TABLE
-- ================================================
CREATE TABLE feedback (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    registration_id UUID REFERENCES registrations(id) ON DELETE CASCADE UNIQUE,
    
    -- Feedback Details
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comments TEXT,
    
    -- Feedback Categories (JSONB for flexibility)
    detailed_ratings JSONB, -- e.g., {"content": 5, "speaker": 4, "venue": 3}
    
    -- Metadata
    is_anonymous BOOLEAN DEFAULT false,
    feedback_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================================
-- 10. EVENT ANALYTICS TABLE (for caching)
-- ================================================
CREATE TABLE event_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id UUID REFERENCES events(id) ON DELETE CASCADE UNIQUE,
    
    -- Calculated Metrics
    total_registrations INTEGER DEFAULT 0,
    total_attendance INTEGER DEFAULT 0,
    attendance_percentage DECIMAL(5,2) DEFAULT 0,
    average_rating DECIMAL(3,2) DEFAULT 0,
    total_feedback_count INTEGER DEFAULT 0,
    
    -- Additional Metrics
    on_time_percentage DECIMAL(5,2) DEFAULT 0,
    no_show_count INTEGER DEFAULT 0,
    
    -- Timestamps
    last_calculated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================================
-- INDEXES FOR PERFORMANCE
-- ================================================

-- Students indexes
CREATE INDEX idx_students_college_id ON students(college_id);
CREATE INDEX idx_students_email ON students(email);
CREATE INDEX idx_students_student_id ON students(student_id);

-- Events indexes
CREATE INDEX idx_events_college_id ON events(college_id);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_start_date ON events(start_date);
CREATE INDEX idx_events_event_type ON events(event_type_id);

-- Registrations indexes
CREATE INDEX idx_registrations_event_id ON registrations(event_id);
CREATE INDEX idx_registrations_student_id ON registrations(student_id);
CREATE INDEX idx_registrations_date ON registrations(registration_date);

-- Attendance indexes
CREATE INDEX idx_attendance_registration_id ON attendance(registration_id);
CREATE INDEX idx_attendance_status ON attendance(status);

-- Feedback indexes
CREATE INDEX idx_feedback_registration_id ON feedback(registration_id);
CREATE INDEX idx_feedback_rating ON feedback(rating);

-- ================================================
-- FUNCTIONS & TRIGGERS
-- ================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers to relevant tables
CREATE TRIGGER update_colleges_updated_at BEFORE UPDATE ON colleges FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_admin_profiles_updated_at BEFORE UPDATE ON admin_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON students FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_venues_updated_at BEFORE UPDATE ON venues FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_registrations_updated_at BEFORE UPDATE ON registrations FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_attendance_updated_at BEFORE UPDATE ON attendance FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_feedback_updated_at BEFORE UPDATE ON feedback FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_event_analytics_updated_at BEFORE UPDATE ON event_analytics FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Function to update current registrations count
CREATE OR REPLACE FUNCTION update_event_registration_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE events 
        SET current_registrations = current_registrations + 1 
        WHERE id = NEW.event_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE events 
        SET current_registrations = current_registrations - 1 
        WHERE id = OLD.event_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger for registration count updates
CREATE TRIGGER update_registration_count 
    AFTER INSERT OR DELETE ON registrations 
    FOR EACH ROW EXECUTE FUNCTION update_event_registration_count();

-- Function to generate unique event codes
CREATE OR REPLACE FUNCTION generate_event_code()
RETURNS TRIGGER AS $$
DECLARE
    college_code VARCHAR(10);
    event_counter INTEGER;
    new_code VARCHAR(20);
BEGIN
    -- Get college code
    SELECT code INTO college_code FROM colleges WHERE id = NEW.college_id;
    
    -- Get next counter for this college
    SELECT COALESCE(MAX(CAST(RIGHT(event_code, 4) AS INTEGER)), 0) + 1 
    INTO event_counter 
    FROM events 
    WHERE college_id = NEW.college_id 
    AND event_code LIKE college_code || '%';
    
    -- Generate new event code: COLLEGECODE-YYYY (e.g., MVJCE-0001)
    new_code := college_code || '-' || LPAD(event_counter::TEXT, 4, '0');
    NEW.event_code := new_code;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for event code generation
CREATE TRIGGER generate_event_code_trigger 
    BEFORE INSERT ON events 
    FOR EACH ROW 
    WHEN (NEW.event_code IS NULL)
    EXECUTE FUNCTION generate_event_code();

-- ================================================
-- INITIAL DATA INSERTS
-- ================================================

-- Insert default event types
INSERT INTO event_types (name, description, color, icon) VALUES
('Hackathon', 'Coding competitions and innovation challenges', '#ef4444', 'code'),
('Workshop', 'Hands-on learning sessions and skill development', '#3b82f6', 'wrench'),
('Tech Talk', 'Expert presentations and knowledge sharing', '#8b5cf6', 'mic'),
('Fest', 'Cultural events and celebrations', '#f59e0b', 'star'),
('Seminar', 'Academic discussions and lectures', '#10b981', 'book');

-- Insert sample college (MVJCE)
INSERT INTO colleges (name, code, address, contact_email, contact_phone) VALUES
('MVJ College of Engineering', 'MVJCE', 'Near ITPB, Whitefield, Bangalore, Karnataka 560067', 'admin@mvjce.edu.in', '+91-80-28476234');

-- ================================================
-- REPORT QUERIES
-- ================================================

-- 1. EVENT POPULARITY REPORT (sorted by registrations)
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

-- 2. STUDENT PARTICIPATION REPORT
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

-- 3. TOP 3 MOST ACTIVE STUDENTS
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
-- UTILITY QUERIES FOR REPORTS
-- ================================================

-- Get registration count per event (for dashboard)
SELECT 
    e.title,
    e.current_registrations,
    e.max_capacity,
    ROUND((e.current_registrations::DECIMAL / e.max_capacity) * 100, 2) as capacity_percentage
FROM events e 
WHERE e.status = 'published' OR e.status = 'active'
ORDER BY capacity_percentage DESC;

-- Get attendance statistics per event type
SELECT 
    et.name as event_type,
    COUNT(e.id) as total_events,
    SUM(e.current_registrations) as total_registrations,
    COUNT(CASE WHEN att.status = 'present' THEN 1 END) as total_attendance,
    ROUND(
        (COUNT(CASE WHEN att.status = 'present' THEN 1 END)::DECIMAL / 
         NULLIF(SUM(e.current_registrations), 0)) * 100, 2
    ) as overall_attendance_rate
FROM event_types et
LEFT JOIN events e ON et.id = e.event_type_id
LEFT JOIN registrations r ON e.id = r.event_id
LEFT JOIN attendance att ON r.id = att.registration_id
WHERE e.status = 'completed'
GROUP BY et.id, et.name
ORDER BY overall_attendance_rate DESC;

-- Get feedback summary
SELECT 
    e.title,
    COUNT(f.id) as feedback_count,
    ROUND(AVG(f.rating), 2) as average_rating,
    COUNT(CASE WHEN f.rating = 5 THEN 1 END) as five_star_count,
    COUNT(CASE WHEN f.rating = 1 THEN 1 END) as one_star_count
FROM events e
LEFT JOIN registrations r ON e.id = r.event_id
LEFT JOIN feedback f ON r.id = f.registration_id
WHERE e.status = 'completed'
GROUP BY e.id, e.title
HAVING COUNT(f.id) > 0
ORDER BY average_rating DESC;

-- ================================================
-- ROW LEVEL SECURITY POLICIES
-- ================================================

-- Enable RLS on all tables
ALTER TABLE colleges ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE venues ENABLE ROW LEVEL SECURITY;

-- Create policies (basic examples - customize based on requirements)
-- Allow admins to see only their college's data
CREATE POLICY "Admins can view their college data" ON colleges
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin_profiles ap 
            WHERE ap.id = auth.uid() 
            AND ap.college_id = colleges.id
        )
    );

CREATE POLICY "Admins can manage their college students" ON students
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin_profiles ap 
            WHERE ap.id = auth.uid() 
            AND ap.college_id = students.college_id
        )
    );

-- Similar policies for other tables...

-- ================================================
-- ANALYTICS REFRESH FUNCTION
-- ================================================

-- Function to refresh event analytics
CREATE OR REPLACE FUNCTION refresh_event_analytics(event_uuid UUID DEFAULT NULL)
RETURNS VOID AS $$
DECLARE
    event_record RECORD;
BEGIN
    -- If specific event provided, update only that event
    -- Otherwise, update all events
    FOR event_record IN 
        SELECT id FROM events 
        WHERE (event_uuid IS NULL OR id = event_uuid)
        AND status IN ('active', 'completed')
    LOOP
        INSERT INTO event_analytics (
            event_id, 
            total_registrations, 
            total_attendance, 
            attendance_percentage,
            average_rating,
            total_feedback_count,
            on_time_percentage,
            no_show_count
        )
        SELECT 
            event_record.id,
            COUNT(r.id),
            COUNT(CASE WHEN att.status = 'present' THEN 1 END),
            CASE 
                WHEN COUNT(r.id) > 0 
                THEN ROUND((COUNT(CASE WHEN att.status = 'present' THEN 1 END)::DECIMAL / COUNT(r.id)) * 100, 2)
                ELSE 0 
            END,
            ROUND(AVG(f.rating), 2),
            COUNT(f.id),
            CASE 
                WHEN COUNT(CASE WHEN att.status = 'present' THEN 1 END) > 0 
                THEN ROUND((COUNT(CASE WHEN att.status = 'present' AND att.late_minutes = 0 THEN 1 END)::DECIMAL / COUNT(CASE WHEN att.status = 'present' THEN 1 END)) * 100, 2)
                ELSE 0 
            END,
            COUNT(CASE WHEN r.id IS NOT NULL AND att.id IS NULL THEN 1 END)
        FROM events e
        LEFT JOIN registrations r ON e.id = r.event_id
        LEFT JOIN attendance att ON r.id = att.registration_id
        LEFT JOIN feedback f ON r.id = f.registration_id
        WHERE e.id = event_record.id
        GROUP BY e.id
        ON CONFLICT (event_id) DO UPDATE SET
            total_registrations = EXCLUDED.total_registrations,
            total_attendance = EXCLUDED.total_attendance,
            attendance_percentage = EXCLUDED.attendance_percentage,
            average_rating = EXCLUDED.average_rating,
            total_feedback_count = EXCLUDED.total_feedback_count,
            on_time_percentage = EXCLUDED.on_time_percentage,
            no_show_count = EXCLUDED.no_show_count,
            last_calculated = NOW(),
            updated_at = NOW();
    END LOOP;
END;
$$ LANGUAGE plpgsql;