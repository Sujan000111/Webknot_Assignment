# Event Management System - Integration Setup

This document provides instructions for setting up the integration between the WebPortal and App_Students applications with Supabase.

## Prerequisites

1. **Supabase Account**: Create a free account at [supabase.com](https://supabase.com)
2. **Node.js**: Version 18 or higher
3. **npm** or **yarn**: Package manager

## Setup Instructions

### 1. Supabase Setup

1. Create a new project in Supabase
2. Go to Settings > API to get your project URL and anon key
3. Run the SQL script from `Backend/main.sql` in the Supabase SQL editor to create the database schema

### 2. WebPortal Configuration

1. Navigate to the WebPortal directory:
   ```bash
   cd WebPortal
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the WebPortal directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_url_here
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   VITE_API_BASE_URL=http://localhost:3000
   ```

4. Update `src/config/supabase.ts` with your actual Supabase credentials:
   ```typescript
   export const supabaseConfig = {
     url: 'your_supabase_url_here',
     anonKey: 'your_supabase_anon_key_here',
   };
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

### 3. App_Students Configuration

1. Navigate to the App_Students directory:
   ```bash
   cd App_Students
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Update `app.json` with your Supabase credentials:
   ```json
   {
     "expo": {
       "extra": {
         "supabaseUrl": "your_supabase_url_here",
         "supabaseAnonKey": "your_supabase_anon_key_here"
       }
     }
   }
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

### 4. Database Schema

The database schema includes the following tables:

- **users**: Student and admin user profiles
- **events**: Event information and details
- **registrations**: Event registrations and status
- **colleges**: College information
- **attendance**: Event attendance tracking
- **feedback**: Event feedback and ratings

### 5. Shared Types

Both applications use shared TypeScript types located in:
- `shared-types/index.ts` - Main shared types
- `WebPortal/src/types/shared.ts` - WebPortal copy
- `App_Students/types/shared.ts` - App_Students copy

### 6. API Services

Both applications have API service classes:
- `WebPortal/src/services/api.ts` - WebPortal API service
- `App_Students/services/api.ts` - App_Students API service

### 7. Authentication

Both applications use the same authentication system:
- `WebPortal/src/hooks/useAuth.ts` - WebPortal auth hook
- `App_Students/hooks/useAuth.ts` - App_Students auth hook

## Features

### WebPortal Features
- Admin dashboard for managing events
- User management
- Event creation and editing
- Registration management
- Attendance tracking
- Reports and analytics

### App_Students Features
- Student event browsing
- Event registration
- Check-in/check-out functionality
- Event feedback submission
- Profile management
- My events view

## Development

### Running Both Applications

1. **Terminal 1 - WebPortal**:
   ```bash
   cd WebPortal
   npm run dev
   ```

2. **Terminal 2 - App_Students**:
   ```bash
   cd App_Students
   npm run dev
   ```

### Testing the Integration

1. Create a user account in either application
2. The user should be able to log in to both applications
3. Events created in WebPortal should appear in App_Students
4. Registrations made in App_Students should be visible in WebPortal

## Troubleshooting

### Common Issues

1. **Supabase Connection Error**:
   - Verify your Supabase URL and anon key
   - Check if your Supabase project is active
   - Ensure the database schema is properly set up

2. **Authentication Issues**:
   - Clear browser/app cache
   - Check if RLS (Row Level Security) policies are set up correctly
   - Verify user permissions in Supabase

3. **Type Errors**:
   - Ensure shared types are copied to both applications
   - Run `npm install` in both directories
   - Check TypeScript configuration

### Support

For issues or questions, please check:
1. Supabase documentation
2. Expo documentation for App_Students
3. Vite documentation for WebPortal

## Security Notes

- Never commit your actual Supabase credentials to version control
- Use environment variables for sensitive configuration
- Set up proper RLS policies in Supabase
- Regularly update dependencies for security patches
