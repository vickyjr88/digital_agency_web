import { Helmet } from 'react-helmet-async';
import PropTypes from 'prop-types';

/**
 * SEO Component for managing meta tags for social media sharing
 * Supports Open Graph (Facebook, LinkedIn, WhatsApp) and Twitter Cards
 */
export default function SEO({
  title = 'Dexter - AI-Powered Influencer Marketing Platform',
  description = 'Connect brands with authentic influencers. AI-powered matching, transparent analytics, and seamless payments for successful marketing campaigns.',
  image = null,
  url = null,
  type = 'website',
  imageAlt = 'Dexter Platform',
  siteName = 'Dexter',
  twitterCard = 'summary_large_image',
  twitterHandle = '@DexterPlatform',
  keywords = 'influencer marketing, brand collaboration, content marketing, AI marketing, social media marketing',
  author = 'Dexter',
  publishedTime = null,
  modifiedTime = null,
  article = null,
  product = null,
}) {
  // Get current URL if not provided
  const currentUrl = url || (typeof window !== 'undefined' ? window.location.href : '');

  // Default OG image if none provided
  const defaultImage = typeof window !== 'undefined'
    ? `${window.location.origin}/og-image.png`
    : '/og-image.png';

  const ogImage = image || defaultImage;

  // Ensure absolute URL for images
  const absoluteImageUrl = ogImage?.startsWith('http')
    ? ogImage
    : (typeof window !== 'undefined' ? `${window.location.origin}${ogImage}` : ogImage);

  // Clean title (remove extra spaces, ensure max length)
  const cleanTitle = title.trim().substring(0, 60);

  // Clean description (remove extra spaces, ensure max length)
  const cleanDescription = description.trim().substring(0, 160);

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{cleanTitle}</title>
      <meta name="description" content={cleanDescription} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={author} />

      {/* Open Graph Meta Tags (Facebook, LinkedIn, WhatsApp, etc.) */}
      <meta property="og:site_name" content={siteName} />
      <meta property="og:title" content={cleanTitle} />
      <meta property="og:description" content={cleanDescription} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={currentUrl} />
      {absoluteImageUrl && <meta property="og:image" content={absoluteImageUrl} />}
      {absoluteImageUrl && <meta property="og:image:secure_url" content={absoluteImageUrl} />}
      {absoluteImageUrl && <meta property="og:image:alt" content={imageAlt} />}
      {absoluteImageUrl && <meta property="og:image:width" content="1200" />}
      {absoluteImageUrl && <meta property="og:image:height" content="630" />}
      <meta property="og:locale" content="en_US" />

      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:site" content={twitterHandle} />
      <meta name="twitter:creator" content={twitterHandle} />
      <meta name="twitter:title" content={cleanTitle} />
      <meta name="twitter:description" content={cleanDescription} />
      {absoluteImageUrl && <meta name="twitter:image" content={absoluteImageUrl} />}
      {absoluteImageUrl && <meta name="twitter:image:alt" content={imageAlt} />}

      {/* WhatsApp uses Open Graph tags */}
      {/* Telegram uses Open Graph tags */}

      {/* Article specific meta tags (for blog posts, news) */}
      {type === 'article' && publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {type === 'article' && modifiedTime && (
        <meta property="article:modified_time" content={modifiedTime} />
      )}
      {type === 'article' && article?.author && (
        <meta property="article:author" content={article.author} />
      )}
      {type === 'article' && article?.section && (
        <meta property="article:section" content={article.section} />
      )}
      {type === 'article' && article?.tags && article.tags.map((tag, index) => (
        <meta key={index} property="article:tag" content={tag} />
      ))}

      {/* Product specific meta tags (for e-commerce) */}
      {type === 'product' && product?.price && (
        <>
          <meta property="og:price:amount" content={product.price} />
          <meta property="og:price:currency" content={product.currency || 'KES'} />
        </>
      )}
      {type === 'product' && product?.availability && (
        <meta property="og:availability" content={product.availability} />
      )}
      {type === 'product' && product?.brand && (
        <meta property="product:brand" content={product.brand} />
      )}
      {type === 'product' && product?.condition && (
        <meta property="product:condition" content={product.condition} />
      )}

      {/* Canonical URL */}
      <link rel="canonical" href={currentUrl} />

      {/* Mobile Web App Capable */}
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />

      {/* Theme Color (already in index.html but can be overridden) */}
      <meta name="theme-color" content="#4F46E5" />
    </Helmet>
  );
}

SEO.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  image: PropTypes.string,
  url: PropTypes.string,
  type: PropTypes.oneOf(['website', 'article', 'product', 'profile']),
  imageAlt: PropTypes.string,
  siteName: PropTypes.string,
  twitterCard: PropTypes.oneOf(['summary', 'summary_large_image', 'app', 'player']),
  twitterHandle: PropTypes.string,
  keywords: PropTypes.string,
  author: PropTypes.string,
  publishedTime: PropTypes.string,
  modifiedTime: PropTypes.string,
  article: PropTypes.shape({
    author: PropTypes.string,
    section: PropTypes.string,
    tags: PropTypes.arrayOf(PropTypes.string),
  }),
  product: PropTypes.shape({
    price: PropTypes.string,
    currency: PropTypes.string,
    availability: PropTypes.string,
    brand: PropTypes.string,
    condition: PropTypes.string,
  }),
};
