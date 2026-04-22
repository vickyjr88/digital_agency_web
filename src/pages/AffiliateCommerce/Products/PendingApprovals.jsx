import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Check, X, Clock, Users, Mail, Phone, Instagram, Youtube, ExternalLink, ShieldCheck, MessageCircle } from 'lucide-react';
import { affiliateApi } from '../../../services/affiliateApi';
import { useAuth } from '../../../context/AuthContext';

export default function PendingApprovals() {
  const { user } = useAuth();
  const isAdmin = user?.role?.toLowerCase() === 'admin' || user?.user_type?.toLowerCase() === 'admin';
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadApprovals();
  }, []);

  const loadApprovals = async () => {
    try {
      setLoading(true);
      const response = await affiliateApi.getPendingApprovals();
      setApprovals(response.data || []);
    } catch (error) {
      toast.error('Failed to load pending requests');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (approvalId, status) => {
    try {
      let reason = null;
      if (status === 'rejected') {
        reason = prompt('Optional: Provide a reason for rejection');
      }
      
      await affiliateApi.reviewApplication(approvalId, { status, rejection_reason: reason });
      toast.success(`Application ${status} successfully`);
      loadApprovals();
    } catch (error) {
      toast.error('Failed to review application');
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <ShieldCheck className="w-8 h-8 text-blue-600" />
          {isAdmin ? 'All Pending Affiliate Requests' : 'Pending Affiliate Requests'}
        </h1>
        <p className="mt-2 text-gray-600">
          {isAdmin 
            ? 'Review and approve influencers applying to any product on the system.' 
            : 'Review and approve influencers who want to promote your products.'}
        </p>
      </div>

      {approvals.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-10 h-10 text-gray-300" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">You're all caught up!</h3>
          <p className="text-gray-500">There are no pending affiliate requests at the moment.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {approvals.map((approval) => (
            <div key={approval.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-6 md:flex gap-6 items-start">
                {/* Influencer Profile Snapshot */}
                <div className="md:w-1/3 border-b md:border-b-0 md:border-r border-gray-100 pb-6 md:pb-0 md:pr-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xl font-bold">
                      {approval.influencer?.display_name?.[0]?.toUpperCase() || 'I'}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-gray-900">{approval.influencer?.display_name || 'Anonymous User'}</h3>
                      <p className="text-sm text-gray-500">ID: {approval.influencer?.id?.substring(0, 8)}...</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {approval.influencer?.instagram_handle && (
                      <div className="flex items-center gap-3 text-sm">
                        <Instagram className="w-4 h-4 text-pink-600" />
                        <a href={`https://instagram.com/${approval.influencer.instagram_handle}`} target="_blank" rel="noreferrer" className="text-gray-700 hover:text-blue-600">
                          @{approval.influencer.instagram_handle}
                        </a>
                        <span className="text-xs bg-pink-50 text-pink-700 px-2 py-0.5 rounded-full ml-auto">
                          {approval.influencer.instagram_followers?.toLocaleString() || 0} followers
                        </span>
                      </div>
                    )}
                    
                    {approval.influencer?.youtube_channel && (
                      <div className="flex items-center gap-3 text-sm">
                        <Youtube className="w-4 h-4 text-red-600" />
                        <span className="text-gray-700 truncate">{approval.influencer.youtube_channel}</span>
                        <span className="text-xs bg-red-50 text-red-700 px-2 py-0.5 rounded-full ml-auto">
                          {approval.influencer.youtube_subscribers?.toLocaleString() || 0} subs
                        </span>
                      </div>
                    )}
                    
                    <div className="pt-3 border-t border-gray-50 flex flex-col gap-2">
                      {approval.influencer?.email && (
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Mail className="w-4 h-4" /> {approval.influencer.email}
                        </div>
                      )}
                      {approval.influencer?.phone_number && (
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <a 
                            href={`https://wa.me/${approval.influencer.phone_number.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-gray-700 hover:text-green-600 flex items-center gap-1"
                          >
                            {approval.influencer.phone_number}
                            <MessageCircle className="w-3 h-3" />
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Application Details */}
                <div className="md:w-2/3 pt-6 md:pt-0 flex flex-col h-full">
                  <div className="mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                      <Clock className="w-4 h-4" />
                      Applied on {new Date(approval.applied_at || approval.created_at).toLocaleDateString()}
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">Wants to promote:</h4>
                    <Link to={`/affiliate/products/edit/${approval.product_id}`} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium">
                      <ExternalLink className="w-4 h-4" />
                      View Product Details
                    </Link>
                  </div>
                  
                  {approval.application_message && (
                    <div className="bg-gray-50 rounded-xl p-4 mb-6 relative">
                      <div className="absolute top-0 left-4 transform -translate-y-1/2 bg-gray-50 px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Message from Influencer
                      </div>
                      <p className="text-gray-700 text-sm italic">"{approval.application_message}"</p>
                    </div>
                  )}
                  
                  <div className="mt-auto flex gap-3">
                    <button
                      onClick={() => handleReview(approval.id, 'approved')}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2.5 px-4 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors"
                    >
                      <Check className="w-5 h-5" />
                      Approve
                    </button>
                    <button
                      onClick={() => handleReview(approval.id, 'rejected')}
                      className="flex-1 bg-white border border-red-200 text-red-600 hover:bg-red-50 py-2.5 px-4 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors"
                    >
                      <X className="w-5 h-5" />
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
