import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { 
  Users, 
  Search, 
  MessageCircle, 
  Instagram, 
  Youtube, 
  Mail, 
  Phone, 
  ExternalLink,
  Award,
  Filter,
  Loader
} from 'lucide-react';
import { affiliateApi } from '../../../services/affiliateApi';

export default function BrandInfluencers() {
  const [influencers, setInfluencers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadInfluencers();
  }, []);

  const loadInfluencers = async () => {
    try {
      setLoading(true);
      const response = await affiliateApi.getBrandInfluencers();
      setInfluencers(response.data || []);
    } catch (error) {
      toast.error('Failed to load influencers');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredInfluencers = influencers.filter(inf => 
    inf.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    inf.instagram_handle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    inf.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader className="w-12 h-12 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Users className="w-8 h-8 text-blue-600" />
            My Influencers
          </h1>
          <p className="mt-2 text-gray-600">
            Manage and communicate with influencers promoting your products.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search influencers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[280px]"
            />
          </div>
        </div>
      </div>

      {filteredInfluencers.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-10 h-10 text-gray-300" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No influencers found</h3>
          <p className="text-gray-500 max-w-md mx-auto">
            {searchQuery 
              ? "We couldn't find any influencers matching your search." 
              : "You don't have any approved influencers yet. Go to Pending Requests to approve some!"}
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredInfluencers.map((influencer) => (
            <div key={influencer.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all group">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xl font-bold shadow-lg">
                      {influencer.display_name?.[0]?.toUpperCase() || 'I'}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {influencer.display_name || 'Anonymous'}
                      </h3>
                      <p className="text-sm text-gray-500">@{influencer.instagram_handle || 'n/a'}</p>
                    </div>
                  </div>
                  {influencer.rating && (
                    <div className="flex items-center gap-1 bg-yellow-50 text-yellow-700 px-2 py-1 rounded-lg text-xs font-bold">
                      <Award className="w-3 h-3" />
                      {influencer.rating}
                    </div>
                  )}
                </div>

                <div className="space-y-3 mb-6">
                  {influencer.instagram_handle && (
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Instagram className="w-4 h-4 text-pink-600" />
                        <span>Instagram</span>
                      </div>
                      <span className="font-semibold text-gray-900">
                        {influencer.instagram_followers?.toLocaleString() || 0}
                      </span>
                    </div>
                  )}
                  {influencer.youtube_channel && (
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Youtube className="w-4 h-4 text-red-600" />
                        <span>YouTube</span>
                      </div>
                      <span className="font-semibold text-gray-900">
                        {influencer.youtube_subscribers?.toLocaleString() || 0}
                      </span>
                    </div>
                  )}
                  <div className="pt-3 border-t border-gray-50">
                    <div className="flex flex-col gap-2">
                      {influencer.email && (
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Mail className="w-3.5 h-3.5" /> {influencer.email}
                        </div>
                      )}
                      {influencer.phone_number && (
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Phone className="w-3.5 h-3.5" /> {influencer.phone_number}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  {influencer.phone_number && (
                    <a
                      href={`https://wa.me/${influencer.phone_number.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 bg-green-50 text-green-700 hover:bg-green-600 hover:text-white py-2.5 rounded-xl font-medium flex items-center justify-center gap-2 transition-all"
                    >
                      <MessageCircle className="w-4 h-4" />
                      WhatsApp
                    </a>
                  )}
                  <a
                    href={`/shop/i/${influencer.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white py-2.5 rounded-xl font-medium flex items-center justify-center gap-2 transition-all"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Storefront
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
