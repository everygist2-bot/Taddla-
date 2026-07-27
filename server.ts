import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';

import { MOCK_USERS } from './mockData.js';
import { Product, Review, ProductQA, AdminReport, TimelineEntry } from './types.js';
dotenv.config();

const currentFilename = typeof import.meta !== 'undefined' && import.meta.url 
  ? fileURLToPath(import.meta.url) 
  : (typeof __filename !== 'undefined' ? __filename : '');

const currentDirname = typeof import.meta !== 'undefined' && import.meta.url 
  ? path.dirname(currentFilename) 
  : (typeof __dirname !== 'undefined' ? __dirname : '');

// -------------------------------------------------------------
// Firebase Admin / Firestore Initialization
// -------------------------------------------------------------
const serviceAccountRaw = process.env.FIREBASE_SERVICE_ACCOUNT;

if (!serviceAccountRaw) {
  console.warn('FIREBASE_SERVICE_ACCOUNT environment variable is missing. Firestore calls will fail until it is set.');
}

// Explicitly target the named Firestore database instance
const db = getFirestore(
  admin.apps.length
    ? admin.app()
    : admin.initializeApp({ credential: admin.credential.cert(JSON.parse(serviceAccountRaw!)) }),
  'ai-studio-reviewpulse-3ec7577d-a9c7-4d71-b1aa-02aa1a28258b'
);

const productsCollection = db.collection('products');
const reviewsCollection = db.collection('reviews');
const qnaCollection = db.collection('product_qna');
const reportsCollection = db.collection('admin_reports');

// -------------------------------------------------------------
// Firestore Helpers
// -------------------------------------------------------------
async function getAllDocs<T>(collection: FirebaseFirestore.CollectionReference): Promise<T[]> {
  const snapshot = await collection.get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
}

async function getDocsWhere<T>(
  collection: FirebaseFirestore.CollectionReference,
  field: string,
  value: any
): Promise<T[]> {
  const snapshot = await collection.where(field, '==', value).get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
}

async function getProductById(id: string): Promise<Product | null> {
  const doc = await productsCollection.doc(id).get();
  return doc.exists ? ({ id: doc.id, ...doc.data() } as Product) : null;
}

async function getReviewById(id: string): Promise<Review | null> {
  const doc = await reviewsCollection.doc(id).get();
  return doc.exists ? ({ id: doc.id, ...doc.data() } as Review) : null;
}

// Initialize Gemini Client
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY environment variable is missing.');
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build'
      }
    }
  });
};

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '10mb' }));

  const PORT = 3000;

  // -------------------------------------------------------------
  // API Endpoints
  // -------------------------------------------------------------

  // GET /api/products
  app.get('/api/products', async (req, res) => {
    try {
      const { search, category, brand, itemType, minRating, sortBy } = req.query;

      let result = await getAllDocs<Product>(productsCollection);

      if (search) {
        const q = String(search).toLowerCase();
        result = result.filter(
          p =>
            p.name.toLowerCase().includes(q) ||
            p.brand.toLowerCase().includes(q) ||
            p.category.toLowerCase().includes(q) ||
            p.description.toLowerCase().includes(q)
        );
      }

      if (category && category !== 'all') {
        result = result.filter(p => p.category.toLowerCase() === String(category).toLowerCase());
      }

      if (brand) {
        result = result.filter(p => p.brand.toLowerCase() === String(brand).toLowerCase());
      }

      if (itemType && itemType !== 'both' && itemType !== 'all') {
        result = result.filter(p => p.itemType === itemType);
      }

      if (minRating) {
        const ratingNum = parseFloat(String(minRating));
        if (!isNaN(ratingNum)) {
          result = result.filter(p => p.avgRating >= ratingNum);
        }
      }

      if (sortBy) {
        switch (sortBy) {
          case 'highest_rated':
            result.sort((a, b) => b.avgRating - a.avgRating);
            break;
          case 'lowest_rated':
            result.sort((a, b) => a.avgRating - b.avgRating);
            break;
          case 'most_helpful':
          case 'authenticity':
            result.sort((a, b) => b.reviewAuthenticityScore - a.reviewAuthenticityScore);
            break;
          case 'most_recent':
          default:
            result.sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime());
            break;
        }
      }

      res.json({ success: true, count: result.length, products: result });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // GET /api/reviews
  app.get('/api/reviews', async (req, res) => {
    try {
      const reviews = await getAllDocs<Review>(reviewsCollection);
      res.json({ success: true, reviews });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // GET /api/qas
  app.get('/api/qas', async (req, res) => {
    try {
      const qas = await getAllDocs<ProductQA>(qnaCollection);
      res.json({ success: true, qas });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // GET /api/products/:id
  app.get('/api/products/:id', async (req, res) => {
    try {
      const product = await getProductById(req.params.id);
      if (!product) {
        return res.status(404).json({ success: false, error: 'Product not found' });
      }

      const [prodReviews, prodQAs] = await Promise.all([
        getDocsWhere<Review>(reviewsCollection, 'productId', product.id),
        getDocsWhere<ProductQA>(qnaCollection, 'productId', product.id)
      ]);

      res.json({
        success: true,
        product,
        reviews: prodReviews,
        qas: prodQAs
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // POST /api/products
  app.post('/api/products', async (req, res) => {
    try {
      const { name, itemType, brand, category, description, imageUrl, gallery, whereToBuy } = req.body;

      if (!name || !category || !brand) {
        return res.status(400).json({ success: false, error: 'Name, Category, and Brand are required' });
      }

      // Check if product already exists by name + brand
      const allProducts = await getAllDocs<Product>(productsCollection);
      const existingProduct = allProducts.find(
        p => p.name.toLowerCase().trim() === name.toLowerCase().trim() && p.brand.toLowerCase().trim() === brand.toLowerCase().trim()
      );

      if (existingProduct) {
        return res.json({
          success: true,
          isDuplicate: true,
          product: existingProduct,
          message: 'Product already exists! Redirecting to existing product page.'
        });
      }

      const docRef = productsCollection.doc();

      const newProduct: Product = {
        id: docRef.id,
        name,
        itemType: itemType || 'product',
        brand,
        category,
        description: description || '',
        imageUrl: imageUrl || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&q=80&w=800',
        gallery: gallery && gallery.length > 0 ? gallery : [imageUrl || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&q=80&w=800'],
        avgRating: 5.0,
        totalReviews: 0,
        ratingBreakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
        pros: [],
        cons: [],
        whereToBuy: whereToBuy || [],
        createdDate: new Date().toISOString().split('T')[0],
        featured: false,
        trending: true,
        reviewQualityScore: 90,
        verifiedPurchaseScore: 88,
        communityTrustScore: 92,
        reviewAuthenticityScore: 91
      };

      await docRef.set(newProduct);

      res.status(201).json({
        success: true,
        isDuplicate: false,
        product: newProduct
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // POST /api/products/ai-suggest (AI Photo & Text Recognition)
  app.post('/api/products/ai-suggest', async (req, res) => {
    try {
      const { imageBase64, imageMimeType, promptText } = req.body;

      const ai = getGeminiClient();

      let recognitionResult = {
        productName: 'Sample Identified Product',
        brand: 'Generic Brand',
        category: 'electronics',
        description: 'Auto-detected item based on visual contours and branding.',
        confidence: 88,
        suggestedTags: ['electronics', 'gadget']
      };

      if (ai) {
        const parts: any[] = [];

        if (imageBase64) {
          parts.push({
            inlineData: {
              data: imageBase64.replace(/^data:image\/\w+;base64,/, ''),
              mimeType: imageMimeType || 'image/jpeg'
            }
          });
        }

        const promptInstruction = promptText
          ? `Analyze this product image or description: "${promptText}". Identify the exact product name, brand name, category (choose from: electronics, phones, laptops, fashion, food, health, beauty, home, cars, gaming, software, apps, internet, banks, mobile_money, telecom, airlines, hotels, restaurants, streaming, insurance, education, healthcare, home_services), and estimated description.`
          : `Analyze this image carefully. Identify the exact product/service name, brand name, appropriate category, and brief 2-sentence description.`;

        parts.push({ text: promptInstruction });

        const response = await ai.models.generateContent({
          model: 'gemini-3.6-flash',
          contents: { parts },
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                productName: { type: Type.STRING },
                brand: { type: Type.STRING },
                category: { type: Type.STRING },
                description: { type: Type.STRING },
                confidence: { type: Type.NUMBER },
                suggestedTags: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                }
              },
              required: ['productName', 'brand', 'category', 'description']
            }
          }
        });

        if (response.text) {
          const parsed = JSON.parse(response.text);
          recognitionResult = { ...recognitionResult, ...parsed };
        }
      } else {
        // Fallback simulation when API key not configured yet
        if (promptText && promptText.toLowerCase().includes('phone')) {
          recognitionResult = {
            productName: 'Samsung Galaxy S24 Ultra',
            brand: 'Samsung',
            category: 'phones',
            description: 'Flagship AI smartphone with S Pen and 200MP camera.',
            confidence: 92,
            suggestedTags: ['android', 'samsung', 'flagship']
          };
        }
      }

      // Check if product matching this exists in database
      const allProducts = await getAllDocs<Product>(productsCollection);
      const existingMatch = allProducts.find(
        p =>
          p.name.toLowerCase().includes(recognitionResult.productName.toLowerCase()) ||
          recognitionResult.productName.toLowerCase().includes(p.name.toLowerCase())
      );

      res.json({
        success: true,
        result: recognitionResult,
        existingMatch: existingMatch || null
      });
    } catch (err: any) {
      console.error('AI suggest error:', err);
      res.status(500).json({
        success: false,
        error: err.message,
        fallback: {
          productName: 'Identified Product',
          brand: 'Detected Brand',
          category: 'electronics',
          description: 'Auto-detected item details.',
          confidence: 80,
          suggestedTags: []
        }
      });
    }
  });

  // POST /api/reviews
  app.post('/api/reviews', async (req, res) => {
    try {
      const {
        productId,
        userId,
        userName,
        userAvatar,
        userLevel,
        rating,
        title,
        content,
        pros,
        cons,
        recommend,
        photos,
        videoUrl,
        datePurchased,
        usageDuration
      } = req.body;

      if (!productId || !title || !content || !rating) {
        return res.status(400).json({ success: false, error: 'Product, title, content, and rating are required' });
      }

      const product = await getProductById(productId);
      if (!product) {
        return res.status(404).json({ success: false, error: 'Product not found' });
      }

      const initialTimeline: TimelineEntry = {
        id: `tm_${Date.now()}`,
        periodLabel: usageDuration ? `At ${usageDuration}` : 'Day 1',
        rating: Number(rating),
        note: content,
        date: new Date().toISOString().split('T')[0]
      };

      const docRef = reviewsCollection.doc();

      const newReview: Review = {
        id: docRef.id,
        productId,
        userId: userId || 'usr_guest',
        userName: userName || 'Authentic Consumer',
        userAvatar: userAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=250',
        userLevel: userLevel || 'Level 1 Reviewer',
        userVerified: true,
        rating: Number(rating),
        title,
        content,
        pros: Array.isArray(pros) ? pros : pros ? [pros] : [],
        cons: Array.isArray(cons) ? cons : cons ? [cons] : [],
        recommend: recommend ?? true,
        photos: photos || [],
        videoUrl: videoUrl || undefined,
        datePurchased: datePurchased || new Date().toISOString().split('T')[0],
        usageDuration: usageDuration || '1 month',
        createdAt: new Date().toISOString().split('T')[0],
        helpfulCount: 0,
        reported: false,
        verifiedPurchase: true,
        authenticityScore: 94,
        timeline: [initialTimeline]
      };

      await docRef.set(newReview);

      // Recalculate product rating & review breakdown
      const prodReviews = await getDocsWhere<Review>(reviewsCollection, 'productId', productId);
      const total = prodReviews.length;
      const sum = prodReviews.reduce((acc, r) => acc + r.rating, 0);
      const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
      prodReviews.forEach(r => {
        const rounded = Math.min(5, Math.max(1, Math.round(r.rating))) as 1 | 2 | 3 | 4 | 5;
        breakdown[rounded] = (breakdown[rounded] || 0) + 1;
      });

      product.avgRating = Number((sum / total).toFixed(1));
      product.totalReviews = total;
      product.ratingBreakdown = breakdown;

      await productsCollection.doc(productId).update({
        avgRating: product.avgRating,
        totalReviews: product.totalReviews,
        ratingBreakdown: product.ratingBreakdown
      });

      res.status(201).json({ success: true, review: newReview, product });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // POST /api/reviews/:id/timeline (Add long-term experience timeline milestone)
  app.post('/api/reviews/:id/timeline', async (req, res) => {
    try {
      const review = await getReviewById(req.params.id);
      if (!review) {
        return res.status(404).json({ success: false, error: 'Review not found' });
      }

      const { periodLabel, rating, note } = req.body;

      if (!periodLabel || !note) {
        return res.status(400).json({ success: false, error: 'Period label and update note are required' });
      }

      const newMilestone: TimelineEntry = {
        id: `tm_${Date.now()}`,
        periodLabel,
        rating: rating ? Number(rating) : review.rating,
        note,
        date: new Date().toISOString().split('T')[0]
      };

      review.timeline.push(newMilestone);
      if (rating) {
        review.rating = Number(rating);
      }

      await reviewsCollection.doc(review.id).update({
        timeline: review.timeline,
        rating: review.rating
      });

      res.json({ success: true, review });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // POST /api/reviews/:id/helpful
  app.post('/api/reviews/:id/helpful', async (req, res) => {
    try {
      const review = await getReviewById(req.params.id);
      if (!review) {
        return res.status(404).json({ success: false, error: 'Review not found' });
      }

      const helpfulCount = (review.helpfulCount || 0) + 1;
      await reviewsCollection.doc(review.id).update({ helpfulCount });

      res.json({ success: true, helpfulCount });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // POST /api/reviews/:id/report
  app.post('/api/reviews/:id/report', async (req, res) => {
    try {
      const review = await getReviewById(req.params.id);
      if (!review) {
        return res.status(404).json({ success: false, error: 'Review not found' });
      }

      await reviewsCollection.doc(review.id).update({ reported: true });

      const product = await getProductById(review.productId);

      const reportDocRef = reportsCollection.doc();

      const report: AdminReport = {
        id: reportDocRef.id,
        reviewId: review.id,
        productName: product ? product.name : 'Unknown Product',
        reason: req.body.reason || 'User reported content quality violation',
        reportedBy: req.body.userName || 'Community User',
        date: new Date().toISOString().split('T')[0],
        status: 'pending'
      };

      await reportDocRef.set(report);

      res.json({ success: true, message: 'Review reported for moderation' });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // POST /api/ai/summarize-product (AI Review Summarizer & Pros/Cons Generator)
  app.post('/api/ai/summarize-product', async (req, res) => {
    try {
      const { productId } = req.body;
      const product = await getProductById(productId);

      if (!product) {
        return res.status(404).json({ success: false, error: 'Product not found' });
      }

      const prodReviews = await getDocsWhere<Review>(reviewsCollection, 'productId', productId);

      const ai = getGeminiClient();

      let summaryData = {
        aiSummary: product.aiSummary || `Overall positive user sentiment praising durability and build quality.`,
        pros: product.pros,
        cons: product.cons,
        reviewQualityScore: product.reviewQualityScore,
        verifiedPurchaseScore: product.verifiedPurchaseScore,
        communityTrustScore: product.communityTrustScore,
        reviewAuthenticityScore: product.reviewAuthenticityScore
      };

      if (ai && prodReviews.length > 0) {
        const reviewTexts = prodReviews
          .map(r => `[Rating: ${r.rating}/5 | Usage: ${r.usageDuration}] Title: ${r.title}. Review: ${r.content}`)
          .join('\n\n');

        const prompt = `You are the chief AI review analyst for Taddla. Analyze these consumer reviews for "${product.name}" (${product.brand}):
\n${reviewTexts}\n
Synthesize a comprehensive unbiased summary (max 3 sentences), bullet points for top 4 Pros, top 3 Cons, and calculate 0-100 scores for:
- reviewQualityScore
- verifiedPurchaseScore
- communityTrustScore
- reviewAuthenticityScore`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.6-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                aiSummary: { type: Type.STRING },
                pros: { type: Type.ARRAY, items: { type: Type.STRING } },
                cons: { type: Type.ARRAY, items: { type: Type.STRING } },
                reviewQualityScore: { type: Type.NUMBER },
                verifiedPurchaseScore: { type: Type.NUMBER },
                communityTrustScore: { type: Type.NUMBER },
                reviewAuthenticityScore: { type: Type.NUMBER }
              },
              required: ['aiSummary', 'pros', 'cons', 'reviewQualityScore', 'reviewAuthenticityScore']
            }
          }
        });

        if (response.text) {
          const parsed = JSON.parse(response.text);
          summaryData = { ...summaryData, ...parsed };

          // Save back to product
          await productsCollection.doc(productId).update({
            aiSummary: summaryData.aiSummary,
            pros: summaryData.pros,
            cons: summaryData.cons,
            reviewQualityScore: summaryData.reviewQualityScore,
            verifiedPurchaseScore: summaryData.verifiedPurchaseScore,
            communityTrustScore: summaryData.communityTrustScore,
            reviewAuthenticityScore: summaryData.reviewAuthenticityScore
          });
        }
      }

      res.json({ success: true, summary: summaryData });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // POST /api/ai/ask-product-qa (AI Q&A Assistant & Recommendations)
  app.post('/api/ai/ask-product-qa', async (req, res) => {
    try {
      const { productId, question } = req.body;
      const product = await getProductById(productId);

      if (!product || !question) {
        return res.status(400).json({ success: false, error: 'Product and question are required' });
      }

      const prodReviews = await getDocsWhere<Review>(reviewsCollection, 'productId', productId);
      const ai = getGeminiClient();

      let answer = '';

      if (ai) {
        const reviewContext = prodReviews.map(r => `User (${r.rating} stars): ${r.title} - ${r.content}`).join('\n');

        const prompt = `You are the expert Taddla AI advisor. A consumer is considering buying "${product.name}" by ${product.brand}.
Product description: ${product.description}.
Key Pros: ${product.pros.join(', ')}.
Key Cons: ${product.cons.join(', ')}.
User Review Context:\n${reviewContext}\n
Answer this consumer's question accurately, honestly, and directly in 2-4 sentences: "${question}"`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.6-flash',
          contents: prompt
        });

        answer = response.text || 'Based on overall review data, this product performs exceptionally well for its target use case.';
      } else {
        answer = `Based on community reviews and technical specs, ${product.name} is highly recommended for users prioritizing ${product.pros[0] || 'quality'}.`;
      }

      const docRef = qnaCollection.doc();

      const newQA: ProductQA = {
        id: docRef.id,
        productId,
        question,
        user: 'Consumer',
        answer,
        aiGenerated: true,
        votes: 1,
        date: new Date().toISOString().split('T')[0]
      };

      await docRef.set(newQA);

      res.json({ success: true, qa: newQA });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // GET /api/admin/stats
  app.get('/api/admin/stats', async (req, res) => {
    try {
      const [products, reviews, adminReports] = await Promise.all([
        getAllDocs<Product>(productsCollection),
        getAllDocs<Review>(reviewsCollection),
        getAllDocs<AdminReport>(reportsCollection)
      ]);

      const totalProducts = products.length;
      const totalReviews = reviews.length;
      const totalUsers = MOCK_USERS.length;
      const pendingReports = adminReports.filter(r => r.status === 'pending').length;
      const avgAuthenticity = Math.round(
        products.reduce((acc, p) => acc + p.reviewAuthenticityScore, 0) / (totalProducts || 1)
      );

      res.json({
        success: true,
        stats: {
          totalProducts,
          totalReviews,
          totalUsers,
          pendingReports,
          avgAuthenticity,
          flaggedSpamReviews: 2
        },
        reports: adminReports
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // POST /api/admin/reports/:id/resolve
  app.post('/api/admin/reports/:id/resolve', async (req, res) => {
    try {
      const reportDoc = await reportsCollection.doc(req.params.id).get();
      if (!reportDoc.exists) {
        return res.status(404).json({ success: false, error: 'Report not found' });
      }

      const report = { id: reportDoc.id, ...reportDoc.data() } as AdminReport;
      report.status = req.body.action === 'dismiss' ? 'dismissed' : 'resolved';

      await reportsCollection.doc(report.id).update({ status: report.status });

      if (req.body.action === 'delete_review' && report.reviewId) {
        await reviewsCollection.doc(report.reviewId).delete();
      }

      res.json({ success: true, report });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // PUT /api/admin/products/:id/affiliate-links (Admin Add/Edit Affiliate Links for products or services)
  app.put('/api/admin/products/:id/affiliate-links', async (req, res) => {
    try {
      const product = await getProductById(req.params.id);
      if (!product) {
        return res.status(404).json({ success: false, error: 'Product or service not found' });
      }

      const { whereToBuy } = req.body;
      if (!Array.isArray(whereToBuy)) {
        return res.status(400).json({ success: false, error: 'whereToBuy must be an array of stores/affiliate links' });
      }

      product.whereToBuy = whereToBuy;
      await productsCollection.doc(product.id).update({ whereToBuy });

      res.json({
        success: true,
        message: 'Affiliate links updated successfully',
        product
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // -------------------------------------------------------------
  // Vite Dev Server / Static Production Fallback
  // -------------------------------------------------------------
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Taddla server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
