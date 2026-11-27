# AGENTS.md

Guidance for AI coding agents working on riz1.dev, a personal portfolio and
blog. This repository is public.

## Stack

Next.js 15 (App Router), React 19, next-intl, ui-sdk, plain CSS. JavaScript,
not TypeScript. Package manager: Yarn 4 (`yarn.lock`); do not use npm.

## Commands

```bash
yarn dev      # local server on port 3000
yarn test     # Vitest
yarn build    # production build
```

`yarn lint` is not set up (there is no ESLint config), so it checks nothing.

## Layout

| Path             | What lives there                               |
| ---------------- | ---------------------------------------------- |
| `app/[locale]/`  | Routes; `/[locale]` is the RudraOS desktop     |
| `components/os/` | Desktop shell: windows, dock, terminal, search |
| `components/`    | Shared and editorial components                |
| `data/`          | Profile, projects and links                    |
| `posts/`         | Blog posts in Markdown                         |
| `messages/`      | Translations: `en`, `bn`, `th`, `zh`, `de`     |
| `app/tokens.css` | Colour, type and spacing tokens                |

## Design

Read `design.md` before changing anything visual. It is the source of truth.

## Rules

- Use `@ui-sdk/react` for menus, dialogs, toolbars and other interactive
  controls instead of hand-writing ARIA. Import from the component entry, such
  as `@ui-sdk/react/menu`, and read
  `node_modules/@ui-sdk/react/docs/components/` first. Window chrome and the
  terminal are custom.
- Every control has an accessible name. Check contrast, keyboard focus and
  reduced motion for anything new.
- Route `params` are promises: `await` them.
- A new page builds its metadata with `pageMetadata` from `lib/seo.js` and gets an
  `opengraph-image.jsx` that calls `ogCard` from `lib/og.jsx`. Add it to
  `app/sitemap.js`.
- A post needs `title`, `date` (YYYY-MM-DD), `description` and `tags` in its
  front matter. Post bodies are English only.
- Facts about the author (roles, dates, employers, skills) come from `data/`.
  Never invent or embellish them.
- Never put secrets, client details or private notes in the repository,
  including in agent files.

## Before calling work done

1. `yarn test` and `yarn build` pass.
2. For UI changes, check in a real browser: light and dark, a phone width
   (375px), a short laptop screen (1366×700) and keyboard only.
3. Say what was not checked.

## Ask first

- Adding or upgrading dependencies. `@ui-sdk/*` is a pinned beta.
- Committing, pushing or deploying.
- Editing the text of published posts.
