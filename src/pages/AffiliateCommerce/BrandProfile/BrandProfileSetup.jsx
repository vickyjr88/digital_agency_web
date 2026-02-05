import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Building2, Phone, MapPin, Clock, Mail, Globe, Instagram, Facebook, Save, ArrowLeft } from 'lucide-react';
import { brandProfileApi } from '../../../services/affiliateApi';

export default function BrandProfileSetup() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [existingProfile, setExistingProfile] = useState(null);
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

  useEffect(() => {
    loadExistingProfile();
  }, []);

  const loadExistingProfile = async () => {
    try {
      const response = await brandProfileApi.getMyProfile();
      setExistingProfile(response.data);
      setFormData(response.data);
    } catch (error) {
      // Profile doesn't exist yet, that's okay
      console.log('No existing profile');
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (existingProfile) {
        await brandProfileApi.updateMyProfile(formData);
        toast.success('Brand profile updated successfully!');
      } else {
        await brandProfileApi.create(formData);
        toast.success('Brand profile created successfully!');
      }
      navigate('/affiliate/products');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to save brand profile');
    } finally {
      setLoading(false);
    }
  };

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
          <h1 className="text-3xl font-bold text-gray-900">
            {existingProfile ? 'Edit Brand Profile' : 'Setup Brand Profile'}
          </h1>
          <p className="text-gray-600 mt-2">
            Set up your brand contact information to start selling products through affiliates
          </p>
        </div>

        {/* Form */}
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
                  <Mail className="w-4 h-4" />
                  Business Email
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
                  <Globe className="w-4 h-4" />
                  Website URL
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
                  <Instagram className="w-4 h-4" />
                  Instagram Handle
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
                  <Facebook className="w-4 h-4" />
                  Facebook Page
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Category
                </label>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Description
                </label>
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

          {/* Settings */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Affiliate Settings
            </h2>
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

          {/* Submit Button */}
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
              disabled={loading}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {loading ? 'Saving...' : existingProfile ? 'Update Profile' : 'Create Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
