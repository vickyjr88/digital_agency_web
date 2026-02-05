import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  Package,
  Filter,
  Search,
  DollarSign,
  CheckCircle,
  Clock,
  XCircle,
  TrendingUp,
  Loader,
  Copy,
  ExternalLink
} from 'lucide-react';
import { ordersApi, affiliateApi } from '../../../services/affiliateApi';

export default function InfluencerOrders() {
  const [orders, setOrders] = useState([]);
  const [myLinks, setMyLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    fulfilled: 0,
    totalEarnings: 0,
    pendingEarnings: 0
  });

  useEffect(() => {
    loadData();
  }, [statusFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      const status = statusFilter === 'all' ? null : statusFilter;
      const [ordersRes, linksRes] = await Promise.all([
        ordersApi.getInfluencerOrders(status),
        affiliateApi.getMyLinks()
      ]);

      setOrders(ordersRes.data);
      setMyLinks(linksRes.data);

      // Calculate stats
      const allOrders = ordersRes.data;
      const totalEarnings = allOrders
        .filter(o => o.status === 'fulfilled')
        .reduce((sum, o) => sum + parseFloat(o.commission?.net_commission || 0), 0);
      const pendingEarnings = allOrders
        .filter(o => o.status !== 'fulfilled' && o.status !== 'cancelled')
        .reduce((sum, o) => sum + parseFloat(o.commission?.net_commission || 0), 0);

      setStats({
        total: allOrders.length,
        pending: allOrders.filter(o => o.status === 'pending' || o.status === 'in_progress').length,
        fulfilled: allOrders.filter(o => o.status === 'fulfilled').length,
        totalEarnings,
        pendingEarnings
      });
    } catch (error) {
      toast.error('Failed to load orders');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Link copied to clipboard!');
  };

  const generateAffiliateUrl = (productSlug, affiliateCode) => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/shop/p/${productSlug}?ref=${affiliateCode}`;
  };

  const filteredOrders = orders.filter(order =>
    order.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.product?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.customer_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'contacted': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-purple-100 text-purple-800';
      case 'fulfilled': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'fulfilled': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      default: return <Package className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
          <p className="text-gray-600 mt-2">
            Track orders from your affiliate links and view your earnings
          </p>
        </div>

        {/* Earnings Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Package className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
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
                <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Fulfilled</p>
                <p className="text-2xl font-bold text-gray-900">{stats.fulfilled}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Earnings</p>
                <p className="text-xl font-bold text-green-600">
                  KES {stats.totalEarnings.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Pending Earnings</p>
                <p className="text-xl font-bold text-yellow-600">
                  KES {stats.pendingEarnings.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* My Affiliate Links */}
        {myLinks.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">My Affiliate Links</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {myLinks.slice(0, 4).map((link) => (
                <div key={link.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{link.product?.name}</p>
                      <p className="text-sm text-gray-500">Code: {link.code}</p>
                    </div>
                    <span className="text-sm font-semibold text-green-600">
                      {link.product?.commission_type === 'percentage'
                        ? `${link.product?.commission_rate}%`
                        : `KES ${parseFloat(link.product?.fixed_commission).toLocaleString()}`
                      }
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <input
                      type="text"
                      value={generateAffiliateUrl(link.product?.slug, link.code)}
                      readOnly
                      className="flex-1 px-3 py-1 text-sm border border-gray-300 rounded bg-gray-50 font-mono"
                    />
                    <button
                      onClick={() => copyToClipboard(generateAffiliateUrl(link.product?.slug, link.code))}
                      className="p-2 border border-gray-300 rounded hover:bg-gray-50"
                      title="Copy link"
                    >
                      <Copy className="w-4 h-4 text-gray-600" />
                    </button>
                    <a
                      href={generateAffiliateUrl(link.product?.slug, link.code)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 border border-gray-300 rounded hover:bg-gray-50"
                      title="Open link"
                    >
                      <ExternalLink className="w-4 h-4 text-gray-600" />
                    </a>
                  </div>
                  <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
                    <span>Clicks: {link.clicks_count || 0}</span>
                    <span>Orders: {link.orders_count || 0}</span>
                  </div>
                </div>
              ))}
            </div>
            {myLinks.length > 4 && (
              <button
                onClick={() => toast.info('View all links page coming soon!')}
                className="mt-4 text-purple-600 hover:text-purple-700 text-sm font-medium"
              >
                View all {myLinks.length} links →
              </button>
            )}
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search orders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">All Orders</option>
                <option value="pending">Pending</option>
                <option value="contacted">Contacted</option>
                <option value="in_progress">In Progress</option>
                <option value="fulfilled">Fulfilled</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchQuery ? 'No orders found' : 'No orders yet'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchQuery
                ? 'Try adjusting your search terms'
                : 'Share your affiliate links to start earning commissions'}
            </p>
            {!searchQuery && myLinks.length === 0 && (
              <button
                onClick={() => window.location.href = '/affiliate/marketplace'}
                className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                <TrendingUp className="w-5 h-5" />
                Browse Products
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                  {/* Order Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {order.order_number}
                          </h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(order.status)}`}>
                            {getStatusIcon(order.status)}
                            {order.status.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="text-gray-600">
                          {order.product?.name} x {order.quantity}
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatDate(order.created_at)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Order Total</p>
                        <p className="text-xl font-bold text-gray-900">
                          KES {parseFloat(order.total_amount).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* Customer Info */}
                    <div className="p-4 bg-gray-50 rounded-lg mb-4">
                      <p className="text-sm text-gray-600 mb-1">Customer: {order.customer_name}</p>
                      <p className="text-sm text-gray-500">Ordered on {formatDate(order.created_at)}</p>
                    </div>

                    {/* Commission Info */}
                    <div className={`flex items-center justify-between p-4 rounded-lg ${
                      order.status === 'fulfilled'
                        ? 'bg-green-50 border border-green-200'
                        : 'bg-yellow-50 border border-yellow-200'
                    }`}>
                      <div className="flex items-center gap-2">
                        <DollarSign className={`w-5 h-5 ${
                          order.status === 'fulfilled' ? 'text-green-600' : 'text-yellow-600'
                        }`} />
                        <div>
                          <p className={`text-sm font-medium ${
                            order.status === 'fulfilled' ? 'text-green-900' : 'text-yellow-900'
                          }`}>
                            Your Commission: KES {parseFloat(order.commission?.net_commission || 0).toLocaleString()}
                          </p>
                          <p className={`text-xs ${
                            order.status === 'fulfilled' ? 'text-green-700' : 'text-yellow-700'
                          }`}>
                            Gross: KES {parseFloat(order.commission?.gross_commission || 0).toLocaleString()} -
                            Platform Fee: KES {parseFloat(order.commission?.platform_fee_amount || 0).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div>
                        {order.status === 'fulfilled' ? (
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                            <span className="text-sm font-medium text-green-700">Paid</span>
                          </div>
                        ) : order.status === 'cancelled' ? (
                          <span className="text-xs font-medium text-red-700 bg-red-100 px-2 py-1 rounded">
                            Cancelled
                          </span>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Clock className="w-5 h-5 text-yellow-600" />
                            <span className="text-sm font-medium text-yellow-700">Pending</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
