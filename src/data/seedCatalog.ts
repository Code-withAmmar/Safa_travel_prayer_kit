import type { PackageTier, Product, ReviewRecord } from '../types/safa';

export const SAFA_ASSETS = {
  logo: '/assets/aistudio/WhatsApp_Image_2026-11-23_at_00.39.44_6369e6a2.jpeg',
  heroCampaign: '/assets/aistudio/Safa_20278988.jpeg',
  men: {
    Elite: '/assets/aistudio/SAFA_Elite_-_Men___Rs19979__f56fe3a7.jpeg',
    Premium: '/assets/aistudio/SAFA_Premium_-_Men__Rs_6400__4c5f0001.jpeg',
    'Digital Plus': '/assets/aistudio/SAFA_Digital_Plus_-_-Men__Rs_1570__aa6d0d01.jpeg',
    Digital: '/assets/aistudio/SAFA_Digital_-_Men__Rs_1570__266ff238.jpeg',
    Classic: '/assets/aistudio/SAFA_Classic_-_Men__Rs_1750__e4538d33.jpeg',
  },
  women: {
    Elite: '/assets/aistudio/Safa_Elite_-_-Women__Rs_21890__446d5c5a.jpeg',
    Premium: '/assets/aistudio/Safa_Premium_-_Women__Rs_7400__784e1410.jpeg',
    'Digital Plus': '/assets/aistudio/SAFA_DIgital_Plus_-_Women__Rs_2870__7651ad35.jpeg',
    Digital: '/assets/aistudio/SAFA_Digital_-_Women__Rs_2870__0f962287.jpeg',
    Classic: '/assets/aistudio/SAFA_Classic_-_Women__Rs_3150__96ab3ad9.jpeg',
  },
} as const;

export const PACKAGE_TIER_ORDER: PackageTier[] = [
  'Elite',
  'Premium',
  'Digital Plus',
  'Digital',
  'Classic',
];

export const PAKISTAN_CITIES = [
  'Lahore',
  'Karachi',
  'Islamabad',
  'Rawalpindi',
  'Faisalabad',
  'Multan',
  'Peshawar',
  'Quetta',
  'Sialkot',
  'Gujranwala',
  'Hyderabad',
  'Bahawalpur',
];

export const SEED_PRODUCTS: Product[] = [
  // =========================================================================
  // MEN'S COLLECTION — Warm Beige / Sand / Taupe
  // =========================================================================
  {
    id: 'men-elite',
    slug: 'safa-elite-men',
    name: 'SAFA Elite – Men',
    category: 'men',
    packageVersion: 'Elite',
    price: 19979,
    shortDescription:
      'Double-layered non-slip beige prayer mat, sleek black smart digital ring tasbih with prayer-time vibration, 30 ml mini hand wash & knitted prayer cap.',
    description:
      'Our flagship travel prayer companion in Warm Beige and Sand. Housed in SAFA’s signature clear cylindrical travel canister with a brushed champagne-beige metallic lid, SAFA Elite pairs a structured double-layered non-slip prayer mat with a sleek all-day smart digital ring tasbih featuring quiet prayer-time vibration alerts.',
    image: SAFA_ASSETS.men.Elite,
    gallery: [SAFA_ASSETS.men.Elite, SAFA_ASSETS.heroCampaign],
    tasbihSummary: 'Smart Digital Ring Tasbih (Prayer-time vibration, all-day wear)',
    accessories: [
      {
        name: 'Double-Layered Non-Slip Prayer Mat',
        detail:
          'Made from double-layered polyester fabric in warm sand-taupe, with two layers stitched together for added structure and underside silicone grip dots to prevent slipping.',
      },
      {
        name: 'Digital Ring Tasbih Counter',
        detail:
          'Sleek black smart ring built for all-day wear with an OLED counter display, quiet prayer-time vibration alerts, and an ergonomic modern profile.',
      },
      {
        name: 'Mini Hand Wash (30 ml)',
        detail:
          'Compact beige travel hand wash bottle for effortless freshness and hygiene on flights, road trips, and daily commutes.',
      },
      {
        name: 'Knitted Prayer Cap',
        detail:
          'Breathable cream-ivory knitted namaz cap folded neatly inside the canister.',
      },
    ],
    specifications: [
      { label: 'Collection', value: "Men's Beige Collection" },
      { label: 'Package Tier', value: 'SAFA Elite' },
      { label: 'Mat Material', value: 'Double-layered polyester with silicone grip dots' },
      { label: 'Tasbih Type', value: 'All-Day Digital Smart Ring with Prayer-Time Vibration' },
      { label: 'Hand Wash Volume', value: '30 ml leak-resistant travel bottle' },
      { label: 'Packaging', value: 'Clear cylindrical travel canister with metallic lid & gold sleeve' },
    ],
    stock: 14,
    available: true,
    featured: true,
  },
  {
    id: 'men-premium',
    slug: 'safa-premium-men',
    name: 'SAFA Premium – Men',
    category: 'men',
    packageVersion: 'Premium',
    price: 6400,
    shortDescription:
      'Double-layered non-slip beige prayer mat, iQibla Smart Tasbih Tally Counter (black & gold Bluetooth ring), 30 ml mini hand wash & knitted prayer cap.',
    description:
      'Crafted for professionals and frequent travellers who value connected spiritual habits. SAFA Premium combines our signature sand-taupe double-layered prayer mat with the Bluetooth-compatible iQibla Smart Tasbih Tally Counter in black and champagne gold.',
    image: SAFA_ASSETS.men.Premium,
    gallery: [SAFA_ASSETS.men.Premium, SAFA_ASSETS.heroCampaign],
    tasbihSummary: 'iQibla Smart Tasbih Tally Counter (Bluetooth ring, milestone vibration)',
    accessories: [
      {
        name: 'Double-Layered Non-Slip Prayer Mat',
        detail:
          'Two stitched polyester layers in refined sand-taupe with underside silicone grip dots to hold steadily on marble, tile, or carpet.',
      },
      {
        name: 'iQibla Smart Tasbih Tally Counter',
        detail:
          'Bluetooth-compatible black and gold smart ring that tracks daily Zikr, vibrates at key milestones (33/66/99), displays prayer times, and offers long battery life.',
      },
      {
        name: 'Mini Hand Wash (30 ml)',
        detail: 'Compact matte beige 30 ml travel hand wash bottle for convenient hygiene anywhere.',
      },
      {
        name: 'Knitted Prayer Cap',
        detail: 'Soft, breathable ivory knitted prayer cap sized for everyday comfort.',
      },
    ],
    specifications: [
      { label: 'Collection', value: "Men's Beige Collection" },
      { label: 'Package Tier', value: 'SAFA Premium' },
      { label: 'Mat Material', value: 'Double-layered polyester with silicone grip dots' },
      { label: 'Tasbih Type', value: 'iQibla Bluetooth Smart Ring (Black & Gold)' },
      { label: 'Hand Wash Volume', value: '30 ml leak-resistant travel bottle' },
      { label: 'Packaging', value: 'Clear cylindrical travel canister with metallic lid & gold sleeve' },
    ],
    stock: 22,
    available: true,
    featured: true,
  },
  {
    id: 'men-digital-plus',
    slug: 'safa-digital-plus-men',
    name: 'SAFA Digital Plus – Men',
    category: 'men',
    packageVersion: 'Digital Plus',
    price: 1570,
    shortDescription:
      'Double-layered non-slip beige prayer mat, contoured sand-beige electronic digital tasbih counter, 30 ml mini hand wash & knitted prayer cap.',
    description:
      'Practical, organized, and lightweight for everyday carry. SAFA Digital Plus brings together our sand-beige travel prayer mat, an ergonomic ring-strap electronic digital tasbih counter, a 30 ml mini hand wash, and a knitted namaz cap in one tidy travel canister.',
    image: SAFA_ASSETS.men['Digital Plus'],
    gallery: [SAFA_ASSETS.men['Digital Plus'], SAFA_ASSETS.heroCampaign],
    tasbihSummary: 'Electronic Finger Digital Tasbih Counter (Contoured beige edition)',
    accessories: [
      {
        name: 'Double-Layered Non-Slip Prayer Mat',
        detail:
          'Stitched double-layered polyester mat with silicone grip dots on the underside for reliable stability during travel prayers.',
      },
      {
        name: 'Digital Tasbih Counter',
        detail:
          'Convenient sand-beige electronic finger counter with clear LCD readout and one-press reset to keep track of dhikr.',
      },
      {
        name: 'Mini Hand Wash (30 ml)',
        detail: 'Travel-sized 30 ml beige hand wash for freshening up before prayer.',
      },
      {
        name: 'Knitted Prayer Cap',
        detail: 'Comfortable cream knitted prayer cap included inside the canister.',
      },
    ],
    specifications: [
      { label: 'Collection', value: "Men's Beige Collection" },
      { label: 'Package Tier', value: 'SAFA Digital Plus' },
      { label: 'Mat Material', value: 'Double-layered polyester with silicone grip dots' },
      { label: 'Tasbih Type', value: 'Electronic Digital Finger Counter (Beige)' },
      { label: 'Hand Wash Volume', value: '30 ml leak-resistant travel bottle' },
      { label: 'Packaging', value: 'Clear cylindrical travel canister with metallic lid & gold sleeve' },
    ],
    stock: 36,
    available: true,
    featured: false,
  },
  {
    id: 'men-digital',
    slug: 'safa-digital-men',
    name: 'SAFA Digital – Men',
    category: 'men',
    packageVersion: 'Digital',
    price: 1570,
    shortDescription:
      'Double-layered non-slip beige prayer mat, beige electronic digital tasbih counter, 30 ml mini hand wash & knitted prayer cap.',
    description:
      'Designed for effortless daily prayers at the office, university, or on the road. SAFA Digital pairs our structured non-slip beige travel prayer mat with a colour-matched digital tasbih counter, compact hand wash, and knitted prayer cap.',
    image: SAFA_ASSETS.men.Digital,
    gallery: [SAFA_ASSETS.men.Digital, SAFA_ASSETS.heroCampaign],
    tasbihSummary: 'Electronic Digital Tasbih Counter (Warm beige finish)',
    accessories: [
      {
        name: 'Double-Layered Non-Slip Prayer Mat',
        detail:
          'Structured double-layered polyester fabric in warm beige with underside silicone grip dots to keep the mat firmly in place.',
      },
      {
        name: 'Digital Tasbih Counter',
        detail:
          'Compact warm-beige electronic counter with tactile count button and crisp digital screen for daily dhikr.',
      },
      {
        name: 'Mini Hand Wash (30 ml)',
        detail: '30 ml compact beige hand wash bottle for clean hands while travelling.',
      },
      {
        name: 'Knitted Prayer Cap',
        detail: 'Soft ivory knitted prayer cap that rolls neatly inside the travel container.',
      },
    ],
    specifications: [
      { label: 'Collection', value: "Men's Beige Collection" },
      { label: 'Package Tier', value: 'SAFA Digital' },
      { label: 'Mat Material', value: 'Double-layered polyester with silicone grip dots' },
      { label: 'Tasbih Type', value: 'Electronic Digital Counter (Warm Beige)' },
      { label: 'Hand Wash Volume', value: '30 ml leak-resistant travel bottle' },
      { label: 'Packaging', value: 'Clear cylindrical travel canister with metallic lid & gold sleeve' },
    ],
    stock: 40,
    available: true,
    featured: false,
  },
  {
    id: 'men-classic',
    slug: 'safa-classic-men',
    name: 'SAFA Classic – Men',
    category: 'men',
    packageVersion: 'Classic',
    price: 1750,
    shortDescription:
      'Double-layered non-slip beige prayer mat, traditional sand-beaded tasbeeh with tassel, 30 ml mini hand wash & knitted prayer cap.',
    description:
      'Timeless simplicity inspired by tradition. SAFA Classic pairs our warm beige non-slip travel prayer mat with a smooth wooden-finish sand-beaded tasbeeh with matching tassel, alongside our 30 ml mini hand wash and knitted prayer cap.',
    image: SAFA_ASSETS.men.Classic,
    gallery: [SAFA_ASSETS.men.Classic, SAFA_ASSETS.heroCampaign],
    tasbihSummary: 'Traditional Sand-Beaded Tasbeeh with Tassel',
    accessories: [
      {
        name: 'Double-Layered Non-Slip Prayer Mat',
        detail:
          'Double-layered sand-taupe polyester fabric with stitched edges and non-slip underside silicone grip dots.',
      },
      {
        name: 'Traditional Beaded Tasbeeh',
        detail:
          'Smooth sand-toned wooden-finish beaded tasbeeh with matching woven tassel for unhurried, tactile dhikr.',
      },
      {
        name: 'Mini Hand Wash (30 ml)',
        detail: 'Compact 30 ml travel hand wash bottle in matte beige.',
      },
      {
        name: 'Knitted Prayer Cap',
        detail: 'Comfortable breathable ivory knitted prayer cap.',
      },
    ],
    specifications: [
      { label: 'Collection', value: "Men's Beige Collection" },
      { label: 'Package Tier', value: 'SAFA Classic' },
      { label: 'Mat Material', value: 'Double-layered polyester with silicone grip dots' },
      { label: 'Tasbih Type', value: 'Traditional Sand-Beaded Tasbeeh with Tassel' },
      { label: 'Hand Wash Volume', value: '30 ml leak-resistant travel bottle' },
      { label: 'Packaging', value: 'Clear cylindrical travel canister with metallic lid & gold sleeve' },
    ],
    stock: 28,
    available: true,
    featured: true,
  },

  // =========================================================================
  // WOMEN'S COLLECTION — Soft Mauve / Dusty Rose
  // =========================================================================
  {
    id: 'women-elite',
    slug: 'safa-elite-women',
    name: 'SAFA Elite – Women',
    category: 'women',
    packageVersion: 'Elite',
    price: 21890,
    shortDescription:
      'Double-layered non-slip mauve prayer mat, sleek black smart digital ring tasbih (prayer-time vibration), 30 ml mini hand wash & matching prayer cap.',
    description:
      'Our most refined travel prayer companion in Soft Mauve and Dusty Rose. Presented in SAFA’s clear cylindrical canister with a rose-mauve metallic lid, SAFA Elite pairs a structured non-slip mauve prayer mat with an all-day sleek digital smart ring tasbih featuring gentle prayer-time vibration reminders.',
    image: SAFA_ASSETS.women.Elite,
    gallery: [SAFA_ASSETS.women.Elite, SAFA_ASSETS.women.Premium],
    tasbihSummary: 'Smart Digital Ring Tasbih (All-day wear, prayer-time vibration)',
    accessories: [
      {
        name: 'Double-Layered Non-Slip Prayer Mat',
        detail:
          'Crafted from double-layered polyester fabric in dusty rose-mauve with stitched edges and underside silicone grip dots that keep the mat anchored.',
      },
      {
        name: 'Digital Ring Tasbih Counter',
        detail:
          'Modern sleek black smart ring designed for all-day wear with crisp digital counter display and gentle prayer-time vibration alerts.',
      },
      {
        name: 'Mini Hand Wash (30 ml)',
        detail: 'Compact soft-mauve 30 ml travel hand wash bottle for effortless cleanliness on the move.',
      },
      {
        name: 'Matching Mauve Prayer Cap',
        detail: 'Soft, comfortable colour-matched dusty rose prayer cap with gentle elastic fit.',
      },
    ],
    specifications: [
      { label: 'Collection', value: "Women's Mauve Collection" },
      { label: 'Package Tier', value: 'SAFA Elite' },
      { label: 'Mat Material', value: 'Double-layered polyester with silicone grip dots' },
      { label: 'Tasbih Type', value: 'All-Day Digital Smart Ring with Prayer-Time Vibration' },
      { label: 'Hand Wash Volume', value: '30 ml leak-resistant travel bottle' },
      { label: 'Packaging', value: 'Clear cylindrical travel canister with rose-mauve metallic lid' },
    ],
    stock: 12,
    available: true,
    featured: true,
  },
  {
    id: 'women-premium',
    slug: 'safa-premium-women',
    name: 'SAFA Premium – Women',
    category: 'women',
    packageVersion: 'Premium',
    price: 7400,
    shortDescription:
      'Double-layered non-slip mauve prayer mat, iQibla Smart Tasbih Tally Counter (black & gold Bluetooth ring), 30 ml mini hand wash & matching prayer cap.',
    description:
      'Graceful styling meets connected convenience. SAFA Premium in Soft Mauve includes our structured double-layered non-slip prayer mat, the Bluetooth-compatible iQibla Smart Tasbih Tally Counter in black and gold, a 30 ml mauve mini hand wash, and a matching prayer cap.',
    image: SAFA_ASSETS.women.Premium,
    gallery: [SAFA_ASSETS.women.Premium, SAFA_ASSETS.women.Elite],
    tasbihSummary: 'iQibla Smart Tasbih Tally Counter (Bluetooth ring, prayer times)',
    accessories: [
      {
        name: 'Double-Layered Non-Slip Prayer Mat',
        detail:
          'Two stitched layers of soft-mauve polyester fabric with underside silicone grip dots for stable footing during prayer.',
      },
      {
        name: 'iQibla Smart Tasbih Tally Counter',
        detail:
          'Bluetooth-compatible black and champagne-gold smart ring that counts Zikr, vibrates at milestones, displays prayer times, and delivers long battery life.',
      },
      {
        name: 'Mini Hand Wash (30 ml)',
        detail: 'Compact dusty-rose 30 ml hand wash bottle for travel convenience.',
      },
      {
        name: 'Matching Mauve Prayer Cap',
        detail: 'Comfortable colour-coordinated dusty-rose prayer cap included in the canister.',
      },
    ],
    specifications: [
      { label: 'Collection', value: "Women's Mauve Collection" },
      { label: 'Package Tier', value: 'SAFA Premium' },
      { label: 'Mat Material', value: 'Double-layered polyester with silicone grip dots' },
      { label: 'Tasbih Type', value: 'iQibla Bluetooth Smart Ring (Black & Gold)' },
      { label: 'Hand Wash Volume', value: '30 ml leak-resistant travel bottle' },
      { label: 'Packaging', value: 'Clear cylindrical travel canister with rose-mauve metallic lid' },
    ],
    stock: 18,
    available: true,
    featured: true,
  },
  {
    id: 'women-digital-plus',
    slug: 'safa-digital-plus-women',
    name: 'SAFA Digital Plus – Women',
    category: 'women',
    packageVersion: 'Digital Plus',
    price: 2870,
    shortDescription:
      'Double-layered non-slip mauve prayer mat, dark brown electronic digital tasbih counter, 30 ml mini hand wash & matching prayer cap.',
    description:
      'Thoughtfully curated for daily outings, campus days, and weekend travel. SAFA Digital Plus pairs our soft-mauve non-slip prayer mat with a rich espresso-brown electronic finger counter, a 30 ml mauve hand wash, and a matching prayer cap.',
    image: SAFA_ASSETS.women['Digital Plus'],
    gallery: [SAFA_ASSETS.women['Digital Plus'], SAFA_ASSETS.women.Digital],
    tasbihSummary: 'Electronic Finger Digital Tasbih Counter (Dark brown finish)',
    accessories: [
      {
        name: 'Double-Layered Non-Slip Prayer Mat',
        detail:
          'Structured double-layered mauve polyester fabric with underside silicone grip dots to prevent slipping.',
      },
      {
        name: 'Digital Tasbih Counter',
        detail:
          'Rich dark-brown electronic finger counter with responsive count button and clear digital readout.',
      },
      {
        name: 'Mini Hand Wash (30 ml)',
        detail: 'Compact 30 ml mauve travel hand wash for clean hands anywhere.',
      },
      {
        name: 'Matching Mauve Prayer Cap',
        detail: 'Soft, easy-to-wear matching dusty-rose prayer cap.',
      },
    ],
    specifications: [
      { label: 'Collection', value: "Women's Mauve Collection" },
      { label: 'Package Tier', value: 'SAFA Digital Plus' },
      { label: 'Mat Material', value: 'Double-layered polyester with silicone grip dots' },
      { label: 'Tasbih Type', value: 'Electronic Digital Finger Counter (Dark Brown)' },
      { label: 'Hand Wash Volume', value: '30 ml leak-resistant travel bottle' },
      { label: 'Packaging', value: 'Clear cylindrical travel canister with rose-mauve metallic lid' },
    ],
    stock: 30,
    available: true,
    featured: false,
  },
  {
    id: 'women-digital',
    slug: 'safa-digital-women',
    name: 'SAFA Digital – Women',
    category: 'women',
    packageVersion: 'Digital',
    price: 2870,
    shortDescription:
      'Double-layered non-slip mauve prayer mat, colour-matched mauve electronic digital tasbih counter, 30 ml mini hand wash & matching prayer cap.',
    description:
      'Monochromatic elegance in Dusty Rose and Soft Mauve. SAFA Digital matches every accessory — including the electronic digital tasbih counter, 30 ml hand wash, prayer cap, and double-layered non-slip mat — inside one sleek travel cylinder.',
    image: SAFA_ASSETS.women.Digital,
    gallery: [SAFA_ASSETS.women.Digital, SAFA_ASSETS.women['Digital Plus']],
    tasbihSummary: 'Electronic Digital Tasbih Counter (Colour-matched mauve)',
    accessories: [
      {
        name: 'Double-Layered Non-Slip Prayer Mat',
        detail:
          'Double-layered dusty-rose polyester prayer mat with non-slip silicone grip dots on the reverse.',
      },
      {
        name: 'Digital Tasbih Counter',
        detail:
          'Colour-matched mauve electronic finger counter for effortless dhikr on the go.',
      },
      {
        name: 'Mini Hand Wash (30 ml)',
        detail: 'Compact 30 ml mauve travel hand wash bottle.',
      },
      {
        name: 'Matching Mauve Prayer Cap',
        detail: 'Soft, comfortable colour-matched dusty-rose prayer cap.',
      },
    ],
    specifications: [
      { label: 'Collection', value: "Women's Mauve Collection" },
      { label: 'Package Tier', value: 'SAFA Digital' },
      { label: 'Mat Material', value: 'Double-layered polyester with silicone grip dots' },
      { label: 'Tasbih Type', value: 'Electronic Digital Counter (Soft Mauve)' },
      { label: 'Hand Wash Volume', value: '30 ml leak-resistant travel bottle' },
      { label: 'Packaging', value: 'Clear cylindrical travel canister with rose-mauve metallic lid' },
    ],
    stock: 34,
    available: true,
    featured: false,
  },
  {
    id: 'women-classic',
    slug: 'safa-classic-women',
    name: 'SAFA Classic – Women',
    category: 'women',
    packageVersion: 'Classic',
    price: 3150,
    shortDescription:
      'Double-layered non-slip mauve prayer mat, traditional rose-pearl beaded tasbeeh with tassel, 30 ml mini hand wash & matching prayer cap.',
    description:
      'A serene, heirloom-inspired travel kit crafted for gifting and daily journeys alike. SAFA Classic in Soft Mauve pairs our structured non-slip prayer mat with a smooth dusty-rose pearl-finish beaded tasbeeh, 30 ml hand wash, and matching prayer cap.',
    image: SAFA_ASSETS.women.Classic,
    gallery: [SAFA_ASSETS.women.Classic, SAFA_ASSETS.women.Digital],
    tasbihSummary: 'Traditional Rose-Pearl Beaded Tasbeeh with Tassel',
    accessories: [
      {
        name: 'Double-Layered Non-Slip Prayer Mat',
        detail:
          'Double-layered dusty-rose polyester fabric with refined mihrab stitching and underside silicone grip dots.',
      },
      {
        name: 'Traditional Beaded Tasbeeh',
        detail:
          'Dusty-rose pearl-finish beaded tasbeeh with matching tassel for traditional, mindful dhikr.',
      },
      {
        name: 'Mini Hand Wash (30 ml)',
        detail: 'Compact 30 ml soft-mauve hand wash for convenient hygiene on every trip.',
      },
      {
        name: 'Matching Mauve Prayer Cap',
        detail: 'Colour-matched mauve prayer cap tucked neatly into the travel canister.',
      },
    ],
    specifications: [
      { label: 'Collection', value: "Women's Mauve Collection" },
      { label: 'Package Tier', value: 'SAFA Classic' },
      { label: 'Mat Material', value: 'Double-layered polyester with silicone grip dots' },
      { label: 'Tasbih Type', value: 'Traditional Rose-Pearl Beaded Tasbeeh with Tassel' },
      { label: 'Hand Wash Volume', value: '30 ml leak-resistant travel bottle' },
      { label: 'Packaging', value: 'Clear cylindrical travel canister with rose-mauve metallic lid' },
    ],
    stock: 26,
    available: true,
    featured: true,
  },
];

export const SEED_REVIEWS: ReviewRecord[] = [
  {
    id: 'rev-1',
    authorName: 'Ayesha Siddiqui',
    city: 'Lahore',
    category: 'women',
    packageVersion: 'Premium',
    rating: 5,
    comment:
      'Ordered the Women’s Premium Mauve kit before my flight to Dubai. The canister fits neatly in my cabin tote, the mat grips airport marble without sliding, and the iQibla ring reminds me at every prayer time.',
    createdAt: '2026-10-18T09:15:00.000Z',
  },
  {
    id: 'rev-2',
    authorName: 'Hamza Tariq',
    city: 'Islamabad',
    category: 'men',
    packageVersion: 'Classic',
    rating: 5,
    comment:
      'Keep the Men’s Classic beige kit in my car every day. Having the non-slip mat, knitted cap, beaded tasbeeh, and mini hand wash in one clean cylinder makes stopping for Asr and Maghrib effortless.',
    createdAt: '2026-10-29T14:40:00.000Z',
  },
  {
    id: 'rev-3',
    authorName: 'Zainab Farooq',
    city: 'Karachi',
    category: 'women',
    packageVersion: 'Classic',
    rating: 5,
    comment:
      'Gifted a matching Men’s and Women’s set to my parents for Umrah. The packaging looks genuinely luxurious right out of the box—no extra gift wrapping needed.',
    createdAt: '2026-11-08T11:20:00.000Z',
  },
];
