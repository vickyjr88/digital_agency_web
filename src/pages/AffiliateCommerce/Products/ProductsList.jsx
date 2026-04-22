import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Plus,
  Search,
  Filter,
  Edit,
  Archive,
  BarChart3,
  Eye,
  Package,
  TrendingUp,
  Users,
  MousePointerClick,
  Building2,
  AlertCircle,
  UserPlus,
  X,
  Check,
  Clock,
  UserCheck,
  XCircle,
  Mail,
  Phone,
  Instagram,
  Youtube,
  ExternalLink,
} from 'lucide-react';
import { productsApi, brandProfileApi, brandsApi, affiliateApi } from '../../../services/affiliateApi';
import { useAuth } from '../../../context/AuthContext';

export default function ProductsList() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role?.toLowerCase() === 'admin' || user?.user_type?.toLowerCase() === 'admin';
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [brandProfiles, setBrandProfiles] = useState([]);   // all user profiles
  const [profileChecked, setProfileChecked] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showAffiliatesModal, setShowAffiliatesModal] = useState(false);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [loadingApprovals, setLoadingApprovals] = useState(false);

  useEffect(() => {
    checkBrandProfiles();
  }, []);

  useEffect(() => {
    if (profileChecked && (isAdmin || brandProfiles.length > 0)) {
      loadProducts();
    } else if (profileChecked && !isAdmin && brandProfiles.length === 0) {
      setLoading(false);
    }
  }, [statusFilter, profileChecked, isAdmin]);  // eslint-disable-line

  const checkBrandProfiles = async () => {
    try {
      const res = await brandProfileApi.listMyProfiles();
      setBrandProfiles(res.data || []);
    } catch {
      setBrandProfiles([]);
    } finally {
      setProfileChecked(true);
    }
  };

  const loadProducts = async () => {
    try {
      setLoading(true);
      const status = statusFilter === 'all' ? null : statusFilter;
      const response = await productsApi.getMyProducts(status);
      setProducts(response.data);
    } catch (error) {
      toast.error('Failed to load products');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleArchive = async (productId) => {
    if (!confirm('Are you sure you want to archive this product?')) return;

    try {
      await productsApi.delete(productId);
      toast.success('Product archived successfully');
      loadProducts();
    } catch (error) {
      toast.error('Failed to archive product');
    }
  };

  const loadPendingApprovals = async (productId) => {
    try {
      setLoadingApprovals(true);
      const response = await affiliateApi.getPendingApprovals();
      // Filter approvals for the selected product
      const productApprovals = response.data.filter(approval => approval.product_id === productId);
      setPendingApprovals(productApprovals);
    } catch (error) {
      console.error('Failed to load pending approvals:', error);
      toast.error('Failed to load pending approvals');
    } finally {
      setLoadingApprovals(false);
    }
  };

  const handleReviewApplication = async (approvalId, status, rejectionReason = null) => {
    try {
      await affiliateApi.reviewApplication(approvalId, { status, rejection_reason: rejectionReason });
      toast.success(status === 'approved' ? 'Affiliate approved successfully!' : 'Application rejected');
      // Reload approvals and products
      if (selectedProduct) {
        loadPendingApprovals(selectedProduct.id);
      }
      loadProducts();
    } catch (error) {
      console.error('Failed to review application:', error);
      toast.error('Failed to process application');
    }
  };

  // Load approvals when modal opens
  useEffect(() => {
    if (showAffiliatesModal && selectedProduct) {
      loadPendingApprovals(selectedProduct.id);
    }
  }, [showAffiliatesModal, selectedProduct]); // eslint-disable-line

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // ── Guards ────────────────────────────────────────────────────────────────
  if (!profileChecked || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="w-12 h-12 text-blue-600 animate-pulse mx-auto mb-4" />
          <p className="text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin && brandProfiles.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">My Products</h1>
            <p className="text-gray-600 mt-2">Manage your products available for affiliate promotion</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-amber-100 p-12 text-center max-w-lg mx-auto">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <AlertCircle className="w-8 h-8 text-amber-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Set up a brand profile first</h2>
            <p className="text-gray-500 mb-8">
              You need at least one brand profile before you can create products. Select one of your brands to get started.
            </p>
            <Link
              to="/affiliate/brand-profile"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold transition-colors"
            >
              <Building2 className="w-5 h-5" />
              Set up brand profile
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {isAdmin ? 'All System Products' : 'My Products'}
              </h1>
              <p className="text-gray-600 mt-2">
                {isAdmin ? 'Manage all products on the platform' : 'Manage your products available for affiliate promotion'}
              </p>
            </div>
            {!isAdmin && (
              <button
                onClick={() => navigate('/affiliate/products/create')}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Create Product
              </button>
            )}
          </div>

          {/* Brand profile banner */}
          {brandProfiles.length > 0 && (
            <div className="flex items-center justify-between bg-blue-50 border border-blue-100 rounded-lg px-4 py-3 mb-4 text-sm">
              <div className="flex items-center gap-2 text-blue-800 flex-wrap">
                <Building2 className="w-4 h-4 shrink-0" />
                <span className="font-medium">Selling under:</span>
                {brandProfiles.map((p, i) => (
                  <span key={p.id} className="inline-flex items-center gap-1">
                    {i > 0 && <span className="text-blue-400">·</span>}
                    <span className="font-semibold">{p.brand_name || p.business_category || 'Brand'}</span>
                  </span>
                ))}
              </div>
              <Link
                to="/affiliate/brand-profile"
                className="text-blue-600 hover:text-blue-800 font-medium underline-offset-2 hover:underline shrink-0 ml-3"
              >
                Manage profiles
              </Link>
            </div>
          )}

          {/* Stats Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Package className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Products</p>
                  <p className="text-2xl font-bold text-gray-900">{products.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Active</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {products.filter(p => p.status === 'active').length}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Archive className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Paused</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {products.filter(p => p.status === 'paused').length}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Archived</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {products.filter(p => p.status === 'archived').length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-lg shadow-sm">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchQuery ? 'No products found' : 'No products yet'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchQuery
                ? 'Try adjusting your search terms'
                : 'Create your first product to start selling through affiliates'}
            </p>
            {!searchQuery && !isAdmin && (
              <button
                onClick={() => navigate('/affiliate/products/create')}
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-5 h-5" />
                Create Product
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Product Image */}
                <div className="relative h-48 bg-gray-200">
                  {(product.images && product.images.length > 0) || product.thumbnail ? (
                    <img
                      src={(product.images && product.images.length > 0) ? product.images[0] : product.thumbnail}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-16 h-16 text-gray-400" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(product.status)}`}>
                      {product.status}
                    </span>
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
                    {product.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {product.description || 'No description'}
                  </p>

                  {/* Price & Commission */}
                  <div className="flex items-center justify-between mb-4 pb-4 border-b">
                    <div>
                      <p className="text-xs text-gray-500">Price</p>
                      <p className="text-xl font-bold text-gray-900">
                        KES {parseFloat(product.price).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Commission</p>
                      <p className="text-lg font-semibold text-blue-600">
                        {product.commission_type === 'percentage'
                          ? `${product.commission_rate}%`
                          : `KES ${parseFloat(product.fixed_commission).toLocaleString()}`
                        }
                      </p>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="text-center p-2 bg-gray-50 rounded">
                      <MousePointerClick className="w-4 h-4 text-gray-400 mx-auto mb-1" />
                      <p className="text-xs text-gray-500">Clicks</p>
                      <p className="font-semibold text-gray-900">{product.total_clicks || 0}</p>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded">
                      <Package className="w-4 h-4 text-gray-400 mx-auto mb-1" />
                      <p className="text-xs text-gray-500">Orders</p>
                      <p className="font-semibold text-gray-900">{product.total_orders || 0}</p>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded">
                      <Users className="w-4 h-4 text-gray-400 mx-auto mb-1" />
                      <p className="text-xs text-gray-500">Affiliates</p>
                      <p className="font-semibold text-gray-900">{product.active_affiliates_count || 0}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 mb-2">
                    <button
                      onClick={() => navigate(`/affiliate/products/edit/${product.id}`)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => navigate(`/shop/p/${product.slug}`)}
                      className="flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      title="View Product Page"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleArchive(product.id)}
                      className="flex items-center justify-center gap-2 px-3 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors"
                      title="Archive Product"
                    >
                      <Archive className="w-4 h-4" />
                    </button>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedProduct(product);
                      setShowAffiliatesModal(true);
                    }}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                  >
                    <UserPlus className="w-4 h-4" />
                    Manage Affiliates ({product.active_affiliates_count || 0})
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Affiliates Management Modal */}
        {showAffiliatesModal && selectedProduct && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Manage Affiliates</h2>
                  <p className="text-sm text-gray-600 mt-1">{selectedProduct.name}</p>
                </div>
                <button
                  onClick={() => setShowAffiliatesModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                {/* Info Banner */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <Users className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-blue-900 mb-1">Affiliate Program Status</h3>
                      <p className="text-sm text-blue-800">
                        This product is available in the affiliate marketplace. Influencers can generate affiliate links
                        and promote it to earn {selectedProduct.commission_type === 'percentage'
                          ? `${selectedProduct.commission_rate}%`
                          : `KES ${selectedProduct.fixed_commission}`} commission per sale.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-4 gap-4 mb-6">
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900">{selectedProduct.active_affiliates_count || 0}</p>
                    <p className="text-sm text-gray-600">Active Affiliates</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <Clock className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900">{selectedProduct.pending_approvals_count || 0}</p>
                    <p className="text-sm text-gray-600">Pending Review</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <MousePointerClick className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900">{selectedProduct.total_clicks || 0}</p>
                    <p className="text-sm text-gray-600">Total Clicks</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <Package className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900">{selectedProduct.total_orders || 0}</p>
                    <p className="text-sm text-gray-600">Total Orders</p>
                  </div>
                </div>

                {/* Pending Approvals Section */}
                {loadingApprovals ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-center">
                      <Clock className="w-8 h-8 text-blue-600 animate-pulse mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Loading pending requests...</p>
                    </div>
                  </div>
                ) : pendingApprovals.length > 0 ? (
                  <div className="mb-6">
                    <h3 className="font-semibold text-gray-900 text-lg mb-4">Pending Approval Requests</h3>
                    <div className="space-y-4">
                      {pendingApprovals.map((approval) => (
                        <div key={approval.id} className="border border-orange-200 bg-orange-50 rounded-xl p-5">
                          <div className="flex items-start gap-4 mb-4">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-xl shrink-0">
                              {approval.influencer?.name?.[0]?.toUpperCase() || approval.influencer?.display_name?.[0]?.toUpperCase() || 'I'}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-3 mb-3">
                                <div>
                                  <h4 className="font-semibold text-gray-900 text-lg">
                                    {approval.influencer?.name || approval.influencer?.display_name || 'Influencer'}
                                  </h4>
                                  {approval.influencer?.display_name && approval.influencer?.name !== approval.influencer?.display_name && (
                                    <p className="text-sm text-gray-600">@{approval.influencer.display_name}</p>
                                  )}
                                </div>
                                <Link
                                  to={`/influencer/${approval.influencer?.id}`}
                                  className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors shrink-0"
                                  title="View Full Profile"
                                >
                                  <Eye className="w-4 h-4" />
                                  View Profile
                                </Link>
                              </div>

                              {/* Contact Info */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
                                {approval.influencer?.email && (
                                  <div className="flex items-center gap-2 text-sm text-gray-700">
                                    <Mail className="w-4 h-4 text-gray-500" />
                                    <span className="truncate">{approval.influencer.email}</span>
                                  </div>
                                )}
                                {approval.influencer?.phone_number && (
                                  <div className="flex items-center gap-2 text-sm text-gray-700">
                                    <Phone className="w-4 h-4 text-gray-500" />
                                    <span>{approval.influencer.phone_number}</span>
                                  </div>
                                )}
                              </div>

                              {/* Social Stats */}
                              <div className="flex flex-wrap gap-3 mb-3">
                                {approval.influencer?.instagram_handle && (
                                  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white rounded-lg border border-gray-200">
                                    <Instagram className="w-4 h-4 text-pink-600" />
                                    <span className="text-xs font-medium text-gray-700">
                                      {approval.influencer.instagram_followers?.toLocaleString() || 0} followers
                                    </span>
                                  </div>
                                )}
                                {approval.influencer?.tiktok_handle && (
                                  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white rounded-lg border border-gray-200">
                                    <div className="w-4 h-4 bg-black rounded-sm"></div>
                                    <span className="text-xs font-medium text-gray-700">
                                      {approval.influencer.tiktok_followers?.toLocaleString() || 0} followers
                                    </span>
                                  </div>
                                )}
                                {approval.influencer?.youtube_channel && (
                                  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white rounded-lg border border-gray-200">
                                    <Youtube className="w-4 h-4 text-red-600" />
                                    <span className="text-xs font-medium text-gray-700">
                                      {approval.influencer.youtube_subscribers?.toLocaleString() || 0} subscribers
                                    </span>
                                  </div>
                                )}
                                {approval.influencer?.rating && (
                                  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white rounded-lg border border-gray-200">
                                    <span className="text-yellow-500">★</span>
                                    <span className="text-xs font-medium text-gray-700">
                                      {approval.influencer.rating.toFixed(1)} rating
                                    </span>
                                  </div>
                                )}
                              </div>

                              {/* Application Message */}
                              {approval.application_message && (
                                <div className="bg-white rounded-lg p-3 mb-3 border border-gray-200">
                                  <p className="text-xs font-medium text-gray-500 mb-1">Application Message:</p>
                                  <p className="text-sm text-gray-700">{approval.application_message}</p>
                                </div>
                              )}

                              <p className="text-xs text-gray-500">
                                Applied {new Date(approval.applied_at || approval.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleReviewApplication(approval.id, 'approved')}
                              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                            >
                              <UserCheck className="w-4 h-4" />
                              Approve Affiliate
                            </button>
                            <button
                              onClick={() => {
                                const reason = prompt('Rejection reason (optional):');
                                handleReviewApplication(approval.id, 'rejected', reason);
                              }}
                              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                            >
                              <XCircle className="w-4 h-4" />
                              Reject Application
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}

                {/* Affiliate Access Info */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900 text-lg">How Affiliates Join</h3>

                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                      <div className="w-6 h-6 rounded-full bg-green-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-medium text-green-900">Automatic Enrollment</p>
                        <p className="text-sm text-green-800">
                          All influencers can automatically browse and promote your products from the affiliate marketplace.
                          No approval needed!
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                      <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                        2
                      </div>
                      <div>
                        <p className="font-medium text-blue-900">Generate Affiliate Links</p>
                        <p className="text-sm text-blue-800">
                          Influencers visit the marketplace, select your product, and generate their unique tracking link.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                      <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                        3
                      </div>
                      <div>
                        <p className="font-medium text-blue-900">Track Performance</p>
                        <p className="text-sm text-blue-800">
                          Monitor clicks, orders, and commissions in your analytics dashboard.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-6 pt-6 border-t border-gray-200 flex gap-3">
                  <button
                    onClick={() => navigate('/affiliate/analytics')}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    <BarChart3 className="w-5 h-5" />
                    View Analytics
                  </button>
                  <button
                    onClick={() => navigate('/affiliate/marketplace')}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    <Eye className="w-5 h-5" />
                    View in Marketplace
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
