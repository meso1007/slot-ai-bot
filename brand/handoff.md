# SLOT COMPASS — Logo Handoff

Method: `logo-design` skill (0x-wzw/logo-design) — research → 8 studies → mechanical scoring → system → suite → QA.

## Selected system
- **Primary mark:** Study 01 APERTURE C — a C ring with a 64° right aperture and a vertical needle.
- **Geometry:** R 170 / SW 24 / GAP 64° / needle 150 × 34 / needle stroke 18 / ticks 120–140.
- **Micro-mark:** R 54 / SW 24 / GAP 90° / needle 42 × 14, designed for 16px.
- **Palette:** ink `#0B1220`, blue `#1D4ED8` (paper), light blue `#60A5FA` (dark), paper `#FFFFFF`.
- **Terminal language:** round. Do not mix sheared/flared terminals.

## Files
- `brand/brief.md` — positioning + decision tests
- `brand/studies/*.svg` — 8 annotated construction studies
- `brand/scoreboard.md` — scoring + selection rationale
- `brand/suite/symbol.svg` — color symbol (paper)
- `brand/suite/symbol-mono.svg` — single-color ink
- `brand/suite/symbol-dark.svg` — dark-mode symbol (source of `assets/icon.png`)
- `brand/suite/micro-mark.svg` — 16px-first mark
- `brand/suite/lockup.svg` — symbol + tracked wordmark
- `brand/suite/construction.svg` — public construction proof
- `brand/qa/favicon-ladder.svg` — 16→96px ladder
- `brand/qa/contrast.md` — contrast numbers
- `brand/out/` — rendered PNGs + studies sheet + blur test

## Account usage
- LINE profile image: `assets/icon.png` (640×640, 8-bit PNG).
- Account name: `SLOT COMPASS` (or `スロットコンパス`).
- Card wordmark: `SLOT COMPASS` (already in `src/flex.ts`).

## Usage law
1. Clear space = cap-height of logotype on all sides.
2. Minimum sizes: symbol 24px, micro-mark 16px, lockup 160px wide.
3. Never stretch, rotate, recolor off-palette, add shadows/gradients, or blind-invert.
4. Vector is master; PNG renders are conveniences.
5. Dark mode is built, not inverted.

## QA status（honest）
| Test | Result | Evidence |
| --- | --- | --- |
| Single color | pass | `suite/symbol-mono.svg` |
| Favicon ladder 16→96 | pass with caveat | 16px: C reads, needle reduces to a bar |
| Blur σ1.2 / σ2.6 | pass | `out/blur.png` |
| Contrast | pass | `qa/contrast.md` |
| Scrolling (<1s) | **pending** | needs real thumb test |
| Physical (4–6ft / print) | **pending** | needs print/emboss trial |
| Uniqueness reverse-search | **pending** | not run |
| Legibility flip | **pending** | not run |

`pending ≠ passed`.
