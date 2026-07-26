import { Product, Review, ProductQA, FilterOptions, AdminReport, WhereToBuy } from '../types';

export async function fetchProducts(filters?: Partial<FilterOptions>): Promise<Product[]> {
  try {
    const params = new URLSearchParams();
    if (filters?.searchQuery) params.append('search', filters.searchQuery);
    if (filters?.category) params.append('category', filters.category);
    if (filters?.brand) params.append('brand', filters.brand);
    if (filters?.itemType) params.append('itemType', filters.itemType);
    if (filters?.minRating) params.append('minRating', String(filters.minRating));
    if (filters?.sortBy) params.append('sortBy', filters.sortBy);

    const res = await fetch(`/api/products?${params.toString()}`);
    const data = await res.json();
    if (data.success) {
      return data.products;
    }
    throw new Error(data.error || 'Failed to fetch products');
  } catch (err) {
    console.warn('API fetch error, using fallback:', err);
    return [];
  }
}

export async function fetchReviews(): Promise<Review[]> {
  try {
    const res = await fetch('/api/reviews');
    const data = await res.json();
    if (data.success) {
      return data.reviews;
    }
    return [];
  } catch (err) {
    console.error('Error fetching reviews:', err);
    return [];
  }
}

export async function fetchQAs(): Promise<ProductQA[]> {
  try {
    const res = await fetch('/api/qas');
    const data = await res.json();
    if (data.success) {
      return data.qas;
    }
    return [];
  } catch (err) {
    console.error('Error fetching QAs:', err);
    return [];
  }
}

export async function fetchProductById(id: string): Promise<{ product: Product; reviews: Review[]; qas: ProductQA[] } | null> {
  try {
    const res = await fetch(`/api/products/${id}`);
    const data = await res.json();
    if (data.success) {
      return {
        product: data.product,
        reviews: data.reviews,
        qas: data.qas
      };
    }
    return null;
  } catch (err) {
    console.error('Error fetching product by ID:', err);
    return null;
  }
}

export async function createProduct(productData: Partial<Product>): Promise<{ success: boolean; isDuplicate?: boolean; product?: Product; message?: string }> {
  try {
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData)
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, message: err.message };
  }
}

export async function aiSuggestProduct(payload: { imageBase64?: string; imageMimeType?: string; promptText?: string }) {
  try {
    const res = await fetch('/api/products/ai-suggest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function submitReview(reviewData: Partial<Review>) {
  try {
    const res = await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reviewData)
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function addTimelineMilestone(reviewId: string, milestone: { periodLabel: string; rating?: number; note: string }) {
  try {
    const res = await fetch(`/api/reviews/${reviewId}/timeline`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(milestone)
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function voteHelpful(reviewId: string) {
  try {
    const res = await fetch(`/api/reviews/${reviewId}/helpful`, { method: 'POST' });
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function reportReview(reviewId: string, reason: string, userName?: string) {
  try {
    const res = await fetch(`/api/reviews/${reviewId}/report`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason, userName })
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function getAISummary(productId: string) {
  try {
    const res = await fetch('/api/ai/summarize-product', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId })
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function askAIQuestion(productId: string, question: string) {
  try {
    const res = await fetch('/api/ai/ask-product-qa', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, question })
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function fetchAdminStats() {
  try {
    const res = await fetch('/api/admin/stats');
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function resolveAdminReport(reportId: string, action: 'resolve' | 'dismiss' | 'delete_review') {
  try {
    const res = await fetch(`/api/admin/reports/${reportId}/resolve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action })
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function updateProductAffiliateLinks(productId: string, whereToBuy: WhereToBuy[]) {
  try {
    const res = await fetch(`/api/admin/products/${productId}/affiliate-links`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ whereToBuy })
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
