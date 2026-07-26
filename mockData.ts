import { Product, Review, User, ProductQA, AdminReport, UserBadge } from '../types';

export const CATEGORIES = [
  { id: 'all', name: 'All Categories', type: 'both', icon: 'Grid' },
  // Products
  { id: 'phones', name: 'Phones', type: 'product', icon: 'Smartphone' },
  { id: 'laptops', name: 'Laptops', type: 'product', icon: 'Laptop' },
  { id: 'electronics', name: 'Electronics', type: 'product', icon: 'Tv' },
  { id: 'gaming', name: 'Gaming', type: 'product', icon: 'Gamepad2' },
  { id: 'fashion', name: 'Fashion', type: 'product', icon: 'Shirt' },
  { id: 'food', name: 'Food & Groceries', type: 'product', icon: 'Utensils' },
  { id: 'health', name: 'Health & Wellness', type: 'product', icon: 'HeartPulse' },
  { id: 'beauty', name: 'Beauty & Skincare', type: 'product', icon: 'Sparkles' },
  { id: 'home', name: 'Home & Kitchen', type: 'product', icon: 'Home' },
  { id: 'cars', name: 'Cars & Automotive', type: 'product', icon: 'Car' },
  { id: 'software', name: 'Software & Tools', type: 'product', icon: 'Code' },
  { id: 'apps', name: 'Mobile Apps', type: 'product', icon: 'AppWindow' },

  // Services
  { id: 'internet', name: 'Internet Providers', type: 'service', icon: 'Wifi' },
  { id: 'banks', name: 'Banks & Fintech', type: 'service', icon: 'Landmark' },
  { id: 'mobile_money', name: 'Mobile Money', type: 'service', icon: 'Wallet' },
  { id: 'telecom', name: 'Telecom & Carriers', type: 'service', icon: 'Radio' },
  { id: 'airlines', name: 'Airlines & Flights', type: 'service', icon: 'Plane' },
  { id: 'hotels', name: 'Hotels & Lodging', type: 'service', icon: 'Hotel' },
  { id: 'restaurants', name: 'Restaurants & Dining', type: 'service', icon: 'Coffee' },
  { id: 'streaming', name: 'Streaming Services', type: 'service', icon: 'Film' },
  { id: 'insurance', name: 'Insurance', type: 'service', icon: 'ShieldCheck' },
  { id: 'education', name: 'Education & Courses', type: 'service', icon: 'GraduationCap' },
  { id: 'healthcare', name: 'Healthcare & Clinics', type: 'service', icon: 'Stethoscope' },
  { id: 'home_services', name: 'Home Services', type: 'service', icon: 'Wrench' }
];

export const MOCK_BADGES: Record<string, UserBadge> = {
  topReviewer: {
    id: 'top_reviewer',
    name: 'Top Reviewer',
    icon: 'Award',
    description: 'Awarded for writing over 25 verified high-impact reviews',
    color: 'bg-amber-500 text-white'
  },
  verifiedBuyer: {
    id: 'verified_buyer',
    name: 'Verified Buyer',
    icon: 'CheckCircle2',
    description: 'Proved ownership of products reviewed',
    color: 'bg-emerald-500 text-white'
  },
  techGuru: {
    id: 'tech_guru',
    name: 'Tech Specialist',
    icon: 'Cpu',
    description: 'Expert reviewer in Smartphones and Hardware',
    color: 'bg-blue-600 text-white'
  },
  communityLeader: {
    id: 'community_leader',
    name: 'Trust Ambassador',
    icon: 'ShieldCheck',
    description: 'Received 100+ helpful community votes',
    color: 'bg-purple-600 text-white'
  }
};

export const MOCK_USERS: User[] = [
  {
    id: 'usr_alex',
    username: 'AlexChen_Tech',
    email: 'alex.chen@example.com',
    photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
    bio: 'Mobile hardware enthusiast, audio engineer, and long-term gadget reviewer based in San Francisco.',
    joinedDate: 'January 2024',
    reviewCount: 38,
    helpfulVotesReceived: 412,
    badges: [MOCK_BADGES.topReviewer, MOCK_BADGES.techGuru, MOCK_BADGES.communityLeader],
    followersCount: 1240,
    followingCount: 185,
    level: 'Level 5 Master Reviewer',
    role: 'user'
  },
  {
    id: 'usr_sara',
    username: 'SaraGlobalTravels',
    email: 'sara.k@example.com',
    photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=250',
    bio: 'Digital nomad exploring fintech services, international airlines, and high-speed satellite internet.',
    joinedDate: 'March 2024',
    reviewCount: 22,
    helpfulVotesReceived: 189,
    badges: [MOCK_BADGES.verifiedBuyer, MOCK_BADGES.topReviewer],
    followersCount: 620,
    followingCount: 94,
    level: 'Level 3 Pro Reviewer',
    role: 'user'
  },
  {
    id: 'usr_admin',
    username: 'Taddla_Admin',
    email: 'admin@taddla.com',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250',
    bio: 'Official Taddla Moderation & Authenticity Lead.',
    joinedDate: 'November 2023',
    reviewCount: 15,
    helpfulVotesReceived: 890,
    badges: [MOCK_BADGES.communityLeader],
    followersCount: 3200,
    followingCount: 12,
    level: 'System Administrator',
    role: 'admin'
  }
];

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'prod_1',
    name: 'Apple iPhone 16 Pro Max',
    itemType: 'product',
    brand: 'Apple',
    category: 'phones',
    description: 'Titanium design with A18 Pro chip, 48MP Fusion camera system, and revolutionary Camera Control button.',
    imageUrl: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&q=80&w=800',
    gallery: [
      'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&q=80&w=800'
    ],
    avgRating: 4.7,
    totalReviews: 128,
    ratingBreakdown: { 5: 92, 4: 24, 3: 8, 2: 3, 1: 1 },
    aiSummary: 'Users universally praise the exceptional battery efficiency, titanium build, and pro video capabilities, though some note the Camera Control button has a minor learning curve.',
    pros: ['Superb battery life lasting 1.5+ days', 'Sleek desert titanium finish', 'Unmatched ProRes video recording', 'Snappy 120Hz ProMotion display'],
    cons: ['Heavy price point', 'Camera Control button accidentally triggers in pocket', 'Slow baseline wired charging speed'],
    whereToBuy: [
      { storeName: 'Apple Store', price: '$1,199.00', url: 'https://apple.com', inStock: true },
      { storeName: 'Amazon', price: '$1,149.00', url: 'https://amazon.com', inStock: true },
      { storeName: 'Best Buy', price: '$1,199.00', url: 'https://bestbuy.com', inStock: true }
    ],
    createdDate: '2024-09-20',
    featured: true,
    trending: true,
    reviewQualityScore: 94,
    verifiedPurchaseScore: 91,
    communityTrustScore: 96,
    reviewAuthenticityScore: 95
  },
  {
    id: 'prod_2',
    name: 'Starlink High-Performance Internet',
    itemType: 'service',
    brand: 'SpaceX Starlink',
    category: 'internet',
    description: 'Global low-Earth orbit satellite internet offering high-speed, low-latency connectivity even in remote off-grid locations.',
    imageUrl: 'https://images.unsplash.com/photo-1516849841032-87cbac4d88f7?auto=format&fit=crop&q=80&w=800',
    gallery: [
      'https://images.unsplash.com/photo-1516849841032-87cbac4d88f7?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?auto=format&fit=crop&q=80&w=800'
    ],
    avgRating: 4.5,
    totalReviews: 86,
    ratingBreakdown: { 5: 58, 4: 18, 3: 6, 2: 3, 1: 1 },
    aiSummary: 'A game changer for rural communities and travelers. Download speeds average 150-220Mbps with low latency, though heavy rainstorms can temporarily degrade throughput.',
    pros: ['Works literally anywhere with clear sky view', 'Easy 15-minute self-installation dish kit', 'Speeds rival urban cable internet'],
    cons: ['Equipment hardware cost ($599 upfront)', 'Performance drops during heavy thunderstorms', 'Power hungry during snow melt heating'],
    whereToBuy: [
      { storeName: 'Starlink Official', price: '$120.00/mo', url: 'https://starlink.com', inStock: true }
    ],
    createdDate: '2024-02-10',
    featured: true,
    trending: true,
    reviewQualityScore: 92,
    verifiedPurchaseScore: 95,
    communityTrustScore: 94,
    reviewAuthenticityScore: 93
  },
  {
    id: 'prod_3',
    name: 'Revolut Premium Banking',
    itemType: 'service',
    brand: 'Revolut',
    category: 'banks',
    description: 'Global digital banking app offering multi-currency exchange, fee-free international spending, investment tools, and disposable virtual cards.',
    imageUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&q=80&w=800',
    gallery: [
      'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&q=80&w=800'
    ],
    avgRating: 4.6,
    totalReviews: 210,
    ratingBreakdown: { 5: 140, 4: 50, 3: 12, 2: 5, 1: 3 },
    aiSummary: 'Essential for international travelers and freelancers. Instant currency exchange at interbank rates and metal security cards receive overwhelming praise.',
    pros: ['Zero markup on interbank currency exchange', 'Instant disposable cards prevent subscription fraud', 'Slick mobile user interface'],
    cons: ['Weekend exchange fees (1%) apply', 'Automated security checks can lock accounts during large transfers'],
    whereToBuy: [
      { storeName: 'Revolut App Store', price: 'Free - $9.99/mo', url: 'https://revolut.com', inStock: true }
    ],
    createdDate: '2024-01-15',
    featured: false,
    trending: true,
    reviewQualityScore: 89,
    verifiedPurchaseScore: 88,
    communityTrustScore: 92,
    reviewAuthenticityScore: 91
  },
  {
    id: 'prod_4',
    name: 'Sony WH-1000XM5 Wireless Headphones',
    itemType: 'product',
    brand: 'Sony',
    category: 'electronics',
    description: 'Industry-leading noise canceling wireless headphones with two processors, 8 microphones, and crystal-clear hands-free calling.',
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800',
    gallery: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&q=80&w=800'
    ],
    avgRating: 4.8,
    totalReviews: 340,
    ratingBreakdown: { 5: 270, 4: 50, 3: 12, 2: 5, 1: 3 },
    aiSummary: 'Widely considered the gold standard for travel noise cancellation and voice call clarity. The new lightweight headband is comfy, though it no longer folds into a small ball like XM4.',
    pros: ['Best-in-class Active Noise Cancellation', 'Lightweight ergonomic headband', '30+ hour battery life with fast USB-C charge'],
    cons: ['Does not fold compactly', 'Touch controls can be overly sensitive'],
    whereToBuy: [
      { storeName: 'Sony Store', price: '$399.99', url: 'https://sony.com', inStock: true },
      { storeName: 'Amazon', price: '$348.00', url: 'https://amazon.com', inStock: true }
    ],
    createdDate: '2023-11-05',
    featured: true,
    trending: false,
    reviewQualityScore: 96,
    verifiedPurchaseScore: 94,
    communityTrustScore: 97,
    reviewAuthenticityScore: 96
  },
  {
    id: 'prod_5',
    name: 'Emirates A380 Business Class',
    itemType: 'service',
    brand: 'Emirates',
    category: 'airlines',
    description: 'Luxury long-haul air travel with lie-flat seating, onboard lounge bar, gourmet dining, and ICE award-winning inflight entertainment.',
    imageUrl: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&q=80&w=800',
    gallery: [
      'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&q=80&w=800'
    ],
    avgRating: 4.9,
    totalReviews: 95,
    ratingBreakdown: { 5: 88, 4: 5, 3: 1, 2: 1, 1: 0 },
    aiSummary: 'Consistently rated as one of the finest business class experiences in civil aviation. The upper-deck horseshoe bar lounge and chauffeur service receive top marks.',
    pros: ['Inflight upper deck bar lounge', 'Complimentary chauffeur transfers in 70+ cities', 'Huge 23-inch ICE entertainment screen'],
    cons: ['Older 2-2-2 configuration on select 777 aircraft', 'Premium fare cost'],
    whereToBuy: [
      { storeName: 'Emirates Direct', price: 'Varies by route', url: 'https://emirates.com', inStock: true }
    ],
    createdDate: '2023-08-12',
    featured: true,
    trending: false,
    reviewQualityScore: 97,
    verifiedPurchaseScore: 96,
    communityTrustScore: 98,
    reviewAuthenticityScore: 98
  },
  {
    id: 'prod_6',
    name: 'M-Pesa Mobile Financial Service',
    itemType: 'service',
    brand: 'Safaricom M-Pesa',
    category: 'mobile_money',
    description: 'Pioneering mobile wallet platform empowering millions with instant peer-to-peer transfers, merchant payments, and micro-loans without a traditional bank account.',
    imageUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&q=80&w=800',
    gallery: [
      'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&q=80&w=800'
    ],
    avgRating: 4.7,
    totalReviews: 154,
    ratingBreakdown: { 5: 115, 4: 28, 3: 7, 2: 3, 1: 1 },
    aiSummary: 'Critical financial utility across East Africa and beyond. Instant QR and USSD code payment reliability is unmatched, though transaction fee tiers can add up.',
    pros: ['Works offline via USSD on feature phones', 'Accepted by 99% of local merchants', 'Instant micro-settlements'],
    cons: ['Transaction fees on larger withdrawal amounts', 'PIN re-entry safety requires vigilance against phishing'],
    whereToBuy: [
      { storeName: 'Safaricom App Store', price: 'Pay per transaction', url: 'https://safaricom.co.ke', inStock: true }
    ],
    createdDate: '2024-03-01',
    featured: false,
    trending: true,
    reviewQualityScore: 91,
    verifiedPurchaseScore: 90,
    communityTrustScore: 93,
    reviewAuthenticityScore: 92
  }
];

export const MOCK_REVIEWS: Review[] = [
  {
    id: 'rev_101',
    productId: 'prod_1',
    userId: 'usr_alex',
    userName: 'AlexChen_Tech',
    userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
    userLevel: 'Level 5 Master Reviewer',
    userVerified: true,
    rating: 5,
    title: '1 Year Long-term experience update: Still the king of battery and pro video!',
    content: 'I bought the iPhone 16 Pro Max on release day. Over the past year of intensive photo shooting, daily navigation, and 4K video recording, the titanium finish has held up flawlessly without a single deep scratch. Battery health is currently sitting at 94% after 340 charge cycles!',
    pros: ['Battery health sustained at 94% after a full year', 'A18 Pro stays cool during high-res 4K60 video', 'Desert titanium color looks pristine without a case'],
    cons: ['Camera Control button needed 2 months of muscle memory calibration'],
    recommend: true,
    photos: [
      'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=800'
    ],
    datePurchased: '2024-09-21',
    usageDuration: '1 year',
    createdAt: '2025-09-25',
    helpfulCount: 84,
    reported: false,
    verifiedPurchase: true,
    authenticityScore: 98,
    timeline: [
      {
        id: 'tm_1',
        periodLabel: 'Day 1',
        rating: 5,
        note: 'Unboxed in Desert Titanium. Display is stunningly bright under sunlight. Initial data migration was finished in 12 minutes.',
        date: '2024-09-21'
      },
      {
        id: 'tm_2',
        periodLabel: 'Month 6',
        rating: 5,
        note: '6 month check-in: Battery lasts easily from 7 AM to 11 PM with 35% left. Camera Control button is useful for exposure tweaks.',
        date: '2025-03-20'
      },
      {
        id: 'tm_3',
        periodLabel: 'Year 1',
        rating: 5,
        note: '1 year milestone: Zero thermal throttling during summer outdoors. iOS software updates fixed minor camera app stuttering.',
        date: '2025-09-25'
      }
    ]
  },
  {
    id: 'rev_102',
    productId: 'prod_2',
    userId: 'usr_sara',
    userName: 'SaraGlobalTravels',
    userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=250',
    userLevel: 'Level 3 Pro Reviewer',
    userVerified: true,
    rating: 4,
    title: 'Saved my remote work while living in a mountain cabin!',
    content: 'As a remote developer, having reliable internet off-grid is mandatory. Starlink provided 180 Mbps download and 25 Mbps upload in the middle of Rocky Mountain National Park. Had zero dropped Zoom calls over 6 months!',
    pros: ['180Mbps down speed in deep wilderness', 'Plug-and-play dish alignment', 'Unlimited data cap'],
    cons: ['Heavy snow accumulation requires enabling dish heating mode'],
    recommend: true,
    photos: [
      'https://images.unsplash.com/photo-1516849841032-87cbac4d88f7?auto=format&fit=crop&q=80&w=800'
    ],
    datePurchased: '2024-03-01',
    usageDuration: '6 months',
    createdAt: '2024-09-10',
    helpfulCount: 52,
    reported: false,
    verifiedPurchase: true,
    authenticityScore: 95,
    timeline: [
      {
        id: 'tm_4',
        periodLabel: 'Day 1',
        rating: 5,
        note: 'Dish setup took 8 minutes on top of my camper van. Instantly locked onto 12 satellites.',
        date: '2024-03-01'
      },
      {
        id: 'tm_5',
        periodLabel: 'Month 6',
        rating: 4,
        note: 'Minor latency increase during heavy downpours, but auto-reconnects in seconds.',
        date: '2024-09-10'
      }
    ]
  },
  {
    id: 'rev_103',
    productId: 'prod_4',
    userId: 'usr_alex',
    userName: 'AlexChen_Tech',
    userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
    userLevel: 'Level 5 Master Reviewer',
    userVerified: true,
    rating: 5,
    title: 'Unbeatable ANC for frequent flyers',
    content: 'I fly internationally twice a month. The active noise cancellation cuts out jet engine drone almost completely. Mic quality in noisy airport lounges is crystal clear.',
    pros: ['Silences cabin hum', 'Multi-device Bluetooth pairing works seamlessly', 'Soft ear cups don’t squeeze glasses'],
    cons: ['Case is a bit bulky compared to older models'],
    recommend: true,
    photos: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800'
    ],
    datePurchased: '2023-11-10',
    usageDuration: '1.5 years',
    createdAt: '2025-01-15',
    helpfulCount: 96,
    reported: false,
    verifiedPurchase: true,
    authenticityScore: 97,
    timeline: [
      {
        id: 'tm_6',
        periodLabel: 'Day 1',
        rating: 5,
        note: 'Ear pads are feather light. ANC instantly removes room fan noise.',
        date: '2023-11-10'
      },
      {
        id: 'tm_7',
        periodLabel: 'Year 1',
        rating: 5,
        note: 'Battery capacity still yields ~28 hours per charge.',
        date: '2024-11-10'
      }
    ]
  }
];

export const MOCK_PRODUCT_QA: ProductQA[] = [
  {
    id: 'qa_1',
    productId: 'prod_1',
    question: 'Is this phone worth upgrading to if I already own an iPhone 14 Pro Max?',
    user: 'David_M',
    answer: 'According to our AI synthesis of 120+ reviews: If you value significant battery gains (approx +4 hours daily), titanium weight reduction (-19g), and 4K 120fps video recording, yes. However, for casual web browsing and messaging, the experience is similar.',
    aiGenerated: true,
    votes: 42,
    date: '2024-10-02'
  },
  {
    id: 'qa_2',
    productId: 'prod_2',
    question: 'What happens to Starlink internet speed during heavy rain or storms?',
    user: 'OffGridSam',
    answer: 'AI Review Insights: Torrential downpours cause a temporary speed decrease of 20-35% due to rain fade, but total connection disconnects occur only in extreme electrical hail storms.',
    aiGenerated: true,
    votes: 28,
    date: '2024-04-12'
  }
];

export const MOCK_ADMIN_REPORTS: AdminReport[] = [
  {
    id: 'rep_1',
    reviewId: 'rev_999',
    productName: 'Random Competitor Device',
    reason: 'Suspected AI-generated spam promotional content with external affiliate links',
    reportedBy: 'Taddla AI Shield',
    date: '2026-07-24',
    status: 'pending'
  }
];
