# Peloton Tread Metrics Design System

This document outlines the design language, color palette, typography, and core CSS utilities used in the Peloton Tread Metrics application. Future features and components should adhere to these guidelines to maintain a cohesive, modern, and premium User Experience (UX).

## 1. Core Philosophy
The application uses a **Modern Dark Theme with Glassmorphism**. The focus is on clean data visualization, high contrast for legibility, and premium micro-interactions that make the app feel dynamic and responsive.

## 2. Color Palette (CSS Variables)
All core colors are defined in `src/app.css` as CSS custom properties on `:root`.

### Backgrounds
- **Primary Background** (`--bg-primary`): `#0f172a` (Deep slate/blue)
- **Secondary Background** (`--bg-secondary`): `#1e293b` (For inputs, dropdowns, minor distinct sections)
- **App Global Background**: A subtle fixed radial gradient that adds depth. 
  ```css
  radial-gradient(circle at top right, #1e293b 0%, #0f172a 50%, #020617 100%)
  ```

### Glassmorphism (Cards & Panels)
- **Glass Background** (`--bg-glass`): `rgba(30, 41, 59, 0.7)`
- **Glass Background Hover** (`--bg-glass-hover`): `rgba(51, 65, 85, 0.8)`

### Text Colors
- **Primary Text** (`--text-primary`): `#f8fafc` (Headers, main body text)
- **Secondary Text** (`--text-secondary`): `#94a3b8` (Subtitles, labels)
- **Muted Text** (`--text-muted`): `#64748b` (Helper text, minor details)

### Accents & Semantic Colors
- **Primary Accent** (`--accent-primary`): `#3b82f6` (Vibrant blue, used for primary actions, active states)
- **Accent Hover** (`--accent-hover`): `#60a5fa`
- **Accent Active** (`--accent-active`): `#2563eb`
- **Success** (`--accent-success`): `#10b981` (Vibrant green, positive metrics)
- **Danger** (`--accent-danger`): `#ef4444` (Vibrant red, errors or destructive actions)

## 3. Typography
- **Primary Font Family**: 'Inter', followed by modern system fallbacks (`-apple-system`, `BlinkMacSystemFont`, etc.)
- **Headers (`h1`-`h6`)**: Use font weight `600` with tight letter spacing (`-0.025em`) to create a sleek appearance.
- **Hero/Title Text**: Key headers (e.g., page titles, 404 text) use a background gradient clip to appear vibrant and premium:
  ```css
  background: linear-gradient(135deg, var(--accent-hover), var(--accent-primary));
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  ```

## 4. Reusable CSS Utilities & Components

### Glass Panels
Whenever creating a distinct section, card, containing block, or data view, use the `.glass-panel` class. This handles the backdrop blur, translucent background, subtle border, and shadow.
```html
<div class="glass-panel">
    <!-- Card Content -->
</div>
```

### Buttons
- **Primary Actions**: Custom styled buttons with `--accent-primary` backgrounds, white text, and box shadows (e.g., `.home-btn` on the error page).
- **Secondary/Ghost Actions**: Use transparent backgrounds with borders and hover states (`.ghost-btn`). Needs to transition to `rgba(255, 255, 255, 0.05)` on hover.
- **Toggles/Options**: Pill or rounded rectangle buttons (`.duration-btn`) with smooth transition states indicating `.active` status using the primary accent color.

### Form Inputs
Standard HTML `<input>`, `<select>`, type `text`, `number`, and `date` are globally styled in `src/app.css` to use `--bg-secondary` and a focus ring using the primary accent. Standardize on the `.input-group` class for `<span>` labels + `<input>`.

### Badges/Tags
Small informational tags should be pill-shaped with customized semi-transparent backgrounds aligning to their category:
- **Base Badge**: `.badge` (subtle white transparency border)
- **Instructor Style**: `.badge-instructor` (blue tinted)
- **Class Type Style**: `.badge-type` (purple tinted)

## 5. UI/UX Best Practices
1. **Dynamic Interactions**: Elements meant to be interacted with should have a `transition: all 0.2s ease` and a hover state (often a slight `transform: translateY(-2px)` or a background tint shift).
2. **Spacing**: Use CSS Grid/Flexbox heavily with `gap` to ensure uniform spacing between elements. Main layout containers are restricted to max `1200px` widths.
3. **No Raw SVGs in Markdown**: Standardize SVG usage inline with `currentColor` sizing handling or use the specific Svelte assets if necessary. Match the stroke style to existing Lucide/Material icons where applicable.
