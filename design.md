# Design system — riz1.dev

The site has two surfaces: **RudraOS**, the desktop shell at `/[locale]`, and the
**editorial pages** at `/profile`, `/blog`, `/dsa`, `/links`. They are two
surfaces of one system, not two systems.

Tokens live in `app/tokens.css`. Both surfaces resolve the same names; only
lightness and chroma change between light and dark. Colour is OKLCH throughout.

## Colour

Palettes set hue and chroma only — lightness is fixed so contrast holds across
every grade.

| Grade           | Neutral hue | Accent hue | Accent chroma |
| --------------- | ----------- | ---------- | ------------- |
| Ember (default) | 80          | 41         | 0.129         |
| Vermilion       | 52          | 28         | 0.190         |
| Cobalt          | 250         | 262        | 0.150         |
| Garden          | 132         | 150        | 0.130         |
| Plum            | 332         | 340        | 0.150         |

The grade is stored on `<html data-palette>` and persisted in `localStorage`
under `palette-preference`. Light/dark is a separate axis (`data-theme`,
`theme-preference`); both are applied by an inline script in
`app/[locale]/layout.jsx` before first paint.

Rules:

- One accent. Neutrals tint toward the anchor hue — never flat grey.
- No pure black or white. No gradients across unrelated hues.
- The accent stays under ~5% of any viewport: links, focus rings, active states,
  a primary action. Not section fills.
- Dark surface: paper ~15% L, ink ~94% L, body weight drops to 350, elevation
  goes lighter rather than darker.

## Typography

Three families, which is the ceiling.

- Display — **Fraunces**, weights 300–600, always roman.
- Body — **Spectral**, weights 300–500.
- Meta and labels — **JetBrains Mono**.

Italic is body-copy emphasis only (`.prose em`, blockquote). Headings and
display type are never italic.

The shell uses mono as its UI face; a terminal aesthetic is monospace on
purpose. On editorial pages mono stays in its two roles: meta lines and code.

Measure is 65ch, 68ch maximum on prose. Scale is a perfect fourth anchored at
`--text-base` 1.0625rem.

## Layout

4-point spacing scale. Use the named tokens (`var(--space-md)`), not raw values.

- Content pages (`/profile`, `/blog/[slug]`, `/dsa`) read as a single document:
  continuous prose, inline section heads, hairline rules.
- Index pages (`/blog`, `/blog/tag/[tag]`, `/links`) are lists of links first.
- The shell owns its own layout — the desktop metaphor, not a page shape.

Header is a centred masthead: meta line, wordmark, inline nav, rule below. The
wordmark is a link, never an `<h1>` — every page already has a content `<h1>`.
Footer anchors the wordmark in one band with navigation beside it.

## Motion

- Easings `--ease-out` / `--ease-in` / `--ease-in-out`; durations 120 / 220 / 420ms.
- Animate `transform` and `opacity` only.
- One entrance per page. Under reduced motion, opacity only, ≤150ms.
- Focus rings appear instantly and are never animated.

## Interaction

- Silent success — no celebratory toasts.
- Hover tooltips delay 800ms, focus tooltips 0ms.
- Links underline via `text-decoration-color`; no layout shift on hover.
- Primary action: solid accent fill, 4px radius. Secondary: hairline border,
  same radius and padding rhythm. No gradient fills. Pills are shell chrome only.

## What every page shares

The wordmark and masthead rhythm, the accent hue and its placement, the three
faces, the button voice, the spacing scale, the hairline rule weight.
