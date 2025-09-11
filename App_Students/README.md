# Campus Event Management App - Student Mobile Application

**Author:** Sujan J (1MJ21IS106)  
**Project:** Campus Event Management Platform - Mobile App  
**Tech Stack:** React Native, Expo, TypeScript, Supabase  

---

## 📱 About This Project

Hey! This is my mobile app for the Campus Event Management Platform. I built this using React Native with Expo framework. The app allows students to browse events, register for them, check attendance, and give feedback. It's part of a bigger project that includes a web portal for teachers/admins.

I had some issues with the database connections initially (typical developer problems 😅) but managed to fix most of them. The app now connects to Supabase for backend services.

## 🚀 Features Implemented

### ✅ What's Working:
- **Authentication System** - Students can sign up and login
- **Event Browsing** - View featured and upcoming events
- **Event Categories** - Different types like hackathons, workshops, etc.
- **User Profile** - Basic profile management
- **Navigation** - Tab-based navigation with 5 main screens
- **Responsive Design** - Works on different screen sizes


## 🛠️ Tech Stack Used

### Frontend:
- **React Native 0.79.1** - Main framework
- **Expo SDK 53** - Development platform
- **TypeScript** - For type safety (still learning this properly)
- **React Navigation** - For navigation between screens
- **Lucide React Native** - For icons

### Backend & Database:
- **Supabase** - Backend as a Service
- **PostgreSQL** - Database (managed by Supabase)
- **Row Level Security** - For data protection

### State Management:
- **React Hooks** - useState, useEffect, useCallback, useMemo
- **Custom Hooks** - useAuth for authentication state

## 📁 Project Structure

```
App_Students/
├── app/                          # Main app screens (Expo Router)
│   ├── (tabs)/                   # Tab navigation screens
│   │   ├── index.tsx            # Home screen
│   │   ├── explore.tsx          # Explore events
│   │   ├── myevents.tsx         # My registered events
│   │   ├── notifications.tsx    # Notifications
│   │   └── profile.tsx          # User profile
│   ├── signin.tsx               # Login screen
│   ├── signup.tsx               # Registration screen
│   └── _layout.tsx              # Root layout
├── components/                   # Reusable components
│   └── ui/                      # UI components
│       ├── Button.tsx           # Custom button component
│       ├── EventCard.tsx        # Event display card
│       ├── ThemedText.tsx       # Themed text component
│       └── ThemedView.tsx       # Themed view component
├── constants/                    # App constants
│   ├── Colors.ts                # Color palette
│   └── Layout.ts                # Layout constants
├── hooks/                        # Custom React hooks
│   └── useAuth.ts               # Authentication hook
├── lib/                          # External library configs
│   └── supabase.ts              # Supabase client setup
├── services/                     # API services
│   └── api.ts                   # API service functions
├── types/                        # TypeScript type definitions
│   └── shared.ts                # Shared types
└── assets/                       # Images and static files
```

## 🔧 Installation & Setup

### Prerequisites:
- Node.js (I used v18)
- Expo CLI
- Android Studio or Xcode (for device testing)


## 🎨 Key Components Explained

### 1. Home Screen (`app/(tabs)/index.tsx`)
This is the main screen where students land after login. It shows:
- Welcome message with user's name
- Quick stats (registered events, attended, ratings)
- Featured events carousel
- Event categories grid
- Upcoming events list

**Challenges I faced:**
- Had trouble with the FlatList performance initially
- Event loading was slow, added useCallback and useMemo to optimize
- Still working on the pull-to-refresh functionality

### 2. Authentication (`hooks/useAuth.ts`)
Handles user login/logout and profile management. Uses Supabase Auth.

**What I learned:**
- Supabase auth is pretty straightforward
- Had to handle async operations properly
- Error handling is crucial for good UX

### 3. API Service (`services/api.ts`)
Contains all the API calls to Supabase. I tried to make it modular and reusable.

**Issues I encountered:**
- Column name mismatches between my code and database schema
- Had to fix foreign key references (event_id vs eventId)
- Still debugging some of the attendance and feedback APIs

### 4. Event Card Component (`components/ui/EventCard.tsx`)
Reusable component for displaying events. Shows event details, registration status, etc.

## 🐛 Known Issues & Bugs

1. **Event Registration**: Sometimes the registration doesn't update immediately
2. **Image Loading**: Profile images and event images sometimes don't load
3. **Offline Support**: App crashes when there's no internet connection
4. **Performance**: Some screens are a bit slow on older devices
5. **Error Messages**: Some error messages are not user-friendly

## 🔮 Future Improvements

### Short Term:
- Fix the remaining bugs
- Add better loading states
- Implement proper error boundaries
- Add form validation

### Long Term:
- Push notifications for event updates
- Offline mode with local storage
- Social features (event sharing, comments)
- Advanced search and filtering
- Dark mode support
- Multi-language support

## 📊 Performance Optimizations Applied

I tried to optimize the app performance by:

1. **React.memo and useMemo**: Used for expensive calculations
2. **useCallback**: For event handlers to prevent unnecessary re-renders
3. **Lazy Loading**: For images and heavy components
4. **Debounced Search**: For search functionality
5. **Proper State Management**: Avoiding unnecessary state updates

## 🎯 Learning Outcomes

This project helped me learn:
- React Native development with Expo
- TypeScript (still learning, made some mistakes)
- Supabase integration
- Mobile app architecture
- State management patterns
- Performance optimization techniques
- Error handling in mobile apps


## 📞 Contact

**Sujan J**  
**USN:** 1MJ21IS106  

---

## 📝 Development Notes

### Database Schema Issues:
I had to fix several column name mismatches:
- `eventId` → `event_id`
- `userId` → `student_id`
- `checkInTime` → `check_in_time`

### Supabase Configuration:
The app connects to Supabase using the credentials in `app.json`.
### Build Issues:
Sometimes the app doesn't build properly. Try:
- Clear Expo cache: `expo r -c`
- Delete node_modules and reinstall
- Check for TypeScript errors

---

