export type ItemType = 'product' | 'service';

export interface RatingBreakdown {
  5: number;
  4: number;
  3: number;
  2: number;
  1: number;
}

export interface WhereToBuy {
  storeName: string;
  price: string;
  url: string;
  inStock: boolean;
  logo?: string;
  isAffiliate?: boolean;
  affiliateTag?: string; // e.g. "Amazon Associates", "CJ Affiliate", "Impact", "Direct Partner"
  commissionRate?: string; // e.g. "5%", "$10 CPA", "7% commission"
  addedByAdmin?: boolean;
  isPrimaryAffiliate?: boolean; // Featured primary affiliate deal
}

export interface TimelineEntry {
  id: string;
  periodLabel: string; // e.g., 'Day 1', 'Month 3', 'Month 6', 'Year 1', 'Year 2'
  rating: number;
  note: string;
  date: string;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  userLevel: string; // e.g. "Level 4 Pro Reviewer"
  userVerified: boolean;
  rating: number;
  title: string;
  content: string;
  pros: string[];
  cons: string[];
  recommend: boolean;
  photos: string[];
  videoUrl?: string;
  datePurchased: string;
  usageDuration: string; // e.g., '6 months', '2 years'
  createdAt: string;
  helpfulCount: number;
  helpfulVotedUsers?: string[];
  reported: boolean;
  verifiedPurchase: boolean;
  timeline: TimelineEntry[];
  authenticityScore?: number; // 0-100 calculated score
}

export interface Product {
  id: string;
  name: string;
  itemType: ItemType; // 'product' or 'service'
  brand: string;
  category: string;
  description: string;
  imageUrl: string;
  gallery: string[];
  avgRating: number;
  totalReviews: number;
  ratingBreakdown: RatingBreakdown;
  aiSummary?: string;
  pros: string[];
  cons: string[];
  whereToBuy: WhereToBuy[];
  createdDate: string;
  featured: boolean;
  trending: boolean;
  
  // AI Review Scores (0-100)
  reviewQualityScore: number;
  verifiedPurchaseScore: number;
  communityTrustScore: number;
  reviewAuthenticityScore: number;
}

export interface ProductQA {
  id: string;
  productId: string;
  question: string;
  user: string;
  answer?: string;
  aiGenerated: boolean;
  votes: number;
  date: string;
}

export interface UserBadge {
  id: string;
  name: string;
  icon: string;
  description: string;
  color: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  photo: string;
  bio: string;
  joinedDate: string;
  reviewCount: number;
  helpfulVotesReceived: number;
  badges: UserBadge[];
  followersCount: number;
  followingCount: number;
  level: string;
  isGuest?: boolean;
  provider?: 'email' | 'google' | 'apple' | 'guest';
  role?: 'user' | 'admin';
}

export interface AdminReport {
  id: string;
  reviewId: string;
  productName: string;
  reason: string;
  reportedBy: string;
  date: string;
  status: 'pending' | 'resolved' | 'dismissed';
}

export interface FilterOptions {
  searchQuery: string;
  category: string;
  brand: string;
  minRating: number;
  itemType: 'all' | 'product' | 'service';
  sortBy: 'most_helpful' | 'most_recent' | 'highest_rated' | 'lowest_rated' | 'authenticity';
  verifiedOnly: boolean;
  priceRange?: string;
  country?: string;
}

export interface ImageRecognitionResult {
  productName: string;
  brand: string;
  category: string;
  description: string;
  barcode?: string;
  confidence: number;
  suggestedTags: string[];
  existingMatch?: Product;
}
