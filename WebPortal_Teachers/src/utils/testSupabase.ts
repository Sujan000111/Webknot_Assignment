import { supabase } from '@/lib/supabase';

export const testSupabaseConnection = async () => {
  try {
    console.log('Testing Supabase connection...');
    
    // Test basic connection with count
    const { count, error: countError } = await supabase?.from('students').select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('Supabase count error:', countError);
      return { success: false, error: countError.message };
    }
    
    console.log('Total students in database:', count);
    
    // Test fetching actual data
    const { data, error } = await supabase?.from('students').select('*').limit(5);
    
    if (error) {
      console.error('Supabase data fetch error:', error);
      return { success: false, error: error.message };
    }
    
    console.log('Sample students data:', data);
    console.log('Supabase connection successful');
    return { success: true, data: { count, sampleData: data } };
  } catch (err) {
    console.error('Supabase test failed:', err);
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
};

export const checkDatabasePermissions = async () => {
  try {
    console.log('Checking database permissions...');
    
    // Check if we can read from students table
    const { data, error } = await supabase?.from('students').select('*').limit(1);
    
    if (error) {
      console.error('Permission error:', error);
      return { 
        success: false, 
        error: error.message,
        suggestion: error.message.includes('permission') ? 
          'Check RLS policies in Supabase dashboard' : 
          'Check table exists and has proper permissions'
      };
    }
    
    console.log('Database permissions OK');
    return { success: true, data };
  } catch (err) {
    console.error('Permission check failed:', err);
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
};

export const createSampleStudents = async () => {
  try {
    console.log('Creating sample students...');
    
    const sampleStudents = [
      {
        college_id: '550e8400-e29b-41d4-a716-446655440000', // You'll need to replace with actual college ID
        student_id: 'MVJ21IS001',
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@student.mvjce.edu.in',
        department: 'Information Science',
        year_of_study: 3,
        is_active: true
      },
      {
        college_id: '550e8400-e29b-41d4-a716-446655440000',
        student_id: 'MVJ21IS002',
        first_name: 'Jane',
        last_name: 'Smith',
        email: 'jane.smith@student.mvjce.edu.in',
        department: 'Information Science',
        year_of_study: 2,
        is_active: true
      },
      {
        college_id: '550e8400-e29b-41d4-a716-446655440000',
        student_id: 'MVJ21IS003',
        first_name: 'Bob',
        last_name: 'Johnson',
        email: 'bob.johnson@student.mvjce.edu.in',
        department: 'Computer Science',
        year_of_study: 4,
        is_active: true
      }
    ];
    
    const { data, error } = await supabase?.from('students').insert(sampleStudents).select();
    
    if (error) {
      console.error('Error creating sample students:', error);
      return { success: false, error: error.message };
    }
    
    console.log('Sample students created successfully:', data);
    return { success: true, data };
  } catch (err) {
    console.error('Failed to create sample students:', err);
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
};
