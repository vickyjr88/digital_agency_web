import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Search,
  Filter,
  Package,
  ShoppingCart,
  Zap,
  Tag,
  ChevronRight,
  LayoutDashboard,
  Loader,
  SlidersHorizontal,
  X,
  Store,
  MapPin,
  ArrowRight,
} from 'lucide-react';
import { productsApi, brandProfileApi, systemCategoriesApi } from '../../../services/affiliateApi';
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
        <div className="flex items-center gap-2">
          {product.category && (
            <span className="text-xs text-blue-600 font-medium uppercase tracking-wide">
              {product.category}
            </span>
          )}
          {product.brand_name && (
            <>
              <span className="text-xs text-gray-300">•</span>
              <Link
                to={`/shop/store/${product.brand_profile_id}`}
                onClick={e => e.stopPropagation()}
                className="text-xs text-gray-500 hover:text-blue-600 font-medium truncate transition-colors"
              >
                {product.brand_name}
              </Link>
            </>
          )}
        </div>

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

function StorefrontCard({ store }) {
  return (
    <Link
      to={`/shop/store/${store.id}`}
      className="group relative bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 p-5 flex flex-col gap-3"
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white text-lg font-bold shrink-0 group-hover:scale-105 transition-transform">
          {(store.brand_name || '?').charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors truncate">
            {store.brand_name}
          </h3>
          {store.business_category && (
            <span className="text-xs text-blue-600 font-medium">{store.business_category}</span>
          )}
        </div>
        <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all shrink-0 mt-1" />
      </div>

      {store.business_description && (
        <p className="text-sm text-gray-500 line-clamp-2">{store.business_description}</p>
      )}

      <div className="flex items-center gap-3 text-xs text-gray-400 mt-auto">
        {store.business_location && (
          <span className="flex items-center gap-1 truncate">
            <MapPin className="w-3 h-3 shrink-0" />
            {store.business_location}
          </span>
        )}
        <span className="flex items-center gap-1 ml-auto shrink-0 font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
          <Package className="w-3 h-3" />
          {store.product_count} product{store.product_count !== 1 ? 's' : ''}
        </span>
      </div>
    </Link>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function PublicShop() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [storefronts, setStorefronts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [showStorefronts, setShowStorefronts] = useState(false);

  // Filter state — initialised from URL params so links are shareable
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [category, setCategory] = useState(searchParams.get('cat') || 'all');
  const [productType, setProductType] = useState(searchParams.get('type') || 'all'); // all | digital | physical
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'newest');
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 18;

  // Debounced search value
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  // Load categories & storefronts once
  useEffect(() => {
    systemCategoriesApi.list('product').then(r => setCategories(r.data.map(c => c.name))).catch(() => {});
    brandProfileApi.listStorefronts().then(r => setStorefronts(r.data || [])).catch(() => {});
  }, []);

  // Load products whenever filters change
  useEffect(() => {
    loadProducts();
    // Sync URL params
    const params = {};
    if (debouncedSearch) params.q = debouncedSearch;
    if (category !== 'all') params.cat = category;
    if (productType !== 'all') params.type = productType;
    if (sortBy !== 'newest') params.sort = sortBy;
    setSearchParams(params, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, category, productType, sortBy, page]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const params = {
        status: 'active',
        page,
        page_size: PAGE_SIZE,
      };
      if (debouncedSearch) params.search = debouncedSearch;
      if (category !== 'all') params.category = category;

      const res = await productsApi.list(params);
      let data = res.data || [];

      // Client-side type filter (API doesn't support it yet)
      if (productType === 'digital') data = data.filter(p => p.is_digital);
      if (productType === 'physical') data = data.filter(p => !p.is_digital);

      // Client-side sort
      if (sortBy === 'price_asc') data = [...data].sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
      if (sortBy === 'price_desc') data = [...data].sort((a, b) => parseFloat(b.price) - parseFloat(a.price));

      setProducts(data);
      setTotalCount(data.length);
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setSearch('');
    setCategory('all');
    setProductType('all');
    setSortBy('newest');
    setPage(1);
  };

  const hasActiveFilters =
    debouncedSearch || category !== 'all' || productType !== 'all' || sortBy !== 'newest';

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO
        title="Dexter Shop - Buy Digital & Physical Products Online in Kenya"
        description="Browse and buy high-quality digital and physical products on Dexter Shop. Instant digital downloads, secure payments, and fast shipping across Kenya. Discover trending products today!"
        keywords="online shopping Kenya, digital products, e-commerce, buy online, instant downloads, secure payments, Dexter marketplace"
        type="website"
        image="/og-images/shop.png"
      />
      {/* ── Topbar ──────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2 text-lg font-bold text-blue-600 shrink-0">
            <LayoutDashboard className="w-5 h-5" />
            <span className="hidden sm:inline">Dexter</span>
          </Link>

          {/* Search bar */}
          <div className="relative flex-1 max-w-xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
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

          {/* Storefronts & Filter toggles */}
          <div className="flex items-center gap-2">
            {storefronts.length > 0 && (
              <button
                onClick={() => setShowStorefronts(v => !v)}
                className={`hidden sm:flex items-center gap-1.5 text-sm border rounded-lg px-3 py-2 font-medium transition-colors ${
                  showStorefronts
                    ? 'bg-blue-50 border-blue-300 text-blue-700'
                    : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Store className="w-4 h-4" />
                Brands
              </button>
            )}
            <button
              onClick={() => setShowFilters(v => !v)}
              className="md:hidden flex items-center gap-1 text-sm text-gray-600 border border-gray-300 rounded-lg px-3 py-2 hover:bg-gray-50"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
            </button>
          </div>
        </div>

        {/* Category chips + filter row */}
        <div className={`${showFilters ? 'block' : 'hidden md:block'} border-t border-gray-100 bg-white`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
            {/* Category chips row */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-2 scrollbar-hide">
              <Tag className="w-4 h-4 text-gray-400 shrink-0" />
              <button
                onClick={() => { setCategory('all'); setPage(1); }}
                className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-sm font-medium transition-all ${
                  category === 'all'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                All Categories
              </button>
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => { setCategory(cat); setPage(1); }}
                  className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-sm font-medium transition-all ${
                    category === cat
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Additional filters */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Type */}
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <select
                  value={productType}
                  onChange={e => { setProductType(e.target.value); setPage(1); }}
                  className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Types</option>
                  <option value="digital">Digital only</option>
                  <option value="physical">Physical only</option>
                </select>
              </div>

              {/* Sort */}
              <div className="flex items-center gap-2 ml-auto">
                <span className="text-sm text-gray-500">Sort:</span>
                <select
                  value={sortBy}
                  onChange={e => { setSortBy(e.target.value); setPage(1); }}
                  className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="newest">Newest</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                </select>
              </div>

              {/* Clear filters */}
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700 font-medium"
                >
                  <X className="w-3 h-3" /> Clear
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ── Body ────────────────────────────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Storefronts Section (collapsible) */}
        {showStorefronts && storefronts.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Store className="w-5 h-5 text-blue-600" />
                Brand Storefronts
              </h2>
              <button
                onClick={() => setShowStorefronts(false)}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Hide
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {storefronts.map(store => (
                <StorefrontCard key={store.id} store={store} />
              ))}
            </div>
          </div>
        )}

        {/* Page title row */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <ShoppingCart className="w-6 h-6 text-blue-600" />
              Shop
            </h1>
            {!loading && (
              <p className="text-sm text-gray-500 mt-0.5">
                {totalCount} product{totalCount !== 1 ? 's' : ''} available
              </p>
            )}
          </div>
          {storefronts.length > 0 && !showStorefronts && (
            <button
              onClick={() => setShowStorefronts(true)}
              className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              <Store className="w-4 h-4" />
              Browse Brands ({storefronts.length})
            </button>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-24">
            <Loader className="w-10 h-10 text-blue-600 animate-spin" />
          </div>
        )}

        {/* Empty state */}
        {!loading && products.length === 0 && (
          <div className="text-center py-24">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-500 mb-6">
              {hasActiveFilters
                ? 'Try adjusting your filters.'
                : 'Check back soon — new products are being added.'}
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

        {/* Simple load-more (pagination) */}
        {!loading && products.length === PAGE_SIZE && (
          <div className="flex justify-center mt-10">
            <button
              onClick={() => setPage(p => p + 1)}
              className="px-6 py-2 border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50 font-medium text-sm"
            >
              Load more
            </button>
          </div>
        )}
      </main>

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
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
