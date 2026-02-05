import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  Package,
  Users,
  MousePointerClick,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  Percent,
  Award,
  Loader
} from 'lucide-react';
import { analyticsApi } from '../../../services/affiliateApi';

export default function BrandDashboard() {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [topProducts, setTopProducts] = useState([]);
  const [topAffiliates, setTopAffiliates] = useState([]);
  const [timeRange, setTimeRange] = useState(30);

  useEffect(() => {
    loadDashboard();
  }, [timeRange]);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const [dashboardRes, productsRes, affiliatesRes] = await Promise.all([
        analyticsApi.getBrandDashboard(timeRange),
        analyticsApi.getBrandTopProducts(5),
        analyticsApi.getBrandTopAffiliates(10)
      ]);

      setDashboardData(dashboardRes.data);
      setTopProducts(productsRes.data);
      setTopAffiliates(affiliatesRes.data);
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
          <p className="text-gray-600">Start adding products to see your analytics</p>
        </div>
      </div>
    );
  }

  const stats = dashboardData.stats;
  const conversionRate = stats.total_clicks > 0
    ? ((stats.total_orders / stats.total_clicks) * 100).toFixed(2)
    : 0;
  const avgOrderValue = stats.total_orders > 0
    ? (stats.total_sales / stats.total_orders).toFixed(2)
    : 0;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Brand Analytics</h1>
              <p className="text-gray-600 mt-2">
                Track your affiliate program performance
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

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Package className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-1">Total Products</p>
            <p className="text-3xl font-bold text-gray-900">{stats.total_products}</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-1">Active Affiliates</p>
            <p className="text-3xl font-bold text-gray-900">{stats.active_affiliates}</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <MousePointerClick className="w-6 h-6 text-yellow-600" />
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
        </div>

        {/* Revenue Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white bg-opacity-20 rounded-lg">
                <DollarSign className="w-6 h-6" />
              </div>
              <TrendingUp className="w-6 h-6 opacity-75" />
            </div>
            <p className="text-sm opacity-90 mb-1">Total Sales</p>
            <p className="text-4xl font-bold">KES {parseFloat(stats.total_sales).toLocaleString()}</p>
            <p className="text-sm opacity-75 mt-2">From {stats.total_orders} orders</p>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white bg-opacity-20 rounded-lg">
                <DollarSign className="w-6 h-6" />
              </div>
            </div>
            <p className="text-sm opacity-90 mb-1">Commissions Paid</p>
            <p className="text-4xl font-bold">KES {parseFloat(stats.commissions_paid).toLocaleString()}</p>
            <p className="text-sm opacity-75 mt-2">To affiliates</p>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white bg-opacity-20 rounded-lg">
                <DollarSign className="w-6 h-6" />
              </div>
            </div>
            <p className="text-sm opacity-90 mb-1">Platform Fees</p>
            <p className="text-4xl font-bold">KES {parseFloat(stats.platform_fees).toLocaleString()}</p>
            <p className="text-sm opacity-75 mt-2">Deducted from commissions</p>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Percent className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Conversion Rate</p>
                <p className="text-3xl font-bold text-purple-600">{conversionRate}%</p>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-purple-600 h-2 rounded-full transition-all"
                style={{ width: `${Math.min(parseFloat(conversionRate), 100)}%` }}
              />
            </div>
            <p className="text-sm text-gray-500 mt-2">
              {stats.total_orders} orders from {stats.total_clicks} clicks
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <ShoppingCart className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Avg Order Value</p>
                <p className="text-3xl font-bold text-blue-600">
                  KES {parseFloat(avgOrderValue).toLocaleString()}
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-500">
              Total sales: KES {parseFloat(stats.total_sales).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Award className="w-6 h-6 text-purple-600" />
              Top Performing Products
            </h2>
          </div>
          {topProducts.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No data available</p>
          ) : (
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div key={product.id} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 text-purple-600 font-bold text-sm">
                    #{index + 1}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{product.name}</h3>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                      <span>{product.orders_count} orders</span>
                      <span>{product.clicks_count} clicks</span>
                      <span>{product.affiliates_count} affiliates</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-green-600">
                      KES {parseFloat(product.total_sales || 0).toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500">Total Sales</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Affiliates */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Users className="w-6 h-6 text-purple-600" />
              Top Performing Affiliates
            </h2>
          </div>
          {topAffiliates.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No data available</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Rank</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Affiliate</th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-gray-600">Clicks</th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-gray-600">Orders</th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-gray-600">Conversion</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">Sales</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">Commission</th>
                  </tr>
                </thead>
                <tbody>
                  {topAffiliates.map((affiliate, index) => (
                    <tr key={affiliate.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-purple-100 text-purple-600 font-bold text-xs">
                          {index + 1}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-gray-900">{affiliate.name || 'Unknown'}</p>
                          <p className="text-sm text-gray-500">@{affiliate.instagram_handle || 'N/A'}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center text-gray-900">{affiliate.clicks_count || 0}</td>
                      <td className="py-3 px-4 text-center text-gray-900">{affiliate.orders_count || 0}</td>
                      <td className="py-3 px-4 text-center">
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                          {affiliate.clicks_count > 0
                            ? ((affiliate.orders_count / affiliate.clicks_count) * 100).toFixed(1)
                            : 0}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-gray-900">
                        KES {parseFloat(affiliate.total_sales || 0).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-green-600">
                        KES {parseFloat(affiliate.total_commission || 0).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
