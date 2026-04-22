import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Package,
  ShoppingCart,
  Zap,
  Tag,
  ChevronRight,
  Loader,
  Instagram,
  Youtube,
  Globe,
  LayoutDashboard,
  ExternalLink,
  Store,
  Share2
} from 'lucide-react';
import { affiliateApi } from '../../../services/affiliateApi';
import SEO from '../../../components/SEO';
import { toast } from 'sonner';

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatPrice(value) {
  return `KES ${parseFloat(value).toLocaleString()}`;
}

function ProductCard({ product, influencerId }) {
  // Use the affiliate code for tracking
  const checkoutUrl = `/shop/p/${product.slug}?ref=${product.affiliate_code}`;

  return (
    <Link
      to={checkoutUrl}
      className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden border border-gray-100 flex flex-col"
    >
      {/* Image */}
      <div className="relative h-64 bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
        {product.thumbnail ? (
          <img
            src={product.thumbnail}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-gray-300">
            {product.is_digital ? <Zap className="w-12 h-12" /> : <Package className="w-12 h-12" />}
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {product.is_digital && (
            <span className="bg-blue-600/90 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-lg">
              <Zap className="w-3 h-3" /> Digital
            </span>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-col flex-1 p-5 gap-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded">
            {product.category || 'Product'}
          </span>
        </div>

        <h3 className="font-bold text-gray-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
          {product.name}
        </h3>

        <div className="flex items-end justify-between mt-auto pt-4 border-t border-gray-50">
          <div>
            <p className="text-xl font-black text-gray-900">
              {formatPrice(product.price)}
            </p>
          </div>
          <button className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-200 group-hover:bg-blue-700 transition-all">
            Shop <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </Link>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function InfluencerStorefront() {
  const { influencerId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStorefront();
  }, [influencerId]);

  const loadStorefront = async () => {
    try {
      setLoading(true);
      const res = await affiliateApi.getInfluencerStorefront(influencerId);
      setData(res.data);
    } catch (err) {
      console.error('Failed to load storefront:', err);
      toast.error('Storefront not found');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${data.influencer.display_name}'s Shop`,
        text: `Check out these products recommended by ${data.influencer.display_name}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader className="w-10 h-10 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 text-center">
        <Store className="w-16 h-16 text-gray-300 mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Storefront Not Found</h1>
        <p className="text-gray-500 mb-6">This creator might not have any active product promotions yet.</p>
        <Link to="/shop" className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium">
          Browse Marketplace
        </Link>
      </div>
    );
  }

  const { influencer, products } = data;

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <SEO
        title={`${influencer.display_name}'s Curated Shop | Dexter`}
        description={`Browse products curated by ${influencer.display_name}. Shop high-quality digital and physical products recommended by your favorite creator.`}
        image={influencer.profile_image_url}
        type="website"
      />

      {/* ── Hero Profile Section ────────────────────────────────────────────── */}
      <div className="relative bg-white border-b border-gray-100">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 to-transparent opacity-50 h-32" />
        
        <div className="max-w-5xl mx-auto px-4 pt-12 pb-8 relative">
          <div className="flex flex-col items-center text-center">
            {/* Avatar */}
            <div className="relative mb-6">
              <div className="w-28 h-28 rounded-3xl bg-gradient-to-tr from-blue-600 to-indigo-700 p-1 shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-500">
                <div className="w-full h-full rounded-[20px] overflow-hidden bg-white flex items-center justify-center">
                  {influencer.profile_image_url ? (
                    <img src={influencer.profile_image_url} alt={influencer.display_name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-4xl font-black text-blue-600">
                      {influencer.display_name.charAt(0)}
                    </span>
                  )}
                </div>
              </div>
              <div className="absolute -bottom-2 -right-2 bg-white p-1.5 rounded-full shadow-lg">
                <div className="bg-green-500 w-3 h-3 rounded-full border-2 border-white animate-pulse" />
              </div>
            </div>

            <h1 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">
              {influencer.display_name}
            </h1>
            
            {influencer.bio && (
              <p className="text-gray-600 max-w-xl mb-6 leading-relaxed font-medium">
                {influencer.bio}
              </p>
            )}

            {/* Social Links */}
            <div className="flex items-center gap-4 mb-8">
              {influencer.instagram_handle && (
                <a href={`https://instagram.com/${influencer.instagram_handle}`} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-xl bg-pink-50 flex items-center justify-center text-pink-600 hover:bg-pink-100 transition-colors border border-pink-100">
                  <Instagram className="w-5 h-5" />
                </a>
              )}
              {influencer.tiktok_handle && (
                <a href={`https://tiktok.com/@${influencer.tiktok_handle}`} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-xl bg-gray-900 flex items-center justify-center text-white hover:bg-black transition-colors">
                  <Globe className="w-5 h-5" />
                </a>
              )}
              {influencer.youtube_channel && (
                <a href={influencer.youtube_channel} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-600 hover:bg-red-100 transition-colors border border-red-100">
                  <Youtube className="w-5 h-5" />
                </a>
              )}
              <button onClick={handleShare} className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 hover:bg-blue-100 transition-colors border border-blue-100">
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Products Grid ─────────────────────────────────────────────────── */}
      <main className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
              <Package className="w-6 h-6 text-blue-600" />
              Curated Products
            </h2>
            <p className="text-gray-500 font-medium">Items recommended by {influencer.display_name}</p>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest bg-gray-100 px-4 py-2 rounded-xl">
            <Tag className="w-3.5 h-3.5" /> {products.length} Products
          </div>
        </div>

        {products.length === 0 ? (
          <div className="bg-white rounded-3xl border border-dashed border-gray-200 p-20 text-center">
            <Package className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No products promoted yet</h3>
            <p className="text-gray-500">Check back later for curated recommendations.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map(product => (
              <ProductCard key={product.product_id} product={product} influencerId={influencerId} />
            ))}
          </div>
        )}
      </main>

      {/* ── Sticky Footer CTA ─────────────────────────────────────────────── */}
      <footer className="bg-white border-t border-gray-100 py-12">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <Link to="/" className="inline-flex items-center gap-2 text-blue-600 font-black text-xl mb-4">
            <LayoutDashboard className="w-6 h-6" /> Dexter
          </Link>
          <p className="text-gray-500 text-sm font-medium">
            Influencer Commerce Platform. &copy; {new Date().getFullYear()} Dexter.
          </p>
        </div>
      </footer>
    </div>
  );
}
