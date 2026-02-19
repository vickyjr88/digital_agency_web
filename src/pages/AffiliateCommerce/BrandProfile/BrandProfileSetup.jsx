import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Building2, Phone, MapPin, Clock, Mail, Globe,
  Instagram, Facebook, Save, ArrowLeft, ChevronDown,
  CheckCircle, Loader,
} from 'lucide-react';
import { brandsApi, brandProfileApi } from '../../../services/affiliateApi';

export default function BrandProfileSetup() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // ── State ────────────────────────────────────────────────────────────────
  const [brands, setBrands] = useState([]);
  const [loadingBrands, setLoadingBrands] = useState(true);
  const [selectedBrandId, setSelectedBrandId] = useState(searchParams.get('brand_id') || '');
  const [existingProfile, setExistingProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    whatsapp_number: '',
    business_location: '',
    business_hours: '',
    preferred_contact_method: 'whatsapp',
    phone_number: '',
    business_email: '',
    website_url: '',
    instagram_handle: '',
    facebook_page: '',
    business_description: '',
    business_category: '',
    auto_approve_influencers: false,
  });

  // ── Load brands on mount ─────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const res = await brandsApi.list();
        setBrands(res.data || []);
        // Auto-select if only one brand or query param given
        if (!selectedBrandId && res.data?.length === 1) {
          setSelectedBrandId(res.data[0].id);
        }
      } catch {
        toast.error('Failed to load your brands');
      } finally {
        setLoadingBrands(false);
      }
    })();
  }, []);

  // ── Load profile whenever brand selection changes ────────────────────────
  useEffect(() => {
    if (!selectedBrandId) {
      setExistingProfile(null);
      resetForm();
      return;
    }
    (async () => {
      setLoadingProfile(true);
      try {
        const res = await brandProfileApi.getForBrand(selectedBrandId);
        setExistingProfile(res.data);
        setFormData({
          whatsapp_number: res.data.whatsapp_number || '',
          business_location: res.data.business_location || '',
          business_hours: res.data.business_hours || '',
          preferred_contact_method: res.data.preferred_contact_method || 'whatsapp',
          phone_number: res.data.phone_number || '',
          business_email: res.data.business_email || '',
          website_url: res.data.website_url || '',
          instagram_handle: res.data.instagram_handle || '',
          facebook_page: res.data.facebook_page || '',
          business_description: res.data.business_description || '',
          business_category: res.data.business_category || '',
          auto_approve_influencers: res.data.auto_approve_influencers || false,
        });
      } catch (err) {
        if (err.response?.status === 404) {
          // No profile yet for this brand — clear form
          setExistingProfile(null);
          resetForm();
        } else {
          toast.error('Failed to load brand profile');
        }
      } finally {
        setLoadingProfile(false);
      }
    })();
  }, [selectedBrandId]);

  const resetForm = () => setFormData({
    whatsapp_number: '',
    business_location: '',
    business_hours: '',
    preferred_contact_method: 'whatsapp',
    phone_number: '',
    business_email: '',
    website_url: '',
    instagram_handle: '',
    facebook_page: '',
    business_description: '',
    business_category: '',
    auto_approve_influencers: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedBrandId) {
      toast.error('Please select a brand first');
      return;
    }
    setSaving(true);
    try {
      if (existingProfile) {
        await brandProfileApi.updateForBrand(selectedBrandId, formData);
        toast.success('Brand profile updated successfully!');
      } else {
        await brandProfileApi.create({ brand_id: selectedBrandId, ...formData });
        toast.success('Brand profile created successfully!');
      }
      navigate('/affiliate/products');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to save brand profile');
    } finally {
      setSaving(false);
    }
  };

  // ── Loading brands ────────────────────────────────────────────────────────
  if (loadingBrands) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader className="w-8 h-8 text-purple-600 animate-spin" />
      </div>
    );
  }

  // ── No brands yet ─────────────────────────────────────────────────────────
  if (brands.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <Building2 className="w-8 h-8 text-purple-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No brands found</h2>
          <p className="text-gray-500 mb-8">
            You need to create a brand in the dashboard before setting up an affiliate shop profile.
          </p>
          <button
            onClick={() => navigate('/my-brands')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 font-semibold"
          >
            <Building2 className="w-5 h-5" />
            Create a brand
          </button>
        </div>
      </div>
    );
  }

  // ── Main form ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Brand Profile Setup</h1>
          <p className="text-gray-600 mt-2">
            Set up contact information for each brand you want to sell through
          </p>
        </div>

        {/* ── Brand picker ──────────────────────────────────────────────── */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-purple-600" />
            Select brand
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {brands.map(brand => (
              <button
                key={brand.id}
                type="button"
                onClick={() => setSelectedBrandId(brand.id)}
                className={`relative flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all
                  ${selectedBrandId === brand.id
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'}`}
              >
                {/* Logo or initials */}
                {brand.logo_url ? (
                  <img src={brand.logo_url} alt={brand.name} className="w-10 h-10 rounded-lg object-cover shrink-0" />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center shrink-0 text-purple-700 font-bold text-lg">
                    {brand.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">{brand.name}</p>
                  {brand.industry && (
                    <p className="text-xs text-gray-500 truncate">{brand.industry}</p>
                  )}
                </div>
                {selectedBrandId === brand.id && (
                  <CheckCircle className="w-5 h-5 text-purple-600 shrink-0" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* ── Profile status for selected brand ────────────────────────── */}
        {selectedBrandId && (
          <div className={`flex items-center gap-2 px-4 py-3 rounded-lg mb-6 text-sm font-medium
            ${existingProfile
              ? 'bg-green-50 border border-green-200 text-green-800'
              : 'bg-amber-50 border border-amber-200 text-amber-800'}`}
          >
            {loadingProfile ? (
              <Loader className="w-4 h-4 animate-spin" />
            ) : existingProfile ? (
              <><CheckCircle className="w-4 h-4" /> Profile exists — editing it below</>
            ) : (
              <><Building2 className="w-4 h-4" /> No profile yet — fill in the details below to create one</>
            )}
          </div>
        )}

        {/* ── Contact form (shown only when a brand is selected) ────────── */}
        {selectedBrandId && !loadingProfile && (
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-6">

            {/* Contact Information */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Phone className="w-5 h-5 text-purple-600" />
                Contact Information (Required)
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    WhatsApp Number *
                  </label>
                  <input
                    type="tel"
                    name="whatsapp_number"
                    value={formData.whatsapp_number}
                    onChange={handleChange}
                    placeholder="+254712345678"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">Include country code (e.g., +254)</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleChange}
                    placeholder="+254712345678"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Location *
                  </label>
                  <textarea
                    name="business_location"
                    value={formData.business_location}
                    onChange={handleChange}
                    placeholder="123 Business Street, Nairobi, Kenya"
                    required
                    rows="2"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Hours
                  </label>
                  <input
                    type="text"
                    name="business_hours"
                    value={formData.business_hours}
                    onChange={handleChange}
                    placeholder="Mon-Sat, 9AM-6PM"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preferred Contact Method *
                  </label>
                  <select
                    name="preferred_contact_method"
                    value={formData.preferred_contact_method}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="whatsapp">WhatsApp</option>
                    <option value="phone">Phone</option>
                    <option value="email">Email</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Online Presence */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Globe className="w-5 h-5 text-purple-600" />
                Online Presence
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Mail className="w-4 h-4" /> Business Email
                  </label>
                  <input
                    type="email"
                    name="business_email"
                    value={formData.business_email}
                    onChange={handleChange}
                    placeholder="contact@business.com"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Globe className="w-4 h-4" /> Website URL
                  </label>
                  <input
                    type="url"
                    name="website_url"
                    value={formData.website_url}
                    onChange={handleChange}
                    placeholder="https://business.com"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Instagram className="w-4 h-4" /> Instagram Handle
                  </label>
                  <input
                    type="text"
                    name="instagram_handle"
                    value={formData.instagram_handle}
                    onChange={handleChange}
                    placeholder="@yourbusiness"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Facebook className="w-4 h-4" /> Facebook Page
                  </label>
                  <input
                    type="text"
                    name="facebook_page"
                    value={formData.facebook_page}
                    onChange={handleChange}
                    placeholder="YourBusinessPage"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Business Details */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-purple-600" />
                Business Details
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Business Category</label>
                  <input
                    type="text"
                    name="business_category"
                    value={formData.business_category}
                    onChange={handleChange}
                    placeholder="Fashion, Electronics, etc."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Business Description</label>
                  <textarea
                    name="business_description"
                    value={formData.business_description}
                    onChange={handleChange}
                    placeholder="Tell customers about your business..."
                    rows="4"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Affiliate Settings */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Affiliate Settings</h2>
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="auto_approve"
                  name="auto_approve_influencers"
                  checked={formData.auto_approve_influencers}
                  onChange={handleChange}
                  className="mt-1 w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <label htmlFor="auto_approve" className="text-sm text-gray-700">
                  <div className="font-medium">Auto-approve influencer applications</div>
                  <div className="text-gray-500">
                    Automatically approve influencers who meet your criteria to promote products
                  </div>
                </label>
              </div>
            </div>

            {/* Submit */}
            <div className="flex justify-end gap-4 pt-6 border-t">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : existingProfile ? 'Update Profile' : 'Create Profile'}
              </button>
            </div>
          </form>
        )}

        {/* Prompt to select a brand when none is chosen */}
        {!selectedBrandId && (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center text-gray-400">
            <ChevronDown className="w-10 h-10 mx-auto mb-3 text-gray-300" />
            <p className="text-lg font-medium text-gray-600">Select a brand above to continue</p>
          </div>
        )}
      </div>
    </div>
  );
}
