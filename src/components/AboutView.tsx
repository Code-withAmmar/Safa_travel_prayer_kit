import { ArrowRight } from 'lucide-react';
import { SAFA_ASSETS } from '../data/seedCatalog';
import type { PageView } from '../types/safa';
import { SafaImage } from './SafaImage';

interface AboutViewProps {
  onNavigate: (page: PageView) => void;
}

export function AboutView({ onNavigate }: AboutViewProps) {
  return (
    <div>
      {/* Hero Banner */}
      <section
        className="border-b py-16 lg:py-20"
        style={{
          backgroundColor: '#173F35',
          color: '#F8F5EE',
          borderColor: 'rgba(197, 161, 91, 0.3)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7 space-y-4">
            <p className="font-arabic text-2xl text-[#E5C989]" dir="rtl">
              صفا — رفيق صلاتك أينما ذهبت
            </p>
            <h1 className="font-display text-[38px] sm:text-[48px] font-semibold leading-tight">
              Designed Around Peace, Organization, and Daily Prayer.
            </h1>
            <p className="text-[15px] sm:text-[16px] text-[#E9E0D1]/90 leading-relaxed max-w-2xl">
              SAFA represents convenience, organization, and the importance of maintaining daily
              prayers during everyday journeys—whether commuting, travelling for work, or
              embarking on Umrah.
            </p>
          </div>
          <div className="lg:col-span-5">
            <div className="rounded-2xl overflow-hidden border border-[#C5A15B]/35 aspect-[4/3] bg-[#E9E0D1]">
              <SafaImage
                src={SAFA_ASSETS.men.Classic}
                alt="SAFA Travel Prayer Kit inside its signature cylindrical canister"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Mission, Vision, Purpose (Exact Section 15 copy) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <article className="safa-card rounded-2xl p-7 space-y-3">
            <p className="text-xs uppercase tracking-[0.18em] text-[#8B735B] font-semibold">
              01. Our Mission
            </p>
            <h2 className="font-display text-2xl font-semibold text-[#173F35]">
              Effortless Travel Prayers
            </h2>
            <p className="text-[15px] text-[#5A5D5A] leading-relaxed">
              To make daily prayers more convenient during travelling by providing Muslims with a
              compact and organized collection of essential prayer accessories.
            </p>
          </article>

          <article className="safa-card rounded-2xl p-7 space-y-3">
            <p className="text-xs uppercase tracking-[0.18em] text-[#8B735B] font-semibold">
              02. Our Vision
            </p>
            <h2 className="font-display text-2xl font-semibold text-[#173F35]">
              A Trusted Companion Everywhere
            </h2>
            <p className="text-[15px] text-[#5A5D5A] leading-relaxed">
              To become a trusted travel prayer essentials brand that encourages Muslims to
              maintain their daily prayers wherever life takes them.
            </p>
          </article>

          <article className="safa-card rounded-2xl p-7 space-y-3">
            <p className="text-xs uppercase tracking-[0.18em] text-[#8B735B] font-semibold">
              03. Our Purpose
            </p>
            <h2 className="font-display text-2xl font-semibold text-[#173F35]">
              Accessible &amp; Organized Essentials
            </h2>
            <p className="text-[15px] text-[#5A5D5A] leading-relaxed">
              SAFA aims to make prayer essentials more accessible, organized, and convenient for
              Muslims who are frequently away from home.
            </p>
          </article>
        </div>
      </section>

      {/* Inside Every SAFA Canister */}
      <section
        className="border-y py-16"
        style={{ backgroundColor: '#E9E0D1', borderColor: 'var(--safa-border)' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-5">
            <div className="rounded-2xl overflow-hidden border aspect-[4/3] bg-white" style={{ borderColor: 'var(--safa-border)' }}>
              <SafaImage
                src={SAFA_ASSETS.women.Premium}
                alt="SAFA Women's Mauve Travel Prayer Kit with non-slip mat and iQibla ring"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <div className="lg:col-span-7 space-y-5">
            <p className="text-xs uppercase tracking-[0.18em] text-[#8B735B] font-semibold">
              Craftsmanship &amp; Details
            </p>
            <h2 className="font-display text-[32px] sm:text-[38px] font-semibold text-[#173F35]">
              Inside Every Cylindrical SAFA Kit
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-[#493A2E]">
              <div className="p-4 rounded-xl bg-[#F8F5EE] border" style={{ borderColor: 'var(--safa-border)' }}>
                <p className="font-semibold text-[#173F35] mb-1">Double-Layered Non-Slip Mat</p>
                <p className="text-xs leading-relaxed text-[#5A5D5A]">
                  Two layers of polyester fabric stitched for structure, finished with underside
                  silicone grip dots to stay anchored on smooth floors.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-[#F8F5EE] border" style={{ borderColor: 'var(--safa-border)' }}>
                <p className="font-semibold text-[#173F35] mb-1">Five Tasbih Options</p>
                <p className="text-xs leading-relaxed text-[#5A5D5A]">
                  From traditional sand or rose-pearl beads to electronic counters, iQibla
                  Bluetooth rings, and our flagship Elite Smart Ring.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-[#F8F5EE] border" style={{ borderColor: 'var(--safa-border)' }}>
                <p className="font-semibold text-[#173F35] mb-1">30 ml Mini Hand Wash</p>
                <p className="text-xs leading-relaxed text-[#5A5D5A]">
                  Colour-matched travel hand wash bottle to stay refreshed before prayer during
                  flights and long drives.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-[#F8F5EE] border" style={{ borderColor: 'var(--safa-border)' }}>
                <p className="font-semibold text-[#173F35] mb-1">Coordinated Prayer Cap</p>
                <p className="text-xs leading-relaxed text-[#5A5D5A]">
                  Breathable ivory knitted cap for Men&apos;s Beige kits and matching dusty-rose
                  cap for Women&apos;s Mauve kits.
                </p>
              </div>
            </div>

            <div className="pt-2 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => onNavigate('men')}
                className="px-5 py-3 text-sm font-semibold text-white rounded-[7px] cursor-pointer inline-flex items-center gap-2 min-h-[44px]"
                style={{ backgroundColor: '#78614A' }}
              >
                Men&apos;s Collection
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => onNavigate('women')}
                className="px-5 py-3 text-sm font-semibold text-white rounded-[7px] cursor-pointer inline-flex items-center gap-2 min-h-[44px]"
                style={{ backgroundColor: '#8C5E85' }}
              >
                Women&apos;s Collection
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
