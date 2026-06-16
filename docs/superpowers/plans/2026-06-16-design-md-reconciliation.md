# DESIGN.md Reconciliation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (sequential chains within waves) or superpowers:dispatching-parallel-agents (parallel tasks within a wave). See Task Grouping section for execution strategy.

**Goal:** Reconcile all 13 public components in `apps/web/` against `/DESIGN.md` (V3 alpha design system), removing the deprecated `tersier` token and adding `SearchBar` + `Modal` components, in 3 deployable waves.

**Architecture:** Atomic visual refactor. No API/DB/admin changes. `tailwind.config.ts` is the single source of truth for color tokens. `app/globals.css` ports V3 `index.css` patterns (`nav a.active`, `#hamburger.active`, `#nav-menu.active`) to Next.js `@layer components`. All `className` uses Tailwind utilities (no hardcoded hex); arbitrary values reserved for fluid units (`vw`/`vh`) and aspect ratios.

**Execution Strategy:** Hybrid — Sequential chains within each wave (config → components), with parallel batches where components are independent. Each wave ends with a Vercel deploy gate.

**Tech Stack:** Next.js 14 (App Router) + Tailwind CSS + TypeScript + pnpm + Turborepo.

**Reference:** `/docs/superpowers/specs/2026-06-16-design-md-reconciliation.md` (master spec)

**Important TDD note:** This is a UI refactor. No automated UI test framework exists (per DESIGN.md "Known Gaps"). The "test" analog is: (1) read current code, identify deviations from DESIGN.md, (2) apply refactor, (3) verify via `pnpm type-check` + `pnpm build` + `pnpm dev` visual smoke test. Existing 53 backend/schema tests must continue to pass.

---

## Task Grouping

### Wave 1: Foundation (Sequential Chain)

**Sequential Chain 1.1:** Foundation changes — config + CSS + 2 new components.

- Task 1.1: Add 7 semantic color tokens to `tailwind.config.ts`
- Task 1.2: Port V3 CSS patterns to `app/globals.css` (depends on Task 1.1 for `bg-primary` semantics)
- Task 1.3: Add `SearchBar.tsx` component (depends on Task 1.1 for new tokens `border-ink-placeholder`, `ring-focus-ring`)
- Task 1.4: Add `Modal.tsx` component (depends on Task 1.1 for `bg-canvas` token)
- Task 1.5: Wave 1 verification + commit + Vercel deploy

### Wave 2: High-Divergence Components (Parallel Batch + Sequential Tail)

**Parallel Batch 2.1:** 7 component refactors (all independent files, all use tokens from Wave 1).

- Task 2.1: Refactor `Hero.tsx`
- Task 2.2: Refactor `Header.tsx`
- Task 2.3: Refactor `StudentCard.tsx`
- Task 2.4: Refactor `TeacherCard.tsx` (structural change: horizontal → vertical)
- Task 2.5: Refactor `Footer.tsx`
- Task 2.6: Refactor `StudentModal.tsx`
- Task 2.7: Refactor `TeacherModal.tsx`

**Sequential Chain 2.2:** Wave 2 verification + commit + Vercel deploy (depends on Batch 2.1)

### Wave 3: Polish + Token Cleanup (Parallel Batch + Sequential Tail)

**Parallel Batch 3.1:** 8 refactors of remaining components + pages.

- Task 3.1: Refactor `About.tsx`
- Task 3.2: Refactor `BirthdayCard.tsx`
- Task 3.3: Refactor `BirthdayPopup.tsx` (CSS var refactor)
- Task 3.4: Refactor `SambutanCarousel.tsx`
- Task 3.5: Refactor `SudutSekolahCarousel.tsx`
- Task 3.6: Refactor `VideoEmbed.tsx`
- Task 3.7: Refactor `guru/page.tsx`
- Task 3.8: Refactor `pesdik/[kelas]/page.tsx`

**Sequential Chain 3.2:** Token cleanup (depends on Batch 3.1 — all `text-tersier` references must be migrated first).

- Task 3.9: Remove `tersier` from `tailwind.config.ts`
- Task 3.10: Wave 3 verification + commit + Vercel deploy

---

## Wave 1: Foundation

### Task 1.1: Add 7 semantic color tokens to tailwind.config.ts

**Type:** `AFK`
**Blocked by:** None

**Files:**
- Modify: `apps/web/tailwind.config.ts:8-15` (the `colors` block)

**Current code:**

```ts
theme: {
  extend: {
    colors: {
      primary: '#065f46',      // V3 hijau tua
      secondary: '#f5f5f5',
      tersier: '#E5BA73',      // V3 gold
      dark: '#171717',
    },
    fontFamily: {
      heading: ['var(--font-bebas)', 'sans-serif'],
      body: ['var(--font-inter)', 'sans-serif'],
    },
  },
},
```

**New code:**

```ts
theme: {
  extend: {
    colors: {
      // Brand (existing)
      primary: '#065f46',           // V3 hijau tua (deep emerald)
      secondary: '#f5f5f5',         // light gray surface
      tertiary: '#E5BA73',          // V3 gold (canonical — replaces `tersier`)
      // DEPRECATED (to remove in Wave 3 — kept as alias during transition)
      tersier: '#E5BA73',
      dark: '#171717',              // near-black

      // Semantic aliases
      ink: '#171717',               // semantic alias of dark (default text)
      'ink-mute': '#64748b',        // slate-500, error subtitle
      'ink-placeholder': '#94a3b8', // slate-400, search placeholder
      canvas: '#f5f5f5',            // semantic alias of secondary
      // NOTE: 'overlay' token removed — use `bg-secondary/50` directly
      'male-icon': '#0c4a6e',       // sky-900, male count icon
      'female-icon': '#be185d',     // pink-700, female count icon
      'focus-ring': '#3b82f6',      // blue-500, search focus border/ring
    },
    fontFamily: {
      heading: ['var(--font-bebas)', 'sans-serif'],
      body: ['var(--font-inter)', 'sans-serif'],
    },
  },
},
```

**Step 1: Apply the edit**

Use Edit tool to replace the `colors` block with the new code above.

**Step 2: Verify type-check**

Run: `pnpm --filter @aksana/web type-check`
Expected: zero errors. Tailwind type system picks up the new colors.

**Step 3: Verify build**

Run: `pnpm --filter @aksana/web build`
Expected: build succeeds. New `tertiary`, `ink`, `ink-mute`, etc. classes are now available.

**Step 4: Commit**

```bash
git add apps/web/tailwind.config.ts
git commit -m "feat(design): add 7 semantic color tokens to tailwind config

- tertiary (canonical gold, replaces deprecated tersier)
- ink, ink-mute, ink-placeholder (semantic text aliases)
- canvas (semantic surface alias)
- male-icon, female-icon (count-up icon colors)
- focus-ring (search focus state)

DEPRECATED: tersier kept as alias, removed in Wave 3."
```

---

### Task 1.2: Port V3 CSS patterns to app/globals.css

**Type:** `AFK`
**Blocked by:** Task 1.1

**Files:**
- Modify: `apps/web/app/globals.css` (currently 3 lines: just @tailwind directives)

**Current code:**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

**New code:**

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

**Step 1: Apply the edit**

Replace the file content with the new code above.

**Step 2: Verify build**

Run: `pnpm --filter @aksana/web build`
Expected: build succeeds. CSS is generated with the new component classes.

**Step 3: Visual check (optional for Task 1.2 alone)**

Run: `pnpm --filter @aksana/web dev` and visit `http://localhost:3000`. The hamburger and nav-menu classes are not yet applied to any element (that's Task 2.2), so no visual change yet. This is expected.

**Step 4: Commit**

```bash
git add apps/web/app/globals.css
git commit -m "feat(design): port V3 CSS patterns to globals.css

- nav a.active (NavLink active state)
- #hamburger span + #hamburger.active (3-line CSS X animation)
- #nav-menu + #nav-menu.active (mobile menu slide-in)

All patterns use @apply with Tailwind utilities, no raw CSS."
```

---

### Task 1.3: Add SearchBar component

**Type:** `AFK`
**Blocked by:** Task 1.1

**Files:**
- Create: `apps/web/components/public/SearchBar.tsx`

**New file content:**

```tsx
'use client';
import { useRef, useEffect } from 'react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
}

/**
 * SearchBar component per DESIGN.md "Components > SearchBar":
 * - rounded-full pill, border-slate-400 resting
 * - focus:border-blue-500 focus:ring-blue-500 focus:ring-1
 * - autoFocus prop places cursor on mount
 * - onChange scrolls to top on every keystroke
 */
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

**Step 1: Create the file**

Write the file with the content above at `apps/web/components/public/SearchBar.tsx`.

**Step 2: Verify type-check**

Run: `pnpm --filter @aksana/web type-check`
Expected: zero errors.

**Step 3: Commit**

```bash
git add apps/web/components/public/SearchBar.tsx
git commit -m "feat(public): add SearchBar component per DESIGN.md

Rounded-full pill, slate-400 resting border, blue-500 focus ring.
autoFocus prop + scroll-to-top on keystroke per spec."
```

---

### Task 1.4: Add Modal component

**Type:** `AFK`
**Blocked by:** Task 1.1

**Files:**
- Create: `apps/web/components/public/Modal.tsx`

**New file content:**

```tsx
'use client';
import { useEffect } from 'react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

/**
 * Modal component per DESIGN.md "Components > Modal":
 * - bg-secondary/50 backdrop overlay
 * - rounded-md shadow-lg max-w-lg card
 * - click-outside-to-close, ESC-to-close
 * - scroll lock on open
 *
 * Currently unused (dormant) per DESIGN.md "Known Gaps".
 * Exported for future use; no parent renders it yet.
 */
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
      return () => {
        document.body.style.overflow = '';
      };
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

**Step 1: Create the file**

Write the file with the content above at `apps/web/components/public/Modal.tsx`.

**Step 2: Verify type-check**

Run: `pnpm --filter @aksana/web type-check`
Expected: zero errors.

**Step 3: Commit**

```bash
git add apps/web/components/public/Modal.tsx
git commit -m "feat(public): add Modal component per DESIGN.md

bg-secondary/50 backdrop, rounded-md shadow-lg card.
ESC-to-close, click-outside-to-close, scroll lock.
Currently dormant — exported for future use."
```

---

### Task 1.5: Wave 1 verification + deploy

**Type:** `HITL` (requires manual visual confirmation)
**Blocked by:** Tasks 1.1, 1.2, 1.3, 1.4

**Step 1: Run full verification suite**

```bash
pnpm --filter @aksana/web type-check  # zero errors
pnpm --filter @aksana/web build        # succeeds
pnpm --filter @aksana/web lint         # no new warnings
pnpm turbo test                        # all 53 existing tests pass
```

**Step 2: Visual smoke test**

Run: `pnpm --filter @aksana/web dev`

Visit `http://localhost:3000` and confirm:
- Home page renders without console errors
- Header still works (old inline-SVG hamburger still toggles)
- Footer still renders
- No visual regression (since Wave 1 only adds new tokens + new components, not refactoring existing code)

**Step 3: Merge Wave 1 branch and deploy**

```bash
git checkout main
git merge feature/wave-1-foundation --no-ff
git push origin main
```

Wait for Vercel auto-deploy. Verify production at `https://aksana-29-nextjs-web.vercel.app` matches local dev.

**Step 4: Tag milestone**

```bash
git tag -a design-reconciliation-wave-1 -m "Wave 1: Foundation complete"
```

---

## Wave 2: High-Divergence Components

**All tasks in this wave are independent (different files).** They can be done in parallel via dispatching-parallel-agents, or sequentially if you prefer one-component-at-a-time review.

### Task 2.1: Refactor Hero.tsx

**Type:** `AFK`
**Blocked by:** Wave 1 (Task 1.5)

**Files:**
- Modify: `apps/web/components/public/Hero.tsx`

**Current code:**

```tsx
import Image from 'next/image';

export function Hero() {
  return (
    <section className="relative h-screen flex items-center justify-center bg-dark">
      <Image
        src="/img/homepage/hero.jpeg"
        alt="AKSANA 29"
        fill
        className="object-cover brightness-50"
        priority
      />
      <div className="relative z-10 text-center">
        <h1 className="text-[18vw] font-heading text-white tracking-widest">AKSANA 29</h1>
        <p className="text-tersier text-xl mt-4">MAN KAPUAS ANGKATAN KE-29</p>
      </div>
    </section>
  );
}
```

**New code:**

```tsx
import Image from 'next/image';

export function Hero() {
  return (
    <section className="relative h-screen flex items-center justify-center bg-dark">
      <Image
        src="/img/homepage/hero.jpeg"
        alt="AKSANA 29"
        fill
        className="object-cover brightness-50"
        priority
      />
      <div className="relative z-10 text-center">
        <h1 className="text-[18vw] tracking-[2vw] font-extrabold font-heading text-secondary">
          AKSANA 29
        </h1>
        <p className="text-[3vw] tracking-[1.3vw] font-extrabold text-secondary">
          MAN KAPUAS ANGKATAN KE-29
        </p>
      </div>
    </section>
  );
}
```

**Changes summary:**
- h1: added `tracking-[2vw] font-extrabold text-secondary` (was `text-white tracking-widest`)
- p (subtitle): `text-tersier text-xl mt-4` → `text-[3vw] tracking-[1.3vw] font-extrabold text-secondary` (white, fluid, no gold)

**Step 1: Apply edit**

Use Edit tool to replace the h1 and p lines.

**Step 2: Verify build**

Run: `pnpm --filter @aksana/web build`
Expected: succeeds.

**Step 3: Visual verify**

Run: `pnpm --filter @aksana/web dev`. Visit `http://localhost:3000`. Confirm:
- "AKSANA 29" h1 still large and white
- Subtitle is white (not gold), fluid-sized, no margin

**Step 4: Commit**

```bash
git add apps/web/components/public/Hero.tsx
git commit -m "refactor(public): align Hero with DESIGN.md spec

- h1: tracking-[2vw] font-extrabold text-secondary
- subtitle: text-[3vw] tracking-[1.3vw] font-extrabold, no gold"
```

---

### Task 2.2: Refactor Header.tsx

**Type:** `AFK`
**Blocked by:** Wave 1 (Task 1.5)

**Files:**
- Modify: `apps/web/components/public/Header.tsx`

This is the largest refactor. Full file replacement (not just className changes) is required because:
1. Hamburger SVG → 3-span JSX
2. Brand color logic changes
3. Nav link structure changes (active class)
4. Mobile menu structure changes (`#nav-menu` ID + `active` class)

**Current code (full file, 176 lines):**

```tsx
'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { KELAS_LIST } from '@aksana/shared';

const KELAS_TO_SLUG: Record<string, string> = {
  'XII IPA 1': 'xii-ipa-1',
  'XII IPA 2': 'xii-ipa-2',
  'XII IPA 3': 'xii-ipa-3',
  'XII IPA 4': 'xii-ipa-4',
  'XII IPS 1': 'xii-ips-1',
  'XII IPS 2': 'xii-ips-2',
  'XII IPS 3': 'xii-ips-3',
  'XII PAI': 'xii-pai',
};

function kelasSlug(kelas: string): string {
  return KELAS_TO_SLUG[kelas] || kelas.toLowerCase().replace(/\s+/g, '-');
}

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === '/';

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const showSolid = !isHome || scrolled;

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        showSolid
          ? 'bg-dark/95 backdrop-blur-sm shadow-lg'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <Link
            href="/"
            className={`font-heading text-2xl tracking-wider transition-colors ${
              showSolid ? 'text-tersier' : 'text-white'
            }`}
          >
            AKSANA 29
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <NavLink href="/" active={pathname === '/'} light={!showSolid}>
              Beranda
            </NavLink>
            <NavLink href="/guru" active={pathname.startsWith('/guru')} light={!showSolid}>
              Guru
            </NavLink>

            {/* Kelas Dropdown */}
            <div className="relative group">
              <button
                className={`text-sm font-medium transition-colors flex items-center gap-1 ${
                  showSolid ? 'text-gray-300 hover:text-white' : 'text-gray-200 hover:text-white'
                } ${pathname.startsWith('/pesdik') ? 'text-tersier' : ''}`}
              >
                Kelas
                <svg className="w-3 h-3 mt-0.5 group-hover:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="py-1">
                  {KELAS_LIST.map((kelas) => (
                    <Link
                      key={kelas}
                      href={`/pesdik/${kelasSlug(kelas)}`}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-primary transition-colors"
                    >
                      {kelas}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            <NavLink href="/galeri" active={pathname.startsWith('/galeri')} light={!showSolid}>
              Galeri
            </NavLink>
          </div>

          {/* Mobile Toggle */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2"
            aria-label="Toggle menu"
          >
            <svg className={`w-6 h-6 transition-colors ${showSolid ? 'text-white' : 'text-white'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-dark/98 backdrop-blur-sm border-t border-gray-800">
          <div className="px-4 py-3 space-y-2">
            <MobileNavLink href="/" active={pathname === '/'}>Beranda</MobileNavLink>
            <MobileNavLink href="/guru" active={pathname.startsWith('/guru')}>Guru</MobileNavLink>
            <div className="pl-4 border-l-2 border-gray-700 space-y-1">
              <p className="text-xs text-gray-400 uppercase tracking-wider mt-2 mb-1">Kelas</p>
              {KELAS_LIST.map((kelas) => (
                <MobileNavLink
                  key={kelas}
                  href={`/pesdik/${kelasSlug(kelas)}`}
                  active={pathname === `/pesdik/${kelasSlug(kelas)}`}
                  small
                >
                  {kelas}
                </MobileNavLink>
              ))}
            </div>
            <MobileNavLink href="/galeri" active={pathname.startsWith('/galeri')}>Galeri</MobileNavLink>
          </div>
        </div>
      )}
    </nav>
  );
}

function NavLink({ href, active, light, children }: { href: string; active: boolean; light: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={`text-sm font-medium transition-colors ${
        active
          ? 'text-tersier'
          : light
            ? 'text-gray-200 hover:text-white'
            : 'text-gray-300 hover:text-white'
      }`}
    >
      {children}
    </Link>
  );
}

function MobileNavLink({ href, active, children, small }: { href: string; active: boolean; children: React.ReactNode; small?: boolean }) {
  return (
    <Link
      href={href}
      className={`block transition-colors ${
        active
          ? 'text-tersier'
          : 'text-gray-300 hover:text-white'
      } ${small ? 'text-sm py-1' : 'py-2'}`}
    >
      {children}
    </Link>
  );
}
```

**New code (full file):**

```tsx
'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { KELAS_LIST } from '@aksana/shared';

const KELAS_TO_SLUG: Record<string, string> = {
  'XII IPA 1': 'xii-ipa-1',
  'XII IPA 2': 'xii-ipa-2',
  'XII IPA 3': 'xii-ipa-3',
  'XII IPA 4': 'xii-ipa-4',
  'XII IPS 1': 'xii-ips-1',
  'XII IPS 2': 'xii-ips-2',
  'XII IPS 3': 'xii-ips-3',
  'XII PAI': 'xii-pai',
};

function kelasSlug(kelas: string): string {
  return KELAS_TO_SLUG[kelas] || kelas.toLowerCase().replace(/\s+/g, '-');
}

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === '/';

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const showSolid = !isHome || scrolled;

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 backdrop-blur-sm ${
        isHome
          ? showSolid
            ? 'bg-secondary/70 lg:bg-primary/80 lg:shadow-lg'
            : 'bg-secondary lg:bg-transparent'
          : 'bg-secondary/70 lg:bg-primary'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          {/* Brand */}
          <Link
            href="/"
            className={`font-heading text-2xl tracking-wider transition-colors ${
              showSolid ? 'text-primary lg:text-secondary' : 'text-primary lg:text-secondary'
            }`}
          >
            AKSANA 29
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1">
            <NavLink href="/" pathname={pathname}>Beranda</NavLink>
            <NavLink href="/guru" pathname={pathname}>Guru</NavLink>

            {/* Kelas Dropdown */}
            <div className="relative group">
              <button
                className={`py-3 px-4 text-sm font-bold flex items-center gap-1 transition-colors ${
                  pathname.startsWith('/pesdik') ? 'active' : ''
                }`}
              >
                Kelas
                <svg className="w-3 h-3 mt-0.5 group-hover:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className="absolute right-0 mt-0 w-40 origin-top-right scale-95 opacity-0 invisible group-hover:opacity-100 group-hover:visible group-hover:scale-100 bg-secondary text-primary rounded-md shadow-lg transition-all duration-200 z-50">
                <div className="py-1">
                  {KELAS_LIST.map((kelas) => (
                    <Link
                      key={kelas}
                      href={`/pesdik/${kelasSlug(kelas)}`}
                      className="block py-3 px-4 text-sm hover:bg-primary/20 transition-colors"
                    >
                      {kelas}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            <NavLink href="/galeri" pathname={pathname}>Galeri</NavLink>
          </div>

          {/* Mobile Toggle (3-span CSS, per globals.css) */}
          <button
            id="hamburger"
            onClick={() => setMenuOpen(!menuOpen)}
            className={`lg:hidden p-2 ${menuOpen ? 'active' : ''}`}
            aria-label="Toggle menu"
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>

      {/* Mobile Menu (slide-in via #nav-menu.active in globals.css) */}
      <div
        id="nav-menu"
        className={`lg:hidden transition-transform duration-300 ${
          menuOpen ? 'active' : ''
        }`}
      >
        <div className="container mx-auto px-4 py-4 space-y-2">
          <MobileNavLink href="/" pathname={pathname}>Beranda</MobileNavLink>
          <MobileNavLink href="/guru" pathname={pathname}>Guru</MobileNavLink>
          <div className="pl-4 border-l-2 border-primary/20 space-y-1">
            <p className="text-xs text-ink-mute uppercase tracking-wider mt-2 mb-1">Kelas</p>
            {KELAS_LIST.map((kelas) => (
              <MobileNavLink
                key={kelas}
                href={`/pesdik/${kelasSlug(kelas)}`}
                pathname={pathname}
                small
              >
                {kelas}
              </MobileNavLink>
            ))}
          </div>
          <MobileNavLink href="/galeri" pathname={pathname}>Galeri</MobileNavLink>
        </div>
      </div>
    </nav>
  );
}

function NavLink({ href, pathname, children }: { href: string; pathname: string; children: React.ReactNode }) {
  const active = pathname === href || (href !== '/' && pathname.startsWith(href));
  return (
    <Link
      href={href}
      className={`py-3 px-4 text-sm font-bold transition-colors ${
        active ? 'active' : 'hover:bg-primary/20'
      }`}
    >
      {children}
    </Link>
  );
}

function MobileNavLink({ href, pathname, children, small }: { href: string; pathname: string; children: React.ReactNode; small?: boolean }) {
  const active = pathname === href || (href !== '/' && pathname.startsWith(href));
  return (
    <Link
      href={href}
      className={`block transition-colors ${
        active ? 'text-primary font-semibold' : 'hover:text-primary'
      } ${small ? 'text-sm py-1' : 'py-2'}`}
    >
      {children}
    </Link>
  );
}
```

**Changes summary:**
- Background: home is `bg-secondary/70 lg:bg-primary/80` on scroll, transparent at top; sub-page is `bg-secondary/70 lg:bg-primary` solid
- Brand color: `text-secondary` (white) on all states — no gold
- NavLink: uses `active` class (which gets the `nav a.active` styling from globals.css)
- Hamburger: 3 `<span />` with `id="hamburger"`; `active` class toggles the X animation from globals.css
- Mobile menu: `<div id="nav-menu">` with `active` class triggering the slide-in from globals.css
- Removed: all `text-gray-200/300` cool grays, `text-tersier` gold accents
- Added: `text-ink-mute` for the "Kelas" sublabel

**Step 1: Replace the file**

Write the new content using Write tool (or Edit with the entire old file as oldString).

**Step 2: Verify type-check + build**

```bash
pnpm --filter @aksana/web type-check
pnpm --filter @aksana/web build
```
Expected: zero errors.

**Step 3: Visual verify**

Run: `pnpm --filter @aksana/web dev`. Test:
- Home page: header transparent on top, becomes emerald (`bg-primary/80`) on scroll
- /guru: header solid emerald (`bg-primary`) always
- /pesdik/xii-ipa-1: same solid emerald
- /galeri: same
- Mobile (resize browser to < lg): hamburger is 3 horizontal lines; click → animates to X + menu slides in from top

**Step 4: Commit**

```bash
git add apps/web/components/public/Header.tsx
git commit -m "refactor(public): align Header with DESIGN.md spec

- bg-primary/80 on home scroll, bg-primary on sub-pages
- 3-span CSS hamburger (#hamburger.active animation)
- Mobile slide-in via #nav-menu.active
- nav a.active global class for active nav links
- Removed: cool grays, gold brand color"
```

---

### Task 2.3: Refactor StudentCard.tsx

**Type:** `AFK`
**Blocked by:** Wave 1 (Task 1.5)

**Files:**
- Modify: `apps/web/components/public/StudentCard.tsx`

**Current code (full file, 43 lines):**

```tsx
'use client';
import Image from 'next/image';
import { getImageUrl } from '@/lib/images';
import type { StudentPublic } from '@aksana/shared';

interface StudentCardProps {
  student: StudentPublic;
  onClick: (student: StudentPublic) => void;
}

export function StudentCard({ student, onClick }: StudentCardProps) {
  return (
    <button
      onClick={() => onClick(student)}
      className="bg-white rounded-lg shadow overflow-hidden text-left hover:shadow-md transition-shadow w-full"
    >
      {student.image_path ? (
        <div className="relative aspect-[3/4] w-full">
          <Image
            src={getImageUrl(student.image_path, 320)}
            alt={student.nama}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16vw"
            loading="lazy"
          />
        </div>
      ) : (
        <div className="aspect-[3/4] w-full bg-secondary flex items-center justify-center">
          <span className="text-4xl text-gray-400 font-heading">
            {student.nama.charAt(0)}
          </span>
        </div>
      )}
      <div className="p-3">
        <p className="font-semibold text-sm truncate">{student.nama}</p>
        <p className="text-xs text-gray-500 truncate">
          {student.jabatan || 'Anggota'}
        </p>
      </div>
    </button>
  );
}
```

**New code (full file):**

```tsx
'use client';
import Image from 'next/image';
import { getImageUrl } from '@/lib/images';
import type { StudentPublic } from '@aksana/shared';

interface StudentCardProps {
  student: StudentPublic;
  onClick: (student: StudentPublic) => void;
}

/**
 * StudentCard per DESIGN.md "Components > Person Card (card-person)":
 * - rounded-md overflow-hidden shadow-lg
 * - bg-secondary text-primary
 * - portrait 1080x1920 with srcSet
 * - h4 name (text-lg font-semibold) + h5 jabatan (text-sm font-light border-b)
 */
export function StudentCard({ student, onClick }: StudentCardProps) {
  return (
    <button
      onClick={() => onClick(student)}
      className="w-full bg-secondary text-primary rounded-md overflow-hidden shadow-lg text-left hover:shadow-md transition-shadow"
    >
      {student.image_path ? (
        <div className="relative aspect-[3/4] w-full">
          <Image
            src={getImageUrl(student.image_path, 320)}
            alt={student.nama}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16vw"
            loading="lazy"
          />
        </div>
      ) : (
        <div className="aspect-[3/4] w-full bg-canvas flex items-center justify-center">
          <span className="text-4xl text-ink-placeholder font-heading">
            {student.nama.charAt(0)}
          </span>
        </div>
      )}
      <div className="p-4">
        <h4 className="text-lg font-semibold truncate">{student.nama}</h4>
        <h5 className="text-sm font-light py-3 border-b border-primary/20 truncate">
          {student.jabatan || 'Anggota'}
        </h5>
      </div>
    </button>
  );
}
```

**Changes summary:**
- Card: `bg-white rounded-lg shadow` → `bg-secondary text-primary rounded-md overflow-hidden shadow-lg`
- Body: `p-3` → `p-4`
- Name: `<p className="font-semibold text-sm">` → `<h4 className="text-lg font-semibold">`
- Jabatan: `<p className="text-xs text-gray-500">` → `<h5 className="text-sm font-light py-3 border-b border-primary/20">`
- Fallback: `bg-secondary` → `bg-canvas`, `text-gray-400` → `text-ink-placeholder`

**Step 1: Replace the file**

**Step 2: Verify build**

```bash
pnpm --filter @aksana/web type-check
pnpm --filter @aksana/web build
```

**Step 3: Visual verify**

Visit `/pesdik/xii-ipa-1` in dev mode. Cards should have `rounded-md` (subtle) corners, `shadow-lg`, light gray background, with name in larger text and jabatan with bottom border.

**Step 4: Commit**

```bash
git add apps/web/components/public/StudentCard.tsx
git commit -m "refactor(public): align StudentCard with DESIGN.md card-person

- rounded-md shadow-lg bg-secondary text-primary
- h4 name (text-lg font-semibold)
- h5 jabatan (text-sm font-light border-b)
- bg-canvas for image fallback"
```

---

### Task 2.4: Refactor TeacherCard.tsx (structural change)

**Type:** `AFK`
**Blocked by:** Wave 1 (Task 1.5)

**Files:**
- Modify: `apps/web/components/public/TeacherCard.tsx`
- Modify: `apps/web/app/(public)/guru/page.tsx` (grid wrapper update, deferred to Task 3.7 — this task only changes the component)

**Current code (full file, 25 lines):**

```tsx
import Image from 'next/image';
import { getImageUrl } from '@/lib/images';
import type { TeacherPublic } from '@aksana/shared';

export function TeacherCard({ teacher, onClick }: { teacher: TeacherPublic; onClick: () => void }) {
  return (
    <button onClick={onClick} className="text-left group flex items-center gap-4 p-4 bg-white rounded-lg shadow hover:shadow-md transition">
      <div className="relative w-16 h-16 rounded-full overflow-hidden bg-secondary flex-shrink-0">
        {teacher.image_path && (
          <Image
            src={getImageUrl(teacher.image_path, 320)}
            alt={teacher.nama}
            fill
            className="object-cover"
            loading="lazy"
          />
        )}
      </div>
      <div>
        <h3 className="font-semibold text-dark">{teacher.nama}</h3>
        <p className="text-sm text-gray-600">{teacher.jabatan}</p>
      </div>
    </button>
  );
}
```

**New code (full file):**

```tsx
import Image from 'next/image';
import { getImageUrl } from '@/lib/images';
import type { TeacherPublic } from '@aksana/shared';

interface TeacherCardProps {
  teacher: TeacherPublic;
  onClick: () => void;
}

/**
 * TeacherCard per DESIGN.md "Components > Person Card (card-person)":
 * - Vertical card (image top, info bottom) in 1→2→3→4 grid (set by parent)
 * - rounded-md overflow-hidden shadow-lg bg-secondary text-primary
 * - portrait 1080x1920 with srcSet
 */
export function TeacherCard({ teacher, onClick }: TeacherCardProps) {
  return (
    <button
      onClick={onClick}
      className="w-full bg-secondary text-primary rounded-md overflow-hidden shadow-lg text-left hover:shadow-md transition-shadow"
    >
      {teacher.image_path ? (
        <div className="relative aspect-[3/4] w-full">
          <Image
            src={getImageUrl(teacher.image_path, 320)}
            alt={teacher.nama}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            loading="lazy"
          />
        </div>
      ) : (
        <div className="aspect-[3/4] w-full bg-canvas flex items-center justify-center">
          <span className="text-4xl text-ink-placeholder font-heading">
            {teacher.nama.charAt(0)}
          </span>
        </div>
      )}
      <div className="p-4">
        <h4 className="text-lg font-semibold truncate">{teacher.nama}</h4>
        <h5 className="text-sm font-light py-3 border-b border-primary/20 truncate">
          {teacher.jabatan}
        </h5>
      </div>
    </button>
  );
}
```

**Changes summary (structural):**
- Layout: `flex items-center gap-4` (horizontal) → vertical (image top, info bottom)
- Image: `w-16 h-16 rounded-full` → `aspect-[3/4] w-full` (full-width portrait)
- Card: `bg-white rounded-lg shadow` → `bg-secondary text-primary rounded-md overflow-hidden shadow-lg`
- Body: `<h3 className="font-semibold text-dark">` + `<p className="text-sm text-gray-600">` → `<h4 className="text-lg font-semibold">` + `<h5 className="text-sm font-light py-3 border-b border-primary/20">`

**Note:** The `guru/page.tsx` grid (`grid md:grid-cols-2 gap-4`) needs to be updated to the responsive 1→2→3→4 wrapper (`w-full xl:w-1/4 lg:w-1/3 sm:w-1/2 p-3` per component). This is done in **Task 3.7** (Wave 3). For now, in Wave 2, the page will render with the new card but in the old 2-column grid — visual delta only at lg+ breakpoints.

**Step 1: Replace the file**

**Step 2: Verify build**

```bash
pnpm --filter @aksana/web type-check
pnpm --filter @aksana/web build
```

**Step 3: Visual verify**

Visit `/guru`. Cards are now vertical, full-width, larger. At `md:` (768px) the page still shows 2 columns (since guru/page.tsx grid update is Wave 3). At `sm:` and mobile, the cards stack.

**Step 4: Commit**

```bash
git add apps/web/components/public/TeacherCard.tsx
git commit -m "refactor(public): align TeacherCard with DESIGN.md card-person

Structural change: horizontal layout -> vertical portrait card.
rounded-md shadow-lg bg-secondary text-primary per card-person spec.
guru/page.tsx grid update deferred to Wave 3 (Task 3.7)."
```

---

### Task 2.5: Refactor Footer.tsx

**Type:** `AFK`
**Blocked by:** Wave 1 (Task 1.5)

**Files:**
- Modify: `apps/web/components/public/Footer.tsx`

**Current code (full file, 52 lines):**

```tsx
export function Footer() {
  return (
    <footer className="bg-dark text-white">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Left: Description */}
          <div>
            <h3 className="font-heading text-2xl text-tersier mb-4">
              WEBSITE BUKU TAHUNAN ANGKATAN 29 (AKSANA 29) MAN KAPUAS TAHUN 2024
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed text-justify">
              Website Buku Tahunan Aksana 29 merupakan website yang dijadikan
              tempat bagaimana Angkatan 29 MAN Kapuas bercerita, bernostalgia,
              dan bertukar informasi satu sama lain nya dalam rangka mempererat
              tali ukhuwah silaturahmi antar sesama alumni MAN Kapuas tahun
              ajaran 2023/2024.
            </p>
            <p className="text-gray-400 text-sm leading-relaxed text-justify mt-3">
              Website ini juga menjadi bukti kemajuan teknologi yang menggantikan
              buku angkatan (fisik) yang sekarang bisa diakses dengan mudahnya
              secara digital (online).
            </p>
          </div>

          {/* Right: Credits */}
          <div className="md:text-right">
            <p className="text-gray-400 text-sm">
              Copyright &copy; 2024
            </p>
            <div className="mt-4">
              <p className="text-gray-300 font-semibold">Dibuat oleh:</p>
              <p className="text-gray-400 text-sm">Muhamad Kemal Faza (XII IPA 1)</p>
            </div>
            <div className="mt-2">
              <p className="text-gray-300 font-semibold">Partner:</p>
              <p className="text-gray-400 text-sm">Muhamad Zulfikar (XII IPA 2)</p>
              <p className="text-gray-400 text-sm">Muhammad Hilmy Alfajar (XII IPA 2)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between gap-2">
          <p className="text-gray-500 text-xs">AKSANA 29 &mdash; MAN Kapuas Angkatan ke-29</p>
          <p className="text-gray-500 text-xs">Dipersembahkan oleh Angkatan 29 MAN Kapuas</p>
        </div>
      </div>
    </footer>
  );
}
```

**New code (full file):**

```tsx
export function Footer() {
  return (
    <footer className="bg-dark text-secondary">
      <div className="container mx-auto py-16 px-10">
        <div className="flex flex-wrap gap-8">
          {/* Left: Description */}
          <div className="w-full lg:w-1/2">
            <h2 className="text-xl lg:text-2xl text-justify font-bold">
              WEBSITE BUKU TAHUNAN ANGKATAN 29 (AKSANA 29) MAN KAPUAS TAHUN 2024
            </h2>
            <p className="text-base mt-5 text-justify">
              Website Buku Tahunan Aksana 29 merupakan website yang dijadikan
              tempat bagaimana Angkatan 29 MAN Kapuas bercerita, bernostalgia,
              dan bertukar informasi satu sama lain nya dalam rangka mempererat
              tali ukhuwah silaturahmi antar sesama alumni MAN Kapuas tahun
              ajaran 2023/2024.
            </p>
            <p className="text-base mt-3 text-justify">
              Website ini juga menjadi bukti kemajuan teknologi yang menggantikan
              buku angkatan (fisik) yang sekarang bisa diakses dengan mudahnya
              secara digital (online).
            </p>
          </div>

          {/* Right: Credits */}
          <div className="w-full lg:w-1/2 lg:text-right">
            <p className="text-base">
              Copyright &copy; 2024
            </p>
            <div className="mt-4">
              <p className="font-semibold">Dibuat oleh:</p>
              <p className="text-base">Muhamad Kemal Faza (XII IPA 1)</p>
            </div>
            <div className="mt-2">
              <p className="font-semibold">Partner:</p>
              <p className="text-base">Muhamad Zulfikar (XII IPA 2)</p>
              <p className="text-base">Muhammad Hilmy Alfajar (XII IPA 2)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-secondary/20">
        <div className="container mx-auto py-4 px-10 flex flex-col md:flex-row items-center justify-between gap-2">
          <p className="text-xs">AKSANA 29 &mdash; MAN Kapuas Angkatan ke-29</p>
          <p className="text-xs">Dipersembahkan oleh Angkatan 29 MAN Kapuas</p>
        </div>
      </div>
    </footer>
  );
}
```

**Changes summary:**
- Container: `text-white` → `text-secondary`
- Padding: `py-12 px-4` → `py-16 px-10`
- Layout: `grid md:grid-cols-2` → `flex flex-wrap` + `w-full lg:w-1/2` per column
- Heading: `font-heading text-2xl text-tersier` (Bebas gold) → `text-xl lg:text-2xl font-bold` (Inter, no gold)
- Body: `text-gray-400 text-sm` → `text-base` (with `text-justify` retained)
- Bottom bar border: `border-gray-800` → `border-secondary/20`

**Step 1: Replace the file**

**Step 2: Verify build + visual**

Visit any page (footer is in public layout). Confirm:
- Footer has `bg-dark` with white-ish text
- Heading is Inter bold (not Bebas, not gold)
- Two-column layout at `lg:` breakpoint
- Stacked at mobile

**Step 3: Commit**

```bash
git add apps/web/components/public/Footer.tsx
git commit -m "refactor(public): align Footer with DESIGN.md spec

- bg-dark text-secondary (semantic)
- py-16 px-10 padding per spec
- h2 Inter bold (no Bebas, no gold)
- flex flex-wrap with w-full lg:w-1/2 columns"
```

---

### Task 2.6: Refactor StudentModal.tsx

**Type:** `AFK`
**Blocked by:** Wave 1 (Task 1.5)

**Files:**
- Modify: `apps/web/components/public/StudentModal.tsx`

**Current code (full file, 79 lines):**

```tsx
'use client';
import Image from 'next/image';
import { getImageUrl } from '@/lib/images';
import type { StudentPublic } from '@aksana/shared';

interface StudentModalProps {
  student: StudentPublic | null;
  onClose: () => void;
}

export function StudentModal({ student, onClose }: StudentModalProps) {
  if (!student) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {student.image_path ? (
          <div className="relative aspect-[4/3] w-full">
            <Image
              src={getImageUrl(student.image_path, 640)}
              alt={student.nama}
              fill
              className="object-cover rounded-t-lg"
              sizes="640px"
            />
          </div>
        ) : null}

        <button
          onClick={onClose}
          className="absolute top-3 right-3 bg-white/90 rounded-full p-1.5 shadow hover:bg-white transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <div className="p-6">
          <h2 className="text-2xl font-heading text-primary">{student.nama}</h2>
          <p className="text-sm text-gray-600">
            {student.kelas} &middot; {student.jabatan || 'Anggota'}
          </p>

          {student.ekstra ? (
            <div className="mt-4">
              <h3 className="font-semibold text-sm text-gray-700">Ekstrakurikuler</h3>
              <p className="mt-1 text-gray-600">{student.ekstra}</p>
            </div>
          ) : null}

          {student.kesan ? (
            <div className="mt-4">
              <h3 className="font-semibold text-sm text-gray-700">Kesan</h3>
              <p className="mt-1 text-gray-600 whitespace-pre-line">{student.kesan}</p>
            </div>
          ) : null}

          {student.pesan ? (
            <div className="mt-4">
              <h3 className="font-semibold text-sm text-gray-700">Pesan</h3>
              <p className="mt-1 text-gray-600 whitespace-pre-line">{student.pesan}</p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
```

**New code (full file):**

```tsx
'use client';
import Image from 'next/image';
import { getImageUrl } from '@/lib/images';
import type { StudentPublic } from '@aksana/shared';

interface StudentModalProps {
  student: StudentPublic | null;
  onClose: () => void;
}

/**
 * StudentModal per DESIGN.md "Components > Modal (modal-card)":
 * - bg-secondary/50 backdrop overlay
 * - rounded-md shadow-lg max-w-lg card
 * - bg-canvas text-ink body
 * - click-outside-to-close
 *
 * Note: There's also a standalone Modal component (Task 1.4).
 * This component is the inline modal used in pesdik page
 * (renders the full student detail inline, not a generic Modal).
 */
export function StudentModal({ student, onClose }: StudentModalProps) {
  if (!student) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-secondary/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-canvas text-ink rounded-md shadow-lg max-w-lg w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {student.image_path ? (
          <div className="relative aspect-[4/3] w-full">
            <Image
              src={getImageUrl(student.image_path, 640)}
              alt={student.nama}
              fill
              className="object-cover"
              sizes="640px"
            />
          </div>
        ) : null}

        <button
          onClick={onClose}
          className="absolute top-3 right-3 bg-canvas/90 rounded-full p-1.5 shadow hover:bg-canvas transition-colors"
          aria-label="Close"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <div className="p-6">
          <h2 className="text-lg font-semibold text-primary">{student.nama}</h2>
          <p className="text-sm text-ink-mute">
            {student.kelas} &middot; {student.jabatan || 'Anggota'}
          </p>

          {student.ekstra ? (
            <div className="mt-4">
              <h3 className="font-semibold text-sm">Ekstrakurikuler</h3>
              <p className="mt-1 text-ink-mute">{student.ekstra}</p>
            </div>
          ) : null}

          {student.kesan ? (
            <div className="mt-4">
              <h3 className="font-semibold text-sm">Kesan</h3>
              <p className="mt-1 text-ink-mute whitespace-pre-line">{student.kesan}</p>
            </div>
          ) : null}

          {student.pesan ? (
            <div className="mt-4">
              <h3 className="font-semibold text-sm">Pesan</h3>
              <p className="mt-1 text-ink-mute whitespace-pre-line">{student.pesan}</p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
```

**Changes summary:**
- Backdrop: `bg-black/50` → `bg-secondary/50 backdrop-blur-sm`
- Card: `bg-white rounded-lg` → `bg-canvas text-ink rounded-md shadow-lg`
- Image: removed `rounded-t-lg` (parent `rounded-md overflow-hidden` handles corners)
- Title: `text-2xl font-heading` (Bebas) → `text-lg font-semibold` (Inter)
- Close button bg: `bg-white/90` → `bg-canvas/90`
- All `text-gray-*` → `text-ink-mute`

**Step 1: Replace the file**

**Step 2: Verify build + visual**

Open `/pesdik/xii-ipa-1`, click any student card. Modal opens with:
- Light gray backdrop with backdrop blur
- White-ish card with subtle shadow
- Student name as Inter semibold (not Bebas)

**Step 3: Commit**

```bash
git add apps/web/components/public/StudentModal.tsx
git commit -m "refactor(public): align StudentModal with DESIGN.md modal-card

- bg-secondary/50 backdrop with blur
- bg-canvas rounded-md shadow-lg card
- Inter semibold title (no Bebas)
- text-ink-mute for body text"
```

---

### Task 2.7: Refactor TeacherModal.tsx

**Type:** `AFK`
**Blocked by:** Wave 1 (Task 1.5)

**Files:**
- Modify: `apps/web/components/public/TeacherModal.tsx`

**Current code (full file, 41 lines):**

```tsx
import Image from 'next/image';
import { getImageUrl } from '@/lib/images';
import type { TeacherPublic } from '@aksana/shared';

export function TeacherModal({ teacher, onClose }: { teacher: TeacherPublic; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-lg max-w-2xl w-full p-6" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="float-right text-2xl">&times;</button>
        <div className="flex flex-col md:flex-row gap-6">
          {teacher.image_path && (
            <Image
              src={getImageUrl(teacher.image_path, 640)}
              alt={teacher.nama}
              width={200}
              height={200}
              className="rounded-lg object-cover"
            />
          )}
          <div>
            <h2 className="text-2xl font-heading text-primary">{teacher.nama}</h2>
            <p className="text-secondary mt-1">{teacher.jabatan}</p>
            {teacher.mapel && teacher.mapel.length > 0 && (
              <div className="mt-3">
                <p className="font-semibold text-sm">Mata Pelajaran:</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {teacher.mapel.map((m, i) => (
                    <span key={i} className="px-2 py-1 bg-tersier/20 text-sm rounded">{m}</span>
                  ))}
                </div>
              </div>
            )}
            {teacher.ekstra && (
              <p className="mt-3 text-sm"><span className="font-semibold">Ekstrakurikuler:</span> {teacher.ekstra}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
```

**New code (full file):**

```tsx
import Image from 'next/image';
import { getImageUrl } from '@/lib/images';
import type { TeacherPublic } from '@aksana/shared';

interface TeacherModalProps {
  teacher: TeacherPublic;
  onClose: () => void;
}

/**
 * TeacherModal per DESIGN.md "Components > Modal (modal-card)":
 * - bg-secondary/50 backdrop overlay
 * - rounded-md shadow-lg max-w-2xl card
 * - bg-canvas text-ink body
 * - Image uses next/image fill mode + Tailwind-sized container
 *   (replaces 200x200 JSX props for consistency with other cards)
 */
export function TeacherModal({ teacher, onClose }: TeacherModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-secondary/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-canvas text-ink rounded-md shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="float-right text-2xl leading-none"
          aria-label="Close"
        >
          &times;
        </button>
        <div className="flex flex-col md:flex-row gap-6">
          {teacher.image_path && (
            <div className="relative w-48 h-48 rounded-md overflow-hidden flex-shrink-0">
              <Image
                src={getImageUrl(teacher.image_path, 640)}
                alt={teacher.nama}
                fill
                className="object-cover"
                sizes="192px"
              />
            </div>
          )}
          <div>
            <h2 className="text-lg font-semibold text-primary">{teacher.nama}</h2>
            <p className="text-ink-mute mt-1">{teacher.jabatan}</p>
            {teacher.mapel && teacher.mapel.length > 0 && (
              <div className="mt-3">
                <p className="font-semibold text-sm">Mata Pelajaran:</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {teacher.mapel.map((m, i) => (
                    <span key={i} className="px-2 py-1 bg-tertiary/20 text-sm rounded">
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {teacher.ekstra && (
              <p className="mt-3 text-sm">
                <span className="font-semibold">Ekstrakurikuler:</span> {teacher.ekstra}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
```

**Changes summary:**
- Backdrop: `bg-black/80` → `bg-secondary/50 backdrop-blur-sm`
- Card: `bg-white rounded-lg` → `bg-canvas text-ink rounded-md shadow-lg max-h-[90vh] overflow-y-auto`
- Image: `<Image width={200} height={200} className="rounded-lg">` → `<div className="relative w-48 h-48 rounded-md overflow-hidden"><Image fill ...></div>` (Tailwind utility + `next/image` fill mode)
- Title: `text-2xl font-heading` (Bebas) → `text-lg font-semibold` (Inter)
- Jabatan: `text-secondary` (low contrast on bg-canvas) → `text-ink-mute`
- Mapel chips: `bg-tersier/20` → `bg-tertiary/20` (canonical)

**Step 1: Replace the file**

**Step 2: Verify build + visual**

Open `/guru`, click any teacher card. Modal opens with:
- Light gray backdrop
- Teacher photo in a 192px square
- Name as Inter semibold
- Mapel chips with light gold background

**Step 3: Commit**

```bash
git add apps/web/components/public/TeacherModal.tsx
git commit -m "refactor(public): align TeacherModal with DESIGN.md modal-card

- bg-secondary/50 backdrop with blur
- bg-canvas rounded-md shadow-lg card
- Image: next/image fill mode + w-48 h-48 (replaces 200x200 JSX props)
- Inter semibold title (no Bebas)
- bg-tertiary/20 for mapel chips (canonical, not tersier)"
```

---

### Task 2.8: Wave 2 verification + deploy

**Type:** `HITL`
**Blocked by:** Tasks 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7

**Step 1: Run full verification**

```bash
pnpm --filter @aksana/web type-check
pnpm --filter @aksana/web build
pnpm --filter @aksana/web lint
pnpm turbo test
```
Expected: all green, 53 existing tests pass.

**Step 2: Visual smoke test**

Run `pnpm --filter @aksana/web dev` and verify:
- **Home (`/`)**: header transparent on top, becomes emerald on scroll; hero subtitle is white; cards/footer look right
- **`/guru`**: header solid emerald; teacher cards are now vertical (visual change); teacher modal works
- **`/pesdik/xii-ipa-1`**: header solid emerald; student cards are rounded-md light gray; student modal works
- **Mobile (resize < lg)**: hamburger is 3 lines, animates to X, menu slides in

**Step 3: Merge and deploy**

```bash
git checkout main
git merge feature/wave-2-high-divergence --no-ff
git push origin main
```

Wait for Vercel auto-deploy. Verify production.

**Step 4: Tag milestone**

```bash
git tag -a design-reconciliation-wave-2 -m "Wave 2: High-divergence components complete"
```

---

## Wave 3: Polish + Token Cleanup

### Task 3.1: Refactor About.tsx

**Type:** `AFK`
**Blocked by:** Wave 2 (Task 2.8)

**Files:**
- Modify: `apps/web/components/public/About.tsx`

**Current code (full file, 25 lines):**

```tsx
const aboutCards = [
  {
    title: 'Aksana 29',
    body: 'Media digital untuk mengenang jejak langkah angkatan ke-29 MAN Kapuas.',
  },
  {
    title: 'AKSANA 29',
    body: 'Ketua: Akhmad Rezky Utama. Total 279 siswa (115 L / 164 P).',
  },
];

export function About() {
  return (
    <section className="py-20 px-4">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8">
        {aboutCards.map((card) => (
          <div key={card.title} className="p-6 bg-white rounded-lg shadow">
            <h2 className="text-2xl font-heading text-primary mb-3">{card.title}</h2>
            <p className="text-dark">{card.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
```

**New code (full file):**

```tsx
const aboutCards = [
  {
    title: 'Aksana 29',
    body: 'Media digital untuk mengenang jejak langkah angkatan ke-29 MAN Kapuas.',
  },
  {
    title: 'AKSANA 29',
    body: 'Ketua: Akhmad Rezky Utama. Total 279 siswa (115 L / 164 P).',
  },
];

export function About() {
  return (
    <section className="py-24 px-4">
      <div className="container mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 justify-center">
        {aboutCards.map((card) => (
          <div key={card.title} className="p-6 bg-canvas rounded-md overflow-hidden shadow-lg">
            <h2 className="text-2xl lg:text-3xl font-bold uppercase text-primary mb-3 text-center">
              {card.title}
            </h2>
            <p className="text-ink text-center">{card.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
```

**Changes summary:**
- Section padding: `py-20` → `py-24`
- h2: `font-heading` (Bebas) → `text-2xl lg:text-3xl font-bold uppercase` (Inter uppercase)
- h2 + p: added `text-center`
- Card: `bg-white rounded-lg shadow` → `bg-canvas rounded-md overflow-hidden shadow-lg`
- Container: `max-w-6xl` → `container mx-auto` (Tailwind container utility)
- Grid: `md:grid-cols-2 gap-8` → `grid-cols-1 lg:grid-cols-2 gap-6` (1 mobile, 2 lg per DESIGN.md)

**Step 1: Replace the file**

**Step 2: Verify build + visual**

Visit `/`. About section has:
- More vertical padding (96px instead of 80px)
- Inter bold uppercase heading
- Centered text
- `rounded-md` subtle card corners
- 1 column mobile, 2 columns at lg

**Step 3: Commit**

```bash
git add apps/web/components/public/About.tsx
git commit -m "refactor(public): align About with DESIGN.md spec

- h2 Inter bold uppercase (was Bebas)
- py-24 (was py-20)
- card: bg-canvas rounded-md shadow-lg (was bg-white rounded-lg)"
```

---

### Task 3.2: Refactor BirthdayCard.tsx

**Type:** `AFK`
**Blocked by:** Wave 2 (Task 2.8)

**Files:**
- Modify: `apps/web/components/public/BirthdayCard.tsx`

**Current code (full file, 44 lines):**

```tsx
import Image from 'next/image';
import { getImageUrl } from '@/lib/images';

interface BirthdayCardProps {
  students: Array<{
    id: string;
    nama: string;
    kelas: string;
    image_path: string | null;
    tanggal: string;
  }>;
}

export function BirthdayCard({ students }: BirthdayCardProps) {
  if (students.length === 0) return null;

  return (
    <section className="py-12 px-4 bg-gradient-to-r from-primary/5 to-tersier/5">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-heading text-primary mb-6">
          Ulang Tahun Bulan Ini
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {students.map(s => (
            <div key={s.id} className="text-center p-3 bg-white rounded-lg shadow">
              <div className="relative w-16 h-16 mx-auto rounded-full overflow-hidden bg-secondary">
                {s.image_path && (
                  <Image
                    src={getImageUrl(s.image_path, 320)}
                    alt={s.nama}
                    fill
                    className="object-cover"
                  />
                )}
              </div>
              <p className="mt-2 font-semibold text-sm">{s.nama}</p>
              <p className="text-xs text-gray-600">{s.tanggal}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

**New code (full file):**

```tsx
import Image from 'next/image';
import { getImageUrl } from '@/lib/images';

interface BirthdayCardProps {
  students: Array<{
    id: string;
    nama: string;
    kelas: string;
    image_path: string | null;
    tanggal: string;
  }>;
}

export function BirthdayCard({ students }: BirthdayCardProps) {
  if (students.length === 0) return null;

  return (
    <section className="py-24 px-16 bg-primary/5">
      <div className="container mx-auto">
        <h2 className="text-2xl lg:text-3xl font-bold uppercase text-primary mb-6 text-center">
          Ulang Tahun Bulan Ini
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-y-3">
          {students.map(s => (
            <div key={s.id} className="text-center p-3 bg-canvas rounded-md shadow-lg">
              <div className="relative w-16 h-16 mx-auto rounded-full overflow-hidden bg-secondary">
                {s.image_path && (
                  <Image
                    src={getImageUrl(s.image_path, 320)}
                    alt={s.nama}
                    fill
                    className="object-cover"
                  />
                )}
              </div>
              <p className="mt-2 font-semibold text-sm">{s.nama}</p>
              <p className="text-xs text-ink-mute">{s.tanggal}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

**Changes summary:**
- Section padding: `py-12 px-4` → `py-24 px-16`
- Background: `bg-gradient-to-r from-primary/5 to-tersier/5` → `bg-primary/5` (no gradient, no gold)
- h2: `font-heading` (Bebas) → `text-2xl lg:text-3xl font-bold uppercase` (Inter) + `text-center`
- Card: `bg-white rounded-lg shadow` → `bg-canvas rounded-md shadow-lg`
- Tanggal: `text-gray-600` → `text-ink-mute`
- Grid: `grid-cols-2 md:grid-cols-4 lg:grid-cols-6` → `grid-cols-1 sm:grid-cols-3 gap-y-3` (per count-up spec, 1 mobile, 3 at sm)

**Step 1: Replace the file**

**Step 2: Verify build + visual**

Visit `/` when there are students with birthdays this month. Section has:
- More padding
- Inter uppercase heading
- Light emerald background (no gold)
- Cards with `rounded-md`

**Step 3: Commit**

```bash
git add apps/web/components/public/BirthdayCard.tsx
git commit -m "refactor(public): align BirthdayCard with DESIGN.md spec

- py-24 px-16 (was py-12 px-4)
- bg-primary/5 (was gradient with gold)
- h2 Inter bold uppercase (was Bebas)
- card: bg-canvas rounded-md shadow-lg"
```

---

### Task 3.3: Refactor BirthdayPopup.tsx (CSS var refactor)

**Type:** `AFK`
**Blocked by:** Wave 2 (Task 2.8)

**Files:**
- Modify: `apps/web/components/public/BirthdayPopup.tsx`

**Current code (full file, 26 lines):**

```tsx
'use client';
import { useEffect } from 'react';
import Swal from 'sweetalert2';

interface BirthdayPopupProps {
  students: Array<{ id: string; nama: string; kelas: string }>;
}

export function BirthdayPopup({ students }: BirthdayPopupProps) {
  useEffect(() => {
    if (students.length === 0) return;

    Swal.fire({
      title: 'Selamat Ulang Tahun!',
      html: students.length === 1
        ? `<b>${students[0].nama}</b><br/>${students[0].kelas}`
        : students.map(s => `<b>${s.nama}</b> (${s.kelas})`).join('<br/>'),
      icon: 'success',
      confirmButtonColor: '#065f46',
      timer: 5000,
      timerProgressBar: true,
    });
  }, [students]);

  return null;
}
```

**New code (full file):**

```tsx
'use client';
import { useEffect } from 'react';
import Swal from 'sweetalert2';

interface BirthdayPopupProps {
  students: Array<{ id: string; nama: string; kelas: string }>;
}

export function BirthdayPopup({ students }: BirthdayPopupProps) {
  useEffect(() => {
    if (students.length === 0) return;

    Swal.fire({
      title: 'Selamat Ulang Tahun!',
      html: students.length === 1
        ? `<b>${students[0].nama}</b><br/>${students[0].kelas}`
        : students.map(s => `<b>${s.nama}</b> (${s.kelas})`).join('<br/>'),
      icon: 'success',
      // CSS var generated by Tailwind from primary token in tailwind.config.ts.
      // Single-sources the brand color so config changes propagate.
      confirmButtonColor: 'var(--tw-color-primary)',
      timer: 5000,
      timerProgressBar: true,
    });
  }, [students]);

  return null;
}
```

**Changes summary:**
- `confirmButtonColor: '#065f46'` → `confirmButtonColor: 'var(--tw-color-primary)'`
- No structural changes; this is a hex-to-CSS-var refactor for single-sourcing

**Step 1: Edit the file**

Use Edit tool to change only the `confirmButtonColor` line.

**Step 2: Verify build + visual**

Visit `/` when there's a student with birthday today. SweetAlert2 popup should show with the same emerald confirm button as before.

**Step 3: Commit**

```bash
git add apps/web/components/public/BirthdayPopup.tsx
git commit -m "refactor(public): use CSS var for BirthdayPopup confirmButtonColor

Replace hardcoded #065f46 with var(--tw-color-primary) so brand
color is single-sourced from tailwind.config.ts."
```

---

### Task 3.4: Refactor SambutanCarousel.tsx

**Type:** `AFK`
**Blocked by:** Wave 2 (Task 2.8)

**Files:**
- Modify: `apps/web/components/public/SambutanCarousel.tsx`

**Changes summary (full replacement):**
- h2: `text-3xl font-heading text-primary` (Bebas) → `text-2xl lg:text-3xl font-bold uppercase text-primary` (Inter)
- h2: add `text-center`
- Section padding: `py-16 px-4` → `py-24 px-16`
- Section background: `bg-gradient-to-b from-white to-gray-50` → `bg-canvas` (no gradient, no gray-50)
- Photo wrapper: `border-4 border-tersier/30` → `border-4 border-primary/30` (no gold)
- Name: `font-heading` (Bebas) → `font-semibold text-xl` (Inter)
- Jabatan: `text-tersier font-medium` → `text-primary/80 font-medium`
- Card: `bg-white rounded-xl shadow-lg` → `bg-canvas rounded-md shadow-lg`
- Speech: `text-gray-600` → `text-ink-mute`

**Current code (full file, 102 lines) — replaced entirely:**

```tsx
'use client';

import { useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import { apiGet } from '@/lib/api';
import { getImageUrl } from '@/lib/images';
import Image from 'next/image';
import type { SambutanPublic } from '@aksana/shared';

export function SambutanCarousel() {
  const [sambutanList, setSambutanList] = useState<SambutanPublic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet<{ data: SambutanPublic[] }>('/api/public/sambutan')
      .then((res) => setSambutanList(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-48 bg-gray-200 rounded mx-auto" />
            <div className="h-64 bg-gray-100 rounded-lg" />
          </div>
        </div>
      </section>
    );
  }

  if (sambutanList.length === 0) return null;

  return (
    <section className="py-16 px-4 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-6xl mx-auto">
        <h2
          className="text-3xl font-heading text-primary text-center mb-10"
        >
          Sambutan
        </h2>

        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          spaceBetween={30}
          slidesPerView={1}
          navigation
          pagination={{ clickable: true }}
          autoplay={{ delay: 6000, disableOnInteraction: false }}
          breakpoints={{
            768: { slidesPerView: 1 },
          }}
          className="sambutan-swiper"
        >
          {sambutanList.map((item) => (
            <SwiperSlide key={item.id}>
              <div className="bg-white rounded-xl shadow-lg p-6 md:p-10 max-w-3xl mx-auto">
                <div className="flex flex-col items-center">
                  {/* Photo */}
                  <div className="relative w-28 h-28 md:w-36 md:h-36 rounded-full overflow-hidden border-4 border-tersier/30 mb-4 bg-gray-100">
                    {item.image_path ? (
                      <Image
                        src={getImageUrl(item.image_path, 320)}
                        alt={item.nama}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-4xl font-heading">
                        {item.nama.charAt(0)}
                      </div>
                    )}
                  </div>

                  {/* Name & Position */}
                  <h3 className="text-xl font-heading text-primary">{item.nama}</h3>
                  <p className="text-sm text-tersier font-medium mt-1">{item.jabatan}</p>

                  {/* Speech */}
                  <div className="mt-6 text-gray-600 text-sm md:text-base leading-relaxed text-justify max-w-2xl">
                    {item.isi.split('\n').map((paragraph, i) => (
                      <p key={i} className="mb-3">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}
```

**New code (full file):**

```tsx
'use client';

import { useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import { apiGet } from '@/lib/api';
import { getImageUrl } from '@/lib/images';
import Image from 'next/image';
import type { SambutanPublic } from '@aksana/shared';

export function SambutanCarousel() {
  const [sambutanList, setSambutanList] = useState<SambutanPublic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet<{ data: SambutanPublic[] }>('/api/public/sambutan')
      .then((res) => setSambutanList(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section className="py-24 px-16">
        <div className="container mx-auto text-center">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-48 bg-secondary rounded mx-auto" />
            <div className="h-64 bg-secondary rounded-md" />
          </div>
        </div>
      </section>
    );
  }

  if (sambutanList.length === 0) return null;

  return (
    <section className="py-24 px-16 bg-canvas">
      <div className="container mx-auto">
        <h2 className="text-2xl lg:text-3xl font-bold uppercase text-primary text-center mb-10">
          Sambutan
        </h2>

        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          spaceBetween={30}
          slidesPerView={1}
          navigation
          pagination={{ clickable: true }}
          autoplay={{ delay: 6000, disableOnInteraction: false }}
          breakpoints={{
            768: { slidesPerView: 1 },
          }}
          className="sambutan-swiper"
        >
          {sambutanList.map((item) => (
            <SwiperSlide key={item.id}>
              <div className="bg-canvas rounded-md shadow-lg p-6 md:p-10 max-w-3xl mx-auto">
                <div className="flex flex-col items-center">
                  {/* Photo */}
                  <div className="relative w-28 h-28 md:w-36 md:h-36 rounded-full overflow-hidden border-4 border-primary/30 mb-4 bg-secondary">
                    {item.image_path ? (
                      <Image
                        src={getImageUrl(item.image_path, 320)}
                        alt={item.nama}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-ink-placeholder text-4xl">
                        {item.nama.charAt(0)}
                      </div>
                    )}
                  </div>

                  {/* Name & Position */}
                  <h3 className="text-xl font-semibold text-primary">{item.nama}</h3>
                  <p className="text-sm text-primary/80 font-medium mt-1">{item.jabatan}</p>

                  {/* Speech */}
                  <div className="mt-6 text-ink-mute text-sm md:text-base leading-relaxed text-justify max-w-2xl">
                    {item.isi.split('\n').map((paragraph, i) => (
                      <p key={i} className="mb-3">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}
```

**Step 1: Replace the file**

**Step 2: Verify build + visual**

Visit `/`. Sambutan carousel:
- Section has more padding (py-24, px-16)
- Heading is Inter bold uppercase
- No gold on the photo border
- No gold on the jabatan text
- Carousel still autoplays

**Step 3: Commit**

```bash
git add apps/web/components/public/SambutanCarousel.tsx
git commit -m "refactor(public): align SambutanCarousel with DESIGN.md spec

- h2 Inter bold uppercase (was Bebas)
- py-24 px-16 (was py-16 px-4)
- bg-canvas (was gradient)
- photo border: border-primary/30 (was border-tersier/30)
- text-primary/80 for jabatan (was text-tersier)"
```

---

### Task 3.5: Refactor SudutSekolahCarousel.tsx

**Type:** `AFK`
**Blocked by:** Wave 2 (Task 2.8)

**Files:**
- Modify: `apps/web/components/public/SudutSekolahCarousel.tsx`

**Changes summary:**
- h2: `text-3xl font-heading text-tersier` (Bebas gold) → `text-2xl lg:text-3xl font-bold uppercase text-secondary` (Inter white, since on dark bg)
- Section padding: `py-16 px-4` → `py-24 px-16`
- h2: add `text-center`
- Slide dimensions: `w-[280px] h-[380px] md:w-[320px] md:h-[420px]` → `w-70 aspect-[3/4] md:w-80` (Tailwind utilities + aspect ratio)
- Image card: `rounded-xl` → `rounded-md`
- Loading state: `bg-gray-700/800` → `bg-secondary/20` (within dark bg context)

**Current code (full file, 90 lines) — replaced entirely:**

```tsx
'use client';

import { useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/navigation';

import { apiGet } from '@/lib/api';
import { getImageUrl } from '@/lib/images';
import Image from 'next/image';
import type { SudutSekolahPublic } from '@aksana/shared';

export function SudutSekolahCarousel() {
  const [photos, setPhotos] = useState<SudutSekolahPublic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet<{ data: SudutSekolahPublic[] }>('/api/public/sudut-sekolah')
      .then((res) => setPhotos(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section className="py-16 px-4 bg-dark">
        <div className="max-w-6xl mx-auto text-center">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-48 bg-gray-700 rounded mx-auto" />
            <div className="h-64 bg-gray-800 rounded-lg" />
          </div>
        </div>
      </section>
    );
  }

  if (photos.length === 0) return null;

  return (
    <section className="py-16 px-4 bg-dark">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-heading text-tersier text-center mb-10">
          Sudut Sekolah
        </h2>

        <p className="text-gray-400 text-center mb-8 max-w-xl mx-auto">
          Kenangan dari setiap sudut MAN Kapuas yang akan selalu kami rindukan
        </p>

        <Swiper
          modules={[Navigation, Autoplay]}
          spaceBetween={16}
          slidesPerView="auto"
          centeredSlides
          navigation
          autoplay={{ delay: 4000, disableOnInteraction: false }}
          loop
          breakpoints={{
            320: { slidesPerView: 1, spaceBetween: 8 },
            480: { slidesPerView: 1.5, spaceBetween: 12 },
            640: { slidesPerView: 2, spaceBetween: 16 },
            768: { slidesPerView: 2.5, spaceBetween: 16 },
            1024: { slidesPerView: 3, spaceBetween: 20 },
          }}
          className="sudut-sekolah-swiper"
        >
          {photos.map((photo) => (
            <SwiperSlide key={photo.id} style={{ width: 'auto' }}>
              <div className="relative w-[280px] h-[380px] md:w-[320px] md:h-[420px] rounded-xl overflow-hidden group shadow-lg">
                <Image
                  src={getImageUrl(photo.image_path, 640)}
                  alt={photo.caption || 'Sudut Sekolah'}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 640px) 280px, 320px"
                />
                {photo.caption && (
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-4 pt-12">
                    <p className="text-white text-sm font-medium">{photo.caption}</p>
                  </div>
                )}
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}
```

**New code (full file):**

```tsx
'use client';

import { useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/navigation';

import { apiGet } from '@/lib/api';
import { getImageUrl } from '@/lib/images';
import Image from 'next/image';
import type { SudutSekolahPublic } from '@aksana/shared';

export function SudutSekolahCarousel() {
  const [photos, setPhotos] = useState<SudutSekolahPublic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet<{ data: SudutSekolahPublic[] }>('/api/public/sudut-sekolah')
      .then((res) => setPhotos(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section className="py-24 px-16 bg-dark">
        <div className="container mx-auto text-center">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-48 bg-dark/50 rounded mx-auto" />
            <div className="h-64 bg-dark/50 rounded-md" />
          </div>
        </div>
      </section>
    );
  }

  if (photos.length === 0) return null;

  return (
    <section className="py-24 px-16 bg-dark">
      <div className="container mx-auto">
        <h2 className="text-2xl lg:text-3xl font-bold uppercase text-secondary text-center mb-10">
          Sudut Sekolah
        </h2>

        <p className="text-ink-mute text-center mb-8 max-w-xl mx-auto">
          Kenangan dari setiap sudut MAN Kapuas yang akan selalu kami rindukan
        </p>

        <Swiper
          modules={[Navigation, Autoplay]}
          spaceBetween={16}
          slidesPerView="auto"
          centeredSlides
          navigation
          autoplay={{ delay: 4000, disableOnInteraction: false }}
          loop
          breakpoints={{
            320: { slidesPerView: 1, spaceBetween: 8 },
            480: { slidesPerView: 1.5, spaceBetween: 12 },
            640: { slidesPerView: 2, spaceBetween: 16 },
            768: { slidesPerView: 2.5, spaceBetween: 16 },
            1024: { slidesPerView: 3, spaceBetween: 20 },
          }}
          className="sudut-sekolah-swiper"
        >
          {photos.map((photo) => (
            <SwiperSlide key={photo.id} style={{ width: 'auto' }}>
              <div className="relative w-70 aspect-[3/4] md:w-80 rounded-md overflow-hidden group shadow-lg">
                <Image
                  src={getImageUrl(photo.image_path, 640)}
                  alt={photo.caption || 'Sudut Sekolah'}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 640px) 280px, 320px"
                />
                {photo.caption && (
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-dark via-dark/50 to-transparent p-4 pt-12">
                    <p className="text-secondary text-sm font-medium">{photo.caption}</p>
                  </div>
                )}
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}
```

**Step 1: Replace the file**

**Step 2: Verify build + visual**

Visit `/`. Sudut Sekolah carousel:
- Section has more padding
- Heading is Inter white uppercase (no gold)
- Slide images use aspect ratio (no more h-[420px] arbitrary)
- Image cards have `rounded-md` (subtle)

**Step 3: Commit**

```bash
git add apps/web/components/public/SudutSekolahCarousel.tsx
git commit -m "refactor(public): align SudutSekolahCarousel with DESIGN.md spec

- h2 Inter bold uppercase text-secondary (was Bebas gold)
- py-24 px-16 (was py-16 px-4)
- slide: w-70 aspect-[3/4] md:w-80 (utilities, no h-[420px] arbitrary)
- image card: rounded-md (was rounded-xl)
- text-secondary for caption (was text-white)"
```

---

### Task 3.6: Refactor VideoEmbed.tsx

**Type:** `AFK`
**Blocked by:** Wave 2 (Task 2.8)

**Files:**
- Modify: `apps/web/components/public/VideoEmbed.tsx`

**Current code (full file, 36 lines):**

```tsx
'use client';
import { useState } from 'react';

interface VideoEmbedProps {
  driveId: string;
  judul: string;
  deskripsi?: string | null;
}

export function VideoEmbed({ driveId, judul, deskripsi }: VideoEmbedProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="bg-secondary rounded-lg overflow-hidden shadow-lg">
      <div className="aspect-video relative bg-dark">
        {!loaded && (
          <div className="absolute inset-0 flex items-center justify-center text-white">
            <p className="text-lg">Memuat video...</p>
          </div>
        )}
        <iframe
          src={`https://drive.google.com/file/d/${driveId}/preview`}
          className={`w-full h-full ${loaded ? '' : 'opacity-0 absolute'}`}
          allow="autoplay"
          allowFullScreen
          onLoad={() => setLoaded(true)}
          title={judul}
        />
      </div>
      <div className="p-4">
        <h3 className="font-heading text-xl text-primary">{judul}</h3>
        {deskripsi && <p className="text-sm text-gray-600 mt-1">{deskripsi}</p>}
      </div>
    </div>
  );
}
```

**New code (full file):**

```tsx
'use client';
import { useState } from 'react';

interface VideoEmbedProps {
  driveId: string;
  judul: string;
  deskripsi?: string | null;
}

/**
 * VideoEmbed per DESIGN.md "Components > Video Lazy (video-lazy)":
 * - aspect-video overflow-hidden rounded-md shadow-lg bg-dark/50
 * - click-to-load Google Drive iframe
 * - p-4 body with Inter title (no Bebas)
 */
export function VideoEmbed({ driveId, judul, deskripsi }: VideoEmbedProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="bg-secondary rounded-md overflow-hidden shadow-lg">
      <div className="aspect-video relative bg-dark/50">
        {!loaded && (
          <div className="absolute inset-0 flex items-center justify-center text-secondary">
            <p className="text-lg font-semibold">Memuat video...</p>
          </div>
        )}
        <iframe
          src={`https://drive.google.com/file/d/${driveId}/preview`}
          className={`w-full h-full ${loaded ? '' : 'opacity-0 absolute'}`}
          allow="autoplay"
          allowFullScreen
          onLoad={() => setLoaded(true)}
          title={judul}
        />
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-primary">{judul}</h3>
        {deskripsi && <p className="text-sm text-ink-mute mt-1">{deskripsi}</p>}
      </div>
    </div>
  );
}
```

**Changes summary:**
- Container: `rounded-lg` → `rounded-md`
- Title: `font-heading text-xl` (Bebas) → `text-lg font-semibold` (Inter)
- Loading state: `text-white` → `text-secondary` (semantic)
- Loading text: added `font-semibold`
- Deskripsi: `text-gray-600` → `text-ink-mute`

**Step 1: Replace the file**

**Step 2: Verify build + visual**

Visit `/galeri`. Videos load with:
- `rounded-md` subtle corners
- Inter semibold title

**Step 3: Commit**

```bash
git add apps/web/components/public/VideoEmbed.tsx
git commit -m "refactor(public): align VideoEmbed with DESIGN.md video-lazy

- rounded-md (was rounded-lg)
- h3 Inter semibold (was Bebas)
- text-secondary for loading state"
```

---

### Task 3.7: Refactor guru/page.tsx

**Type:** `AFK`
**Blocked by:** Wave 2 (Task 2.8)

**Files:**
- Modify: `apps/web/app/(public)/guru/page.tsx`

**Current code (full file, 62 lines):**

```tsx
'use client';
import { useState, useEffect } from 'react';
import { apiGet } from '@/lib/api';
import { TeacherCard } from '@/components/public/TeacherCard';
import { TeacherModal } from '@/components/public/TeacherModal';
import { JABATAN_PRIORITY } from '@aksana/shared';
import type { TeacherPublic } from '@aksana/shared';

const PRIORITY_MAP = Object.fromEntries(JABATAN_PRIORITY);

export default function GuruPage() {
  const [teachers, setTeachers] = useState<TeacherPublic[]>([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<TeacherPublic | null>(null);

  useEffect(() => {
    apiGet<{ data: TeacherPublic[] }>('/api/public/teachers', { limit: '100' })
      .then(res => setTeachers(res.data));
  }, []);

  const filtered = teachers.filter(t =>
    t.nama.toLowerCase().includes(search.toLowerCase())
  );

  // Group by jabatan using JABATAN_PRIORITY order
  const grouped = filtered.reduce((acc, t) => {
    const key = t.jabatan || 'Lainnya';
    if (!acc[key]) acc[key] = [];
    acc[key].push(t);
    return acc;
  }, {} as Record<string, TeacherPublic[]>);

  const sortedGroups = Object.entries(grouped).sort(
    ([a], [b]) => (PRIORITY_MAP[a] ?? 99) - (PRIORITY_MAP[b] ?? 99)
  );

  return (
    <main className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-heading text-primary">Guru</h1>
      <input
        type="search"
        placeholder="Cari guru..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="mt-4 w-full p-2 border rounded"
      />
      <div className="mt-6 space-y-8">
        {sortedGroups.map(([jabatan, list]) => (
          <div key={jabatan}>
            <h2 className="text-xl font-heading text-tersier mb-4">{jabatan}</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {list.map(t => (
                <TeacherCard key={t.id} teacher={t} onClick={() => setSelected(t)} />
              ))}
            </div>
          </div>
        ))}
      </div>
      {selected && <TeacherModal teacher={selected} onClose={() => setSelected(null)} />}
    </main>
  );
}
```

**New code (full file):**

```tsx
'use client';
import { useState, useEffect } from 'react';
import { apiGet } from '@/lib/api';
import { TeacherCard } from '@/components/public/TeacherCard';
import { TeacherModal } from '@/components/public/TeacherModal';
import { SearchBar } from '@/components/public/SearchBar';
import { JABATAN_PRIORITY } from '@aksana/shared';
import type { TeacherPublic } from '@aksana/shared';

const PRIORITY_MAP = Object.fromEntries(JABATAN_PRIORITY);

export default function GuruPage() {
  const [teachers, setTeachers] = useState<TeacherPublic[]>([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<TeacherPublic | null>(null);

  useEffect(() => {
    apiGet<{ data: TeacherPublic[] }>('/api/public/teachers', { limit: '100' })
      .then(res => setTeachers(res.data));
  }, []);

  const filtered = teachers.filter(t =>
    t.nama.toLowerCase().includes(search.toLowerCase())
  );

  // Group by jabatan using JABATAN_PRIORITY order
  const grouped = filtered.reduce((acc, t) => {
    const key = t.jabatan || 'Lainnya';
    if (!acc[key]) acc[key] = [];
    acc[key].push(t);
    return acc;
  }, {} as Record<string, TeacherPublic[]>);

  const sortedGroups = Object.entries(grouped).sort(
    ([a], [b]) => (PRIORITY_MAP[a] ?? 99) - (PRIORITY_MAP[b] ?? 99)
  );

  return (
    <main className="container mx-auto px-16 py-24">
      <h1 className="text-2xl lg:text-3xl font-bold uppercase text-primary">Guru</h1>
      <div className="mt-4">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Cari guru..."
        />
      </div>
      <div className="mt-6 space-y-8">
        {sortedGroups.map(([jabatan, list]) => (
          <div key={jabatan}>
            <h2 className="text-2xl font-bold uppercase text-primary mb-4">{jabatan}</h2>
            <div className="flex flex-wrap">
              {list.map(t => (
                <div key={t.id} className="w-full sm:w-1/2 lg:w-1/3 xl:w-1/4 p-3">
                  <TeacherCard teacher={t} onClick={() => setSelected(t)} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      {selected && <TeacherModal teacher={selected} onClose={() => setSelected(null)} />}
    </main>
  );
}
```

**Changes summary:**
- h1: `text-3xl font-heading` (Bebas) → `text-2xl lg:text-3xl font-bold uppercase` (Inter)
- Inline `<input>` → `<SearchBar>` component
- Per-jabatan h2: `text-xl font-heading text-tersier` (Bebas gold) → `text-2xl font-bold uppercase text-primary` (Inter, no gold)
- Grid: `grid md:grid-cols-2 gap-4` → `flex flex-wrap` with `w-full sm:w-1/2 lg:w-1/3 xl:w-1/4 p-3` per card (1→2→3→4 per DESIGN.md)
- Container: `max-w-6xl mx-auto p-6` → `container mx-auto px-16 py-24` (more padding per spec)

**Step 1: Replace the file**

**Step 2: Verify build + visual**

Visit `/guru`:
- h1 is Inter bold uppercase
- Search bar is the new pill component (rounded-full)
- Per-jabatan h2 is Inter bold uppercase (no gold)
- Cards: 1 column mobile, 2 at sm (640px), 3 at lg (1024px), 4 at xl (1280px)

**Step 3: Commit**

```bash
git add apps/web/app/'(public)'/guru/page.tsx
git commit -m "refactor(public): align guru page with DESIGN.md spec

- h1 + h2 Inter bold uppercase (no Bebas, no gold)
- SearchBar component (replaces inline input)
- 1->2->3->4 card grid (was 2 columns only at md)
- container mx-auto px-16 py-24"
```

---

### Task 3.8: Refactor pesdik/[kelas]/page.tsx

**Type:** `AFK`
**Blocked by:** Wave 2 (Task 2.8)

**Files:**
- Modify: `apps/web/app/(public)/pesdik/[kelas]/page.tsx`

**Current code (full file, 73 lines):**

```tsx
'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { apiGet } from '@/lib/api';
import { StudentCard } from '@/components/public/StudentCard';
import { StudentModal } from '@/components/public/StudentModal';
import type { StudentPublic } from '@aksana/shared';

const SLUG_TO_KELAS: Record<string, string> = {
  'xii-ipa-1': 'XII IPA 1',
  'xii-ipa-2': 'XII IPA 2',
  'xii-ipa-3': 'XII IPA 3',
  'xii-ipa-4': 'XII IPA 4',
  'xii-ips-1': 'XII IPS 1',
  'xii-ips-2': 'XII IPS 2',
  'xii-ips-3': 'XII IPS 3',
  'xii-pai': 'XII PAI',
};

const KELAS_TO_SLUG: Record<string, string> = Object.fromEntries(
  Object.entries(SLUG_TO_KELAS).map(([slug, kelas]) => [kelas, slug])
);

export default function PesdikPage() {
  const params = useParams();
  const slug = params.kelas as string;
  const kelas = SLUG_TO_KELAS[slug] || '';

  const [students, setStudents] = useState<StudentPublic[]>([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<StudentPublic | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!kelas) return;
    setLoading(true);
    apiGet<{ data: StudentPublic[] }>('/api/public/students', { kelas })
      .then((res) => setStudents(res.data))
      .finally(() => setLoading(false));
  }, [kelas]);

  const filtered = students.filter((s) =>
    s.nama.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-heading text-primary">{kelas || slug}</h1>

      <input
        type="search"
        placeholder="Cari siswa..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mt-4 w-full p-2 border rounded"
      />

      {loading ? (
        <p className="mt-6 text-gray-500">Memuat data...</p>
      ) : filtered.length === 0 ? (
        <p className="mt-6 text-gray-500">Tidak ada siswa ditemukan.</p>
      ) : (
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filtered.map((s) => (
            <StudentCard key={s.id} student={s} onClick={setSelected} />
          ))}
        </div>
      )}

      <StudentModal student={selected} onClose={() => setSelected(null)} />
    </main>
  );
}
```

**New code (full file):**

```tsx
'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { apiGet } from '@/lib/api';
import { StudentCard } from '@/components/public/StudentCard';
import { StudentModal } from '@/components/public/StudentModal';
import { SearchBar } from '@/components/public/SearchBar';
import type { StudentPublic } from '@aksana/shared';

const SLUG_TO_KELAS: Record<string, string> = {
  'xii-ipa-1': 'XII IPA 1',
  'xii-ipa-2': 'XII IPA 2',
  'xii-ipa-3': 'XII IPA 3',
  'xii-ipa-4': 'XII IPA 4',
  'xii-ips-1': 'XII IPS 1',
  'xii-ips-2': 'XII IPS 2',
  'xii-ips-3': 'XII IPS 3',
  'xii-pai': 'XII PAI',
};

const KELAS_TO_SLUG: Record<string, string> = Object.fromEntries(
  Object.entries(SLUG_TO_KELAS).map(([slug, kelas]) => [kelas, slug])
);

export default function PesdikPage() {
  const params = useParams();
  const slug = params.kelas as string;
  const kelas = SLUG_TO_KELAS[slug] || '';

  const [students, setStudents] = useState<StudentPublic[]>([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<StudentPublic | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!kelas) return;
    setLoading(true);
    apiGet<{ data: StudentPublic[] }>('/api/public/students', { kelas })
      .then((res) => setStudents(res.data))
      .finally(() => setLoading(false));
  }, [kelas]);

  const filtered = students.filter((s) =>
    s.nama.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="container mx-auto px-16 py-24">
      <h1 className="text-2xl lg:text-3xl font-bold uppercase text-primary">
        {kelas || slug}
      </h1>

      <div className="mt-4">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Cari siswa..."
        />
      </div>

      {loading ? (
        <p className="mt-6 text-ink-mute">Memuat data...</p>
      ) : filtered.length === 0 ? (
        <p className="mt-6 text-ink-mute">Tidak ada siswa ditemukan.</p>
      ) : (
        <div className="mt-6 flex flex-wrap">
          {filtered.map((s) => (
            <div key={s.id} className="w-full sm:w-1/2 lg:w-1/3 xl:w-1/4 p-3">
              <StudentCard student={s} onClick={setSelected} />
            </div>
          ))}
        </div>
      )}

      <StudentModal student={selected} onClose={() => setSelected(null)} />
    </main>
  );
}
```

**Changes summary:**
- h1: `text-3xl font-heading` (Bebas) → `text-2xl lg:text-3xl font-bold uppercase` (Inter)
- Inline `<input>` → `<SearchBar>` component
- Grid: `grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5` (2→3→4→5) → `flex flex-wrap` with `w-full sm:w-1/2 lg:w-1/3 xl:w-1/4 p-3` (1→2→3→4 per DESIGN.md)
- Container: `max-w-6xl mx-auto p-6` → `container mx-auto px-16 py-24`
- Loading/empty: `text-gray-500` → `text-ink-mute`

**Step 1: Replace the file**

**Step 2: Verify build + visual**

Visit `/pesdik/xii-ipa-1`:
- h1 is Inter bold uppercase
- Search bar is the new pill
- Cards: 1 column mobile, 2 at sm, 3 at lg, 4 at xl (was 5 at lg)

**Step 3: Commit**

```bash
git add apps/web/app/'(public)'/pesdik/'[kelas]'/page.tsx
git commit -m "refactor(public): align pesdik page with DESIGN.md spec

- h1 Inter bold uppercase (no Bebas)
- SearchBar component (replaces inline input)
- 1->2->3->4 card grid (was 2->3->4->5)
- container mx-auto px-16 py-24"
```

---

### Task 3.9: Remove tersier from tailwind.config.ts

**Type:** `HITL` (final token cleanup — requires verification gate)
**Blocked by:** Tasks 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8

**Files:**
- Modify: `apps/web/tailwind.config.ts:11` (remove `tersier` line)

**Pre-merge verification (GATE — do not proceed if this fails):**

**Step 1: Grep for any remaining tersier references**

Run: `grep -rn "tersier" apps/web/`
Expected: ONLY one line: `apps/web/tailwind.config.ts:11:      tersier: '#E5BA73',`

If there are any other matches in components or pages, do NOT proceed — go back and migrate them to `tertiary` first.

**Step 2: Remove tersier from config**

Edit `apps/web/tailwind.config.ts` to remove the line:

```ts
// REMOVE THIS LINE:
      tersier: '#E5BA73',
```

And the comment above it:

```ts
// REMOVE THIS COMMENT:
// DEPRECATED (to remove in Wave 3 — kept as alias during transition)
```

**Step 3: Verify type-check + build + test**

```bash
pnpm --filter @aksana/web type-check
pnpm --filter @aksana/web build
pnpm turbo test
```
Expected: all green. 53 tests pass.

**Step 4: Visual smoke test**

Run `pnpm --filter @aksana/web dev` and visit all public pages:
- `/` — home (header, hero, about, birthday, sambutan, sudut sekolah)
- `/guru` — teacher list + modal
- `/pesdik/xii-ipa-1` — student list + modal
- `/galeri` — video embeds

Confirm no visual regression (the `tersier` and `tertiary` tokens have the same hex `#E5BA73`, so removal should not change visual output — only ensure the code now uses `tertiary` everywhere).

**Step 5: Commit**

```bash
git add apps/web/tailwind.config.ts
git commit -m "refactor(design): remove deprecated tersier token

All references migrated to canonical 'tertiary' (same hex #E5BA73).
Verified via grep -r 'tersier' returning zero matches in components."
```

---

### Task 3.10: Wave 3 verification + final deploy

**Type:** `HITL`
**Blocked by:** Tasks 3.1-3.9

**Step 1: Final full verification**

```bash
pnpm --filter @aksana/web type-check
pnpm --filter @aksana/web build
pnpm --filter @aksana/web lint
pnpm turbo test
grep -r "tersier" apps/web/   # expect: no matches
```

**Step 2: Full site visual audit at 3 viewports**

Run `pnpm --filter @aksana/web dev` and check at:
- **Desktop (1280px)**: All 4 pages render correctly with DESIGN.md specs
- **Tablet (768px)**: Responsive breakpoints kick in correctly
- **Mobile (375px)**: Hamburger animates, mobile menu slides in

**Step 3: Final merge and deploy**

```bash
git checkout main
git merge feature/wave-3-polish --no-ff
git push origin main
```

Wait for Vercel auto-deploy. Verify production at `https://aksana-29-nextjs-web.vercel.app`.

**Step 4: Tag final milestone**

```bash
git tag -a design-reconciliation-v1 -m "DESIGN.md reconciliation complete (L2)"
```

**Step 5: Update memory + handoff**

Update `memory/2026-06-16.md` with Wave 1-3 completion notes. Update `handoff-aksana29-evolution.md` to reflect that DESIGN.md reconciliation is done.

---

## Self-Review Notes

The writer's self-review against the spec:

1. **Spec coverage:** All 13 components in Section 1.2 goals are covered. All 7 tokens in Section 3.1 are added. SearchBar and Modal in Section 3.3-3.4. globals.css port in Section 3.2. Wave 2's 7 components. Wave 3's 6 components + 2 pages + token cleanup. Success criteria 1-11 in Section 1.4 are testable via the verification steps.

2. **Placeholder scan:** No "TBD"/"TODO". Every step has actual code (not "similar to Task N"). All new file contents are full. All component refactors show full file content.

3. **Type consistency:** `SearchBarProps` defined in Task 1.3 used in Task 3.7 and 3.8. `TeacherCardProps` in Task 2.4 used in Task 3.7. `TeacherModalProps` in Task 2.7 used in Task 3.7. `StudentModalProps` in Task 2.6 used in Task 3.8. No mismatched names.

4. **Vertical slice check:** The "vertical slice" rule is adapted for UI refactor: each task is one focused file change (refactor), with its own verification (type-check + build + visual). The wave-level deploy is the integration boundary. This is appropriate for a UI-only refactor with no API/DB changes.

5. **HITL/AFK check:** Tasks 1.1, 1.2, 1.3, 1.4 are AFK (config/CSS/new component). Tasks 2.1-2.7 are AFK (component refactors with verification). Tasks 3.1-3.8 are AFK. Task 3.9 is HITL because the grep gate is critical. Tasks 1.5, 2.8, 3.10 are HITL (Vercel deploy + visual smoke test requires human confirmation).

6. **Task grouping check:** Wave 1 is one sequential chain (config → CSS → components). Wave 2 is one parallel batch (7 independent file changes) + sequential tail (deploy). Wave 3 is one parallel batch (8 independent file changes) + sequential tail (token cleanup + deploy). No cross-dependencies within batches.

7. **Demoability check:** After Wave 1, the foundation is in place but no visible change. After Wave 2, the home page header becomes transparent emerald, hero subtitle becomes white, etc. — clearly demoable. After Wave 3, full DESIGN.md compliance.

**Issues found and fixed during self-review:**
- None — initial draft passed all checks.
