# Design system — riz1.dev

The site has two surfaces: **RudraOS**, the desktop shell at `/[locale]`, and the
**editorial pages** at `/profile`, `/blog`, `/dsa`, `/links`. They are two
surfaces of one system, not two systems.

Tokens live in `app/tokens.css`. Both surfaces resolve the same names. Colour is
OKLCH throughout.

## Direction

An early-90s workstation: pinstriped title bars, square window controls, 2px
outlines, hard offset shadows, a dithered desktop and 12×12 pixel icons.
Editorial pages are documents opened in that OS. No blur, glass, soft shadows,
gradient meshes or rounded corners.

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
`app/[locale]/layout.jsx` before first paint. Switching language is a full page
load so these attributes survive.

Rules:

- All three ink levels clear 4.5:1 on paper and chrome. `--color-rule` is for
  decorative dividers only; control edges use `--color-edge`.
- The dithered desktop carries no text.
- Dark mode is a phosphor screen: the accent tints edges and the desktop.

## Typography

- Display — **Pixelify Sans**: names, headings, title bars. Never body copy or
  anything under 1rem.
- Body — **IBM Plex Sans**.
- Controls, meta and code — **IBM Plex Mono**.

Pixelify Sans is Latin only; other scripts fall back to the system face.

## Layout

4-point spacing scale. Use the named tokens.

- Home: a fixed profile card (name, role, facts, contact, "start here" links)
  that must be readable without opening anything. Only the terminal opens by
  itself, on screens 1200px and wider.
- Short screens (≤860px tall) widen the card so its links stay above the fold.
- Phones (≤720px): one scrolling column — card, app grid, open windows.
- `/profile` has a print stylesheet; it doubles as the résumé.

## Controls and accessibility

Menus, the search palette, the dock toolbar and buttons come from
`@ui-sdk/react` and are styled here via `data-slot` and state attributes.
`test/` checks that an agent can find and operate them (`yarn test`).

- Buttons: 2px edge, hard shadow, pressed state moves into the shadow.
- Icon-only controls carry a name; a visible label is part of that name.
- Focus is a 3px outline. Windows a person opens take focus and give it back to
  the dock when closed.

## Motion

Stepped, short transitions on windows. Reduced motion removes them and skips
the boot screen; any key skips it otherwise.
