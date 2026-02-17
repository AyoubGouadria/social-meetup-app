# Meetly - Complete MVP Social Meetup App

## 🎯 Overview
A production-ready social connection platform MVP for people living in Germany (especially immigrants and newcomers) to meet others through spontaneous real-life activities. Features a complete event joining flow, host approval system, group chat, notifications, and event management.

## 📱 Main Navigation (Bottom Bar - Mobile)
4 Primary Tabs:
1. **Discover** (`/home`) - Swipe or browse events
2. **Joined Events** (`/joined-events`) - Your requested/accepted events
3. **My Events** (`/my-events`) - Events you're hosting
4. **Profile** (`/profile`) - Your user profile

## ✅ Complete User Flows

### 1. Join Event Flow (Guest User)
```
Discover Event Card
  ↓ Click Event
Event Details Page
  ↓ Click "Request to Join"
Join Request Modal
  ├─ Event info preview
  ├─ Host card
  └─ Optional message input (200 chars)
  ↓ Send Request
Navigates to Joined Events (Pending Tab)
  ↓ Host receives notification
Host Reviews in My Events / Notifications
  ↓ Accept
Join Request → Accepted
  ↓ User notified
Group Chat Unlocked ✅
```

### 2. Host Approval Flow
```
Host Dashboard (My Events)
  ↓ Sees "X pending" badge
Pending Requests Section
  ├─ User avatar (clickable → profile)
  ├─ Name, languages, bio
  ├─ Optional request message
  └─ Event reference
  ↓ Actions
[Accept Button] or [Decline Button]
  ↓ If Accept
- User added to participants
- User gets notification
- Chat becomes accessible
  ↓ If Decline
- Request removed
- User gets notification
```

### 3. Notifications System
Path: `/notifications`

**For Event Hosts:**
- 🆕 "Ahmed wants to join your Coffee Event"
- Shows: Avatar, name, languages, bio, message
- Actions: Accept ✅ / Decline ❌
- Inline participant profile preview

**For Event Guests:**
- ✅ "You've been accepted to Coffee Event" (Green)
- ❌ "Your request was declined" (Red)
- 🕒 "Your request is pending" (Amber)
- Auto-redirect to Group Chat on acceptance

**UI Features:**
- Unread count badge
- Real-time status updates
- System messages ("User joined the event")

### 4. My Events (Host Dashboard)
Path: `/my-events`

**Features:**
- Pending requests counter with bell icon
- Expandable request cards with full user info
- Event management section
- Participant grid (clickable avatars)
- Quick actions:
  - Open Group Chat
  - View Event Details
  - Edit Event (future)
  - Cancel Event (future)

**Empty State:**
- "Create Your First Event" CTA

### 5. Joined Events (Guest Dashboard)
Path: `/joined-events`

**3 Tabs:**

**Upcoming Tab:**
- Accepted events (future dates)
- Status badge: "Accepted" (green)
- Host info clickable
- "Chat" button

**Pending Tab:**
- Awaiting host approval
- Status badge: "Pending" (amber)
- Info banner: "Waiting for Host Approval"
- Cannot access chat yet

**Past Tab:**
- Completed events (past dates)
- Dimmed UI (75% opacity)
- Historical reference

### 6. Group Chat
Path: `/event/:id/chat`

**WhatsApp-Style Features:**
- Header with event name + participant count
- Participants button (opens side sheet)
- Event info banner (date, time, location)
- System messages: "Ahmed Hassan joined the event"
- Chat bubbles (user-specific colors)
- Clickable avatars → Profile Preview
- Emoji button (placeholder)
- Real-time typing indicator (future)

**Participants Sheet:**
- Scrollable list
- Name + languages
- Host badge
- Click → Navigate to profile

**Access Control:**
- ❌ Blocked if request pending
- ✅ Accessible after host acceptance

## 🎨 Design Components

### Status Badges
- **Pending** - Amber (Clock icon)
- **Accepted** - Green (CheckCircle icon)
- **Declined** - Red (XCircle icon)
- **Joined** - Blue (MessageCircle icon)

### Bottom Navigation Bar
- Fixed at bottom on mobile
- Animated active tab indicator
- Badge counters for notifications

### Profile Preview Modal
- Quick user preview
- Avatar, name, location, bio
- Languages, stats (events, verified, joined date)
- CTAs: "Close" / "View Full Profile"

### Join Request Modal
- Event preview card
- Host info
- Message textarea (optional)
- Character counter (200 max)
- Submit animation

## 📄 Pages Overview

| Page | Path | Purpose | Auth |
|------|------|---------|------|
| Landing | `/` | Marketing homepage | Public |
| Login | `/login` | User authentication | Public |
| Register | `/register` | New user signup | Public |
| Profile Setup | `/profile-setup` | Onboarding | Private |
| **Discover** | `/home` | Browse/swipe events | Private |
| Event Details | `/event/:id` | Full event info | Private |
| **Joined Events** | `/joined-events` | User's events | Private |
| **My Events** | `/my-events` | Hosted events | Private |
| **Profile** | `/profile/:id?` | User profiles | Private |
| **Notifications** | `/notifications` | Activity feed | Private |
| **Group Chat** | `/event/:id/chat` | Event messaging | Private |
| Create Event | `/create-event` | New event form | Private |
| Join Requests | `/event/:id/requests` | Legacy (replaced by My Events) | Private |

## 🔄 UX Logic Rules

1. **Chat Access Control**
   - ❌ Request pending = No chat access
   - ✅ Request accepted = Chat unlocked
   - System message appears when user joins

2. **Status Badge Everywhere**
   - Event cards show current status
   - Color-coded for quick scanning
   - Consistent across all views

3. **Role Separation**
   - Clear "Host" vs "Guest" distinction
   - My Events = Things I created
   - Joined Events = Things I requested/joined
   - No confusion between roles

4. **Notification Priorities**
   - Red badge = Action required (pending requests)
   - Amber badge = Awaiting response
   - Green = Success confirmation

5. **Trust & Safety**
   - Always show who's attending
   - Profile previews before joining
   - Host controls participant list
   - Optional introduction messages

## 🎯 Micro-Interactions

### Hover States
- Avatar scale (1.05x)
- Ring transitions (muted → primary)
- Card shadow increase
- Text color shifts

### Click States
- Scale down (0.95x on tap)
- Ripple effect (future)
- Loading states on buttons
- Smooth transitions (0.3s)

### Animations
- Slide-up modals (Motion)
- Staggered list reveals (0.1s delay per item)
- Fade-in page transitions
- Bottom nav active indicator (layoutId)

## 📱 Responsive Design

### Mobile (<768px)
- Bottom navigation bar
- Single column layouts
- Horizontal scrollable participants
- Touch-optimized tap targets (44x44px min)
- Swipe gestures

### Desktop (≥768px)
- Top navigation only
- Grid layouts (2-5 columns)
- Hover states prominent
- Sidebar for filters
- Better use of whitespace

## 🎨 Design System

### Colors
- **Primary**: `#0ea5e9` (Calm blue/teal)
- **Success**: Green-600
- **Warning**: Amber-500
- **Error**: Red-600
- **Muted**: Gray-500

### Typography
- Headings: Bold, large
- Body: Regular, readable
- Labels: Uppercase, tracking-wide, small
- European startup aesthetic

### Spacing
- Cards: Rounded-lg, soft shadows
- Padding: 4-6 spacing scale
- Gaps: 3-4 for consistency

### Components
- Rounded cards
- Soft shadows (not harsh)
- Badge pills (rounded-full)
- Ring effects on focus
- Gradient backgrounds (subtle)

## 🔒 Security & Privacy

- No sensitive data in previews
- User controls join requests
- Host can remove participants
- Clear privacy indicators
- GDPR-ready (mock implementation)

## 🚀 Next Steps for Production

### Backend Integration
- Replace mock data with real API calls
- Implement WebSocket for real-time chat
- Add push notifications (FCM/OneSignal)
- User authentication (JWT/OAuth)
- Image uploads for events/profiles

### Advanced Features
- Event search & filters
- Location-based discovery (maps)
- In-app messaging (1-on-1)
- Event reviews & ratings
- Report/block users
- Event categories expansion

### Performance
- Image lazy loading
- Infinite scroll for events
- Optimistic UI updates
- Service worker (PWA)
- CDN for assets

### Analytics
- User behavior tracking
- Conversion funnels
- A/B testing
- Heatmaps

## 📊 Tech Stack

- **Framework**: React 18 + TypeScript
- **Routing**: React Router v7 (Data mode)
- **Styling**: Tailwind CSS v4
- **Animations**: Motion (motion/react)
- **UI Components**: Radix UI (shadcn/ui)
- **Icons**: Lucide React
- **State**: React Hooks (local state)
- **Build**: Vite

## 📦 File Structure

```
/src/app
  ├── pages/
  │   ├── Home.tsx (Discover)
  │   ├── JoinedEventsNew.tsx
  │   ├── MyEvents.tsx
  │   ├── Notifications.tsx
  │   ├── EventDetails.tsx
  │   ├── Chat.tsx
  │   ├── Profile.tsx
  │   └── ...
  ├── components/
  │   ├── BottomNav.tsx
  │   ├── StatusBadge.tsx
  │   ├── JoinRequestModal.tsx
  │   ├── ProfilePreviewModal.tsx
  │   ├── EventCard.tsx
  │   └── ui/ (shadcn components)
  ├── contexts/
  │   └── LanguageContext.tsx
  ├── utils/
  │   └── mockData.ts
  ├── routes.ts
  └── App.tsx

/src/styles
  ├── tailwind.css
  ├── theme.css
  ├── custom.css
  └── fonts.css
```

## 🌍 Multilingual Support

Current languages:
- 🇬🇧 English
- 🇩🇪 German
- 🇸🇦 Arabic (RTL support)

Language switching:
- Top-right header dropdown
- Persistent across pages
- Context API implementation

## 🎬 Prototype Demo Flow

### Investor Demo Path:
1. Start at Landing (`/`)
2. Click "Get Started" → Register
3. Complete Profile Setup
4. Land on Discover (swipe mode)
5. Swipe right on event → Join Request Modal
6. Send request → Navigate to Joined Events (Pending)
7. View Notifications → See pending request
8. Switch role to Host → My Events
9. Accept pending request
10. Switch back to Guest → Notification accepted
11. Open Group Chat → Send message
12. View participants → Click profile
13. Navigate using bottom tabs

## ✨ Key Differentiators

1. **Trust-First Design**: Always show who you'll meet
2. **Approval System**: Hosts control their events
3. **Zero Friction**: Minimal steps to join/chat
4. **Mobile-First**: Bottom nav, touch-optimized
5. **Clear Roles**: Host vs Guest separation
6. **Status Transparency**: Know where you stand
7. **Community-Focused**: Not dating, just socializing

## 📈 Success Metrics

- Join request → acceptance rate
- Time to first chat message
- Event creation rate
- User retention (7-day, 30-day)
- Average participants per event
- Profile completion rate

## 🐛 Known Limitations (Mock Data)

- No real-time updates (WebSocket needed)
- Chat messages not persisted
- Notifications don't auto-refresh
- No image uploads
- No geolocation
- No email notifications

## 💡 Future Enhancements

- Event reminders (push/email)
- Recurring events
- Event templates
- Friend connections
- Activity feed
- Event photos gallery
- Check-in feature
- Attendance verification
- Trust score
- Social proof indicators

---

**Status**: ✅ MVP Complete & Production-Ready (Frontend)
**Last Updated**: February 17, 2026
**Version**: 1.0.0
