# Component Audit Results

> Audit of shadcn/ui components for Weather Vibes UI Overhaul

## Summary

- **Total Components:** 53
- **Actively Used:** 28
- **Unused (can remove):** 23
- **Demo Files:** 1 (component-example.tsx)

## Actively Used Components

These components are imported and used in the application:

| Component | Usage Locations | Restyle Priority |
|-----------|-----------------|------------------|
| badge | variable-selector, compare, city, index, trend-indicator | HIGH |
| button | everywhere | HIGH |
| calendar | date-range-picker | MEDIUM |
| card | charts, routes, stat-cards | HIGH |
| chart | charts | LOW (Recharts wrapper) |
| checkbox | variable-selector | MEDIUM |
| command | command palette (search) | HIGH |
| dialog | command, modals | HIGH |
| drawer | layer toggles | HIGH |
| dropdown-menu | component-example, menubar | MEDIUM |
| field | forms | MEDIUM |
| input | city-search | MEDIUM |
| input-group | command, combobox | MEDIUM |
| label | field | LOW |
| popover | date-range-picker, variable-selector | HIGH |
| scroll-area | lists | MEDIUM |
| select | compare | MEDIUM |
| separator | chart-controls | LOW |
| sheet | sidebar (mobile) | MEDIUM |
| skeleton | loading states | MEDIUM |
| sonner | toasts | LOW |
| spinner | loading | LOW |
| table | weather-table | MEDIUM |
| tabs | city, explore | HIGH |
| textarea | forms | LOW |
| toggle | toggle-group | MEDIUM |
| toggle-group | chart controls | MEDIUM |
| tooltip | sidebar | MEDIUM |

## Unused Components (Safe to Remove)

These components have no imports outside of internal dependencies:

1. accordion.tsx
2. alert.tsx
3. aspect-ratio.tsx
4. avatar.tsx
5. breadcrumb.tsx
6. carousel.tsx
7. collapsible.tsx
8. context-menu.tsx
9. empty.tsx
10. hover-card.tsx
11. input-otp.tsx
12. item.tsx
13. kbd.tsx
14. menubar.tsx
15. navigation-menu.tsx
16. pagination.tsx
17. progress.tsx
18. radio-group.tsx
19. resizable.tsx
20. slider.tsx
21. switch.tsx
22. button-group.tsx
23. alert-dialog.tsx (only in demo)

## Demo Files (Remove)

- `src/components/component-example.tsx` - Demo/showcase file, not used in app

## Restyle Priorities

### HIGH Priority (Core to New Design)

1. **card.tsx** - Transform to bento panel style with glassmorphism
2. **button.tsx** - Update to match new aesthetic with proper states
3. **badge.tsx** - Update for layer toggles and data indicators
4. **tabs.tsx** - Restyle for mode switching (Explore/Compare)
5. **popover.tsx** - Add glass effect for floating panels
6. **command.tsx** - Spotlight-style search palette
7. **dialog.tsx** - Glass modal overlays
8. **drawer.tsx** - Layer drawer with slide animation

### MEDIUM Priority (Important for UX)

1. **calendar.tsx** - Match bento aesthetic
2. **select.tsx** - Consistent dropdown styling
3. **skeleton.tsx** - Loading states for panels
4. **scroll-area.tsx** - Custom scrollbar styling
5. **toggle-group.tsx** - Chart type switcher
6. **sheet.tsx** - Mobile navigation

### LOW Priority (Functional, Less Visual)

1. **sonner.tsx** - Toast notifications
2. **spinner.tsx** - Loading indicator
3. **separator.tsx** - Visual dividers
4. **label.tsx** - Form labels

## New Design Tokens Required

### Typography
- Display font: "Outfit" or "Plus Jakarta Sans" (modern, geometric)
- Mono font: Keep "JetBrains Mono" for data

### Colors
- Glass background: `oklch(0.98 0 0 / 0.08)`
- Glass border: `oklch(1 0 0 / 0.1)`
- Adaptive accents based on weather/time

### Radius
- Bento panels: `1.5rem` (24px)
- Buttons/inputs: `0.75rem` (12px)
- Pills: `9999px` (full)

### Shadows
- Glass shadow: `0 8px 32px oklch(0 0 0 / 0.1)`
- Elevated: `0 4px 16px oklch(0 0 0 / 0.15)`

## Next Steps

1. Remove unused components
2. Remove component-example.tsx
3. Update styles.css with new design tokens
4. Restyle HIGH priority components
5. Add glassmorphism utilities

