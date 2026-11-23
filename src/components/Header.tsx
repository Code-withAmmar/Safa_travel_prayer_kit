import { useState } from 'react';
import { Heart, Menu, ShoppingBag, X } from 'lucide-react';
import { SAFA_ASSETS } from '../data/seedCatalog';
import type { PageView } from '../types/safa';
import { SafaImage } from './SafaImage';

interface HeaderProps {
  activePage: PageView;
  cartCount: number;
  wishlistCount: number;
  onNavigate: (page: PageView) => void;
  onOpenCart: () => void;
}

const NAV_LINKS: Array<{ id: PageView; label: string }> = [
  { id: 'home', label: 'Home' },
  { id: 'shop', label: 'Shop' },
  { id: 'men', label: 'Men' },
  { id: 'women', label: 'Women' },
  { id: 'about', label: 'About SAFA' },
  { id: 'contact', label: 'Contact Us' },
];

export function Header({
  activePage,
  cartCount,
  wishlistCount,
  onNavigate,
  onOpenCart,
}: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLinkClick = (page: PageView) => {
    setMobileOpen(false);
    onNavigate(page);
  };

  return (
    <header
      className="sticky top-0 z-40 border-b safa-theme-transition backdrop-blur-md"
      style={{
        backgroundColor: 'var(--safa-header-bg)',
        borderColor: 'var(--safa-border)',
        color: 'var(--safa-header-ink)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-[72px] flex items-center justify-between gap-8">
        {/* Zone 1: Official SAFA Logo (preserved original calligraphy proportions & gold colour) */}
        <button
          type="button"
          onClick={() => handleLinkClick('home')}
          aria-label="SAFA Home"
          className="flex items-center gap-2.5 shrink-0 whitespace-nowrap text-left cursor-pointer"
        >
          <span className="h-11 w-10 rounded-md overflow-hidden bg-[#F7F4EC] border border-[#C5A15B]/30 flex items-center justify-center shrink-0">
            <SafaImage
              src={SAFA_ASSETS.logo}
              alt="SAFA Arabic Calligraphy Logo"
              loading="eager"
              className="h-full w-full object-contain p-0.5"
            />
          </span>
          <span className="font-display text-xl sm:text-2xl font-semibold tracking-[0.14em] whitespace-nowrap">
            SAFA
          </span>
        </button>

        {/* Zone 2: Primary Single-Line Navigation Links */}
        <nav
          aria-label="Primary navigation"
          className="hidden lg:flex items-center gap-7 text-[15px] font-medium"
        >
          {NAV_LINKS.map((link) => {
            const isActive = activePage === link.id;
            return (
              <button
                key={link.id}
                type="button"
                onClick={() => handleLinkClick(link.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`relative py-1 whitespace-nowrap shrink-0 cursor-pointer transition-opacity ${
                  isActive ? 'font-semibold opacity-100' : 'opacity-80 hover:opacity-100'
                }`}
              >
                {link.label}
                {isActive && (
                  <span
                    className="absolute left-0 right-0 -bottom-0.5 h-[2px] rounded-full"
                    style={{ backgroundColor: 'var(--safa-accent)' }}
                    aria-hidden="true"
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Saved Items + Shopping Cart Actions + Mobile Menu Trigger */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => handleLinkClick('wishlist')}
            aria-current={activePage === 'wishlist' ? 'page' : undefined}
            aria-label={`Saved Items (${wishlistCount})`}
            className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3.5 py-2 text-sm font-medium rounded-[7px] border whitespace-nowrap shrink-0 cursor-pointer min-h-[40px] transition-colors ${
              activePage === 'wishlist'
                ? 'bg-[var(--safa-surface-alt)] font-semibold'
                : 'hover:bg-[var(--safa-surface-alt)]/70'
            }`}
            style={{
              borderColor:
                activePage === 'wishlist' ? 'var(--safa-accent)' : 'var(--safa-border)',
              color: 'var(--safa-header-ink)',
            }}
          >
            <Heart
              className={`w-4 h-4 shrink-0 ${
                wishlistCount > 0 ? 'fill-[#B43E55] text-[#B43E55]' : ''
              }`}
              aria-hidden="true"
            />
            <span className="hidden md:inline">Saved Items</span>
            <span
              className="tabular-nums text-xs sm:text-sm font-semibold"
              data-testid="header-wishlist-count"
            >
              ({wishlistCount})
            </span>
          </button>

          <button
            type="button"
            onClick={onOpenCart}
            aria-label={`Open shopping cart with ${cartCount} item${cartCount === 1 ? '' : 's'}`}
            className="safa-btn-primary inline-flex items-center gap-2 px-3 sm:px-4 py-2 text-sm whitespace-nowrap shrink-0 cursor-pointer min-h-[40px]"
          >
            <ShoppingBag className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span className="hidden sm:inline">Cart</span>
            <span
              className="tabular-nums font-semibold"
              data-testid="header-cart-count"
            >
              ({cartCount})
            </span>
          </button>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileOpen}
            className="lg:hidden inline-flex items-center justify-center w-11 h-11 rounded-md border cursor-pointer"
            style={{
              borderColor: 'var(--safa-border)',
              color: 'var(--safa-header-ink)',
            }}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileOpen && (
        <nav
          aria-label="Mobile navigation"
          className="lg:hidden border-t px-4 py-4 space-y-1 safa-theme-transition"
          style={{
            backgroundColor: 'var(--safa-surface)',
            borderColor: 'var(--safa-border)',
            color: 'var(--safa-ink)',
          }}
        >
          {NAV_LINKS.map((link) => {
            const isActive = activePage === link.id;
            return (
              <button
                key={link.id}
                type="button"
                onClick={() => handleLinkClick(link.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`w-full text-left px-3 py-3 rounded-md text-[15px] cursor-pointer min-h-[44px] flex items-center justify-between ${
                  isActive ? 'font-semibold bg-[var(--safa-surface-alt)]' : 'hover:bg-[var(--safa-surface-alt)]/60'
                }`}
              >
                <span>{link.label}</span>
                {isActive && (
                  <span
                    className="w-5 h-[2px] rounded-full"
                    style={{ backgroundColor: 'var(--safa-accent)' }}
                    aria-hidden="true"
                  />
                )}
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => handleLinkClick('wishlist')}
            aria-current={activePage === 'wishlist' ? 'page' : undefined}
            className={`w-full text-left px-3 py-3 rounded-md text-[15px] cursor-pointer min-h-[44px] flex items-center justify-between ${
              activePage === 'wishlist'
                ? 'font-semibold bg-[var(--safa-surface-alt)]'
                : 'hover:bg-[var(--safa-surface-alt)]/60'
            }`}
          >
            <span className="inline-flex items-center gap-2">
              <Heart
                className={`w-4 h-4 ${
                  wishlistCount > 0 ? 'fill-[#B43E55] text-[#B43E55]' : ''
                }`}
                aria-hidden="true"
              />
              Saved Items
            </span>
            <span className="text-xs font-semibold tabular-nums">({wishlistCount})</span>
          </button>
        </nav>
      )}
    </header>
  );
}
