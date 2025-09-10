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
}

export interface College {
  id: string;
  name: string;
  domain: string;
  logoUrl?: string;
  location: string;
}