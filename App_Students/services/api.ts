import { supabase } from '../lib/supabase';
import { 
  User, 
  Event, 
  Registration, 
  College, 
  Attendance, 
  Feedback,
  ApiResponse,
  PaginatedResponse 
} from '../types/shared';

// Utility function to map database columns to our interface
const mapEventFromDB = (dbEvent: any): Event => ({
  id: dbEvent.id,
  title: dbEvent.title,
  description: dbEvent.description,
  type: dbEvent.event_type_id || 'workshop', // Map event type ID to type
  startDate: dbEvent.start_date,
  endDate: dbEvent.end_date,
  venue: dbEvent.venue_id || 'TBD', // Map venue ID to venue name
  capacity: dbEvent.max_capacity,
  registeredCount: dbEvent.current_registrations,
  imageUrl: dbEvent.image_url,
  organizer: 'Event Organizer', // This would need to be joined from admin_profiles
  isFeatured: dbEvent.is_featured,
  createdAt: dbEvent.created_at,
  updatedAt: dbEvent.updated_at,
});

const mapUserFromDB = (dbUser: any): User => ({
  id: dbUser.id,
  email: dbUser.email,
  studentId: dbUser.student_id,
  firstName: dbUser.first_name,
  lastName: dbUser.last_name,
  college: dbUser.college_id || 'Unknown College', // Map college ID to name
  department: dbUser.department,
  yearOfStudy: dbUser.year_of_study,
  phone: dbUser.phone,
  profileImage: dbUser.profile_image,
  createdAt: dbUser.created_at,
  updatedAt: dbUser.updated_at,
});

export class ApiService {
  // User operations
  static async getCurrentUser(): Promise<User | null> {
    if (!supabase) {
      console.warn('Supabase not initialized - returning null user');
      return null;
    }
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) return null;
    return mapUserFromDB(data);
  }

  static async updateProfile(updates: Partial<User>): Promise<User> {
    if (!supabase) throw new Error('Supabase not initialized. Please configure your Supabase credentials.');
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('students')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();

    if (error) throw error;
    return mapUserFromDB(data);
  }

  // Event operations
  static async getEvents(page = 1, limit = 10): Promise<PaginatedResponse<Event>> {
    if (!supabase) {
      console.warn('Supabase not initialized - returning empty events');
      return {
        data: [],
        total: 0,
        page,
        limit,
        hasMore: false
      };
    }
    
    const { data, error, count } = await supabase
      .from('events')
      .select('*', { count: 'exact' })
      .range((page - 1) * limit, page * limit - 1)
      .order('start_date', { ascending: true });

    if (error) throw error;

    return {
      data: (data || []).map(mapEventFromDB),
      total: count || 0,
      page,
      limit,
      hasMore: (count || 0) > page * limit
    };
  }

  static async getEventById(id: string): Promise<Event> {
    if (!supabase) throw new Error('Supabase not initialized');
    
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return mapEventFromDB(data);
  }

  static async getMyEvents(): Promise<Event[]> {
    if (!supabase) {
      console.warn('Supabase not initialized - returning empty events');
      return [];
    }
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('registrations')
      .select(`
        *,
        events (*)
      `)
      .eq('student_id', user.id)
      .eq('status', 'confirmed');

    if (error) throw error;
    return (data || [])
      .map(reg => reg.events)
      .filter(Boolean)
      .map(mapEventFromDB);
  }

  // Registration operations
  static async registerForEvent(eventId: string): Promise<Registration> {
    if (!supabase) throw new Error('Supabase not initialized');
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Check if already registered
    const { data: existing } = await supabase
      .from('registrations')
      .select('*')
      .eq('event_id', eventId)
      .eq('student_id', user.id)
      .single();

    if (existing) {
      throw new Error('Already registered for this event');
    }

    // Check event capacity
    const { data: event } = await supabase
      .from('events')
      .select('max_capacity, current_registrations')
      .eq('id', eventId)
      .single();

    if (!event) throw new Error('Event not found');

    const status = event.current_registrations < event.max_capacity ? 'confirmed' : 'waitlisted';

    const { data, error } = await supabase
      .from('registrations')
      .insert({
        event_id: eventId,
        student_id: user.id,
        registration_date: new Date().toISOString(),
        status
      })
      .select()
      .single();

    if (error) throw error;

    // Update event registered count
    await supabase
      .from('events')
      .update({ current_registrations: event.current_registrations + 1 })
      .eq('id', eventId);

    return data;
  }

  static async cancelRegistration(eventId: string): Promise<void> {
    if (!supabase) throw new Error('Supabase not initialized');
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('registrations')
      .update({ status: 'cancelled' })
      .eq('event_id', eventId)
      .eq('student_id', user.id);

    if (error) throw error;

    // Update event registered count
    const { data: event } = await supabase
      .from('events')
      .select('current_registrations')
      .eq('id', eventId)
      .single();

    if (event) {
      await supabase
        .from('events')
        .update({ current_registrations: Math.max(0, event.current_registrations - 1) })
        .eq('id', eventId);
    }
  }

  static async getMyRegistrations(): Promise<Registration[]> {
    if (!supabase) {
      console.warn('Supabase not initialized - returning empty registrations');
      return [];
    }
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('registrations')
      .select('*')
      .eq('student_id', user.id)
      .order('registration_date', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // Attendance operations
  static async checkIn(eventId: string): Promise<Attendance> {
    if (!supabase) throw new Error('Supabase not initialized');
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Check if already checked in
    const { data: existing } = await supabase
      .from('attendance')
      .select('*')
      .eq('event_id', eventId)
      .eq('student_id', user.id)
      .single();

    if (existing) {
      throw new Error('Already checked in for this event');
    }

    const { data, error } = await supabase
      .from('attendance')
      .insert({
        event_id: eventId,
        student_id: user.id,
        check_in_time: new Date().toISOString(),
        status: 'present'
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async checkOut(eventId: string): Promise<Attendance> {
    if (!supabase) throw new Error('Supabase not initialized');
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('attendance')
      .update({ 
        check_out_time: new Date().toISOString() 
      })
      .eq('event_id', eventId)
      .eq('student_id', user.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Feedback operations
  static async submitFeedback(eventId: string, rating: number, comment?: string): Promise<Feedback> {
    if (!supabase) throw new Error('Supabase not initialized');
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Check if already submitted feedback
    const { data: existing } = await supabase
      .from('feedback')
      .select('*')
      .eq('event_id', eventId)
      .eq('student_id', user.id)
      .single();

    if (existing) {
      throw new Error('Feedback already submitted for this event');
    }

    const { data, error } = await supabase
      .from('feedback')
      .insert({
        event_id: eventId,
        student_id: user.id,
        rating,
        comment
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getEventFeedback(eventId: string): Promise<Feedback[]> {
    if (!supabase) throw new Error('Supabase not initialized');
    
    const { data, error } = await supabase
      .from('feedback')
      .select('*')
      .eq('event_id', eventId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // College operations
  static async getColleges(): Promise<College[]> {
    if (!supabase) throw new Error('Supabase not initialized');
    
    const { data, error } = await supabase
      .from('colleges')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;
    return data || [];
  }
}
