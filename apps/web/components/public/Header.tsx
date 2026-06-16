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
