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

export class ApiService {
  // User operations
  static async getUsers(page = 1, limit = 10): Promise<PaginatedResponse<User>> {
    if (!supabase) throw new Error('Supabase not initialized');
    
    const { data, error, count } = await supabase
      .from('admin_profiles')
      .select('*', { count: 'exact' })
      .range((page - 1) * limit, page * limit - 1)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return {
      data: data || [],
      total: count || 0,
      page,
      limit,
      hasMore: (count || 0) > page * limit
    };
  }

  static async getUserById(id: string): Promise<User> {
    if (!supabase) throw new Error('Supabase not initialized');
    
    const { data, error } = await supabase
      .from('admin_profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  static async createUser(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    if (!supabase) throw new Error('Supabase not initialized');
    
    const { data, error } = await supabase
      .from('admin_profiles')
      .insert(user)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async updateUser(id: string, updates: Partial<User>): Promise<User> {
    if (!supabase) throw new Error('Supabase not initialized');
    
    const { data, error } = await supabase
      .from('admin_profiles')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async deleteUser(id: string): Promise<void> {
    if (!supabase) throw new Error('Supabase not initialized');
    
    const { error } = await supabase
      .from('admin_profiles')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Event operations
  static async getEvents(page = 1, limit = 10): Promise<PaginatedResponse<Event>> {
    if (!supabase) throw new Error('Supabase not initialized');
    
    const { data, error, count } = await supabase
      .from('events')
      .select('*', { count: 'exact' })
      .range((page - 1) * limit, page * limit - 1)
      .order('start_date', { ascending: true });

    if (error) throw error;

    return {
      data: data || [],
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
    return data;
  }

  static async createEvent(event: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>): Promise<Event> {
    if (!supabase) throw new Error('Supabase not initialized');
    
    const { data, error } = await supabase
      .from('events')
      .insert(event)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async updateEvent(id: string, updates: Partial<Event>): Promise<Event> {
    if (!supabase) throw new Error('Supabase not initialized');
    
    const { data, error } = await supabase
      .from('events')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async deleteEvent(id: string): Promise<void> {
    if (!supabase) throw new Error('Supabase not initialized');
    
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Registration operations
  static async getRegistrations(eventId?: string, userId?: string): Promise<Registration[]> {
    if (!supabase) throw new Error('Supabase not initialized');
    
    let query = supabase.from('registrations').select('*');
    
    if (eventId) query = query.eq('event_id', eventId);
    if (userId) query = query.eq('student_id', userId);
    
    const { data, error } = await query.order('registration_date', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async createRegistration(registration: Omit<Registration, 'id' | 'createdAt' | 'updatedAt'>): Promise<Registration> {
    if (!supabase) throw new Error('Supabase not initialized');
    
    const { data, error } = await supabase
      .from('registrations')
      .insert(registration)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async updateRegistration(id: string, updates: Partial<Registration>): Promise<Registration> {
    if (!supabase) throw new Error('Supabase not initialized');
    
    const { data, error } = await supabase
      .from('registrations')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
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

  static async createCollege(college: Omit<College, 'id' | 'createdAt' | 'updatedAt'>): Promise<College> {
    if (!supabase) throw new Error('Supabase not initialized');
    
    const { data, error } = await supabase
      .from('colleges')
      .insert(college)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Attendance operations
  static async getAttendance(eventId?: string, userId?: string): Promise<Attendance[]> {
    if (!supabase) throw new Error('Supabase not initialized');
    
    let query = supabase.from('attendance').select('*');
    
    if (eventId) query = query.eq('event_id', eventId);
    if (userId) query = query.eq('student_id', userId);
    
    const { data, error } = await query.order('check_in_time', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async createAttendance(attendance: Omit<Attendance, 'id' | 'createdAt' | 'updatedAt'>): Promise<Attendance> {
    if (!supabase) throw new Error('Supabase not initialized');
    
    const { data, error } = await supabase
      .from('attendance')
      .insert(attendance)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Feedback operations
  static async getFeedback(eventId?: string, userId?: string): Promise<Feedback[]> {
    if (!supabase) throw new Error('Supabase not initialized');
    
    let query = supabase.from('feedback').select('*');
    
    if (eventId) query = query.eq('event_id', eventId);
    if (userId) query = query.eq('student_id', userId);
    
    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async createFeedback(feedback: Omit<Feedback, 'id' | 'createdAt' | 'updatedAt'>): Promise<Feedback> {
    if (!supabase) throw new Error('Supabase not initialized');
    
    const { data, error } = await supabase
      .from('feedback')
      .insert(feedback)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}
