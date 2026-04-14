import { useState, useEffect } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import {
  Search,
  Package,
  ShoppingCart,
  Zap,
  ChevronRight,
  ArrowLeft,
  Loader,
  MapPin,
  Clock,
  Globe,
  Instagram,
  Facebook,
  Store,
  Tag,
  X,
} from 'lucide-react';
import { productsApi } from '../../../services/affiliateApi';
import SEO from '../../../components/SEO';

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatPrice(value) {
  return `KES ${parseFloat(value).toLocaleString()}`;
}

function ProductCard({ product }) {
  const hasDiscount =
    product.compare_at_price &&
    parseFloat(product.compare_at_price) > parseFloat(product.price);

  const discountPct = hasDiscount
    ? Math.round(
        ((parseFloat(product.compare_at_price) - parseFloat(product.price)) /
          parseFloat(product.compare_at_price)) *
          100
      )
    : null;

  return (
    <Link
      to={`/shop/p/${product.slug}`}
      className="group bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 flex flex-col"
    >
      {/* Image */}
      <div className="relative h-52 bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
        {product.thumbnail ? (
          <img
            src={product.thumbnail}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-gray-300">
            {product.is_digital ? (
              <>
                <Zap className="w-12 h-12" />
                <span className="text-sm">Digital product</span>
              </>
            ) : (
              <Package className="w-12 h-12" />
            )}
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {hasDiscount && (
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              -{discountPct}%
            </span>
          )}
          {product.is_digital && (
            <span className="bg-blue-600 text-white text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
              <Zap className="w-3 h-3" /> Digital
            </span>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-col flex-1 p-4 gap-2">
        {product.category && (
          <span className="text-xs text-blue-600 font-medium uppercase tracking-wide">
            {product.category}
          </span>
        )}

        <h3 className="font-semibold text-gray-900 line-clamp-2 leading-snug group-hover:text-blue-700 transition-colors">
          {product.name}
        </h3>

        {product.description && (
          <p className="text-sm text-gray-500 line-clamp-2 flex-1">
            {product.description}
          </p>
        )}

        <div className="flex items-end justify-between mt-auto pt-3 border-t border-gray-100">
          <div>
            <p className="text-xl font-bold text-gray-900">
              {formatPrice(product.price)}
            </p>
            {hasDiscount && (
              <p className="text-sm text-gray-400 line-through">
                {formatPrice(product.compare_at_price)}
              </p>
            )}
          </div>
          <span className="flex items-center gap-1 text-sm font-semibold text-blue-600 group-hover:translate-x-1 transition-transform">
            {product.is_digital ? 'Buy now' : 'Order'}{' '}
            <ChevronRight className="w-4 h-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function BrandStorefront() {
  const { brandProfileId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const [storefront, setStorefront] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [category, setCategory] = useState(searchParams.get('cat') || 'all');

  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  // Load storefront data
  useEffect(() => {
    loadStorefront();
    // Sync URL
    const params = {};
    if (debouncedSearch) params.q = debouncedSearch;
    if (category !== 'all') params.cat = category;
    setSearchParams(params, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [brandProfileId, debouncedSearch, category]);

  const loadStorefront = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {};
      if (debouncedSearch) params.search = debouncedSearch;
      if (category !== 'all') params.category = category;
      const res = await productsApi.getStorefront(brandProfileId, params);
      setStorefront(res.data);
    } catch (err) {
      console.error('Failed to load storefront:', err);
      setError('This storefront could not be found.');
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setSearch('');
    setCategory('all');
  };

  const hasActiveFilters = debouncedSearch || category !== 'all';
  const brand = storefront?.brand_profile;
  const products = storefront?.products || [];
  const categories = storefront?.categories || [];

  // ── Error state ──────────────────────────────────────────────────────────
  if (!loading && error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <Store className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Storefront Not Found</h2>
          <p className="text-gray-500 mb-6">{error}</p>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Shop
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO
        title={brand ? `${brand.brand_name} — Shop on Dexter` : 'Brand Storefront — Dexter Shop'}
        description={brand?.business_description || `Browse products from ${brand?.brand_name || 'this brand'} on Dexter Shop.`}
        type="website"
      />

      {/* ── Header / Hero ────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Nav back */}
          <Link
            to="/shop"
            className="inline-flex items-center gap-1.5 text-sm text-blue-200 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Shop
          </Link>

          {loading ? (
            <div className="flex items-center gap-3 py-6">
              <Loader className="w-8 h-8 animate-spin text-blue-300" />
              <span className="text-blue-200">Loading storefront…</span>
            </div>
          ) : brand ? (
            <div className="flex flex-col md:flex-row md:items-end gap-6">
              {/* Brand avatar */}
              <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-3xl font-bold shrink-0">
                {(brand.brand_name || '?').charAt(0).toUpperCase()}
              </div>

              <div className="flex-1 min-w-0">
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-1">
                  {brand.brand_name}
                </h1>

                {brand.business_description && (
                  <p className="text-blue-200 line-clamp-2 max-w-2xl mb-3">
                    {brand.business_description}
                  </p>
                )}

                {/* Meta pills */}
                <div className="flex flex-wrap gap-3 text-sm">
                  {brand.business_category && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm text-blue-100">
                      <Tag className="w-3.5 h-3.5" />
                      {brand.business_category}
                    </span>
                  )}
                  {brand.business_location && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm text-blue-100">
                      <MapPin className="w-3.5 h-3.5" />
                      {brand.business_location}
                    </span>
                  )}
                  {brand.business_hours && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm text-blue-100">
                      <Clock className="w-3.5 h-3.5" />
                      {brand.business_hours}
                    </span>
                  )}
                  {brand.website_url && (
                    <a
                      href={brand.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm text-blue-100 hover:bg-white/20 transition-colors"
                    >
                      <Globe className="w-3.5 h-3.5" />
                      Website
                    </a>
                  )}
                  {brand.instagram_handle && (
                    <a
                      href={`https://instagram.com/${brand.instagram_handle.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm text-blue-100 hover:bg-white/20 transition-colors"
                    >
                      <Instagram className="w-3.5 h-3.5" />
                      {brand.instagram_handle}
                    </a>
                  )}
                  {brand.facebook_page && (
                    <a
                      href={brand.facebook_page.startsWith('http') ? brand.facebook_page : `https://facebook.com/${brand.facebook_page}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm text-blue-100 hover:bg-white/20 transition-colors"
                    >
                      <Facebook className="w-3.5 h-3.5" />
                      Facebook
                    </a>
                  )}
                </div>
              </div>

              {/* Product count */}
              <div className="text-right shrink-0">
                <p className="text-4xl font-bold">{storefront?.total || 0}</p>
                <p className="text-blue-200 text-sm">Products</p>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* ── Filters ──────────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search products…"
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Category chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 flex-1">
            <button
              onClick={() => setCategory('all')}
              className={`whitespace-nowrap px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                category === 'all'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`whitespace-nowrap px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                  category === cat
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Clear */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700 font-medium shrink-0"
            >
              <X className="w-3 h-3" /> Clear
            </button>
          )}
        </div>
      </div>

      {/* ── Body ──────────────────────────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-24">
            <Loader className="w-10 h-10 text-blue-600 animate-spin" />
          </div>
        )}

        {/* Empty */}
        {!loading && products.length === 0 && (
          <div className="text-center py-24">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-500 mb-6">
              {hasActiveFilters
                ? 'Try adjusting your search or filters.'
                : 'This brand has no products listed yet.'}
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}

        {/* Product grid */}
        {!loading && products.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </main>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <footer className="border-t border-gray-200 mt-16 py-8 text-center text-sm text-gray-400">
        <p>
          Powered by{' '}
          <Link to="/" className="text-blue-600 font-medium hover:underline">
            Dexter
          </Link>
          . Want to sell your products?{' '}
          <Link to="/signup" className="text-blue-600 font-medium hover:underline">
            Sign up free
          </Link>
          .
        </p>
      </footer>
    </div>
  );
}
