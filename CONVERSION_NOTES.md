# React → Angular conversion notes

## Original project inspected

The supplied ZIP contains a Vite + React 19 application with:

- `src/App.tsx` containing the application shell, routing, dashboard and the main workspace pages.
- `src/components/ui/*` containing the generated Radix/shadcn-style primitives.
- `src/hooks/*` for mobile/toast behavior.
- `src/lib/*` for demo data, local storage and API connection helpers.
- `src/pages/not-found.tsx`.
- Tailwind CSS theme variables and animation styles in `src/index.css`.

## Angular mapping

| React | Angular |
|---|---|
| `App.tsx` / Wouter | `src/app/app.component.ts`, `app.routes.ts` |
| `useState` / `useEffect` | Angular signals and lifecycle hooks |
| React local storage helpers | `StorageService` |
| `api.ts` | `ApiService` |
| React hooks | Angular services under `hooks/` |
| Radix UI wrappers | Angular standalone UI wrappers under `components/ui/` |
| React pages | Angular page marker components plus the routed workspace template |
| `Link` / Wouter navigation | Angular Router |
| React modal state | Angular signal-driven modal |
| React toast | Angular signal-driven toast |
| `lucide-react` | `lucide-angular` |
| Tailwind/Tailwind theme | Angular global Tailwind/PostCSS setup |

The app preserves the original demo-first behavior and the Settings API connection test. Demo changes remain in browser local storage.


## Build fixes (September 25, 2026)

- Added `zone.js` and the original `tw-animate-css` dependency required by the generated Tailwind stylesheet.
- Added `@tailwindcss/typography` because the stylesheet uses the Tailwind typography plugin.
- Added `baseUrl: "."` so the existing `@/*` TypeScript path mapping is valid.
- Corrected the `StorageService` signal property types in `AppComponent`. The previous `ReturnType<StorageService['store']>` resolved to the signal value type rather than the signal itself, which caused `store()` / `settings()` template and TypeScript errors.
- Removed the unused `RouterLink` import from `AppComponent`.
