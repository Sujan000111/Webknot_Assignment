# Quick Setup Guide for Authentication

## 🚨 **IMPORTANT: You need to run SQL changes first!**

### Step 1: Run the Authentication Fixes SQL

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `AUTHENTICATION_FIXES.sql`
4. Click **Run** to execute the SQL

This will:
- ✅ Fix the students table to work with Supabase Auth
- ✅ Add proper Row Level Security (RLS) policies
- ✅ Create automatic student profile creation
- ✅ Add sample data (events, venues, etc.)

### Step 2: Create Demo User

1. Go to **Authentication** → **Users** in your Supabase dashboard
2. Click **Add user**
3. Create user with:
   - **Email**: `student@mvjce.edu.in`
   - **Password**: `password123`
   - **Auto Confirm User**: ✅ (checked)
   - **User Metadata** (optional):
     ```json
     {
       "first_name": "Demo",
       "last_name": "Student",
       "student_id": "MVJCE2021CS001"
     }
     ```

### Step 3: Test the App

1. Start your App_Students application:
   ```bash
   cd App_Students
   npm run dev
   ```

2. You should see the sign-in screen
3. Use the demo credentials:
   - **Email**: `student@mvjce.edu.in`
   - **Password**: `password123`

4. After signing in, you should see the home screen with sample events

## 🔧 **What the SQL Fixes Do**

### **Before (Broken)**:
- Students table had its own `id` field
- No connection between `auth.users` and `students`
- Authentication would fail

### **After (Fixed)**:
- Students table uses `auth.users.id` as primary key
- Automatic student profile creation on signup
- Proper RLS policies for security
- Sample data for testing

## 🎯 **Expected Results**

After running the SQL and creating the demo user:

1. **Sign-in screen** appears first
2. **Demo credentials** work
3. **Home screen** shows sample events
4. **Profile screen** shows student information
5. **Event registration** works
6. **Sign-out** returns to sign-in screen

## 🚨 **If Something Goes Wrong**

1. **Check Supabase logs** in the dashboard
2. **Verify RLS policies** are enabled
3. **Check that the demo user** exists in both `auth.users` and `students` tables
4. **Restart the app** after making changes

## 📱 **Testing Checklist**

- [ ] SQL fixes applied successfully
- [ ] Demo user created in Supabase Auth
- [ ] App shows sign-in screen
- [ ] Demo credentials work
- [ ] Home screen loads with events
- [ ] Profile screen shows user data
- [ ] Sign-out works
- [ ] Event registration works

The authentication flow should now work perfectly! 🎉
