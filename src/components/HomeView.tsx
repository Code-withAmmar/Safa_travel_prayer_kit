import { useState, type FormEvent } from 'react';
import { ArrowRight, Check, Star } from 'lucide-react';
import { PACKAGE_TIER_ORDER, SAFA_ASSETS } from '../data/seedCatalog';
import type { CollectionCategory, PackageTier, PageView, Product, ReviewRecord } from '../types/safa';
import { formatPKR } from '../utils/storeLogic';
import { ProductCard } from './ProductCard';
import { SafaImage } from './SafaImage';

interface HomeViewProps {
  products: Product[];
  reviews: ReviewRecord[];
  wishlistIds: string[];
  onToggleWishlist: (productId: string) => void;
  onNavigate: (page: PageView) => void;
  onViewProduct: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onSubmitReview: (payload: {
    authorName: string;
    city: string;
    category: CollectionCategory;
    packageVersion: PackageTier;
    rating: number;
    comment: string;
  }) => Promise<void>;
}

const WHY_SAFA_POINTS = [
  {
    number: '01.',
    title: 'Travel-Friendly Prayer Essentials',
    detail:
      'Every essential fits inside one crystal-clear cylindrical canister that slips effortlessly into cabin totes, office backpacks, or car door pockets.',
  },
  {
    number: '02.',
    title: 'Five Thoughtful Package Tiers',
    detail:
      'Choose from Elite, Premium, Digital Plus, Digital, or Classic—matching your preferred tasbih style and budget without compromising mat quality.',
  },
  {
    number: '03.',
    title: 'Organized, Non-Slip Craftsmanship',
    detail:
      'Double-layered polyester prayer mats stitched with underside silicone grip dots stay grounded on airport marble, office tiles, and hotel floors.',
  },
  {
    number: '04.',
    title: 'Curated For Men & Women',
    detail:
      'Dedicated Warm Beige / Sand kits for men and Soft Mauve / Dusty Rose kits for women, each with colour-matched lids, caps, and 30 ml hand wash.',
  },
  {
    number: '05.',
    title: 'Ready For Personal Use & Gifting',
    detail:
      'Gold-accented presentation sleeves make SAFA an elevated gift for Ramadan, Eid, Umrah, weddings, and loved ones travelling abroad.',
  },
];

export function HomeView({
  products,
  reviews,
  wishlistIds,
  onToggleWishlist,
  onNavigate,
  onViewProduct,
  onAddToCart,
  onSubmitReview,
}: HomeViewProps) {
  const [previewCategory, setPreviewCategory] = useState<CollectionCategory>('men');
  const [reviewFormOpen, setReviewFormOpen] = useState(false);
  const [authorName, setAuthorName] = useState('');
  const [city, setCity] = useState('');
  const [reviewCategory, setReviewCategory] = useState<CollectionCategory>('men');
  const [reviewTier, setReviewTier] = useState<PackageTier>('Premium');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const tierProducts = PACKAGE_TIER_ORDER.map((tier) =>
    products.find((p) => p.category === previewCategory && p.packageVersion === tier)
  ).filter((p): p is Product => Boolean(p));

  const handleReviewSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setReviewError('');
    setReviewSuccess('');
    setSubmittingReview(true);
    try {
      await onSubmitReview({
        authorName,
        city,
        category: reviewCategory,
        packageVersion: reviewTier,
        rating,
        comment,
      });
      setAuthorName('');
      setCity('');
      setComment('');
      setRating(5);
      setReviewSuccess('Thank you—your customer review has been published.');
      setReviewFormOpen(false);
    } catch (err) {
      setReviewError(err instanceof Error ? err.message : 'Unable to submit review.');
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div>
      {/* SECTION 2: HERO BANNER — Forest Green, Champagne Gold & Warm Cream */}
      <section
        className="relative overflow-hidden border-b"
        style={{
          backgroundColor: '#173F35',
          color: '#F8F5EE',
          borderColor: 'rgba(197, 161, 91, 0.35)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
            {/* Editorial Copy Column */}
            <div className="lg:col-span-6 flex flex-col justify-center space-y-6">
              <div className="space-y-3">
                <p
                  className="font-arabic text-2xl sm:text-[28px] text-[#E5C989] leading-normal text-left"
                  dir="rtl"
                >
                  رفيق صلاتك أينما ذهبت
                </p>
                <p className="text-xs tracking-[0.2em] uppercase text-[#E5C989] font-medium">
                  SAFA Travel Prayer Kits · Pakistan
                </p>
                <h1 className="font-display text-[38px] sm:text-[48px] lg:text-[54px] font-semibold leading-[1.12] tracking-tight text-[#F8F5EE]">
                  Never Miss Your Prayer, Wherever Life Takes You.
                </h1>
              </div>

              <p className="text-[15px] sm:text-[16px] leading-relaxed text-[#E9E0D1]/90 max-w-xl">
                Discover thoughtfully designed travel prayer kits that make maintaining your
                daily prayers easier, wherever you go.
              </p>

              <div className="flex flex-wrap items-center gap-3.5 pt-2">
                <button
                  type="button"
                  onClick={() => onNavigate('shop')}
                  className="safa-btn-secondary inline-flex items-center gap-2 px-6 py-3.5 text-[15px] font-semibold text-[#173F35] cursor-pointer whitespace-nowrap min-h-[46px]"
                >
                  Shop Now
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById('choose-collection');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="inline-flex items-center gap-2 px-6 py-3.5 text-[15px] font-medium rounded-[7px] border border-[#E5C989]/55 text-[#F8F5EE] hover:bg-white/10 transition-colors cursor-pointer whitespace-nowrap min-h-[46px]"
                >
                  Explore Our Collection
                </button>
              </div>

              <div className="pt-4 border-t border-[#F8F5EE]/15 grid grid-cols-3 gap-4 max-w-lg text-xs text-[#E9E0D1]/85">
                <div>
                  <p className="font-display text-lg text-[#E5C989] tabular-nums">2 Themes</p>
                  <p>Men&apos;s Beige &amp; Women&apos;s Mauve</p>
                </div>
                <div>
                  <p className="font-display text-lg text-[#E5C989] tabular-nums">5 Tiers</p>
                  <p>Classic to Smart Ring Elite</p>
                </div>
                <div>
                  <p className="font-display text-lg text-[#E5C989] tabular-nums">Free COD</p>
                  <p>Orders Rs. 5,000+ in Pakistan</p>
                </div>
              </div>
            </div>

            {/* Official SAFA Campaign Photography */}
            <div className="lg:col-span-6 flex items-center">
              <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden border border-[#C5A15B]/35 bg-[#C5B39A] shadow-2xl">
                <SafaImage
                  src={SAFA_ASSETS.heroCampaign}
                  alt="SAFA Travel Prayer Kit — Your Faith, Wherever You Go"
                  loading="eager"
                  className="w-full h-full object-cover object-center scale-[1.07]"
                />
                <div
                  className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#173F35]/75 to-transparent pointer-events-none"
                  aria-hidden="true"
                />
                <p className="absolute bottom-3.5 left-4 right-4 text-xs text-[#F8F5EE]/95 font-medium tracking-wide">
                  Clear Cylindrical Travel Canister · Non-Slip Mat · Tasbih · 30 ml Hand Wash · Cap
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: INTRODUCTION TO SAFA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <p className="text-xs uppercase tracking-[0.18em] text-[#8B735B] font-medium">
            Your Prayer Companion, Wherever You Go
          </p>
          <h2 className="font-display text-[32px] sm:text-[38px] font-semibold text-[#173F35] leading-tight">
            Prayer Should Travel With You.
          </h2>
          <p className="text-[15px] sm:text-[16px] leading-relaxed text-[#5A5D5A]">
            SAFA brings together essential prayer accessories in convenient travel-friendly kits,
            helping you stay connected to your daily prayers wherever your journey takes you.
          </p>
        </div>
      </section>

      {/* SECTION 4: CHOOSE YOUR COLLECTION — Dual Theme Entry Cards */}
      <section
        id="choose-collection"
        className="border-y py-16 lg:py-20"
        style={{
          backgroundColor: '#E9E0D1',
          borderColor: 'rgba(23, 63, 53, 0.12)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-[#8B735B] font-medium mb-2">
                Dual-Theme Collections
              </p>
              <h2 className="font-display text-[32px] sm:text-[38px] font-semibold text-[#173F35]">
                Choose Your Collection
              </h2>
            </div>
            <p className="text-sm text-[#5A5D5A] max-w-md">
              Each collection opens in its own product-matched palette—Warm Beige &amp; Sand for
              Men, Soft Mauve &amp; Dusty Rose for Women.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
            {/* Men's Collection Card */}
            <article
              className="rounded-2xl overflow-hidden border flex flex-col"
              style={{
                backgroundColor: '#F8F5EE',
                borderColor: 'rgba(139, 115, 91, 0.3)',
              }}
            >
              <div className="aspect-[16/10] w-full overflow-hidden bg-[#D8C4A8]">
                <SafaImage
                  src={SAFA_ASSETS.men.Elite}
                  alt="SAFA Men's Beige Travel Prayer Kit Collection"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-7 sm:p-8 flex flex-col flex-1 justify-between gap-5">
                <div className="space-y-2.5">
                  <p className="text-xs tracking-[0.16em] uppercase font-medium text-[#8B735B]">
                    Warm Beige · Sand · Taupe
                  </p>
                  <h3 className="font-display text-2xl sm:text-[30px] font-semibold text-[#493A2E]">
                    Men&apos;s Collection
                  </h3>
                  <p className="text-[15px] text-[#6E5B49] leading-relaxed">
                    Thoughtfully selected beige and sand prayer essentials with a knitted ivory
                    prayer cap, non-slip mat, 30 ml hand wash, and five tasbih tiers starting at{' '}
                    <span className="font-semibold tabular-nums text-[#493A2E]">Rs. 1,570</span>.
                  </p>
                </div>
                <div>
                  <button
                    type="button"
                    onClick={() => onNavigate('men')}
                    className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white rounded-[7px] cursor-pointer transition-colors hover:opacity-95 min-h-[44px]"
                    style={{ backgroundColor: '#78614A' }}
                  >
                    Explore Men&apos;s Collection
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </article>

            {/* Women's Collection Card */}
            <article
              className="rounded-2xl overflow-hidden border flex flex-col"
              style={{
                backgroundColor: '#FFF9F5',
                borderColor: 'rgba(181, 138, 174, 0.35)',
              }}
            >
              <div className="aspect-[16/10] w-full overflow-hidden bg-[#E8D8E7]">
                <SafaImage
                  src={SAFA_ASSETS.women.Elite}
                  alt="SAFA Women's Soft Mauve Travel Prayer Kit Collection"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-7 sm:p-8 flex flex-col flex-1 justify-between gap-5">
                <div className="space-y-2.5">
                  <p className="text-xs tracking-[0.16em] uppercase font-medium text-[#8C5E85]">
                    Soft Mauve · Dusty Rose · Warm Ivory
                  </p>
                  <h3 className="font-display text-2xl sm:text-[30px] font-semibold text-[#5C4358]">
                    Women&apos;s Collection
                  </h3>
                  <p className="text-[15px] text-[#785B73] leading-relaxed">
                    Graceful dusty-rose and soft-mauve travel prayer kits featuring a colour-matched
                    prayer cap, non-slip mat, 30 ml hand wash, and five tiers starting at{' '}
                    <span className="font-semibold tabular-nums text-[#5C4358]">Rs. 2,870</span>.
                  </p>
                </div>
                <div>
                  <button
                    type="button"
                    onClick={() => onNavigate('women')}
                    className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white rounded-[7px] cursor-pointer transition-colors hover:opacity-95 min-h-[44px]"
                    style={{ backgroundColor: '#8C5E85' }}
                  >
                    Explore Women&apos;s Collection
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* SECTION 5: EXPLORE OUR FIVE PACKAGES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.18em] text-[#8B735B] font-medium">
              Five Signature Tiers
            </p>
            <h2 className="font-display text-[32px] sm:text-[38px] font-semibold text-[#173F35]">
              Explore Our Five Packages
            </h2>
            <p className="text-sm text-[#5A5D5A] max-w-xl">
              Compare Elite, Premium, Digital Plus, Digital, and Classic across both collections.
            </p>
          </div>

          {/* Functional Segmented Collection Switcher */}
          <div
            role="tablist"
            aria-label="Preview collection packages"
            className="inline-flex p-1 rounded-lg border self-start md:self-auto"
            style={{
              backgroundColor: '#E9E0D1',
              borderColor: 'rgba(23, 63, 53, 0.14)',
            }}
          >
            <button
              type="button"
              role="tab"
              aria-selected={previewCategory === 'men'}
              onClick={() => setPreviewCategory('men')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap min-h-[40px] ${
                previewCategory === 'men'
                  ? 'bg-[#78614A] text-white shadow-sm'
                  : 'text-[#493A2E] hover:bg-white/60'
              }`}
            >
              Men&apos;s Beige (5)
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={previewCategory === 'women'}
              onClick={() => setPreviewCategory('women')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap min-h-[40px] ${
                previewCategory === 'women'
                  ? 'bg-[#8C5E85] text-white shadow-sm'
                  : 'text-[#5C4358] hover:bg-white/60'
              }`}
            >
              Women&apos;s Mauve (5)
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-7">
          {tierProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              wishlisted={wishlistIds.includes(product.id)}
              onToggleWishlist={onToggleWishlist}
              onViewDetails={onViewProduct}
              onAddToCart={onAddToCart}
            />
          ))}

          {/* Interactive Package Comparison Quick-Card in 6th Grid Slot */}
          <div
            className="rounded-xl p-6 sm:p-7 flex flex-col justify-between border"
            style={{
              backgroundColor: '#173F35',
              color: '#F8F5EE',
              borderColor: 'rgba(197, 161, 91, 0.35)',
            }}
          >
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.18em] text-[#E5C989]">
                Interactive Configurator
              </p>
              <h3 className="font-display text-2xl font-semibold leading-snug">
                Need help comparing all 10 SAFA variations?
              </h3>
              <p className="text-sm text-[#E9E0D1]/85 leading-relaxed">
                Use our step-by-step Package Selector to switch between Men&apos;s Beige and
                Women&apos;s Mauve, compare tasbih types side by side, and configure your travel
                kit in seconds.
              </p>
              <ul className="space-y-2 pt-2 text-xs text-[#E9E0D1]/90">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#E5C989] shrink-0" aria-hidden="true" />
                  Same double-layered non-slip mat in every tier
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#E5C989] shrink-0" aria-hidden="true" />
                  30 ml mini hand wash &amp; prayer cap included
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#E5C989] shrink-0" aria-hidden="true" />
                  Choose traditional beads, digital counter, or smart ring
                </li>
              </ul>
            </div>

            <button
              type="button"
              onClick={() => onNavigate('shop')}
              className="safa-btn-secondary mt-6 w-full py-3 px-4 text-sm font-semibold text-[#173F35] inline-flex items-center justify-center gap-2 cursor-pointer min-h-[44px]"
            >
              Open Package Selector
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </section>

      {/* SECTION 6: WHY CHOOSE SAFA? */}
      <section
        className="border-y py-16 lg:py-20"
        style={{
          backgroundColor: '#FFFFFF',
          borderColor: 'var(--safa-border)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-12">
            <p className="text-xs uppercase tracking-[0.18em] text-[#8B735B] font-medium mb-2">
              The SAFA Standard
            </p>
            <h2 className="font-display text-[32px] sm:text-[38px] font-semibold text-[#173F35]">
              Why Choose SAFA?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            {WHY_SAFA_POINTS.map((point) => (
              <div key={point.number} className="space-y-2.5">
                <p className="font-display text-2xl text-[#C5A15B] font-semibold tabular-nums">
                  {point.number}
                </p>
                <h3 className="font-sans text-[16px] font-semibold text-[#173F35]">
                  {point.title}
                </h3>
                <p className="text-sm text-[#5A5D5A] leading-relaxed">{point.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 7: PROMOTIONAL BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div
          className="rounded-2xl px-6 sm:px-12 py-12 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 border"
          style={{
            backgroundColor: '#173F35',
            color: '#F8F5EE',
            borderColor: 'rgba(197, 161, 91, 0.35)',
          }}
        >
          <div className="space-y-2 max-w-2xl">
            <p className="font-arabic text-xl text-[#E5C989]" dir="rtl">
              إِنَّ الصَّلَاةَ كَانَتْ عَلَى الْمُؤْمِنِينَ كِتَابًا مَّوْقُوتًا
            </p>
            <h2 className="font-display text-3xl sm:text-[36px] font-semibold">
              Make Every Journey Prayer-Friendly.
            </h2>
            <p className="text-sm sm:text-[15px] text-[#E9E0D1]/85">
              Complimentary nationwide delivery across Pakistan on orders of Rs. 5,000 or more.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('shop')}
            className="safa-btn-secondary px-7 py-3.5 text-[15px] font-semibold text-[#173F35] inline-flex items-center gap-2 cursor-pointer whitespace-nowrap min-h-[46px]"
          >
            Explore SAFA Kits
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </section>

      {/* SECTION 8: CUSTOMER REVIEWS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-[#8B735B] font-medium mb-2">
              Community Feedback
            </p>
            <h2 className="font-display text-[32px] sm:text-[38px] font-semibold text-[#173F35]">
              Customer Reviews
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setReviewFormOpen((prev) => !prev)}
            className="px-4 py-2.5 text-sm font-medium rounded-[7px] border cursor-pointer min-h-[42px] hover:bg-[#E9E0D1]/60 transition-colors"
            style={{
              borderColor: 'var(--safa-border)',
              color: '#173F35',
            }}
          >
            {reviewFormOpen ? 'Cancel Review' : 'Share Your Experience'}
          </button>
        </div>

        {reviewSuccess && (
          <div
            role="status"
            className="mb-6 rounded-lg px-4 py-3 text-sm bg-[#173F35]/10 text-[#173F35] border border-[#173F35]/20"
          >
            {reviewSuccess}
          </div>
        )}

        {reviewFormOpen && (
          <form
            onSubmit={handleReviewSubmit}
            className="mb-10 safa-card rounded-xl p-6 sm:p-7 space-y-4"
          >
            <h3 className="font-display text-xl font-semibold text-[#173F35]">
              Write a Customer Review
            </h3>
            {reviewError && (
              <p role="alert" className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                {reviewError}
              </p>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label htmlFor="rev-name" className="block text-xs font-medium mb-1">
                  Full Name
                </label>
                <input
                  id="rev-name"
                  type="text"
                  required
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="e.g. Bilal Hassan"
                  className="w-full rounded-md border px-3 py-2 text-sm bg-white"
                  style={{ borderColor: 'var(--safa-border)' }}
                />
              </div>
              <div>
                <label htmlFor="rev-city" className="block text-xs font-medium mb-1">
                  City
                </label>
                <input
                  id="rev-city"
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Lahore"
                  className="w-full rounded-md border px-3 py-2 text-sm bg-white"
                  style={{ borderColor: 'var(--safa-border)' }}
                />
              </div>
              <div>
                <label htmlFor="rev-collection" className="block text-xs font-medium mb-1">
                  Collection
                </label>
                <select
                  id="rev-collection"
                  value={reviewCategory}
                  onChange={(e) => setReviewCategory(e.target.value as CollectionCategory)}
                  className="w-full rounded-md border px-3 py-2 text-sm bg-white"
                  style={{ borderColor: 'var(--safa-border)' }}
                >
                  <option value="men">Men&apos;s Beige</option>
                  <option value="women">Women&apos;s Mauve</option>
                </select>
              </div>
              <div>
                <label htmlFor="rev-tier" className="block text-xs font-medium mb-1">
                  Package Tier
                </label>
                <select
                  id="rev-tier"
                  value={reviewTier}
                  onChange={(e) => setReviewTier(e.target.value as PackageTier)}
                  className="w-full rounded-md border px-3 py-2 text-sm bg-white"
                  style={{ borderColor: 'var(--safa-border)' }}
                >
                  {PACKAGE_TIER_ORDER.map((t) => (
                    <option key={t} value={t}>
                      SAFA {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-medium">Rating:</span>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  aria-label={`Rate ${star} out of 5 stars`}
                  className="p-1 cursor-pointer"
                >
                  <Star
                    className={`w-5 h-5 ${
                      star <= rating ? 'fill-[#C5A15B] text-[#C5A15B]' : 'text-stone-300'
                    }`}
                  />
                </button>
              ))}
            </div>

            <div>
              <label htmlFor="rev-comment" className="block text-xs font-medium mb-1">
                Your Review
              </label>
              <textarea
                id="rev-comment"
                rows={3}
                required
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Tell fellow travellers about your SAFA prayer kit..."
                className="w-full rounded-md border px-3 py-2 text-sm bg-white"
                style={{ borderColor: 'var(--safa-border)' }}
              />
            </div>

            <button
              type="submit"
              disabled={submittingReview}
              className="safa-btn-primary px-5 py-2.5 text-sm cursor-pointer disabled:opacity-50"
            >
              {submittingReview ? 'Publishing...' : 'Publish Review'}
            </button>
          </form>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.slice(0, 6).map((review) => (
            <article key={review.id} className="safa-card rounded-xl p-6 flex flex-col justify-between gap-4">
              <div className="space-y-3">
                <div className="flex items-center gap-0.5" aria-label={`${review.rating} out of 5 stars`}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < review.rating ? 'fill-[#C5A15B] text-[#C5A15B]' : 'text-stone-300'
                      }`}
                      aria-hidden="true"
                    />
                  ))}
                </div>
                <p className="text-[14px] leading-relaxed text-[#292B29]">
                  &ldquo;{review.comment}&rdquo;
                </p>
              </div>
              <div className="pt-3 border-t text-xs text-[#5A5D5A]" style={{ borderColor: 'var(--safa-border)' }}>
                <p className="font-semibold text-[#173F35] text-sm">{review.authorName}</p>
                <p>
                  {review.city} · {review.category === 'men' ? "Men's" : "Women's"} SAFA{' '}
                  {review.packageVersion}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
