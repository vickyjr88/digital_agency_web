import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  DollarSign,
  MousePointerClick,
  ShoppingCart,
  TrendingUp,
  Percent,
  Award,
  Clock,
  Loader,
  Package
} from 'lucide-react';
import { analyticsApi } from '../../../services/affiliateApi';

export default function InfluencerDashboard() {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [topProducts, setTopProducts] = useState([]);
  const [timeRange, setTimeRange] = useState(30);

  useEffect(() => {
    loadDashboard();
  }, [timeRange]);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const [dashboardRes, productsRes] = await Promise.all([
        analyticsApi.getInfluencerDashboard(timeRange),
        analyticsApi.getInfluencerTopProducts(5)
      ]);

      setDashboardData(dashboardRes.data);
      setTopProducts(productsRes.data);
    } catch (error) {
      toast.error('Failed to load dashboard');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No data available</h3>
          <p className="text-gray-600 mb-6">Start promoting products to see your analytics</p>
          <button
            onClick={() => window.location.href = '/affiliate/marketplace'}
            className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            <TrendingUp className="w-5 h-5" />
            Browse Products
          </button>
        </div>
      </div>
    );
  }

  const stats = dashboardData.stats;
  const conversionRate = stats.total_clicks > 0
    ? ((stats.total_orders / stats.total_clicks) * 100).toFixed(2)
    : 0;
  const avgOrderValue = stats.total_orders > 0
    ? (stats.total_earnings / stats.total_orders).toFixed(2)
    : 0;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Affiliate Dashboard</h1>
              <p className="text-gray-600 mt-2">
                Track your performance and earnings
              </p>
            </div>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(parseInt(e.target.value))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value={7}>Last 7 days</option>
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 90 days</option>
              <option value={365}>Last year</option>
            </select>
          </div>
        </div>

        {/* Earnings Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white bg-opacity-20 rounded-lg">
                <DollarSign className="w-6 h-6" />
              </div>
              <TrendingUp className="w-6 h-6 opacity-75" />
            </div>
            <p className="text-sm opacity-90 mb-1">Total Earnings</p>
            <p className="text-4xl font-bold">KES {parseFloat(stats.total_earnings).toLocaleString()}</p>
            <p className="text-sm opacity-75 mt-2">From {stats.total_orders} orders</p>
          </div>

          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white bg-opacity-20 rounded-lg">
                <Clock className="w-6 h-6" />
              </div>
            </div>
            <p className="text-sm opacity-90 mb-1">Pending Commissions</p>
            <p className="text-4xl font-bold">KES {parseFloat(stats.pending_commissions).toLocaleString()}</p>
            <p className="text-sm opacity-75 mt-2">Awaiting fulfillment</p>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white bg-opacity-20 rounded-lg">
                <DollarSign className="w-6 h-6" />
              </div>
            </div>
            <p className="text-sm opacity-90 mb-1">Available to Withdraw</p>
            <p className="text-4xl font-bold">KES {parseFloat(stats.available_to_withdraw).toLocaleString()}</p>
            <p className="text-sm opacity-75 mt-2">Ready for payout</p>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <MousePointerClick className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-1">Total Clicks</p>
            <p className="text-3xl font-bold text-gray-900">{stats.total_clicks.toLocaleString()}</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <ShoppingCart className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-1">Total Orders</p>
            <p className="text-3xl font-bold text-gray-900">{stats.total_orders.toLocaleString()}</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Percent className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-1">Conversion Rate</p>
            <p className="text-3xl font-bold text-purple-600">{conversionRate}%</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-1">Avg Commission</p>
            <p className="text-2xl font-bold text-blue-600">
              KES {parseFloat(avgOrderValue).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Performance Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Conversion Funnel</h3>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Clicks</span>
                  <span className="font-semibold text-gray-900">{stats.total_clicks.toLocaleString()}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div className="bg-purple-600 h-3 rounded-full" style={{ width: '100%' }} />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Orders</span>
                  <span className="font-semibold text-gray-900">{stats.total_orders.toLocaleString()}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-green-600 h-3 rounded-full"
                    style={{ width: `${conversionRate}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">{conversionRate}% conversion rate</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Earnings Breakdown</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <span className="text-sm text-gray-700">Paid Commissions</span>
                <span className="font-semibold text-green-600">
                  KES {parseFloat(stats.total_earnings).toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <span className="text-sm text-gray-700">Pending</span>
                <span className="font-semibold text-yellow-600">
                  KES {parseFloat(stats.pending_commissions).toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <span className="text-sm text-gray-700">Available</span>
                <span className="font-semibold text-purple-600">
                  KES {parseFloat(stats.available_to_withdraw).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Top Performing Products */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Award className="w-6 h-6 text-purple-600" />
              Your Top Performing Products
            </h2>
          </div>
          {topProducts.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No product data yet</p>
              <button
                onClick={() => window.location.href = '/affiliate/marketplace'}
                className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                <TrendingUp className="w-5 h-5" />
                Browse Products to Promote
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {topProducts.map((product, index) => {
                const productConversion = product.clicks_count > 0
                  ? ((product.orders_count / product.clicks_count) * 100).toFixed(1)
                  : 0;

                return (
                  <div key={product.id} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-100 text-purple-600 font-bold">
                      #{index + 1}
                    </div>

                    {product.thumbnail ? (
                      <img
                        src={product.thumbnail}
                        alt={product.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                        <Package className="w-8 h-8 text-gray-400" />
                      </div>
                    )}

                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{product.name}</h3>
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-1 text-sm">
                          <MousePointerClick className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">{product.clicks_count} clicks</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm">
                          <ShoppingCart className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">{product.orders_count} orders</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm">
                          <Percent className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">{productConversion}% conversion</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-sm text-gray-500 mb-1">Total Earned</p>
                      <p className="text-2xl font-bold text-green-600">
                        KES {parseFloat(product.total_commission || 0).toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {product.commission_type === 'percentage'
                          ? `${product.commission_rate}% commission`
                          : `KES ${parseFloat(product.fixed_commission).toLocaleString()} per sale`
                        }
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Tips & Insights */}
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
          <h3 className="text-xl font-semibold mb-4">Performance Tips</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white bg-opacity-10 rounded-lg p-4">
              <h4 className="font-semibold mb-2">Increase Your Clicks</h4>
              <p className="text-sm opacity-90">
                Share your affiliate links on multiple platforms and create engaging content around the products
              </p>
            </div>
            <div className="bg-white bg-opacity-10 rounded-lg p-4">
              <h4 className="font-semibold mb-2">Improve Conversion Rate</h4>
              <p className="text-sm opacity-90">
                Promote products that align with your audience's interests and provide honest reviews
              </p>
            </div>
            <div className="bg-white bg-opacity-10 rounded-lg p-4">
              <h4 className="font-semibold mb-2">Track Performance</h4>
              <p className="text-sm opacity-90">
                Monitor which products perform best and focus on promoting similar items
              </p>
            </div>
            <div className="bg-white bg-opacity-10 rounded-lg p-4">
              <h4 className="font-semibold mb-2">Maximize Earnings</h4>
              <p className="text-sm opacity-90">
                Look for products with higher commission rates and promote during peak shopping seasons
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
