import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Search,
  Filter,
  Package,
  TrendingUp,
  CheckCircle,
  Clock,
  Percent,
  DollarSign,
  Eye,
  Loader
} from 'lucide-react';
import { productsApi, affiliateApi } from '../../../services/affiliateApi';

export default function ProductMarketplace() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [commissionFilter, setCommissionFilter] = useState('all');
  const [categories, setCategories] = useState([]);
  const [applying, setApplying] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [productsRes, applicationsRes, categoriesRes] = await Promise.all([
        productsApi.list({ status: 'active' }),
        affiliateApi.getMyApplications(),
        productsApi.getCategories()
      ]);

      setProducts(productsRes.data);
      setMyApplications(applicationsRes.data);
      setCategories(categoriesRes.data);
    } catch (error) {
      toast.error('Failed to load products');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (productId) => {
    try {
      setApplying(productId);
      await affiliateApi.apply({ product_id: productId });
      toast.success('Application submitted successfully!');

      // Reload applications
      const response = await affiliateApi.getMyApplications();
      setMyApplications(response.data);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to apply');
    } finally {
      setApplying(null);
    }
  };

  const getApplicationStatus = (productId) => {
    const application = myApplications.find(app => app.product_id === productId);
    return application?.status || null;
  };

  const filteredProducts = products.filter(product => {
    // Search filter
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description?.toLowerCase().includes(searchQuery.toLowerCase());

    // Category filter
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;

    // Commission filter
    let matchesCommission = true;
    if (commissionFilter === 'high') {
      matchesCommission = product.commission_type === 'percentage'
        ? parseFloat(product.commission_rate) >= 20
        : parseFloat(product.fixed_commission) >= 1000;
    } else if (commissionFilter === 'medium') {
      matchesCommission = product.commission_type === 'percentage'
        ? parseFloat(product.commission_rate) >= 10 && parseFloat(product.commission_rate) < 20
        : parseFloat(product.fixed_commission) >= 500 && parseFloat(product.fixed_commission) < 1000;
    } else if (commissionFilter === 'low') {
      matchesCommission = product.commission_type === 'percentage'
        ? parseFloat(product.commission_rate) < 10
        : parseFloat(product.fixed_commission) < 500;
    }

    return matchesSearch && matchesCategory && matchesCommission;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading marketplace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Product Marketplace</h1>
          <p className="text-gray-600 mt-2">
            Browse and apply to promote products from brands
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Package className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Available Products</p>
                <p className="text-2xl font-bold text-gray-900">{products.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-gray-900">
                  {myApplications.filter(app => app.status === 'approved').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">
                  {myApplications.filter(app => app.status === 'pending').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="grid md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Commission Filter */}
            <div className="flex items-center gap-2">
              <Percent className="w-5 h-5 text-gray-400" />
              <select
                value={commissionFilter}
                onChange={(e) => setCommissionFilter(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">All Commissions</option>
                <option value="high">High (20%+ or 1000+ KES)</option>
                <option value="medium">Medium (10-20% or 500-1000 KES)</option>
                <option value="low">Low (&lt;10% or &lt;500 KES)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No products found
            </h3>
            <p className="text-gray-600">
              Try adjusting your filters or check back later for new products
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => {
              const applicationStatus = getApplicationStatus(product.id);

              return (
                <div
                  key={product.id}
                  className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                >
                  {/* Product Image */}
                  <div className="relative h-48 bg-gray-200">
                    {product.thumbnail ? (
                      <img
                        src={product.thumbnail}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-16 h-16 text-gray-400" />
                      </div>
                    )}
                    {product.compare_at_price && parseFloat(product.compare_at_price) > parseFloat(product.price) && (
                      <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
                        SALE
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
                      {product.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {product.description || 'No description'}
                    </p>

                    {/* Category */}
                    {product.category && (
                      <div className="mb-3">
                        <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                          {product.category}
                        </span>
                      </div>
                    )}

                    {/* Price & Commission */}
                    <div className="flex items-center justify-between mb-4 pb-4 border-b">
                      <div>
                        <p className="text-xs text-gray-500">Price</p>
                        <p className="text-lg font-bold text-gray-900">
                          KES {parseFloat(product.price).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">Your Commission</p>
                        <p className="text-xl font-bold text-green-600">
                          {product.commission_type === 'percentage'
                            ? `${product.commission_rate}%`
                            : `KES ${parseFloat(product.fixed_commission).toLocaleString()}`
                          }
                        </p>
                      </div>
                    </div>

                    {/* Commission Preview */}
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                      <p className="text-xs text-green-700 mb-1">Estimated Earnings per Sale:</p>
                      <p className="text-lg font-bold text-green-700">
                        {product.commission_type === 'percentage'
                          ? `KES ${(parseFloat(product.price) * parseFloat(product.commission_rate) / 100 * 0.9).toLocaleString()}`
                          : `KES ${(parseFloat(product.fixed_commission) * 0.9).toLocaleString()}`
                        }
                      </p>
                      <p className="text-xs text-green-600 mt-1">(After 10% platform fee)</p>
                    </div>

                    {/* Action Button */}
                    {applicationStatus === 'approved' ? (
                      <button
                        onClick={() => navigate('/affiliate/my-links')}
                        className="w-full px-4 py-2 bg-green-100 text-green-700 rounded-lg font-medium flex items-center justify-center gap-2"
                      >
                        <CheckCircle className="w-5 h-5" />
                        Approved - View Link
                      </button>
                    ) : applicationStatus === 'pending' ? (
                      <button
                        disabled
                        className="w-full px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg font-medium flex items-center justify-center gap-2"
                      >
                        <Clock className="w-5 h-5" />
                        Pending Review
                      </button>
                    ) : applicationStatus === 'rejected' ? (
                      <button
                        disabled
                        className="w-full px-4 py-2 bg-red-100 text-red-700 rounded-lg font-medium flex items-center justify-center gap-2"
                      >
                        Application Rejected
                      </button>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          onClick={() => navigate(`/shop/p/${product.slug}`)}
                          className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2"
                        >
                          <Eye className="w-4 h-4" />
                          Preview
                        </button>
                        <button
                          onClick={() => handleApply(product.id)}
                          disabled={applying === product.id}
                          className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 font-medium flex items-center justify-center gap-2"
                        >
                          {applying === product.id ? (
                            <>
                              <Loader className="w-4 h-4 animate-spin" />
                              Applying...
                            </>
                          ) : (
                            <>
                              <TrendingUp className="w-4 h-4" />
                              Apply
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
