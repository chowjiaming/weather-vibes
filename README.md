# Weather Vibes 🌦️

[![Netlify Status](https://api.netlify.com/api/v1/badges/499263c3-1cc4-4312-bb1a-804871e23f43/deploy-status)](https://app.netlify.com/projects/tourmaline-sunshine-440754/deploys)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61dafb?logo=react&logoColor=white)](https://react.dev)
[![TanStack](https://img.shields.io/badge/TanStack-Start-ff4154?logo=react-query&logoColor=white)](https://tanstack.com/start)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38bdf8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![License](https://img.shields.io/badge/License-ISC-green.svg)](LICENSE)

A historical weather patterns explorer featuring city weather data, alerts monitoring, and beautiful shareable weather cards.

**🔗 Live:** [weathervibes.xyz](https://weathervibes.xyz)

---

## 📑 Table of Contents

- [Features](#-features)
- [Tech Stack](#️-tech-stack)
- [Getting Started](#-getting-started)
- [Available Scripts](#-available-scripts)
- [Project Structure](#️-project-structure)
- [API Layer](#-api-layer)
- [Environment Variables](#-environment-variables)
- [Pre-commit Hooks](#-pre-commit-hooks)
- [Commit Guidelines](#-commit-guidelines)
- [Deployment](#-deployment)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)
- [License](#-license)
- [Acknowledgements](#-acknowledgements)

---

## ✨ Features

- 🌍 **World Cities** — Browse real-time weather data from cities worldwide
- 📊 **Historical Archive** — Explore past weather patterns and trends (1940-present)
- 🔄 **Year-over-Year Comparison** — Compare weather on the same date across multiple years
- ⚠️ **Weather Alerts** — Monitor extreme weather conditions (heat, cold, wind, air quality)
- 🌊 **Marine & Flood Data** — Access wave conditions and river discharge forecasts
- 🔗 **Shareable Cards** — Generate beautiful weather cards with dynamic Open Graph images

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | [TanStack Start](https://tanstack.com/start) + [React 19](https://react.dev) |
| **Routing** | [TanStack Router](https://tanstack.com/router) (file-based, type-safe) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com) + [shadcn/ui](https://ui.shadcn.com) |
| **Validation** | [Zod](https://zod.dev) (type-safe schema validation) |
| **Data** | [Open-Meteo API](https://open-meteo.com) (weather, air quality, marine, flood) |
| **Linting** | [Biome](https://biomejs.dev) (linting & formatting) |
| **Testing** | [Vitest](https://vitest.dev) + [Testing Library](https://testing-library.com) |
| **Deployment** | [Netlify](https://netlify.com) |

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) >= 24.0.0
- [pnpm](https://pnpm.io) >= 10.0.0

> 💡 **Tip:** We recommend using [Corepack](https://nodejs.org/api/corepack.html) to manage pnpm:
> ```bash
> corepack enable
> corepack prepare pnpm@latest --activate
> ```

### Installation

```bash
# 📦 Clone the repository
git clone https://github.com/chowjiaming/weather-vibes.git
cd weather-vibes

# 📥 Install dependencies
pnpm install

# 🔧 Start development server
pnpm dev
```

The app will be available at [http://localhost:3000](http://localhost:3000).

## 📜 Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server on port 3000 |
| `pnpm dev:debug` | Start dev server with debug logging |
| `pnpm build` | Build for production |
| `pnpm preview` | Preview production build locally |
| `pnpm start` | Alias for `preview` |
| `pnpm test` | Run tests once |
| `pnpm test:watch` | Run tests in watch mode |
| `pnpm test:coverage` | Run tests with coverage report |
| `pnpm lint` | Check for linting issues |
| `pnpm lint:fix` | Fix linting issues automatically |
| `pnpm format` | Format code with Biome |
| `pnpm check` | Lint and format (auto-fix) |
| `pnpm typecheck` | Run TypeScript type checking |
| `pnpm validate` | Run typecheck, lint, and tests |
| `pnpm clean` | Remove build artifacts |
| `pnpm clean:all` | Remove all generated files including node_modules |

## 🏗️ Project Structure

```
weather-vibes/
├── src/
│   ├── api/              # 🌐 Open-Meteo API server functions
│   │   ├── config.ts     # API endpoints & defaults
│   │   ├── types.ts      # TypeScript type definitions
│   │   ├── schemas.ts    # Zod validation schemas
│   │   ├── client.ts     # HTTP utilities & error handling
│   │   ├── geocoding.ts  # 🌍 Location search
│   │   ├── forecast.ts   # 🌤️ Weather forecast
│   │   ├── historical.ts # 📜 Historical weather
│   │   ├── air-quality.ts# 🌫️ Air quality & pollen
│   │   ├── marine.ts     # 🌊 Marine weather
│   │   ├── flood.ts      # 🌊 River discharge
│   │   ├── ensemble.ts   # 🎲 Probabilistic forecasts
│   │   ├── seasonal.ts   # 📅 Seasonal outlooks
│   │   └── index.ts      # Re-exports
│   ├── components/       # 🧩 Reusable UI components
│   │   └── ui/           # shadcn/ui components
│   ├── hooks/            # 🪝 Custom React hooks
│   ├── lib/              # 🔧 Utility functions
│   ├── routes/           # 📍 File-based routes (TanStack Router)
│   ├── router.tsx        # 🛤️ Router configuration
│   └── styles.css        # 🎨 Global styles (Tailwind)
├── public/               # 📁 Static assets
├── .husky/               # 🐶 Git hooks
├── biome.json            # ⚙️ Biome configuration
├── netlify.toml          # ⚙️ Netlify deployment config
├── tsconfig.json         # ⚙️ TypeScript configuration
└── vite.config.ts        # ⚙️ Vite configuration
```

## 🌐 API Layer

This project uses [TanStack Start server functions](https://tanstack.com/start/latest/docs/framework/react/server-functions) to interact with the [Open-Meteo API](https://open-meteo.com). All API calls are made server-side for security and performance.

### Available Server Functions

<details>
<summary><strong>Geocoding</strong></summary>

- `searchLocations` — Search for multiple locations by name
- `searchLocation` — Get single best match for a location

</details>

<details>
<summary><strong>Weather Forecast</strong></summary>

- `getWeatherForecast` — Full forecast with all options
- `getCurrentWeather` — Current conditions only
- `getWeeklyForecast` — 7-day daily forecast
- `getHourlyForecast` — Hourly data for N hours

</details>

<details>
<summary><strong>Historical Weather (1940-present)</strong></summary>

- `getHistoricalWeather` — Full historical query
- `compareHistoricalDates` — Compare same date across years
- `getRecentHistoricalWeather` — Past N days
- `getYearOverYearComparison` — Seasonal comparison

</details>

<details>
<summary><strong>Air Quality</strong></summary>

- `getAirQuality` — Full air quality data
- `getCurrentAirQuality` — Current AQI and pollutants
- `getPollenForecast` — Pollen counts forecast

</details>

<details>
<summary><strong>Marine & Flood</strong></summary>

- `getMarineWeather` — Wave and ocean data
- `getSurfConditions` — Surf-optimized forecast
- `getFloodData` — River discharge data
- `getRiverDischarge` — Simplified flood monitoring

</details>

<details>
<summary><strong>Ensemble & Seasonal</strong></summary>

- `getEnsembleForecast` — Probabilistic forecasts
- `getPrecipitationProbability` — Rain chance predictions
- `getSeasonalForecast` — Long-range outlooks (up to 7 months)

</details>

### Example Usage

```tsx
import { createFileRoute } from '@tanstack/react-router'
import { searchLocation, getHistoricalWeather } from '@/api'

export const Route = createFileRoute('/weather/$city')({
  loader: async ({ params }) => {
    const location = await searchLocation({ data: { name: params.city } })
    if (!location) throw new Error('Location not found')

    const weather = await getHistoricalWeather({
      data: {
        latitude: location.latitude,
        longitude: location.longitude,
        start_date: '2024-01-01',
        end_date: '2024-12-31',
        daily: ['temperature_2m_max', 'temperature_2m_min', 'precipitation_sum'],
      }
    })

    return { location, weather }
  },
})
```

## 🔐 Environment Variables

This project uses environment variables for configuration. Create a `.env.local` file for local development:

```bash
# .env.local (optional - no API key required for Open-Meteo free tier)

# Public variables (exposed to client)
VITE_APP_URL=http://localhost:3000

# Server-only variables (not exposed to client)
# OPEN_METEO_API_KEY=your-api-key  # Only needed for commercial use
```

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_APP_URL` | No | Base URL for the application |
| `OPEN_METEO_API_KEY` | No | API key for commercial Open-Meteo usage |

> 📝 **Note:** Open-Meteo provides generous free tier limits (~10,000 calls/day). No API key is required for non-commercial use.

## 🔒 Pre-commit Hooks

This project uses [Husky](https://typicode.github.io/husky) for pre-commit hooks:

- **Biome** — Lints and formats staged files
- **TypeScript** — Type checks the codebase

## 📝 Commit Guidelines

This project follows the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) specification for clear, structured commit history.

### Commit Message Format

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Types

| Type | Description | SemVer |
|------|-------------|--------|
| `feat` | A new feature | MINOR |
| `fix` | A bug fix | PATCH |
| `docs` | Documentation only changes | - |
| `style` | Changes that don't affect code meaning | - |
| `refactor` | Code change that neither fixes a bug nor adds a feature | - |
| `perf` | Performance improvements | PATCH |
| `test` | Adding or correcting tests | - |
| `build` | Changes to build system or dependencies | - |
| `ci` | Changes to CI configuration | - |
| `chore` | Other changes that don't modify src or test files | - |

### Examples

```bash
# Feature with scope
feat(api): add historical weather comparison endpoint

# Bug fix
fix: prevent racing of requests in weather loader

# Breaking change (note the !)
feat(api)!: change response format for historical data

# With body and footer
fix: correct temperature unit conversion

The celsius to fahrenheit conversion was using the wrong formula.

Fixes #123
```

### Breaking Changes

Breaking changes can be indicated by:
- Adding `!` after the type/scope: `feat(api)!: change response format`
- Adding a `BREAKING CHANGE:` footer in the commit body

## 🚢 Deployment

This project is configured for deployment on [Netlify](https://netlify.com).

### Automatic Deployments

Push to the `main` branch triggers automatic deployment to production.

### Manual Deployment

```bash
# Install Netlify CLI
pnpm add -g netlify-cli

# Login to Netlify
netlify login

# Deploy preview
netlify deploy

# Deploy to production
netlify deploy --prod
```

### Build Configuration

The `netlify.toml` file contains all deployment configuration:
- Build command: `pnpm build`
- Publish directory: `dist/client`
- Node.js version: 24

## 🔧 Troubleshooting

<details>
<summary><strong>pnpm install fails with store location error</strong></summary>

```bash
# Reinstall dependencies with correct store
rm -rf node_modules
pnpm install
```

</details>

<details>
<summary><strong>TypeScript errors after updating dependencies</strong></summary>

```bash
# Clear TypeScript cache and rebuild
pnpm clean
pnpm install
pnpm typecheck
```

</details>

<details>
<summary><strong>Port 3000 already in use</strong></summary>

```bash
# Find and kill the process
lsof -i :3000
kill -9 <PID>

# Or use a different port
pnpm dev -- --port 3001
```

</details>

<details>
<summary><strong>Biome formatting conflicts with editor</strong></summary>

Ensure your editor is using the project's Biome configuration. For VS Code, install the [Biome extension](https://marketplace.visualstudio.com/items?itemName=biomejs.biome) and add to `.vscode/settings.json`:

```json
{
  "editor.defaultFormatter": "biomejs.biome",
  "editor.formatOnSave": true
}
```

</details>

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feat/amazing-feature`
3. **Commit** your changes using [Conventional Commits](#-commit-guidelines)
4. **Push** to the branch: `git push origin feat/amazing-feature`
5. **Open** a Pull Request

### Development Workflow

```bash
# 1. Install dependencies
pnpm install

# 2. Start development server
pnpm dev

# 3. Make your changes...

# 4. Validate before committing
pnpm validate

# 5. Commit with conventional format
git commit -m "feat(component): add weather card animation"
```

## 📄 License

[ISC](LICENSE) © [Joseph Chow](https://josephchow.dev)

## 🙏 Acknowledgements

- [Open-Meteo](https://open-meteo.com) — Free weather API with no key required
- [TanStack](https://tanstack.com) — Excellent React ecosystem tools
- [shadcn/ui](https://ui.shadcn.com) — Beautiful, accessible UI components
- [Tailwind CSS](https://tailwindcss.com) — Utility-first CSS framework
- [Biome](https://biomejs.dev) — Fast, unified linter and formatter
- [Netlify](https://netlify.com) — Seamless deployment platform

---

<p align="center">
  Made with ☀️ and ❄️ by <a href="https://github.com/chowjiaming">@chowjiaming</a>
</p>
