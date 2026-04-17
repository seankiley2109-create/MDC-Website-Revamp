# Montana Data Company - Enterprise Platform

## What the App Does
An enterprise cloud backup, data protection, and cyber resilience platform website for "Montana Data Company". It features service showcases, an interactive "Build Your Solution" (POS) configurator, and a lead-generating POPIA compliance assessment tool.

## Stack
- **Framework:** Next.js 15+ (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS (v4)
- **Icons:** Lucide React
- **Components:** Custom Glassmorphism UI

## Folder Map
```text
/
├── app/                  # Next.js App Router pages and API routes
│   ├── api/              # Backend API endpoints (e.g., /api/popia-assessment)
│   ├── about/            # About Us page
│   ├── popia-assessment/ # Interactive POPIA compliance tool
│   ├── pos/              # "Build Your Solution" configurator
│   └── services/         # Services offered page
├── components/           # Reusable React components
│   ├── layout/           # Navbar, Footer
│   ├── sections/         # Page sections (Hero, TrustStrip, etc.)
│   └── ui/               # Base UI components (GlassCard, AnimatedButton)
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions (e.g., cn helper)
└── public/               # Static assets (images, logos)
```

## Coding Rules
- **Server Components Default:** Use Server Components by default. Only add `'use client'` for interactivity, hooks, or browser APIs.
- **Styling:** Use Tailwind CSS utility classes. Maintain the dark mode, glassmorphism aesthetic (`bg-montana-bg`, `GlassCard`, `border-white/10`).
- **Icons:** Always import icons from `lucide-react`. Do not use custom SVG icons unless absolutely necessary.
- **Data Fetching:** Prefer fetching data in Server Components using `async`/`await`.
- **Environment Variables:** Prefix public variables with `NEXT_PUBLIC_`. Always document new variables in `.env.example`.

## Common Commands
- `npm run dev` - Start the development server (runs on port 3000)
- `npm run build` - Create an optimized production build
- `npm run lint` - Run ESLint to check for code issues

## Important Constraints
- **Port:** The application MUST run on port 3000. This is hardcoded by the infrastructure.
- **API Keys:** Never generate custom UI for API keys. Rely on environment variables.
- **iFrame Environment:** The app runs in an iframe preview. Avoid `window.alert` or `window.open` without proper cross-origin handling.
- **Routing:** Use Next.js `<Link>` for internal navigation to maintain SPA-like transitions.

## Relevant Docs
- [Next.js App Router](https://nextjs.org/docs/app)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Lucide React Icons](https://lucide.dev/icons)
