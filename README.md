# Weather Vibes 🌦️

[![Netlify Status](https://api.netlify.com/api/v1/badges/499263c3-1cc4-4312-bb1a-804871e23f43/deploy-status)](https://app.netlify.com/projects/tourmaline-sunshine-440754/deploys)

A historical weather patterns explorer featuring city weather data, alerts monitoring, and beautiful shareable weather cards.

**🔗 Live:** [weathervibes.xyz](https://weathervibes.xyz)

## ✨ Features

- 🌍 **World Cities** — Browse real-time weather data from cities worldwide
- 📊 **Historical Archive** — Explore past weather patterns and trends
- ⚠️ **Weather Alerts** — Monitor extreme weather conditions (heat, cold, wind, air quality)
- 🔗 **Shareable Cards** — Generate beautiful weather cards with dynamic Open Graph images

## 🛠️ Tech Stack

- **Framework:** [TanStack Start](https://tanstack.com/start) + [React 19](https://react.dev)
- **Routing:** [TanStack Router](https://tanstack.com/router) (file-based, type-safe)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com) + [shadcn/ui](https://ui.shadcn.com)
- **Data:** [Open-Meteo API](https://open-meteo.com)
- **Tooling:** [Biome](https://biomejs.dev) (linting & formatting), [Vitest](https://vitest.dev) (testing)
- **Deployment:** [Netlify](https://netlify.com)

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) >= 20.0.0
- [pnpm](https://pnpm.io) (recommended)

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
| `pnpm build` | Build for production |
| `pnpm preview` | Preview production build locally |
| `pnpm test` | Run tests with Vitest |
| `pnpm lint` | Check for linting issues |
| `pnpm format` | Format code with Biome |
| `pnpm check` | Lint and format (auto-fix) |
| `pnpm typecheck` | Run TypeScript type checking |

## 🏗️ Project Structure

```
weather-vibes/
├── src/
│   ├── components/     # 🧩 Reusable UI components
│   │   └── ui/         # shadcn/ui components
│   ├── lib/            # 🔧 Utility functions
│   ├── routes/         # 📍 File-based routes (TanStack Router)
│   ├── router.tsx      # 🛤️ Router configuration
│   └── styles.css      # 🎨 Global styles (Tailwind)
├── public/             # 📁 Static assets
├── biome.json          # ⚙️ Biome configuration
├── tsconfig.json       # ⚙️ TypeScript configuration
└── vite.config.ts      # ⚙️ Vite configuration
```

## 🔒 Pre-commit Hooks

This project uses [Husky](https://typicode.github.io/husky) for pre-commit hooks:

- **Biome** — Lints and formats staged files
- **TypeScript** — Type checks the codebase

## 📄 License

[ISC](LICENSE) © [Joseph Chow](https://josephchow.dev)

---

<p align="center">
  Made with ☀️ and ❄️ by <a href="https://github.com/chowjiaming">@chowjiaming</a>
</p>
