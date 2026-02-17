# Developer Guide - Meetly

## Quick Start

### Project Navigation

**Key Pages:**
- Landing: `/` - Homepage with hero, features, testimonials
- Home: `/home` - Main swipe/grid event discovery
- Login/Register: `/login`, `/register` - Authentication flows
- Profile Setup: `/profile-setup` - Onboarding wizard
- Event Details: `/event/:id` - Full event page
- Create Event: `/create-event` - Event creation form
- Design System: `/design-system` - Component showcase

### File Structure

```
src/app/
├── components/          # Reusable components
│   ├── ui/             # Base UI components (Radix)
│   ├── EventCard.tsx   # Event display card
│   └── LanguageSelector.tsx
├── contexts/           # React contexts
│   └── LanguageContext.tsx  # i18n management
├── pages/              # Route pages
├── utils/              # Utilities & data
│   ├── mockData.ts     # Sample data
│   └── translations.ts  # Translation strings
├── routes.ts           # Route configuration
└── App.tsx             # App entry point
```

### Adding a New Page

1. Create page component in `src/app/pages/`
2. Add route to `src/app/routes.ts`
3. Import and use existing UI components

Example:
```tsx
// src/app/pages/NewPage.tsx
import { useNavigate } from "react-router";
import { Button } from "../components/ui/button";

export default function NewPage() {
  const navigate = useNavigate();
  return (
    <div>
      <Button onClick={() => navigate("/home")}>
        Go to Home
      </Button>
    </div>
  );
}

// src/app/routes.ts
import NewPage from "./pages/NewPage";

export const router = createBrowserRouter([
  // ... existing routes
  {
    path: "/new-page",
    Component: NewPage,
  },
]);
```

### Adding Translations

Edit `src/app/utils/translations.ts`:

```typescript
export const translations = {
  en: {
    my_new_key: "My Text",
    // ...
  },
  de: {
    my_new_key: "Mein Text",
    // ...
  },
  ar: {
    my_new_key: "النص الخاص بي",
    // ...
  },
};
```

Usage in components:
```tsx
const { t } = useLanguage();
<p>{t("my_new_key")}</p>
```

### Adding Mock Data

Edit `src/app/utils/mockData.ts`:

```typescript
export const myNewData = [
  {
    id: "1",
    name: "Example",
    // ...
  },
];
```

### Styling

**Using Tailwind:**
```tsx
<div className="bg-primary text-white p-4 rounded-lg">
  Content
</div>
```

**CSS Variables (theme.css):**
- `--primary`: #0ea5e9
- `--accent`: #e0f2fe
- `--muted`: #ececf0
- Use via: `bg-primary`, `text-primary`, etc.

**Custom CSS:**
Add to `src/styles/custom.css`

### Icons

Using Lucide React:
```tsx
import { Coffee, Users, MapPin } from "lucide-react";

<Coffee className="h-5 w-5 text-primary" />
```

Browse icons: https://lucide.dev

### State Management

Currently using React useState/Context:
- Language: `LanguageContext`
- Events: Local state in pages
- Filters: Local state

For production, consider adding:
- React Query for server state
- Zustand for global state

### Navigation

Using React Router:
```tsx
import { useNavigate, useParams, Link } from "react-router";

const navigate = useNavigate();
const { id } = useParams();

// Programmatic
navigate("/home");
navigate(-1); // Go back

// Link
<Link to="/profile">Profile</Link>
```

### Common Patterns

**Protected Routes:**
```tsx
// Add auth check wrapper
function ProtectedRoute({ children }) {
  const isAuthenticated = checkAuth();
  return isAuthenticated ? children : <Navigate to="/login" />;
}
```

**Loading States:**
```tsx
import { LoadingScreen } from "../components/LoadingScreen";

{isLoading && <LoadingScreen />}
```

**Error Handling:**
```tsx
try {
  // API call
} catch (error) {
  console.error(error);
  // Show error toast
}
```

### UI Component Library

All base components in `src/app/components/ui/`:
- Button, Card, Badge, Avatar
- Input, Textarea, Select, Label
- Dialog, Sheet, Popover
- Tabs, Accordion, Collapsible

See `/design-system` page for visual reference.

### Responsive Design

**Breakpoints:**
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px

**Usage:**
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Responsive grid */}
</div>
```

### Performance Tips

1. Use `useMemo` for expensive computations
2. Lazy load routes with React.lazy()
3. Optimize images (use WebP)
4. Minimize bundle size
5. Use production build for deployment

### Testing

**Component Testing:**
```bash
# Add testing library
pnpm add -D @testing-library/react @testing-library/jest-dom
```

**E2E Testing:**
Consider Playwright or Cypress for user flows.

### Deployment

```bash
# Build
pnpm build

# Output in dist/
# Deploy to Vercel, Netlify, etc.
```

### Environment Variables

Create `.env`:
```
VITE_API_URL=https://api.example.com
```

Usage:
```tsx
const apiUrl = import.meta.env.VITE_API_URL;
```

### Common Issues

**Issue: React Router not working**
- Check RouterProvider setup in App.tsx
- Verify routes.ts configuration

**Issue: Styles not applying**
- Check Tailwind imports in index.css
- Verify class names (no typos)

**Issue: Context not available**
- Wrap component tree with provider
- Check useContext hook usage

### Backend Integration Checklist

When ready to connect to a backend:

1. **API Client:**
   - Add axios or fetch wrapper
   - Configure base URL and interceptors
   - Handle authentication tokens

2. **Authentication:**
   - Store JWT tokens securely
   - Add auth context
   - Protect routes

3. **Data Fetching:**
   - Replace mock data with API calls
   - Add loading states
   - Handle errors

4. **Real-time Features:**
   - WebSocket for chat
   - Polling for notifications
   - Optimistic updates

5. **File Uploads:**
   - Profile photos
   - Event images
   - Presigned URLs

### Useful Commands

```bash
# Development
pnpm dev

# Build
pnpm build

# Preview build
pnpm preview

# Add package
pnpm add package-name

# Remove package
pnpm remove package-name
```

### Resources

- [React Docs](https://react.dev)
- [React Router](https://reactrouter.com)
- [Tailwind CSS](https://tailwindcss.com)
- [Radix UI](https://www.radix-ui.com)
- [Lucide Icons](https://lucide.dev)

---

**Questions?** Check the main README.md or component documentation.
