import React, { useEffect } from 'react';
import { Product, Review } from '../types';

interface SEOHeadProps {
  currentView: 'home' | 'product_details' | 'admin';
  selectedProduct: Product | null;
  selectedCategory: string;
  reviews?: Review[];
}

export const SEOHead: React.FC<SEOHeadProps> = ({
  currentView,
  selectedProduct,
  selectedCategory,
  reviews = []
}) => {
  useEffect(() => {
    // Helper to safely set or update dynamic meta tag in <head>
    const setMetaTag = (selector: string, attribute: string, value: string) => {
      let element = document.querySelector(selector);
      if (!element) {
        element = document.createElement('meta');
        if (selector.includes('property=')) {
          const propName = selector.match(/property="([^"]+)"/)?.[1];
          if (propName) element.setAttribute('property', propName);
        } else if (selector.includes('name=')) {
          const nameValue = selector.match(/name="([^"]+)"/)?.[1];
          if (nameValue) element.setAttribute('name', nameValue);
        }
        document.head.appendChild(element);
      }
      element.setAttribute(attribute, value);
    };

    // Helper to set or update dynamic JSON-LD script block in <head>
    const setJsonLdScript = (id: string, jsonObject: object) => {
      let script = document.getElementById(id) as HTMLScriptElement | null;
      if (!script) {
        script = document.createElement('script');
        script.id = id;
        script.type = 'application/ld+json';
        document.head.appendChild(script);
      }
      script.text = JSON.stringify(jsonObject);
    };

    // Clean up dynamic product schema script when leaving product_details
    const removeJsonLdScript = (id: string) => {
      const script = document.getElementById(id);
      if (script) {
        script.remove();
      }
    };

    if (currentView === 'product_details' && selectedProduct) {
      const title = `${selectedProduct.name} Reviews, Rating & AI Insights — Taddla`;
      const description = `${selectedProduct.name} (${selectedProduct.brand}) rated ${selectedProduct.avgRating}/5 stars across ${selectedProduct.totalReviews} verified reviews. Read AI summary, long-term timeline updates, pros/cons, and authentic ratings on Taddla.`;
      const imageUrl = selectedProduct.imageUrl;
      const canonicalUrl = `https://taddla.com/?product=${selectedProduct.id}`;

      // Update Document Title & Standard Metas
      document.title = title;
      setMetaTag('meta[name="description"]', 'content', description);
      setMetaTag('meta[name="title"]', 'content', title);
      setMetaTag('meta[name="keywords"]', 'content', `${selectedProduct.name}, ${selectedProduct.brand}, ${selectedProduct.category}, user reviews, rating, authentic reviews, Taddla`);

      // Update Open Graph
      setMetaTag('meta[property="og:title"]', 'content', title);
      setMetaTag('meta[property="og:description"]', 'content', description);
      setMetaTag('meta[property="og:image"]', 'content', imageUrl);
      setMetaTag('meta[property="og:url"]', 'content', canonicalUrl);
      setMetaTag('meta[property="og:type"]', 'content', 'product');

      // Update Twitter Cards
      setMetaTag('meta[property="twitter:title"]', 'content', title);
      setMetaTag('meta[property="twitter:description"]', 'content', description);
      setMetaTag('meta[property="twitter:image"]', 'content', imageUrl);

      // Update Canonical Link
      let canonicalLink = document.querySelector('link[rel="canonical"]');
      if (canonicalLink) {
        canonicalLink.setAttribute('href', canonicalUrl);
      }

      // Inject Product Schema.org JSON-LD
      const productReviews = reviews.filter(r => r.productId === selectedProduct.id);
      
      const productSchema: Record<string, unknown> = {
        '@context': 'https://schema.org/',
        '@type': 'Product',
        'name': selectedProduct.name,
        'image': [selectedProduct.imageUrl, ...(selectedProduct.gallery || [])],
        'description': selectedProduct.description,
        'brand': {
          '@type': 'Brand',
          'name': selectedProduct.brand
        },
        'aggregateRating': {
          '@type': 'AggregateRating',
          'ratingValue': selectedProduct.avgRating.toString(),
          'reviewCount': selectedProduct.totalReviews.toString(),
          'bestRating': '5',
          'worstRating': '1'
        }
      };

      if (productReviews.length > 0) {
        productSchema['review'] = productReviews.slice(0, 5).map(r => ({
          '@type': 'Review',
          'reviewRating': {
            '@type': 'Rating',
            'ratingValue': r.rating.toString(),
            'bestRating': '5'
          },
          'author': {
            '@type': 'Person',
            'name': r.userName
          },
          'datePublished': r.createdAt,
          'reviewBody': r.content,
          'name': r.title
        }));
      }

      setJsonLdScript('seo-dynamic-product-schema', productSchema);

    } else if (currentView === 'admin') {
      document.title = 'Admin Moderation Dashboard — Taddla';
      setMetaTag('meta[name="description"]', 'content', 'Taddla admin moderation & review verification platform.');
      removeJsonLdScript('seo-dynamic-product-schema');
    } else {
      // Home view
      let pageTitle = 'Taddla — Verified Consumer Reviews, Ratings & Product Insights';
      let pageDesc = 'Discover authentic consumer reviews, AI-powered review summaries, long-term product experience timelines, and verified buyer ratings on Taddla.';

      if (selectedCategory && selectedCategory !== 'all') {
        const catName = selectedCategory.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
        pageTitle = `${catName} Reviews & Consumer Ratings — Taddla`;
        pageDesc = `Browse top-rated ${catName} products and services with authentic verified consumer reviews, AI summaries, and long-term experience timelines on Taddla.`;
      }

      document.title = pageTitle;
      setMetaTag('meta[name="description"]', 'content', pageDesc);
      setMetaTag('meta[name="title"]', 'content', pageTitle);
      setMetaTag('meta[property="og:title"]', 'content', pageTitle);
      setMetaTag('meta[property="og:description"]', 'content', pageDesc);
      
      let canonicalLink = document.querySelector('link[rel="canonical"]');
      if (canonicalLink) {
        canonicalLink.setAttribute('href', 'https://taddla.com/');
      }

      removeJsonLdScript('seo-dynamic-product-schema');
    }
  }, [currentView, selectedProduct, selectedCategory, reviews]);

  return null; // Headless component manipulating document head dynamically
};
