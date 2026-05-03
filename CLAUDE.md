@AGENTS.md

# Instructions for AI coding assistant

You are building YV Japan Buy Quest, a mobile-first shopping tracker for one person’s Japan trip.

Always follow README.md as the product spec.

## Engineering rules

- Use Next.js App Router.
- Use TypeScript.
- Use Tailwind CSS.
- Use shadcn/ui components where useful.
- Use localStorage only inside client components/hooks.
- Use `"use client"` where interactivity/localStorage is required.
- Keep the app simple. No database, no auth, no API routes for v1.
- Prefer clean, small components.
- Keep data logic in `/src/lib`.
- Keep types in `/src/types`.
- Do not introduce unnecessary dependencies.
- Do not remove import/export JSON.
- Do not remove sample data.

## UX rules

- Mobile-first.
- One-thumb use.
- Large buttons.
- No spreadsheet tables on the main mobile screens.
- Cards over tables.
- Bottom nav.
- Clear empty states.
- Cute Japan quest-log feeling.
- Prioritise speed while walking around shops.

## Core flows to preserve

1. Add item.
2. Add multiple stores to item.
3. View by day.
4. View by store.
5. Mark sold out.
6. Show backup stores.
7. Mark bought.
8. Track bought/packed.
9. Export/import backup.