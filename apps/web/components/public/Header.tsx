'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { KELAS_LIST } from '@aksana/shared';

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
                      href={`/pesdik/${encodeURIComponent(kelas)}`}
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
                  href={`/pesdik/${encodeURIComponent(kelas)}`}
                  active={pathname === `/pesdik/${encodeURIComponent(kelas)}`}
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
