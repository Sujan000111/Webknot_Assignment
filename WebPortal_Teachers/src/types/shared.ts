// Shared types between WebPortal and App_Students

export interface User {
  id: string;
  email: string;
  studentId: string;
  firstName: string;
  lastName: string;
  college: string;
  department: string;
  yearOfStudy: number;
  phone?: string;
  profileImage?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  type: EventType;
  startDate: string;
  endDate: string;
  venue: string;
  capacity: number;
  registeredCount: number;
  imageUrl?: string;
  organizer: string;
  isFeatured: boolean;
  isRegistered?: boolean;
  rating?: number;
  reviewCount?: number;
  price?: number;
  prerequisites?: string[];
  whatIncluded?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export type EventType = 
  | 'hackathon'
  | 'workshop'
  | 'techTalk'
  | 'seminar'
  | 'fest'
  | 'competition';

export interface Registration {
  id: string;
  eventId: string;
  userId: string;
  registrationDate: string;
  status: 'confirmed' | 'waitlisted' | 'cancelled';
  checkInDate?: string;
  feedbackGiven?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface College {
  id: string;
  name: string;
  domain: string;
  logoUrl?: string;
  location: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Attendance {
  id: string;
  eventId: string;
  userId: string;
  checkInTime: string;
  checkOutTime?: string;
  status: 'present' | 'absent' | 'late';
  createdAt?: string;
  updatedAt?: string;
}

export interface Feedback {
  id: string;
  eventId: string;
  userId: string;
  rating: number;
  comment?: string;
  createdAt?: string;
  updatedAt?: string;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// Database table types for Supabase
export interface Database {
  public: {
    Tables: {
      users: {
        Row: User;
        Insert: Omit<User, 'id' | 'createdAt' | 'updatedAt'>;
        Update: Partial<Omit<User, 'id' | 'createdAt' | 'updatedAt'>>;
      };
      events: {
        Row: Event;
        Insert: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>;
        Update: Partial<Omit<Event, 'id' | 'createdAt' | 'updatedAt'>>;
      };
      registrations: {
        Row: Registration;
        Insert: Omit<Registration, 'id' | 'createdAt' | 'updatedAt'>;
        Update: Partial<Omit<Registration, 'id' | 'createdAt' | 'updatedAt'>>;
      };
      colleges: {
        Row: College;
        Insert: Omit<College, 'id' | 'createdAt' | 'updatedAt'>;
        Update: Partial<Omit<College, 'id' | 'createdAt' | 'updatedAt'>>;
      };
      attendance: {
        Row: Attendance;
        Insert: Omit<Attendance, 'id' | 'createdAt' | 'updatedAt'>;
        Update: Partial<Omit<Attendance, 'id' | 'createdAt' | 'updatedAt'>>;
      };
      feedback: {
        Row: Feedback;
        Insert: Omit<Feedback, 'id' | 'createdAt' | 'updatedAt'>;
        Update: Partial<Omit<Feedback, 'id' | 'createdAt' | 'updatedAt'>>;
      };
    };
  };
}
