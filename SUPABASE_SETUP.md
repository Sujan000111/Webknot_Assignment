# Supabase Setup Guide

## Current Status
The App_Students application is now running with placeholder Supabase configuration. The app will show empty states until you configure your actual Supabase credentials.

## Setup Instructions

### 1. Create a Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Sign up or log in to your account
3. Click "New Project"
4. Choose your organization
5. Enter project details:
   - **Name**: `event-management-system`
   - **Database Password**: Choose a strong password
   - **Region**: Choose the closest region to your users
6. Click "Create new project"

### 2. Get Your Supabase Credentials
1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (looks like: `https://your-project-id.supabase.co`)
   - **anon public** key (starts with `eyJ...`)

### 3. Configure App_Students
Update the `App_Students/app.json` file:

```json
{
  "expo": {
    "extra": {
      "supabaseUrl": "https://your-project-id.supabase.co",
      "supabaseAnonKey": "your-anon-key-here"
    }
  }
}
```

### 4. Configure WebPortal
Create a `.env` file in the `WebPortal` directory:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 5. Set Up Database Schema
1. In your Supabase project, go to **SQL Editor**
2. Copy the contents of `Backend/main.sql`
3. Paste and run the SQL script to create all tables

### 6. Test the Connection
1. Restart both applications
2. The apps should now connect to your Supabase database
3. You can create events in WebPortal and see them in App_Students

## Troubleshooting

### "Invalid supabaseUrl" Error
- Make sure your URL starts with `https://`
- Ensure the URL doesn't contain `placeholder`
- Check that the URL is exactly as shown in your Supabase dashboard

### "Supabase not initialized" Warnings
- Verify your credentials are correctly set in `app.json`
- Make sure you've restarted the app after updating configuration
- Check the console for any connection errors

### Empty Data
- Ensure the database schema has been created
- Check that you have data in your tables
- Verify Row Level Security (RLS) policies are set up correctly

## Security Notes
- Never commit your actual Supabase credentials to version control
- Use environment variables for production deployments
- Set up proper RLS policies in Supabase for data security

## Next Steps
Once configured, you can:
1. Create events in the WebPortal
2. Register for events in App_Students
3. Manage user profiles and attendance
4. View analytics and reports

The integration is now complete and ready for use! 🎉
