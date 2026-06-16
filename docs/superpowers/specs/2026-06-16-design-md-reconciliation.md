# DESIGN.md Reconciliation Spec — Aksana 29 v5

**Date:** 2026-06-16
**Status:** Draft — pending user review
**Author:** Brainstorming session between user (Muhamad Kemal Faza) and assistant
**Scope:** Full reconciliation (L2) of `apps/web/` public site against `/DESIGN.md` (V3 design system spec)

---

## 1. Overview

### 1.1 Purpose

`/DESIGN.md` (alpha version) is the V3 design system spec, reverse-engineered from the
Vite + Firebase era codebase. It documents the canonical visual identity (deep emerald
primary `#065f46`, gold tertiary `#E5BA73`, near-black ink), typography (Bebas Neue for
hero only, Inter for everything else), and component patterns (rounded-md 6px universal
radius, shadow-lg elevation, etc.).

The current codebase is **v5** (Next.js 14 monorepo, deployed to Vercel). The public
site has been built with **V3-inspired** components, but **deviates from DESIGN.md in
specific, traceable ways**. This spec documents those deviations and the planned
reconciliation.

### 1.2 Goals

- Reconcile all 13 public components with DESIGN.md spec
- Update `tailwind.config.ts` to expose 7 missing semantic color tokens
- Port V3 `index.css` global patterns (`nav a.active`, `#hamburger.active`, `#nav-menu.active`)
  to Next.js `app/globals.css`
- Add 2 missing components documented in DESIGN.md (`SearchBar`, `Modal`)
- Remove the deprecated `tersier` token (rename to `tertiary` per DESIGN.md "Don'ts")
- Ship the reconciliation in 3 atomic deployable waves, each independently verifiable

### 1.3 Non-Goals (this spec)

- **Admin dashboard** — `components/admin/`, `app/(admin)/`. Uses shadcn/ui (per master
  design spec section 7.3), out of scope.
- **API changes** — `apps/api/`, `packages/{shared,db}/`. No backend changes.
- **Tertiary color adoption** — DESIGN.md says tertiary is "currently defined but unused.
  Reserved for future brand accent moments." This spec only renames the token
  (`tersier` → `tertiary`); actual usage of tertiary in components is a future decision.
- **New test framework** — Vitest + RTL + Playwright not added. Verification is existing
  53 tests + manual visual smoke test per wave.
- **Performance optimization** — `next/image`, `loading="lazy"`, srcSet already in place.
- **Accessibility audit** — flagged in DESIGN.md "Known Gaps", not addressed here.
- **Dark mode toggle** — DESIGN.md explicitly forbids it; light/dark inversion is structural.

### 1.4 Success Criteria

1. `grep -r "tersier" apps/web/` returns zero matches (post Wave 3)
2. `pnpm turbo test` — all 53 existing tests pass
3. `pnpm --filter @aksana/web build` — succeeds
4. `pnpm --filter @aksana/web type-check` — zero errors
5. Visual: home page header is transparent over hero, emerald on scroll
6. Visual: sub-page headers are solid emerald (`bg-primary`)
7. Visual: Hero subtitle is white, not gold
8. Visual: All cards use `rounded-md shadow-lg` (no `rounded-lg`)
9. Visual: All section headings are Inter uppercase (`text-2xl lg:text-3xl font-bold uppercase`)
10. Visual: Mobile hamburger is 3-span CSS animation (not inline SVG)
11. Visual: Footer is `bg-dark text-secondary` with Inter-bold heading, no gold

---

## 2. Architecture & File Layout

The reconciliation lives entirely in `apps/web/`. No changes to `apps/api/`,
`packages/shared/`, `packages/db/`, or `apps/web/app/(admin)/`.

### 2.1 Files to modify (17 unique files, 18 modification events)

Note: `tailwind.config.ts` is modified in both Wave 1 (add tokens) and Wave 3
(remove `tersier`), counting as 1 unique file but 2 modification events.

```
apps/web/
├── tailwind.config.ts                          [Wave 1 + Wave 3]
├── app/
│   ├── globals.css                             [Wave 1: port V3 patterns]
│   └── (public)/
│       ├── guru/page.tsx                       [Wave 3: h1 + SearchBar + grid]
│       └── pesdik/[kelas]/page.tsx             [Wave 3: h1 + SearchBar + grid]
└── components/public/
    ├── About.tsx                               [Wave 3: h2 Inter uppercase, py-24, card]
    ├── BirthdayCard.tsx                        [Wave 3: h2 Inter uppercase, card]
    ├── BirthdayPopup.tsx                       [Wave 3: confirmButtonColor CSS var]
    ├── Footer.tsx                              [Wave 2: bg-dark text-secondary, Inter h3]
    ├── Header.tsx                              [Wave 2: bg-primary, hamburger CSS, mobile]
    ├── Hero.tsx                                [Wave 2: subtitle white, no gold]
    ├── SambutanCarousel.tsx                    [Wave 3: h2 Inter, no tersier]
    ├── StudentCard.tsx                         [Wave 2: rounded-md, bg-secondary]
    ├── StudentModal.tsx                        [Wave 2: rounded-md, modal-card]
    ├── SudutSekolahCarousel.tsx                [Wave 3: h2 Inter, aspect-[3/4]]
    ├── TeacherCard.tsx                         [Wave 2: vertical card, rounded-md]
    ├── TeacherModal.tsx                        [Wave 2: rounded-md, fill image]
    └── VideoEmbed.tsx                          [Wave 3: rounded-md, Inter title]
```

### 2.2 Files to add (2 new components)

```
apps/web/components/public/
├── SearchBar.tsx                               [Wave 1: rounded-full pill, focus ring]
└── Modal.tsx                                   [Wave 1: bg-secondary/50 overlay, rounded-md]
```

### 2.3 Token transition strategy

The `tersier` token (typo for `tertiary`) is referenced in 7+ files. Removing it from
`tailwind.config.ts` before refactoring all references breaks the build.

**Transition plan:**

- **Wave 1**: Add `tertiary: '#E5BA73'` to config. Keep `tersier: '#E5BA73'` as deprecated
  alias. Both work; `tertiary` is canonical.
- **Wave 2**: Refactor high-divergence components. Most new code uses `tertiary`. `tersier`
  remains valid.
- **Wave 3**: Polish remaining components, then `grep -r "tersier" apps/web/` for final
  verification. If zero matches (excluding config), remove `tersier` from config.

---

## 3. Wave 1 — Foundation

Single deployable PR. Three deliverables.

### 3.1 Tailwind config updates (`apps/web/tailwind.config.ts`)

#### Tailwind-first policy (canonical for all future work)

- `className` MUST use Tailwind utilities (`bg-primary`, `text-tertiary`, `py-24`, `rounded-md`)
- Arbitrary values (`[Xpx]`, `[Xvw]`, `[Xvh]`) ONLY for: fluid units, aspect ratios, or
  precision dimensions not available in Tailwind scale (e.g., `90vh` for modal cap)
- Hex values ONLY appear in `tailwind.config.ts` as source-of-truth tokens
- Custom palette tokens accessed via utilities (`bg-primary`, `text-ink-mute`, `border-focus-ring`)
- **3rd-party icon props exception**: `react-feather` `color` prop accepts CSS var:
  `color="var(--tw-color-male-icon)"` (Tailwind-generated var from config token)
- **3rd-party library exception**: Swiper `<SwiperSlide style={{ width: 'auto' }}>` — API
  requires `style` prop, not `className`
- **Responsiveness** is automatic — all spacing/color/layout use Tailwind utilities with
  responsive variants (`lg:`, `md:`, `sm:`) where needed

#### New color tokens (Wave 1)

```ts
colors: {
  primary: '#065f46',           // V3 hijau tua (brand)
  secondary: '#f5f5f5',         // light gray surface (brand)
  tertiary: '#E5BA73',          // V3 gold (canonical — replaces `tersier`)
  // DEPRECATED (removed in Wave 3)
  tersier: '#E5BA73',           // alias during transition
  dark: '#171717',              // near-black

  // SEMANTIC ALIASES (used via className)
  ink: '#171717',               // semantic alias of dark
  'ink-mute': '#64748b',        // slate-500, error subtitle
  'ink-placeholder': '#94a3b8', // slate-400, search placeholder
  canvas: '#f5f5f5',            // semantic alias of secondary
  // NOTE: 'overlay' token REMOVED — use `bg-secondary/50` directly (same value)
  'male-icon': '#0c4a6e',       // sky-900, male count icon
  'female-icon': '#be185d',     // pink-700, female count icon
  'focus-ring': '#3b82f6',      // blue-500, search focus border/ring
}
```

#### Font family (no change)

`font-heading` (mapped to `var(--font-bebas)`) and `font-body` (mapped to `var(--font-inter)`)
stay as-is. The semantic name is preferable to DESIGN.md's `font-bebas`/`font-inter` and
the underlying font is identical.

#### Spacing/radius (no change)

Tailwind defaults already match DESIGN.md: `rounded-md` = 6px, `py-24` = 96px.

#### Hex value inventory (post Wave 1)

| Hex | Token | Class name | Hardcoded? |
|---|---|---|---|
| `#065f46` | `primary` | `bg-primary` | No — via token |
| `#f5f5f5` | `secondary` | `bg-secondary` | No — via token |
| `#E5BA73` | `tertiary` | `bg-tertiary` | No — via token |
| `#171717` | `dark` / `ink` | `bg-dark` / `text-ink` | No — via token |
| `#64748b` | `ink-mute` | `text-ink-mute` | No — via token |
| `#94a3b8` | `ink-placeholder` | `text-ink-placeholder` | No — via token |
| `#0c4a6e` | `male-icon` | `color="var(--tw-color-male-icon)"` | No — via CSS var |
| `#be185d` | `female-icon` | `color="var(--tw-color-female-icon)"` | No — via CSS var |
| `#3b82f6` | `focus-ring` | `border-focus-ring` | No — via token |
| `rgba(245,245,245,0.5)` | (no token) | `bg-secondary/50` | No — Tailwind opacity |

**Zero hardcoded hex in `className` or component code.**

### 3.2 Global CSS port (`apps/web/app/globals.css`)

V3's `index.css` patterns ported to Next.js `@layer components` block:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer components {
  /* NavLink active state (DESIGN.md "Components > NavLink") */
  nav a.active {
    @apply bg-primary text-secondary
           hover:bg-primary/80
           lg:bg-secondary lg:text-primary
           lg:hover:bg-secondary/80;
  }

  /* Hamburger line (DESIGN.md "Components > Hamburger Toggle") */
  #hamburger span {
    @apply block w-7 h-0.5 my-2.5 bg-primary
           transition duration-300 origin-center;
  }

  /* Hamburger animated X — toggled via #hamburger.active */
  #hamburger.active span:nth-child(1) { @apply -rotate-45 origin-top-right; }
  #hamburger.active span:nth-child(2) { @apply scale-0; }
  #hamburger.active span:nth-child(3) { @apply rotate-45 origin-bottom-right; }

  /* Mobile nav menu slide-in — toggled via #nav-menu.active */
  #nav-menu {
    @apply -translate-y-[700px] shadow-2xl bg-secondary;
  }
  #nav-menu.active {
    @apply translate-y-0;
  }
}
```

**Notes:**

- Hamburger uses `w-7 h-0.5 my-2.5` (28×2×10px) instead of DESIGN.md's literal 30×2×10px.
  Visual delta 2px width (negligible). Pure utilities, no arbitrary values.
- `#nav-menu` uses `bg-secondary` (per DESIGN.md), NOT `bg-dark/95` (current code).
- Active states are toggled via component-level `classList.toggle` (Header.tsx),
  not via the Vite/Vue-style `[id].active` CSS-only approach. Component uses
  `useState` and applies `id="hamburger"` and `id="nav-menu"` plus `active` class.

### 3.3 New component: `SearchBar.tsx`

Per DESIGN.md "Components > SearchBar":

```tsx
'use client';
import { useRef, useEffect } from 'react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
}

export function SearchBar({
  value,
  onChange,
  placeholder = 'Cari...',
  autoFocus = false,
}: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  return (
    <input
      ref={inputRef}
      type="text"
      value={value}
      onChange={(e) => {
        onChange(e.target.value);
        // DESIGN.md: scroll to top on every keystroke
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }}
      placeholder={placeholder}
      className="w-full rounded-full border border-ink-placeholder
                 bg-canvas text-ink px-4 py-2 text-sm font-light
                 placeholder:italic placeholder:text-ink-placeholder
                 focus:border-focus-ring focus:ring-1 focus:ring-focus-ring
                 focus:outline-none transition"
    />
  );
}
```

### 3.4 New component: `Modal.tsx`

Per DESIGN.md "Components > Modal (currently unused)":

```tsx
'use client';
import { useEffect } from 'react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export function Modal({ open, onClose, children }: ModalProps) {
  // ESC to close
  useEffect(() => {
    if (!open) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [open, onClose]);

  // Scroll lock
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center
                 bg-secondary/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-canvas text-ink rounded-md shadow-lg
                   max-w-lg w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
```

DESIGN.md says Modal was "currently unused" in V3, but having the component available
is required for the design system to be complete. The component is **dormant** —
exported from `components/public/Modal.tsx` but not rendered anywhere unless a parent
calls it.

### 3.5 Wave 1 verification

- `pnpm --filter @aksana/web type-check` — zero errors
- `pnpm --filter @aksana/web build` — Next.js build succeeds
- `pnpm --filter @aksana/web lint` — no new lint warnings
- `pnpm turbo test` — all 53 existing tests pass
- Visual: dev server, home page renders, new `tertiary` token is available in DevTools

---

## 4. Wave 2 — High-Divergence Components

7 components with the largest visual delta. Each refactored against the spec section-by-section.
Data flow (props, API calls) unchanged — only `className` and structural markup change.

### 4.1 `Header.tsx`

| Aspect | Current | DESIGN.md / Spec |
|---|---|---|
| Solid background (sub-page) | `bg-dark/95 backdrop-blur-sm shadow-lg` | `bg-primary` (solid emerald, no `/80`) |
| Solid background (home, scrolled) | `bg-dark/95` | `lg:bg-primary/80 bg-secondary/70 lg:shadow-lg` |
| Nav link color | `text-gray-200/300` | `text-secondary` (home) / `text-primary` (sub-page) |
| Active nav link | `text-tersier` (component-level) | `nav a.active` global class (from globals.css) |
| Hamburger | Inline SVG with `if(loaded) X else bars` | 3 `<span>` + CSS `#hamburger.active` from globals.css |
| Mobile menu | `bg-dark/98 border-t` always visible | `bg-secondary shadow-2xl` + slide-in via `#nav-menu.active` |
| Brand color | `text-tersier` (gold) | `text-secondary` (white) — no gold |

**Net effect:** Header becomes transparent emerald on home, solid emerald on sub-pages,
with white nav links. 3-span CSS hamburger replaces inline SVG. Mobile menu slides in
from above with `shadow-2xl` lift.

### 4.2 `Hero.tsx`

| Aspect | Current | DESIGN.md / Spec |
|---|---|---|
| h1 | `text-[18vw] font-heading text-white tracking-widest` | `text-[18vw] tracking-[2vw] font-extrabold font-heading text-secondary` |
| Subtitle | `text-tersier text-xl mt-4` | `text-[3vw] tracking-[1.3vw] font-extrabold text-secondary` (white) |
| Image overlay | `brightness-50` (correct) | `brightness-50` (correct) |

**Net effect:** Subtitle becomes fluid-white with Bebas tracking, no gold accent. The
gold was an unprompted v5 addition; DESIGN.md keeps the hero monochromatic-white on
dark image.

### 4.3 `StudentCard.tsx`

| Aspect | Current | DESIGN.md / Spec |
|---|---|---|
| Card container | `bg-white rounded-lg shadow` | `bg-secondary text-primary rounded-md overflow-hidden shadow-lg` |
| Image | `aspect-[3/4] w-full` | (same — `aspect-[3/4] w-full` ✓) |
| Body padding | `p-3` (12px) | `p-4` (16px) |
| Name typography | `font-semibold text-sm truncate` | `text-lg font-semibold` (h4) |
| Jabatan typography | `text-xs text-gray-500` | `text-sm font-light py-3 border-b border-primary/20` |

### 4.4 `TeacherCard.tsx`

Structural change: horizontal card → vertical card.

| Aspect | Current | DESIGN.md / Spec |
|---|---|---|
| Layout | `flex items-center gap-4 p-4` (horizontal) | Vertical card in 1→2→3→4 grid |
| Image size | `w-16 h-16 rounded-full` | `w-full aspect-[3/4]` (full card width, portrait) |
| Grid placement (guru page) | `md:grid-cols-2` (2 columns) | `xl:w-1/4 lg:w-1/3 sm:w-1/2 w-full p-3` wrapper |
| Card style | `bg-white rounded-lg shadow` | `bg-secondary text-primary rounded-md overflow-hidden shadow-lg` |
| Body | `flex` with name left, jabatan left | `p-4` with name h4 + jabatan h5 |

**Note:** `guru/page.tsx` will need to update its grid from `md:grid-cols-2` to use the
responsive 1→2→3→4 wrapper per component instance.

### 4.5 `Footer.tsx`

| Aspect | Current | DESIGN.md / Spec |
|---|---|---|
| Container | `bg-dark text-white` | `bg-dark text-secondary` (semantic correct) |
| Padding | `py-12 px-4` | `py-16 px-10` |
| Heading typography | `font-heading text-2xl text-tersier` (Bebas gold) | `text-xl lg:text-2xl font-bold` (Inter, no gold) |
| Body | `text-gray-400 text-sm` | `text-base mt-5` |
| Layout | `grid md:grid-cols-2 gap-8` | `flex flex-wrap`, columns at `lg:w-1/2` |

### 4.6 `StudentModal.tsx`

| Aspect | Current | DESIGN.md / Spec |
|---|---|---|
| Backdrop | `bg-black/50` | `bg-secondary/50` (overlay semantics) |
| Card | `bg-white rounded-lg` | `bg-canvas rounded-md shadow-lg max-w-lg` |
| Image wrapper | `rounded-t-lg` | (no extra rounding — parent `rounded-md overflow-hidden`) |
| Title | `font-heading text-primary` (Bebas) | `text-lg font-semibold text-primary` (Inter) |

### 4.7 `TeacherModal.tsx`

| Aspect | Current | DESIGN.md / Spec |
|---|---|---|
| Backdrop | `bg-black/80` | `bg-secondary/50` |
| Card | `bg-white rounded-lg` | `bg-canvas rounded-md shadow-lg max-w-2xl p-6` |
| Image | `<Image ... width={200} height={200} className="rounded-lg" />` | `<div className="relative w-48 h-48 rounded-md overflow-hidden"><Image ... fill ... /></div>` (use `next/image` `fill` mode + Tailwind utility) |
| Mapel chips | `bg-tersier/20` (typo) | `bg-tertiary/20` (canonical) |

**Note:** Image refactor `width={200}` → `w-48` (192px). Visual delta 8px (negligible).
Trade-off: `next/image` `fill` mode requires `relative` parent + `overflow-hidden` for
proper cropping, but eliminates JSX pixel props.

### 4.8 Wave 2 verification

- Same as Wave 1 (`type-check`, `build`, `lint`, `test`)
- Visual: home, `/guru`, `/pesdik/xii-ipa-1` each render correctly
- Visual: Header is solid emerald on sub-pages, transparent on home (emerald on scroll)
- Visual: StudentCard/TeacherCard have `rounded-md shadow-lg bg-secondary text-primary`
- Visual: Hero subtitle is white, not gold
- Visual: Hamburger animates 3 lines → X via CSS (not inline SVG)

---

## 5. Wave 3 — Polish Components + Token Cleanup

6 remaining components + 2 page files + final `tersier` removal.

### 5.1 Component refactors

#### `About.tsx`

| Aspect | Current | Spec |
|---|---|---|
| h2 | `font-heading text-primary` (Bebas) | `text-2xl lg:text-3xl font-bold uppercase text-primary` (Inter) |
| Section padding | `py-20 px-4` | `py-24 px-4` |
| Card | `bg-white rounded-lg shadow` | `bg-secondary rounded-md overflow-hidden shadow-lg` |

#### `BirthdayCard.tsx`

| Aspect | Current | Spec |
|---|---|---|
| h2 | `font-heading text-primary` (Bebas) | `text-2xl lg:text-3xl font-bold uppercase text-primary` (Inter) |
| Section padding | `py-12 px-4` | `py-24 px-4` |
| Background | `bg-gradient-to-r from-primary/5 to-tersier/5` | `bg-primary/5` (no gradient, no gold) |
| Card | `bg-white rounded-lg shadow` | `bg-secondary rounded-md overflow-hidden shadow-lg` |

#### `BirthdayPopup.tsx`

| Aspect | Current | Spec |
|---|---|---|
| `confirmButtonColor` | `'#065f46'` (hardcoded hex) | `'var(--tw-color-primary)'` (CSS var from config) |

**Note:** No structural changes — this is purely a hex-to-CSS-var refactor for
single-sourcing the brand color.

#### `SambutanCarousel.tsx`

| Aspect | Current | Spec |
|---|---|---|
| h2 | `text-3xl font-heading text-primary` (Bebas) | `text-2xl lg:text-3xl font-bold uppercase text-primary` (Inter) |
| Section padding | `py-16 px-4` | `py-24 px-16` |
| Photo wrapper | `border-4 border-tersier/30` | `border-4 border-primary/30` (no gold) |
| Name typography | `font-heading` (Bebas) | `font-semibold text-xl` (Inter) |
| Jabatan color | `text-tersier font-medium` | `text-primary/80 font-medium` |
| Card | `bg-white rounded-xl shadow-lg` | `bg-secondary rounded-md shadow-lg` |

#### `SudutSekolahCarousel.tsx`

| Aspect | Current | Spec |
|---|---|---|
| h2 | `text-3xl font-heading text-tersier` (Bebas gold) | `text-2xl lg:text-3xl font-bold uppercase text-secondary` (Inter white, since on dark bg) |
| Section padding | `py-16 px-4 bg-dark` | `py-24 px-16 bg-dark` |
| Slide dimensions | `w-[280px] h-[380px] md:w-[320px] md:h-[420px]` | `w-70 aspect-[3/4] md:w-80` (utilities + aspect ratio) |
| Image card | `rounded-xl` | `rounded-md` |

**Note:** Aspect ratio `3/4` gives 280×373 (mobile) and 320×427 (desktop). Close to
original 380/420. Eliminates `h-[380px]` and `md:h-[420px]` arbitrary values.

#### `VideoEmbed.tsx`

| Aspect | Current | Spec |
|---|---|---|
| Container | `bg-secondary rounded-lg overflow-hidden shadow-lg` | `bg-secondary rounded-md overflow-hidden shadow-lg` |
| Title | `font-heading text-xl text-primary` (Bebas) | `text-lg font-semibold text-primary` (Inter) |
| Body padding | `p-4` (correct) | `p-4` (no change) |

### 5.2 Page file refactors

#### `guru/page.tsx`

| Aspect | Current | Spec |
|---|---|---|
| h1 | `text-3xl font-heading text-primary` (Bebas) | `text-2xl lg:text-3xl font-bold uppercase text-primary` (Inter) |
| Search input | `<input type="search" ... className="mt-4 w-full p-2 border rounded" />` | `<SearchBar value={search} onChange={setSearch} placeholder="Cari guru..." />` |
| Per-jabatan h2 | `text-xl font-heading text-tersier` (Bebas gold) | `text-2xl font-bold uppercase text-primary` (Inter, no gold) |
| Grid | `grid md:grid-cols-2 gap-4` | (uses `TeacherCard` wrapper with `xl:w-1/4 lg:w-1/3 sm:w-1/2 w-full p-3` for 1→2→3→4) |

#### `pesdik/[kelas]/page.tsx`

| Aspect | Current | Spec |
|---|---|---|
| h1 | `text-3xl font-heading text-primary` (Bebas) | `text-2xl lg:text-3xl font-bold uppercase text-primary` (Inter) |
| Search input | `<input type="search" ... className="mt-4 w-full p-2 border rounded" />` | `<SearchBar value={search} onChange={setSearch} placeholder="Cari siswa..." />` |
| Grid | `grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4` (2→3→4→5) | `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4` (1→2→3→4) |

**Note:** Grid changes from 2→3→4→5 (5 columns at lg) to 1→2→3→4 (4 columns at xl).
Matches DESIGN.md "1→2→3→4 card grid" rule explicitly documented in "Don't" section.

### 5.3 Token cleanup (the load-bearing step)

Before removing `tersier` from config:

```bash
# 1. Verify zero references
grep -r "tersier" apps/web/
# Expected: only `tailwind.config.ts` line itself

# 2. Type-check
pnpm --filter @aksana/web type-check

# 3. Build
pnpm --filter @aksana/web build

# 4. Local dev server smoke test
pnpm --filter @aksana/web dev
# Manually verify: home + /guru + /pesdik/xii-ipa-1 + /galeri render correctly
```

If grep returns zero matches and build succeeds, remove `tersier: '#E5BA73'` from
`tailwind.config.ts`. Final state has only `tertiary: '#E5BA73'`.

**This is the only step in the reconciliation where the build can break.** All Wave 1
and Wave 2 changes are `className`-only and don't touch tokens. The cleanup commits
the final token state.

### 5.4 Wave 3 verification

- Same as Wave 1 + Wave 2
- `grep -r "tersier" apps/web/` returns zero matches
- Visual: full site audit at desktop (1280px) + tablet (768px) + mobile (375px) viewports
- Visual: `py-24` rhythm on all sections
- Visual: no remaining `text-gray-200/300` cool grays in nav
- Visual: all cards have `rounded-md`
- Visual: all section h2 are Inter uppercase
- Visual: `text-tertiary` works (post `tersier` removal)

---

## 6. Testing Strategy

DESIGN.md "Known Gaps" explicitly notes: *"No tests. The project has no test framework
configured."* Existing coverage is shared schemas (22 Vitest) + API endpoints (31 Jest)
= 53 tests. Zero UI tests.

For this reconciliation, we use **lightweight verification at each wave** rather than
introducing a new test framework. Rationale: setting up Vitest + RTL + Playwright is
its own multi-day effort that would significantly expand scope beyond "implement
DESIGN.md". The reconciliation is **visual refactor**, not behavior change — API
contracts and data flow unchanged. Existing tests continue to pass; visual verification
is the primary signal.

### 6.1 Per-wave verification

| Wave | Type-check | Build | Lint | Test (53) | Visual |
|---|---|---|---|---|---|
| **1: Foundation** | Required | Required | Required | Required | Home renders, header solid on scroll, hamburger still toggles (3 lines) |
| **2: High-divergence** | Required | Required | Required | Required | Home + /guru + /pesdik/xii-ipa-1; Header solid emerald sub-pages; cards rounded-md; Hero white subtitle |
| **3: Polish + cleanup** | Required | Required | Required | Required | Full site at 3 viewports; py-24 rhythm; no `text-gray-200/300` cool grays; no `rounded-lg` |

### 6.2 Out of scope (test infrastructure)

- No new test framework (Vitest + RTL)
- No Playwright visual regression
- No automated accessibility audit
- No Storybook

These are flagged in DESIGN.md "Known Gaps" as future improvements. The current work
is reconciliation, not test infrastructure.

---

## 7. Risks & Migration Concerns

### 7.1 Risk 1: Vercel deploy breaks the live site (highest)

**Impact:** The site is live at `aksana-29-nextjs-web.vercel.app`. Any deploy that
breaks `className` references (e.g., removing `tersier` too early, or wrong token
names) will show broken UI publicly.

**Mitigation:** Each wave ends with `pnpm --filter @aksana/web build` locally + manual
visual smoke test in `pnpm dev` before pushing. Wave 3's `tersier` removal is gated on
a clean `grep -r "tersier" apps/web/` returning zero results (excluding the config
file itself).

### 7.2 Risk 2: `tersier` has hidden transitive references

**Impact:** If any `text-tersier/X` opacity variant or any computed value references
`tersier`, removal could be missed.

**Mitigation:** The grep is recursive across `apps/web/` (excluding `node_modules` and
`.next`). Wave 3's pre-merge checklist explicitly includes this grep as a pass/fail
gate.

### 7.3 Risk 3: TeacherCard structural change affects guru page layout

**Impact:** Current TeacherCard is a horizontal `flex items-center` card in a 2-column
grid. DESIGN.md version is a vertical card in a 1→2→3→4 grid. **Visual change** that
users will notice.

**Mitigation:** This is a deliberate spec compliance change. No migration path needed —
the visual change is the goal. Note in commit message and brief user-facing note
(optional, internal project).

### 7.4 Risk 4: Hamburger CSS animation vs inline SVG

**Impact:** Switching from inline SVG (current, simple) to 3-span CSS animation
(DESIGN.md, more elaborate) changes the visual feel of the mobile menu toggle.

**Mitigation:** This is the spec. The CSS approach matches V3. After Wave 2, the
toggle will visually match the documented behavior.

### 7.5 Risk 5: Swiper carousels need visual recheck

**Impact:** Swiper is installed and working. DESIGN.md doesn't mention Swiper but
doesn't forbid it. The current carousels have h2 with `font-heading` (Bebas) which
violates "Bebas is a one-shot" rule. Wave 3 fixes the typography. The Swiper library
itself is fine.

**Mitigation:** Wave 3 refactors only the `className`, not the Swiper integration. If
Swiper breaks visually post-refactor (e.g., pagination color), it's a small fix in the
same PR.

### 7.6 Risk 6: Subtle whitespace/sizing differences break visual rhythm

**Impact:** Switching from `py-20` (80px) → `py-24` (96px) on About, `rounded-lg` →
`rounded-md` on cards, `py-12` → `py-16` on Footer — these are all subtle but
cumulative. Site will look different, even if the data and content are unchanged.

**Mitigation:** This is the spec. The visual delta is the reconciliation.
User-facing communication is optional; the change is contained to this project (no
external integrations break).

### 7.7 Risk 7: Scope creep into admin components

**Impact:** DESIGN.md is public-site only. Admin components (`components/admin/`,
`app/(admin)/`) have their own design (shadcn/ui per master design spec section 7.3)
and are out of scope.

**Mitigation:** Spec explicitly excludes admin. The diff in Waves 1-3 is contained to
`components/public/`, `app/(public)/`, `app/globals.css`, and `tailwind.config.ts`.
No admin file changes.

### 7.8 Migration check (one-time, at start of Wave 1)

```bash
git log --oneline -20       # confirm clean history
git status                  # confirm working tree clean
```

Per handoff `handoff-aksana29-evolution.md`: "Working tree: clean" and 28 commits in.

---

## 8. Final Summary

### 8.1 Work breakdown

| Wave | Files modified (events) | New files | Time | Deployable |
|---|---|---|---|---|
| **1: Foundation** | `tailwind.config.ts` (add tokens), `app/globals.css` = 2 events | `SearchBar.tsx`, `Modal.tsx` | ~45 min | Yes |
| **2: High-divergence** | `Header.tsx`, `Hero.tsx`, `StudentCard.tsx`, `TeacherCard.tsx`, `Footer.tsx`, `StudentModal.tsx`, `TeacherModal.tsx` = 7 events | (none) | ~2-3 hours | Yes |
| **3: Polish + cleanup** | `About.tsx`, `BirthdayCard.tsx`, `BirthdayPopup.tsx`, `SambutanCarousel.tsx`, `SudutSekolahCarousel.tsx`, `VideoEmbed.tsx`, `guru/page.tsx`, `pesdik/[kelas]/page.tsx`, `tailwind.config.ts` (remove `tersier`) = 9 events | (none) | ~1.5-2 hours | Yes |
| **Total** | 18 modification events across 17 unique files | 2 new files = **19 unique files in scope** | ~4-6 hours | 3 deploys |

### 8.2 Arbitrary value inventory (post-revision)

**Zero pixel arbitrary values in `className`.** All `w-[Xpx]`/`h-[Xpx]` replaced with
Tailwind utilities.

**Remaining arbitrary values (all justified):**

| File | Value | Type | Reason |
|---|---|---|---|
| `Hero.tsx` | `text-[18vw]`, `text-[3vw]`, `tracking-[2vw]`, `tracking-[1.3vw]` | Fluid vw | Hero typography — DESIGN.md requires fluid responsive |
| `StudentCard.tsx` | `aspect-[3/4]` | Aspect ratio | Portrait image — no Tailwind utility for aspect ratio |
| `StudentModal.tsx` | `max-h-[90vh]` | Fluid vh | Modal viewport cap (90vh, no exact utility) |
| `SudutSekolahCarousel.tsx` | `aspect-[3/4]` | Aspect ratio | Slide portrait — no Tailwind utility for aspect ratio |
| `globals.css` | `-translate-y-[700px]` | Pixel | Mobile menu slide-in offset (DESIGN.md explicit 700px) |
| `BirthdayPopup.tsx` | `var(--tw-color-primary)` | CSS var | SweetAlert2 prop, not className |

### 8.3 Next step

After this spec is approved by user, invoke the `writing-plans` skill to create a
per-wave implementation plan with task-level detail.

---

## 9. Approval

- [ ] Reviewed by user (Muhamad Kemal Faza)
- [ ] Approved for implementation planning

**Next step:** invoke `writing-plans` skill to create implementation plan.

---

## 10. References

- `/DESIGN.md` — Master design spec (V3 reverse-engineered, version: alpha)
- `/CONTEXT.md` — Domain language glossary
- `/docs/superpowers/specs/2026-06-15-aksana-29-design.md` — Master design doc
- `/handoff-aksana29-evolution.md` — Project state handoff
- `/memory/2026-06-15.md` — Initial brainstorming session
- `/memory/2026-06-16.md` — Implementation sprint day
