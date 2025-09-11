// Shared configuration between WebPortal and App_Students

export const config = {
  // Supabase Configuration
  supabase: {
    url: 'https://dgovpaystazgcomafwji.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRnb3ZwYXlzdGF6Z2NvbWFmd2ppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0MTg5NjgsImV4cCI6MjA3Mjk5NDk2OH0.datNaTmkHgaQdwdvqDomnnei1eYivyagHtKW32PZEZA',
  },

  // API Configuration
  api: {
    baseUrl: 'http://localhost:3000',
    timeout: 10000,
  },

  // App Configuration
  app: {
    name: 'Event Management System',
    version: '1.0.0',
    description: 'A comprehensive event management system for colleges',
  },

  // Feature Flags
  features: {
    enableNotifications: true,
    enableQRCode: true,
    enableFeedback: true,
    enableAttendance: true,
  },

  // Pagination
  pagination: {
    defaultLimit: 10,
    maxLimit: 100,
  },

  // Date/Time Configuration
  dateTime: {
    format: 'YYYY-MM-DD HH:mm:ss',
    timezone: 'UTC',
  },

  // File Upload Configuration
  upload: {
    maxFileSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif'],
  },
};

export default config;
