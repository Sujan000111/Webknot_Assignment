import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';
import { User as AppUser } from '../types/shared';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase?.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchAppUser(session.user.id);
      } else {
        setAppUser(null);
        setLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase?.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchAppUser(session.user.id);
      } else {
        setAppUser(null);
        setLoading(false);
      }
    }) || { data: { subscription: null } };

    return () => subscription?.unsubscribe();
  }, []);

  const fetchAppUser = async (userId: string) => {
    if (!supabase) return;
    
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching app user:', error);
        setAppUser(null);
      } else {
        setAppUser(data);
      }
    } catch (error) {
      console.error('Error fetching app user:', error);
      setAppUser(null);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    if (!supabase) throw new Error('Supabase not initialized');
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  };

  const signUp = async (email: string, password: string, userData: any) => {
    if (!supabase) throw new Error('Supabase not initialized');
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: userData.first_name,
          last_name: userData.last_name,
          student_id: userData.student_id,
        }
      }
    });

    if (error) throw error;

    // Try to create profile if session exists (email confirmation disabled)
    // and as a fallback, poll for trigger-created profile
    if (data.user) {
      const userId = data.user.id;

      // Attempt insert (allowed by RLS: insert own row)
      const { data: sessionResp } = await supabase.auth.getSession();
      if (sessionResp?.session) {
        await supabase
          .from('students')
          .insert({
            id: userId,
            email: data.user.email!,
            first_name: userData.first_name,
            last_name: userData.last_name,
            student_id: userData.student_id,
            phone: userData.phone,
            department: userData.department,
            year_of_study: userData.year_of_study,
            college_id: userData.college_id ?? null,
          })
          .maybeSingle();
      }

      // Poll for existence regardless (covers trigger path)
      const maxAttempts = 10;
      const delayMs = 300;
      for (let attempt = 0; attempt < maxAttempts; attempt++) {
        const { data: profile } = await supabase
          .from('students')
          .select('*')
          .eq('id', userId)
          .maybeSingle();
        if (profile) break;
        await new Promise((res) => setTimeout(res, delayMs));
      }
    }

    return data;
  };

  const signOut = async () => {
    if (!supabase) throw new Error('Supabase not initialized');
    
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return {
    user,
    appUser,
    loading,
    signIn,
    signUp,
    signOut,
  };
}
