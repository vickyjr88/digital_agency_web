import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { 
  Users, 
  TrendingUp, 
  DollarSign, 
  MousePointer2, 
  Award, 
  Package, 
  MessageCircle, 
  ExternalLink,
  ArrowUpRight,
  Loader
} from 'lucide-react';
import { analyticsApi } from '../../services/affiliateApi';

export default function AdminAffiliateOverview() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const response = await analyticsApi.getAdminAffiliateStats();
      setData(response.data);
    } catch (error) {
      toast.error('Failed to load affiliate stats');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader className="w-10 h-10 text-indigo-600 animate-spin" />
      </div>
    );
  }

  if (!data) return null;

  const { stats, top_influencers, top_products } = data;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={DollarSign} 
          label="Total Sales" 
          value={`KES ${stats.total_sales.toLocaleString()}`} 
          color="bg-green-50 text-green-600"
          subValue={`KES ${stats.total_platform_fees.toLocaleString()} platform fees`}
        />
        <StatCard 
          icon={TrendingUp} 
          label="Total Commissions" 
          value={`KES ${stats.total_commissions.toLocaleString()}`} 
          color="bg-indigo-50 text-indigo-600"
        />
        <StatCard 
          icon={MousePointer2} 
          label="Total Clicks" 
          value={stats.total_clicks.toLocaleString()} 
          color="bg-blue-50 text-blue-600"
          subValue={`${stats.total_influencers} registered influencers`}
        />
        <StatCard 
          icon={Users} 
          label="Active Influencers" 
          value={stats.active_influencers.toLocaleString()} 
          color="bg-purple-50 text-purple-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Influencers */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <Award className="w-5 h-5 text-yellow-500" />
              Top Influencers
            </h3>
            <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">System Wide</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">
                  <th className="px-6 py-3">Influencer</th>
                  <th className="px-6 py-3 text-center">Sales</th>
                  <th className="px-6 py-3 text-right">Volume</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {top_influencers.map((inf) => (
                  <tr key={inf.influencer_id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-bold text-gray-900">{inf.display_name}</p>
                        <p className="text-[10px] text-gray-500">@{inf.instagram_handle || 'n/a'}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-bold">
                        {inf.sales_count}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <p className="text-sm font-bold text-gray-900">KES {inf.total_sales.toLocaleString()}</p>
                      <p className="text-[10px] text-green-600">Earned: KES {inf.commission_earned.toLocaleString()}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        {inf.phone_number && (
                          <a 
                            href={`https://wa.me/${inf.phone_number.replace(/\D/g, '')}`} 
                            target="_blank" 
                            rel="noreferrer"
                            className="p-1.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-600 hover:text-white transition-all"
                            title="WhatsApp"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </a>
                        )}
                        <a 
                          href={`/shop/i/${inf.influencer_id}`} 
                          target="_blank" 
                          rel="noreferrer"
                          className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-600 hover:text-white transition-all"
                          title="Storefront"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
                {top_influencers.length === 0 && (
                  <tr>
                    <td colSpan="4" className="px-6 py-10 text-center text-gray-500 italic text-sm">
                      No influencer sales data yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <Package className="w-5 h-5 text-blue-500" />
              Top Performing Offerings
            </h3>
            <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">System Wide</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">
                  <th className="px-6 py-3">Product</th>
                  <th className="px-6 py-3 text-center">Sales</th>
                  <th className="px-6 py-3 text-right">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {top_products.map((prod) => (
                  <tr key={prod.product_id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-gray-900 truncate max-w-[200px]">{prod.product_name}</p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-sm font-medium text-gray-700">{prod.sales_count}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <p className="text-sm font-bold text-gray-900">KES {prod.total_sales.toLocaleString()}</p>
                      <p className="text-[10px] text-indigo-600">Comm: KES {prod.total_commission.toLocaleString()}</p>
                    </td>
                  </tr>
                ))}
                {top_products.length === 0 && (
                  <tr>
                    <td colSpan="3" className="px-6 py-10 text-center text-gray-500 italic text-sm">
                      No product sales data yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="p-4 bg-gray-50 border-t border-gray-100">
            <a href="/admin/commerce" className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center justify-center gap-1">
              View All Products <ArrowUpRight className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color, subValue }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${color}`}>
        <Icon className="w-6 h-6" />
      </div>
      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-2xl font-black text-gray-900">{value}</p>
      {subValue && (
        <p className="mt-2 text-[10px] font-medium text-gray-500">{subValue}</p>
      )}
    </div>
  );
}
