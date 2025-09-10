-- ================================================
-- MVJCE Campus Event Management Platform
-- All-in-One Supabase Setup Script
-- ================================================
-- Run this script once in Supabase SQL Editor.
-- It will:
-- 1) Ensure core tables exist (colleges, admin_profiles, students, event_types, venues, events, registrations, attendance, feedback, event_analytics)
-- 2) Fix students table to use auth.users(id) as PK
-- 3) Create RLS policies
-- 4) Create triggers/functions (timestamps, registration count, event code, analytics refresh, auto student profile on auth user created)
-- 5) Seed demo data (event types, one college, venue, sample events)
-- 6) Optionally create a demo student profile (requires auth user id)
-- ================================================

-- Extensions (make sure UUID/crypto funcs are available)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ================================================
-- TABLES
-- ================================================

CREATE TABLE IF NOT EXISTS colleges (
	id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
	name VARCHAR(255) NOT NULL,
	code VARCHAR(10) UNIQUE NOT NULL,
	address TEXT,
	contact_email VARCHAR(255),
	contact_phone VARCHAR(20),
	admin_user_id UUID,
	is_active BOOLEAN DEFAULT true,
	created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
	updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS admin_profiles (
	id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
	college_id UUID REFERENCES colleges(id) ON DELETE CASCADE,
	first_name VARCHAR(100) NOT NULL,
	last_name VARCHAR(100) NOT NULL,
	email VARCHAR(255) NOT NULL,
	phone VARCHAR(20),
	role VARCHAR(50) DEFAULT 'admin',
	is_active BOOLEAN DEFAULT true,
	created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
	updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- IMPORTANT: Recreate students to use auth.users(id) as PK
-- Comment the next DROP if you already have data and will migrate manually
DROP TABLE IF EXISTS students CASCADE;
CREATE TABLE students (
	id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
	college_id UUID REFERENCES colleges(id) ON DELETE CASCADE,
	student_id VARCHAR(50) NOT NULL,
	first_name VARCHAR(100) NOT NULL,
	last_name VARCHAR(100) NOT NULL,
	email VARCHAR(255) NOT NULL,
	phone VARCHAR(20),
	department VARCHAR(100),
	year_of_study INTEGER CHECK (year_of_study >= 1 AND year_of_study <= 4),
	profile_image TEXT,
	is_active BOOLEAN DEFAULT true,
	created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
	updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
	UNIQUE(college_id, student_id),
	UNIQUE(college_id, email)
);

CREATE TABLE IF NOT EXISTS event_types (
	id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
	name VARCHAR(100) NOT NULL UNIQUE,
	description TEXT,
	color VARCHAR(7) DEFAULT '#1e3a8a',
	icon VARCHAR(50),
	is_active BOOLEAN DEFAULT true,
	created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS venues (
	id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
	college_id UUID REFERENCES colleges(id) ON DELETE CASCADE,
	name VARCHAR(255) NOT NULL,
	capacity INTEGER NOT NULL CHECK (capacity > 0),
	location TEXT,
	facilities TEXT[],
	is_active BOOLEAN DEFAULT true,
	created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
	updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS events (
	id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
	college_id UUID REFERENCES colleges(id) ON DELETE CASCADE,
	event_type_id UUID REFERENCES event_types(id),
	venue_id UUID REFERENCES venues(id),
	created_by UUID REFERENCES admin_profiles(id),
	title VARCHAR(255) NOT NULL,
	description TEXT,
	event_code VARCHAR(20) UNIQUE,
	start_date TIMESTAMP WITH TIME ZONE NOT NULL,
	end_date TIMESTAMP WITH TIME ZONE NOT NULL,
	registration_start TIMESTAMP WITH TIME ZONE NOT NULL,
	registration_end TIMESTAMP WITH TIME ZONE NOT NULL,
	max_capacity INTEGER NOT NULL CHECK (max_capacity > 0),
	current_registrations INTEGER DEFAULT 0,
	status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft','published','active','completed','cancelled')),
	image_url TEXT,
	requirements TEXT,
	contact_info JSONB,
	tags TEXT[],
	is_featured BOOLEAN DEFAULT false,
	is_active BOOLEAN DEFAULT true,
	created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
	updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
	CONSTRAINT valid_dates CHECK (end_date > start_date),
	CONSTRAINT valid_registration CHECK (registration_end <= start_date)
);

CREATE TABLE IF NOT EXISTS registrations (
	id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
	event_id UUID REFERENCES events(id) ON DELETE CASCADE,
	student_id UUID REFERENCES students(id) ON DELETE CASCADE,
	registration_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
	status VARCHAR(20) DEFAULT 'registered' CHECK (status IN ('registered','cancelled','waitlist')),
	registration_source VARCHAR(50) DEFAULT 'web',
	notes TEXT,
	metadata JSONB,
	created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
	updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
	UNIQUE(event_id, student_id)
);

CREATE TABLE IF NOT EXISTS attendance (
	id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
	registration_id UUID REFERENCES registrations(id) ON DELETE CASCADE UNIQUE,
	checked_in_at TIMESTAMP WITH TIME ZONE,
	checked_out_at TIMESTAMP WITH TIME ZONE,
	status VARCHAR(20) DEFAULT 'absent' CHECK (status IN ('present','absent','late')),
	check_in_method VARCHAR(20) DEFAULT 'manual' CHECK (check_in_method IN ('qr_code','manual','bulk_import')),
	checked_in_by UUID REFERENCES admin_profiles(id),
	notes TEXT,
	late_minutes INTEGER DEFAULT 0,
	created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
	updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS feedback (
	id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
	registration_id UUID REFERENCES registrations(id) ON DELETE CASCADE UNIQUE,
	rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
	comments TEXT,
	detailed_ratings JSONB,
	is_anonymous BOOLEAN DEFAULT false,
	feedback_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
	created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
	updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS event_analytics (
	id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
	event_id UUID REFERENCES events(id) ON DELETE CASCADE UNIQUE,
	total_registrations INTEGER DEFAULT 0,
	total_attendance INTEGER DEFAULT 0,
	attendance_percentage DECIMAL(5,2) DEFAULT 0,
	average_rating DECIMAL(3,2) DEFAULT 0,
	total_feedback_count INTEGER DEFAULT 0,
	on_time_percentage DECIMAL(5,2) DEFAULT 0,
	no_show_count INTEGER DEFAULT 0,
	last_calculated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
	created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
	updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================================
-- INDEXES
-- ================================================
CREATE INDEX IF NOT EXISTS idx_students_college_id ON students(college_id);
CREATE INDEX IF NOT EXISTS idx_students_email ON students(email);
CREATE INDEX IF NOT EXISTS idx_students_student_id ON students(student_id);

CREATE INDEX IF NOT EXISTS idx_events_college_id ON events(college_id);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_start_date ON events(start_date);
CREATE INDEX IF NOT EXISTS idx_events_event_type ON events(event_type_id);

CREATE INDEX IF NOT EXISTS idx_registrations_event_id ON registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_registrations_student_id ON registrations(student_id);
CREATE INDEX IF NOT EXISTS idx_registrations_date ON registrations(registration_date);

CREATE INDEX IF NOT EXISTS idx_attendance_registration_id ON attendance(registration_id);
CREATE INDEX IF NOT EXISTS idx_attendance_status ON attendance(status);

CREATE INDEX IF NOT EXISTS idx_feedback_registration_id ON feedback(registration_id);
CREATE INDEX IF NOT EXISTS idx_feedback_rating ON feedback(rating);

-- ================================================
-- FUNCTIONS & TRIGGERS
-- ================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
	NEW.updated_at = NOW();
	RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
	IF NOT EXISTS (
		SELECT 1 FROM pg_trigger WHERE tgname = 'update_colleges_updated_at'
	) THEN
		CREATE TRIGGER update_colleges_updated_at BEFORE UPDATE ON colleges FOR EACH ROW EXECUTE FUNCTION update_updated_at();
	END IF;
END $$;

DO $$ BEGIN
	IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_admin_profiles_updated_at') THEN
		CREATE TRIGGER update_admin_profiles_updated_at BEFORE UPDATE ON admin_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
	END IF;
END $$;

DO $$ BEGIN
	IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_students_updated_at') THEN
		CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON students FOR EACH ROW EXECUTE FUNCTION update_updated_at();
	END IF;
END $$;

DO $$ BEGIN
	IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_venues_updated_at') THEN
		CREATE TRIGGER update_venues_updated_at BEFORE UPDATE ON venues FOR EACH ROW EXECUTE FUNCTION update_updated_at();
	END IF;
END $$;

DO $$ BEGIN
	IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_events_updated_at') THEN
		CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events FOR EACH ROW EXECUTE FUNCTION update_updated_at();
	END IF;
END $$;

DO $$ BEGIN
	IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_registrations_updated_at') THEN
		CREATE TRIGGER update_registrations_updated_at BEFORE UPDATE ON registrations FOR EACH ROW EXECUTE FUNCTION update_updated_at();
	END IF;
END $$;

DO $$ BEGIN
	IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_attendance_updated_at') THEN
		CREATE TRIGGER update_attendance_updated_at BEFORE UPDATE ON attendance FOR EACH ROW EXECUTE FUNCTION update_updated_at();
	END IF;
END $$;

DO $$ BEGIN
	IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_feedback_updated_at') THEN
		CREATE TRIGGER update_feedback_updated_at BEFORE UPDATE ON feedback FOR EACH ROW EXECUTE FUNCTION update_updated_at();
	END IF;
END $$;

DO $$ BEGIN
	IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_event_analytics_updated_at') THEN
		CREATE TRIGGER update_event_analytics_updated_at BEFORE UPDATE ON event_analytics FOR EACH ROW EXECUTE FUNCTION update_updated_at();
	END IF;
END $$;

-- Registration count trigger
CREATE OR REPLACE FUNCTION update_event_registration_count()
RETURNS TRIGGER AS $$
BEGIN
	IF TG_OP = 'INSERT' THEN
		UPDATE events SET current_registrations = current_registrations + 1 WHERE id = NEW.event_id;
		RETURN NEW;
	ELSIF TG_OP = 'DELETE' THEN
		UPDATE events SET current_registrations = current_registrations - 1 WHERE id = OLD.event_id;
		RETURN OLD;
	END IF;
	RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
	IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_registration_count') THEN
		CREATE TRIGGER update_registration_count 
			AFTER INSERT OR DELETE ON registrations 
			FOR EACH ROW EXECUTE FUNCTION update_event_registration_count();
	END IF;
END $$;

-- Event code generator
CREATE OR REPLACE FUNCTION generate_event_code()
RETURNS TRIGGER AS $$
DECLARE
	college_code VARCHAR(10);
	event_counter INTEGER;
	new_code VARCHAR(20);
BEGIN
	SELECT code INTO college_code FROM colleges WHERE id = NEW.college_id;
	SELECT COALESCE(MAX(CAST(RIGHT(event_code, 4) AS INTEGER)), 0) + 1 INTO event_counter
	FROM events WHERE college_id = NEW.college_id AND event_code LIKE college_code || '%';
	new_code := college_code || '-' || LPAD(event_counter::TEXT, 4, '0');
	NEW.event_code := new_code;
	RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
	IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'generate_event_code_trigger') THEN
		CREATE TRIGGER generate_event_code_trigger 
		BEFORE INSERT ON events 
		FOR EACH ROW 
		WHEN (NEW.event_code IS NULL)
		EXECUTE FUNCTION generate_event_code();
	END IF;
END $$;

-- Auto-create student profile when a new auth user is created
CREATE OR REPLACE FUNCTION handle_new_student()
RETURNS TRIGGER AS $$
BEGIN
	INSERT INTO students (id, email, first_name, last_name, student_id, college_id)
	VALUES (
		NEW.id,
		NEW.email,
		COALESCE(NEW.raw_user_meta_data->>'first_name', 'Student'),
		COALESCE(NEW.raw_user_meta_data->>'last_name', 'User'),
		COALESCE(NEW.raw_user_meta_data->>'student_id', 'TEMP-' || EXTRACT(EPOCH FROM NOW())::TEXT),
		(SELECT id FROM colleges WHERE code = 'MVJCE' LIMIT 1)
	)
	ON CONFLICT (id) DO NOTHING;
	RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DO $$ BEGIN
	IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created') THEN
		CREATE TRIGGER on_auth_user_created
			AFTER INSERT ON auth.users
			FOR EACH ROW EXECUTE FUNCTION handle_new_student();
	END IF;
END $$;

-- ================================================
-- RLS POLICIES
-- ================================================
ALTER TABLE colleges ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_analytics ENABLE ROW LEVEL SECURITY;

-- Example policies (adjust as needed)
DO $$ BEGIN
	IF NOT EXISTS (
		SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'students' AND policyname = 'Students can view own profile'
	) THEN
		CREATE POLICY "Students can view own profile" ON students
			FOR SELECT USING (auth.uid() = id);
	END IF;
END $$;

DO $$ BEGIN
	IF NOT EXISTS (
		SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'students' AND policyname = 'Students can update own profile'
	) THEN
		CREATE POLICY "Students can update own profile" ON students
			FOR UPDATE USING (auth.uid() = id);
	END IF;
END $$;

-- Admins manage students in their college
DO $$ BEGIN
	IF NOT EXISTS (
		SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'students' AND policyname = 'Admins can manage college students'
	) THEN
		CREATE POLICY "Admins can manage college students" ON students
			FOR ALL USING (
				EXISTS (
					SELECT 1 FROM admin_profiles ap 
					WHERE ap.id = auth.uid() AND ap.college_id = students.college_id
				)
			);
	END IF;
END $$;

-- Grant helpful access
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated;

-- ================================================
-- SEED DATA (idempotent)
-- ================================================
INSERT INTO event_types (name, description, color, icon) VALUES
('Hackathon','Coding competitions and innovation challenges','#ef4444','code'),
('Workshop','Hands-on learning sessions and skill development','#3b82f6','wrench'),
('Tech Talk','Expert presentations and knowledge sharing','#8b5cf6','mic'),
('Fest','Cultural events and celebrations','#f59e0b','star'),
('Seminar','Academic discussions and lectures','#10b981','book')
ON CONFLICT (name) DO NOTHING;

INSERT INTO colleges (name, code, address, contact_email, contact_phone) VALUES
('MVJ College of Engineering','MVJCE','Near ITPB, Whitefield, Bangalore, Karnataka 560067','admin@mvjce.edu.in','+91-80-28476234')
ON CONFLICT (code) DO NOTHING;

INSERT INTO venues (college_id, name, capacity, location, facilities)
SELECT c.id, 'Main Auditorium', 200, 'Main Campus Building', ARRAY['Projector','AC','Whiteboard','Sound System']
FROM colleges c WHERE c.code = 'MVJCE'
ON CONFLICT DO NOTHING;

-- Featured events (two separate idempotent inserts)
INSERT INTO events (
	college_id, event_type_id, venue_id, title, description,
	start_date, end_date, registration_start, registration_end,
	max_capacity, is_featured, status
)
SELECT
	c.id,
	et.id,
	v.id,
	'React Native Workshop',
	'Learn mobile app development with React Native',
	NOW() + INTERVAL '7 days',
	NOW() + INTERVAL '7 days',
	NOW(),
	NOW() + INTERVAL '6 days',
	50,
	true,
	'published'
FROM colleges c
JOIN event_types et ON et.name = 'Workshop'
JOIN venues v ON v.name = 'Main Auditorium' AND v.college_id = c.id
WHERE c.code = 'MVJCE'
AND NOT EXISTS (
	SELECT 1 FROM events ev WHERE ev.college_id = c.id AND ev.title = 'React Native Workshop'
);

INSERT INTO events (
	college_id, event_type_id, venue_id, title, description,
	start_date, end_date, registration_start, registration_end,
	max_capacity, is_featured, status
)
SELECT
	c.id,
	et.id,
	v.id,
	'AI & ML Hackathon 2024',
	'Build innovative AI solutions in 48 hours',
	NOW() + INTERVAL '14 days',
	NOW() + INTERVAL '16 days',
	NOW(),
	NOW() + INTERVAL '13 days',
	100,
	true,
	'published'
FROM colleges c
JOIN event_types et ON et.name = 'Workshop'
JOIN venues v ON v.name = 'Main Auditorium' AND v.college_id = c.id
WHERE c.code = 'MVJCE'
AND NOT EXISTS (
	SELECT 1 FROM events ev WHERE ev.college_id = c.id AND ev.title = 'AI & ML Hackathon 2024'
);

-- Another event
INSERT INTO events (
	college_id, event_type_id, venue_id, title, description,
	start_date, end_date, registration_start, registration_end,
	max_capacity, is_featured, status
)
SELECT
	c.id,
	et.id,
	v.id,
	'Future of Web Development',
	'Trends in modern web dev, performance, and best practices',
	NOW() + INTERVAL '21 days',
	NOW() + INTERVAL '21 days' + INTERVAL '2 hours',
	NOW(),
	NOW() + INTERVAL '20 days',
	75,
	false,
	'published'
FROM colleges c
JOIN event_types et ON et.name = 'Tech Talk'
JOIN venues v ON v.name = 'Main Auditorium' AND v.college_id = c.id
WHERE c.code = 'MVJCE'
AND NOT EXISTS (
	SELECT 1 FROM events ev
	WHERE ev.college_id = c.id AND ev.title = 'Future of Web Development'
);

-- ================================================
-- OPTIONAL: Link existing auth user to students
-- Replace THE_AUTH_USER_ID with UUID from Auth > Users if you want a demo student now
-- Otherwise, use the Admin API to create a user and the trigger will insert students row.
-- ================================================
-- INSERT INTO students (
-- 	id, college_id, student_id, first_name, last_name, email, phone, department, year_of_study, profile_image
-- )
-- SELECT 'THE_AUTH_USER_ID'::uuid, c.id, 'MVJCE2021CS001', 'Demo', 'Student', 'student@mvjce.edu.in', '+91-9876543210', 'Computer Science', 3, NULL
-- FROM colleges c WHERE c.code = 'MVJCE'
-- ON CONFLICT (id) DO NOTHING;
