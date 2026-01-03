# Design Patterns for Weather Vibes UI Overhaul

> 📋 Key patterns extracted from cursor rules and TanStack best practices

## 1. Routing Patterns

### File-Based Routing Structure
```
src/routes/
├── __root.tsx          # Root layout with global providers
├── index.tsx           # Landing/home (will be map canvas)
├── _app.tsx            # App layout wrapper (pathless)
├── _app/
│   ├── explore.tsx     # Explore mode
│   └── compare.tsx     # Compare mode
```

### Route Configuration Pattern
```tsx
// Use createFileRoute with proper head management
export const Route = createFileRoute('/explore')({
  validateSearch: exploreSearchSchema,  // Zod validation
  head: ({ loaderData }) => ({
    meta: [
      { title: 'Explore Weather | Weather Vibes' },
      { name: 'description', content: '...' },
    ],
  }),
  loader: async ({ location }) => {
    // Fetch data server-side
  },
  component: ExploreComponent,
})
```

## 2. Server Functions Pattern

### Creating Server Functions with Validation
```tsx
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

const inputSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
})

export const getWeatherData = createServerFn({ method: 'GET' })
  .inputValidator(inputSchema)
  .handler(async ({ data }) => {
    // Server-only logic here
    return fetchWeatherFromAPI(data)
  })
```

### Calling from Route Loaders
```tsx
export const Route = createFileRoute('/explore')({
  loader: () => getWeatherData({ data: { latitude: 0, longitude: 0 } }),
})
```

## 3. Search Parameters Pattern

### Type-Safe URL State
```tsx
// Define schema with Zod
const exploreSearchSchema = z.object({
  lat: z.coerce.number().optional(),
  lon: z.coerce.number().optional(),
  vars: z.string().transform(v => v.split(',')).optional(),
  chart: z.enum(['line', 'bar', 'area']).default('line'),
})

// Use in route
export const Route = createFileRoute('/explore')({
  validateSearch: exploreSearchSchema,
})

// Access in component
function ExploreComponent() {
  const search = Route.useSearch()
  const navigate = useNavigate()
  
  // Update search params
  navigate({ search: { ...search, chart: 'bar' } })
}
```

## 4. Head Management for SEO

### Dynamic Meta Tags
```tsx
head: ({ loaderData, params }) => ({
  meta: [
    { title: loaderData.city.name },
    { name: 'description', content: `Weather data for ${loaderData.city.name}` },
    { property: 'og:title', content: loaderData.city.name },
    { property: 'og:image', content: generateOGImage(loaderData) },
  ],
  links: [
    { rel: 'canonical', href: `https://weather-vibes.netlify.app/${params.slug}` },
  ],
})
```

## 5. Component Patterns

### Layout Components with Outlet
```tsx
// _app.tsx - Pathless layout route
import { Outlet } from '@tanstack/react-router'

function AppLayout() {
  return (
    <div className="app-canvas">
      <FloatingNav />
      <Outlet />  {/* Child routes render here */}
      <LayerDrawer />
    </div>
  )
}
```

### Composable UI Components
```tsx
// Prefer composition over configuration
<BentoPanel variant="glass">
  <BentoPanelHeader>
    <BentoPanelTitle>Temperature</BentoPanelTitle>
  </BentoPanelHeader>
  <BentoPanelContent>
    <TemperatureChart data={data} />
  </BentoPanelContent>
</BentoPanel>
```

## 6. Tailwind CSS v4 Patterns

### CSS-First Configuration
```css
/* src/styles.css */
@import 'tailwindcss';

/* Custom theme tokens */
@theme {
  --font-display: 'Space Grotesk', sans-serif;
  --radius-bento: 1.5rem;
  --color-glass: oklch(0.98 0 0 / 0.1);
}
```

### Adaptive Color Scheme
```css
/* Time-based theming */
@media (prefers-color-scheme: dark) {
  :root {
    --background: oklch(0.15 0.02 250);
    --foreground: oklch(0.95 0.01 250);
  }
}
```

## 7. Animation Patterns

### Framer Motion Integration
```tsx
import { motion, AnimatePresence } from 'motion/react'

// Panel entrance animation
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -20 }}
  transition={{ duration: 0.3, ease: 'easeOut' }}
>
  {children}
</motion.div>

// Staggered children
<motion.div
  variants={{
    show: { transition: { staggerChildren: 0.1 } }
  }}
  initial="hidden"
  animate="show"
>
  {items.map(item => (
    <motion.div
      key={item.id}
      variants={{
        hidden: { opacity: 0, scale: 0.95 },
        show: { opacity: 1, scale: 1 }
      }}
    />
  ))}
</motion.div>
```

## 8. Data Fetching Patterns

### Use Available APIs Contextually
```tsx
// Detect location type and fetch appropriate data
async function fetchContextualData(location: Location) {
  const promises = [
    getHistoricalWeather({ data: { ...location } }),
    getForecast({ data: { ...location } }),
    getAirQuality({ data: { ...location } }),
  ]
  
  // Add marine data for coastal locations
  if (isCoastal(location)) {
    promises.push(getMarineWeather({ data: { ...location } }))
  }
  
  // Add flood data for riverside locations
  if (nearRiver(location)) {
    promises.push(getFloodData({ data: { ...location } }))
  }
  
  return Promise.all(promises)
}
```

## 9. State Management Patterns

### URL as Primary State
- Use search params for shareable state (location, date range, variables)
- Use React state for ephemeral UI state (panel open/closed, hover states)
- Use server functions for data fetching

### Theme State
```tsx
// Use next-themes for system-aware theming
import { ThemeProvider } from 'next-themes'

function RootLayout({ children }) {
  return (
    <ThemeProvider 
      attribute="class" 
      defaultTheme="system"
      enableSystem
    >
      {children}
    </ThemeProvider>
  )
}
```

## 10. Accessibility Patterns

### Keyboard Navigation
- `Cmd/Ctrl + K` - Open search
- `E` - Switch to Explore mode
- `C` - Switch to Compare mode
- `L` - Toggle layers panel
- `Escape` - Close overlays

### Focus Management
```tsx
// Auto-focus search input when command palette opens
useEffect(() => {
  if (isOpen) {
    inputRef.current?.focus()
  }
}, [isOpen])
```

---

## Implementation Checklist

- [ ] Use file-based routing with proper route configuration
- [ ] Validate all search params with Zod schemas
- [ ] Add proper head management for SEO
- [ ] Use server functions for all API calls
- [ ] Follow Tailwind CSS v4 patterns
- [ ] Add animations with Framer Motion
- [ ] Implement keyboard shortcuts
- [ ] Ensure accessibility compliance

