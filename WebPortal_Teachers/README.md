# Campus Event Management Portal - Teacher/Admin Web Application

**Author:** Sujan J (1MJ21IS106)  
**Project:** Campus Event Management Platform - Web Portal  
**Tech Stack:** React, TypeScript, Vite, Tailwind CSS, Supabase  

---

## 🖥️ About This Project

Hey! This is the web portal for teachers and administrators to manage the campus event management system. I built this using React with Vite, TypeScript, and Tailwind CSS. The portal allows admins to manage students, events, attendance, and generate reports.

I had some challenges with the database connections and student loading initially, but I've added debugging tools to help identify and fix issues.

## 🚀 Features Implemented

### ✅ What's Working:
- **Student Management** - View, add, and manage student records
- **Event Management** - Create and manage campus events
- **Dashboard** - Overview of system statistics
- **Reports** - Generate various reports
- **College Management** - Manage college information
- **Responsive Design** - Works on desktop and mobile
- **Authentication** - Admin login system

### 🔧 What I'm Still Working On:
- Real-time notifications
- Advanced reporting features
- Bulk student import/export
- Email notifications
- Advanced search and filtering

## 🛠️ Tech Stack Used

### Frontend:
- **React 18.3.1** - Main framework
- **TypeScript** - For type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling framework
- **Radix UI** - Component library
- **React Router** - Navigation
- **React Query** - Data fetching and caching

### Backend & Database:
- **Supabase** - Backend as a Service
- **PostgreSQL** - Database (managed by Supabase)
- **Row Level Security** - For data protection

### State Management:
- **React Query** - Server state management
- **React Hooks** - Local state management
- **Custom Hooks** - useAuth for authentication

## 📁 Project Structure

```
WebPortal_Teachers/
├── src/
│   ├── components/                 # Reusable components
│   │   ├── ui/                    # UI components (shadcn/ui)
│   │   ├── Header.tsx             # App header
│   │   ├── Sidebar.tsx            # Navigation sidebar
│   │   ├── Layout.tsx             # Main layout wrapper
│   │   └── ErrorBoundary.tsx      # Error handling
│   ├── pages/                     # Page components
│   │   ├── Dashboard.tsx          # Main dashboard
│   │   ├── Students.tsx           # Student management
│   │   ├── Events.tsx             # Event management
│   │   ├── Reports.tsx            # Reports page
│   │   ├── Colleges.tsx           # College management
│   │   └── Settings.tsx           # Settings page
│   ├── hooks/                     # Custom React hooks
│   │   └── useAuth.ts             # Authentication hook
│   ├── lib/                       # External library configs
│   │   └── supabase.ts            # Supabase client setup
│   ├── services/                  # API services
│   │   └── api.ts                 # API service functions
│   ├── types/                     # TypeScript type definitions
│   │   └── shared.ts              # Shared types
│   ├── utils/                     # Utility functions
│   │   └── testSupabase.ts        # Supabase testing utilities
│   ├── config/                    # Configuration files
│   │   └── supabase.ts            # Supabase configuration
│   └── App.tsx                    # Main app component
├── public/                        # Static assets
└── package.json                   # Dependencies and scripts
```

## 🔧 Installation & Setup

### Prerequisites:
- Node.js (I used v18)
- npm or yarn
- Supabase account

### Steps:
1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd WebPortal_Teachers
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Supabase**
   - Update `src/config/supabase.ts` with your Supabase credentials
   - Or set environment variables:
     ```bash
     VITE_SUPABASE_URL=your_supabase_url
     VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
     ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   - Navigate to `http://localhost:5173`

## 🎨 Key Components Explained

### 1. Students Page (`src/pages/Students.tsx`)
This is where admins manage student records. It includes:
- Student listing with search functionality
- Add new student form
- Student statistics
- Debug tools for troubleshooting

**Challenges I faced:**
- Students not loading initially due to database connection issues
- Added comprehensive error handling and debugging tools
- Implemented proper loading states and retry mechanisms

### 2. Authentication (`src/hooks/useAuth.ts`)
Handles admin login/logout and profile management. Uses Supabase Auth.

**What I learned:**
- Supabase auth integration with React
- Proper error handling for authentication
- Session management and persistence

### 3. API Service (`src/services/api.ts`)
Contains all the API calls to Supabase. Organized by entity type.

**Issues I encountered:**
- Column name mismatches between code and database
- Had to fix foreign key references
- Implemented proper error handling and retry logic

### 4. Dashboard (`src/pages/Dashboard.tsx`)
Main overview page showing system statistics and recent activity.

## 🐛 Known Issues & Solutions

### Students Not Loading:
If students are not loading, try these steps:

1. **Check Supabase Connection:**
   - Use the "Test Connection" button in the debug panel
   - Verify your Supabase credentials are correct

2. **Add Sample Data:**
   - Use the "Add Sample Data" button to create test students
   - This helps verify the database connection is working

3. **Check Browser Console:**
   - Open developer tools and check for error messages
   - Look for Supabase connection errors

4. **Verify Database Schema:**
   - Ensure the `students` table exists in your Supabase database
   - Check that RLS policies allow reading from the students table

### Common Issues:
1. **Supabase Connection Failed**: Check credentials and network connection
2. **Permission Denied**: Verify RLS policies in Supabase
3. **Table Not Found**: Ensure database schema is properly set up
4. **CORS Issues**: Check Supabase project settings

## 🔮 Future Improvements

### Short Term:
- Fix remaining database connection issues
- Add better error handling throughout the app
- Implement proper loading states
- Add form validation

### Long Term:
- Real-time updates with Supabase subscriptions
- Advanced reporting and analytics
- Bulk operations for student management
- Email notifications
- Advanced search and filtering
- Dark mode support

## 📊 Performance Optimizations Applied

I tried to optimize the app performance by:

1. **React Query Caching**: Implemented proper caching strategies
2. **Lazy Loading**: For heavy components and data
3. **Error Boundaries**: To prevent app crashes
4. **Proper State Management**: Avoiding unnecessary re-renders
5. **Debounced Search**: For search functionality

## 🎯 Learning Outcomes

This project helped me learn:
- React development with TypeScript
- Supabase integration and database management
- Modern React patterns (hooks, context, etc.)
- Error handling and debugging techniques
- Performance optimization strategies
- Web application architecture

## 🤝 Contributing

This is a student project, but if you want to contribute:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Contact

**Sujan J**  
**USN:** 1MJ21IS106  
**Email:** sujan.j@student.mvjce.edu.in  

---

## 📝 Development Notes

### Database Schema:
The app expects these main tables:
- `students` - Student information
- `events` - Event details
- `registrations` - Event registrations
- `colleges` - College information
- `admin_profiles` - Admin user profiles

### Supabase Configuration:
Make sure to:
1. Set up your Supabase project
2. Configure RLS policies
3. Update the configuration file with your credentials
4. Test the connection using the debug tools

### Build Issues:
If you encounter build issues:
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Check TypeScript errors: `npm run lint`
- Verify all dependencies are installed correctly

---

*This README was written by a student developer who's still learning. Please excuse any mistakes or incomplete information! 😅*
