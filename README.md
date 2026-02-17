# Meetly - Social Connection Platform

A modern, responsive web application for people living in Germany (especially immigrants and newcomers) to meet others through spontaneous real-life activities.

## Overview

Meetly is a swipe-based social connection platform that helps people discover and join local activities like coffee meetups, walks, study sessions, gym workouts, and city exploration. The app features a clean European startup design with multilingual support (English, German, Arabic).

## Features

### Core Functionality
- **Landing Page**: Hero section with value proposition, how it works, features, and testimonials
- **Authentication**: Login/Register with social login options (Google, Apple)
- **Profile Setup**: Multi-step onboarding flow for name, bio, city, languages, and photo
- **Event Discovery**: 
  - Swipe-based interface (Tinder-style) for browsing events
  - Grid view alternative
  - Advanced filtering by distance, category, language, and time
- **Event Details**: Full event information with map preview and participant list
- **Join Requests**: Event organizers can accept/reject join requests
- **Group Chat**: WhatsApp-style messaging for event participants
- **User Profiles**: View profiles with event history
- **Create Events**: Form to create new activities with all details

### Design Features
- **Multilingual**: Full support for English, German, and Arabic
- **Responsive**: Mobile-first design that works on all screen sizes
- **Modern UI**: Clean, minimal design with soft rounded cards and subtle shadows
- **Accessible**: Proper semantic HTML and ARIA labels
- **Design System**: Complete component library documented on `/design-system` page

## Tech Stack

- **Frontend**: React 18.3.1
- **Routing**: React Router 7.13.0 (Data mode)
- **Styling**: Tailwind CSS 4.1.12
- **UI Components**: Radix UI primitives
- **Animations**: Motion (Framer Motion) 12.23.24
- **Swipe Cards**: react-tinder-card 1.6.4
- **Icons**: Lucide React
- **Build Tool**: Vite 6.3.5

## Project Structure

```
src/
├── app/
│   ├── components/
│   │   ├── ui/              # Radix UI components
│   │   ├── EventCard.tsx    # Reusable event card component
│   │   └── LanguageSelector.tsx
│   ├── contexts/
│   │   └── LanguageContext.tsx  # Language management
│   ├── pages/
│   │   ├── Landing.tsx
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   ├── ProfileSetup.tsx
│   │   ├── Home.tsx         # Main discover/swipe page
│   │   ├── EventDetails.tsx
│   │   ├── JoinRequests.tsx
│   │   ├── Chat.tsx
│   │   ├── Profile.tsx
│   │   ├── CreateEvent.tsx
│   │   └── DesignSystem.tsx
│   ├── utils/
│   │   ├── mockData.ts      # Sample data
│   │   └── translations.ts   # i18n strings
│   ├── routes.ts            # Route configuration
│   └── App.tsx
└── styles/
    ├── theme.css            # Design tokens
    ├── custom.css           # Custom styles
    └── index.css
```

## Routes

- `/` - Landing page
- `/login` - Login page
- `/register` - Registration page
- `/profile-setup` - Profile creation flow
- `/home` - Main event discovery page (swipe/grid view)
- `/event/:id` - Event details
- `/event/:id/requests` - Join request management
- `/event/:id/chat` - Event group chat
- `/profile/:id?` - User profile (own or others)
- `/create-event` - Create new event
- `/design-system` - Component library showcase

## Design System

### Colors
- **Primary**: #0ea5e9 (Calm blue/teal)
- **Accent**: #e0f2fe (Light blue)
- **Background**: #fafbfc (Off-white)
- **Muted**: #ececf0 (Light gray)

### Components
- Buttons (default, outline, ghost, destructive)
- Cards with hover effects
- Badges for categories and languages
- Form inputs and textareas
- Avatars with fallbacks
- Modal dialogs and sheets
- Swipeable cards

### Category Colors
- Coffee: Amber
- Walk: Green
- Study: Purple
- Gym: Red
- Explore: Blue

## Mock Data

The application currently uses mock data for:
- Users (5 sample profiles)
- Events (5 sample events across different categories)
- Join requests
- Chat messages

All data is defined in `/src/app/utils/mockData.ts`

## Language Support

The app supports three languages:
- English (en)
- German (de)
- Arabic (ar)

Translations are managed via React Context and can be switched using the globe icon in the header.

## Key Features Implementation

### Swipe Functionality
Uses `react-tinder-card` for smooth card swiping:
- Swipe right to join an event
- Swipe left to pass
- Cards animate out after swipe
- Fallback to empty state when no more events

### Filters
- Category (coffee, walk, study, gym, explore, other)
- Distance (1-50 km slider)
- Language (all languages or specific)

### Responsive Design
- Mobile-first approach
- Desktop: Split layouts, multi-column grids
- Mobile: Single column, bottom navigation
- Tablet: Optimized layouts for medium screens

## Future Enhancements (Backend Integration)

Currently, the app is a frontend prototype with mock data. For production:

1. **Database**: Store users, events, join requests, messages
2. **Authentication**: Real OAuth integration with Google/Apple
3. **Geolocation**: Calculate real distances using user location
4. **Real-time Chat**: WebSocket connection for live messaging
5. **Image Upload**: Profile photos and event images
6. **Notifications**: Push notifications for join requests and messages
7. **Map Integration**: Google Maps or Mapbox for location selection
8. **Search**: Full-text search for events

## Getting Started

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Build for production
pnpm build
```

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Accessibility

- Semantic HTML structure
- ARIA labels where needed
- Keyboard navigation support
- Focus indicators
- Color contrast ratios meet WCAG guidelines

## License

This is a prototype/MVP application designed for demonstration purposes.

---

Built with ❤️ for the German community
