# Design System

Flat and editorial, in the spirit of MetaMask's public site: big condensed headlines, near-black pill buttons, solid color tiles. **No gradients anywhere.**

Tokens live in `src/app/globals.css`. Components only use tokens, so the same Button, Card, Input and Notice work in both themes.

## Themes

| Token | App (`:root`, dark navy) | Public site and auth (`.theme-light`) |
| --- | --- | --- |
| `bg` | `#071426` | `#F3F3F0` |
| `card` | `#0D1B31` | `#FFFFFF` |
| `elevated` | `#13233D` | `#EBEBE6` |
| `border` | `#213450` | `#DCDCD5` |
| `fg` | `#F5F8FF` | `#0B0F17` |
| `muted` | `#9AAEC9` | `#555C69` |
| `primary` (links, focus, selection) | `#4C8DFF` | `#1F5FE0` |
| `success` / `warning` / `danger` | `#22C99A` / `#F5B94C` / `#F0616D` | `#0E8A66` / `#9A5B00` / `#C4303D` |

Landing tiles (light theme only, flat): `tile-ice #DBE5FF`, `tile-sand #F2E5CF`, `tile-mint #D3EFE2`, `tile-lilac #E5DEF8`.
Brand accent `#3478F6` appears as a solid color in the logo and the 3D mark only.

## Typography

MetaMask's site uses Grotzec Condensed (commercial, licensed to MetaMask) for headings, Inter for body and JetBrains Mono for code. We use the same open fonts where possible and Grotzec's own declared fallback for headings:

| Role | Font | Notes |
| --- | --- | --- |
| Display headings | Oswald 500 | `.display`: line height 0.92, tracking -0.015em. Landing H1 58 to 116 px |
| Body and UI | Inter | 15 to 20 px |
| Addresses, paths, hashes | JetBrains Mono | |

## Shape and spacing

- 8 px scale. Section padding 80 to 112 px vertically on the landing page.
- Radius: buttons and pills full, inputs 12 px, cards 20 px, landing tiles 28 to 32 px.
- Borders instead of shadows. Only dialogs and menus use a soft shadow.

## Buttons

`primary` is solid `fg` on `bg` (ink pill on light, white pill on dark). `secondary` is a bordered card-colored pill. `ghost`, `danger`, `link`. Sizes 36, 44 and 52 px.

## Motion and 3D

- Hero: WebGL scene (Three.js via React Three Fiber). The extruded XORVET mark scales in on load and spins continuously (about one turn every 7 s, faster as you scroll). Four coins orbit it on a tilted ellipse and flip as they travel. The pointer tilts the whole scene.
- Rendered at up to 2x device pixel ratio for sharpness. Loaded lazily on the client. Stops rendering when off-screen.
- `prefers-reduced-motion`: nothing moves on its own; the mark and coins only tilt toward the cursor. No WebGL: flat logo.
- Scroll reveals are CSS only and never hide content before JavaScript runs.
- Network strip marquee, 40 s loop, stops under reduced motion.

## Imagery

- One photograph (Unsplash, free license): a person writing in a notebook, used for the self-custody steps. Stored locally at `public/images/writing-notebook.jpg`.
- Product illustrations are built from real UI components and clearly use example values.

## Icons

Lucide only, 16 to 24 px, stroke 2. Decorative icons `aria-hidden`; icon-only buttons have an `aria-label`. No emojis.

## Layout

- Mobile `< 768`: top bar, bottom nav (Home, Activity, Swap, Settings), bottom-sheet dialogs.
- Tablet `768-1023`: menu button opens a navigation drawer.
- Desktop `>= 1024`: 240 px sidebar, logo top left, content max 1120 px. Landing max 1280 px.
- Verified with no horizontal overflow at 320 and 375 px.
