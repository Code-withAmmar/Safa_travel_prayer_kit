import { Mail, MessageCircle, ShieldCheck } from 'lucide-react';
import { SAFA_ASSETS } from '../data/seedCatalog';
import type { PageView } from '../types/safa';
import { SafaImage } from './SafaImage';

export type PolicyKey = 'privacy' | 'terms' | 'returns';

interface FooterProps {
  onNavigate: (page: PageView) => void;
  onOpenPolicy: (policy: PolicyKey) => void;
}

export function Footer({ onNavigate, onOpenPolicy }: FooterProps) {
  return (
    <footer
      className="safa-theme-transition border-t"
      style={{
        backgroundColor: 'var(--safa-footer-bg)',
        color: 'var(--safa-footer-ink)',
        borderColor: 'rgba(197, 161, 91, 0.25)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand Column */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="h-12 w-11 rounded-md overflow-hidden bg-[#F7F4EC] border border-[#C5A15B]/40 flex items-center justify-center shrink-0">
                <SafaImage
                  src={SAFA_ASSETS.logo}
                  alt="SAFA Official Calligraphy Logo"
                  className="h-full w-full object-contain p-0.5"
                />
              </span>
              <div>
                <p className="font-display text-2xl font-semibold tracking-[0.14em]">SAFA</p>
                <p className="font-arabic text-base text-[#C5A15B]" dir="rtl">
                  رفيق صلاتك أينما ذهبت
                </p>
              </div>
            </div>
            <p className="text-sm leading-relaxed opacity-85">
              Your Prayer Companion, Wherever You Go. Thoughtfully organized travel prayer kits
              for men and women across Pakistan.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-display text-lg font-medium mb-4 text-[#E9D7AC]">
              Explore SAFA
            </h3>
            <ul className="space-y-2.5 text-sm opacity-90">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('home')}
                  className="hover:underline cursor-pointer"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('shop')}
                  className="hover:underline cursor-pointer"
                >
                  Shop All Packages
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('men')}
                  className="hover:underline cursor-pointer"
                >
                  Men&apos;s Beige Collection
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('women')}
                  className="hover:underline cursor-pointer"
                >
                  Women&apos;s Mauve Collection
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('wishlist')}
                  className="hover:underline cursor-pointer"
                >
                  Saved Items
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('about')}
                  className="hover:underline cursor-pointer"
                >
                  About SAFA
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('contact')}
                  className="hover:underline cursor-pointer"
                >
                  Contact Us
                </button>
              </li>
            </ul>
          </div>

          {/* Contact & Social */}
          <div>
            <h3 className="font-display text-lg font-medium mb-4 text-[#E9D7AC]">
              Connect With Us
            </h3>
            <ul className="space-y-3 text-sm opacity-90">
              <li className="flex items-center gap-2.5">
                <MessageCircle className="w-4 h-4 text-[#C5A15B] shrink-0" aria-hidden="true" />
                <a
                  href="https://wa.me/923001234567?text=Assalam-o-Alaikum%20SAFA%2C%20I%20would%20like%20to%20inquire%20about%20your%20Travel%20Prayer%20Kits."
                  target="_blank"
                  rel="noreferrer"
                  className="hover:underline"
                >
                  WhatsApp: +92 300 1234567
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#C5A15B] shrink-0" aria-hidden="true" />
                <a href="mailto:care@safaprayerkits.pk" className="hover:underline">
                  care@safaprayerkits.pk
                </a>
              </li>
              <li className="pt-1 flex items-center gap-4 text-sm">
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noreferrer"
                  className="underline decoration-[#C5A15B]/60 underline-offset-4 hover:text-[#E9D7AC]"
                >
                  Instagram
                </a>
                <span aria-hidden="true" className="opacity-40">
                  ·
                </span>
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noreferrer"
                  className="underline decoration-[#C5A15B]/60 underline-offset-4 hover:text-[#E9D7AC]"
                >
                  Facebook
                </a>
              </li>
            </ul>
          </div>

          {/* Policies & Store Management */}
          <div>
            <h3 className="font-display text-lg font-medium mb-4 text-[#E9D7AC]">
              Policies &amp; Support
            </h3>
            <ul className="space-y-2.5 text-sm opacity-90">
              <li>
                <button
                  type="button"
                  onClick={() => onOpenPolicy('privacy')}
                  className="hover:underline cursor-pointer"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onOpenPolicy('terms')}
                  className="hover:underline cursor-pointer"
                >
                  Terms &amp; Conditions
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onOpenPolicy('returns')}
                  className="hover:underline cursor-pointer"
                >
                  Return &amp; Exchange Policy
                </button>
              </li>
              <li className="pt-2">
                <button
                  type="button"
                  onClick={() => onNavigate('admin')}
                  className="inline-flex items-center gap-1.5 text-xs tracking-wide text-[#E9D7AC] hover:underline cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
                  Admin Dashboard
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div
          className="mt-12 pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-4 text-xs opacity-75"
          style={{ borderColor: 'rgba(248, 245, 238, 0.16)' }}
        >
          <p>© {new Date().getFullYear()} SAFA Travel Prayer Kits. All rights reserved.</p>
          <p>Nationwide Delivery Across Pakistan · Cash on Delivery &amp; Bank Transfer</p>
        </div>
      </div>
    </footer>
  );
}
