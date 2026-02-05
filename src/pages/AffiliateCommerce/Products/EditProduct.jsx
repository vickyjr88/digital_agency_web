import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Save,
  Package,
  DollarSign,
  Percent,
  Image as ImageIcon,
  Settings,
  Trash2,
  Loader
} from 'lucide-react';
import { productsApi } from '../../../services/affiliateApi';

export default function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState(null);

  useEffect(() => {
    loadProduct();
  }, [id]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const response = await productsApi.getById(id);
      const product = response.data;

      setFormData({
        name: product.name || '',
        description: product.description || '',
        category: product.category || '',
        price: product.price || '',
        compare_at_price: product.compare_at_price || '',
        commission_type: product.commission_type || 'percentage',
        commission_rate: product.commission_rate || '',
        fixed_commission: product.fixed_commission || '',
        platform_fee_type: product.platform_fee_type || 'percentage',
        platform_fee_rate: product.platform_fee_rate || '10.00',
        platform_fee_fixed: product.platform_fee_fixed || '',
        stock_quantity: product.stock_quantity || '',
        track_inventory: product.track_inventory || false,
        low_stock_threshold: product.low_stock_threshold || '10',
        images: product.images || [],
        thumbnail: product.thumbnail || '',
        sku: product.sku || '',
        weight: product.weight || '',
        dimensions: product.dimensions || '',
        shipping_info: product.shipping_info || '',
        auto_approve_affiliates: product.auto_approve_affiliates || false,
        status: product.status || 'active'
      });
    } catch (error) {
      toast.error('Failed to load product');
      console.error(error);
      navigate('/affiliate/products');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageUrlsChange = (e) => {
    const urls = e.target.value.split('\n').filter(url => url.trim());
    setFormData(prev => ({
      ...prev,
      images: urls,
      thumbnail: urls[0] || ''
    }));
  };

  const validateForm = () => {
    if (!formData.name || !formData.price) {
      toast.error('Please fill in all required fields');
      return false;
    }

    if (formData.commission_type === 'percentage') {
      if (!formData.commission_rate || parseFloat(formData.commission_rate) <= 0 || parseFloat(formData.commission_rate) > 100) {
        toast.error('Commission rate must be between 0 and 100');
        return false;
      }
    } else {
      if (!formData.fixed_commission || parseFloat(formData.fixed_commission) <= 0) {
        toast.error('Fixed commission must be greater than 0');
        return false;
      }
    }

    if (formData.platform_fee_type === 'percentage') {
      if (!formData.platform_fee_rate || parseFloat(formData.platform_fee_rate) < 0 || parseFloat(formData.platform_fee_rate) > 100) {
        toast.error('Platform fee rate must be between 0 and 100');
        return false;
      }
    } else {
      if (formData.platform_fee_fixed && parseFloat(formData.platform_fee_fixed) < 0) {
        toast.error('Platform fee must be 0 or greater');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setSaving(true);

    try {
      const productData = {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        price: parseFloat(formData.price),
        compare_at_price: formData.compare_at_price ? parseFloat(formData.compare_at_price) : null,
        commission_type: formData.commission_type,
        commission_rate: formData.commission_type === 'percentage' ? parseFloat(formData.commission_rate) : null,
        fixed_commission: formData.commission_type === 'fixed' ? parseFloat(formData.fixed_commission) : null,
        platform_fee_type: formData.platform_fee_type,
        platform_fee_rate: formData.platform_fee_type === 'percentage' ? parseFloat(formData.platform_fee_rate) : null,
        platform_fee_fixed: formData.platform_fee_type === 'fixed' && formData.platform_fee_fixed ? parseFloat(formData.platform_fee_fixed) : null,
        stock_quantity: formData.track_inventory && formData.stock_quantity ? parseInt(formData.stock_quantity) : null,
        track_inventory: formData.track_inventory,
        low_stock_threshold: formData.track_inventory && formData.low_stock_threshold ? parseInt(formData.low_stock_threshold) : null,
        images: formData.images,
        thumbnail: formData.thumbnail,
        sku: formData.sku || null,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        dimensions: formData.dimensions || null,
        shipping_info: formData.shipping_info || null,
        auto_approve_affiliates: formData.auto_approve_affiliates,
        status: formData.status
      };

      await productsApi.update(id, productData);
      toast.success('Product updated successfully!');
      navigate('/affiliate/products');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to update product');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) return;

    try {
      await productsApi.delete(id);
      toast.success('Product deleted successfully');
      navigate('/affiliate/products');
    } catch (error) {
      toast.error('Failed to delete product');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!formData) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/affiliate/products')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Products
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Edit Product</h1>
              <p className="text-gray-600 mt-2">Update product information</p>
            </div>
            <button
              onClick={handleDelete}
              className="flex items-center gap-2 px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
              Delete Product
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-purple-600" />
              Basic Information
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="4"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <input
                    type="text"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SKU
                  </label>
                  <input
                    type="text"
                    name="sku"
                    value={formData.sku}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-purple-600" />
              Pricing
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price (KES) *
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Compare at Price (KES)
                </label>
                <input
                  type="number"
                  name="compare_at_price"
                  value={formData.compare_at_price}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Commission Settings */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Percent className="w-5 h-5 text-purple-600" />
              Commission Settings
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Commission Type *
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="commission_type"
                      value="percentage"
                      checked={formData.commission_type === 'percentage'}
                      onChange={handleChange}
                      className="text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-700">Percentage</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="commission_type"
                      value="fixed"
                      checked={formData.commission_type === 'fixed'}
                      onChange={handleChange}
                      className="text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-700">Fixed Amount</span>
                  </label>
                </div>
              </div>

              {formData.commission_type === 'percentage' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Commission Rate (%) *
                  </label>
                  <input
                    type="number"
                    name="commission_rate"
                    value={formData.commission_rate}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                    max="100"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fixed Commission (KES) *
                  </label>
                  <input
                    type="number"
                    name="fixed_commission"
                    value={formData.fixed_commission}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              )}

              <div className="border-t pt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Platform Fee Type
                </label>
                <div className="flex gap-4 mb-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="platform_fee_type"
                      value="percentage"
                      checked={formData.platform_fee_type === 'percentage'}
                      onChange={handleChange}
                      className="text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-700">Percentage</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="platform_fee_type"
                      value="fixed"
                      checked={formData.platform_fee_type === 'fixed'}
                      onChange={handleChange}
                      className="text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-700">Fixed Amount</span>
                  </label>
                </div>

                {formData.platform_fee_type === 'percentage' ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Platform Fee Rate (%)
                    </label>
                    <input
                      type="number"
                      name="platform_fee_rate"
                      value={formData.platform_fee_rate}
                      onChange={handleChange}
                      step="0.01"
                      min="0"
                      max="100"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Platform Fee (KES)
                    </label>
                    <input
                      type="number"
                      name="platform_fee_fixed"
                      value={formData.platform_fee_fixed}
                      onChange={handleChange}
                      step="0.01"
                      min="0"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Inventory */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-purple-600" />
              Inventory
            </h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="track_inventory"
                  name="track_inventory"
                  checked={formData.track_inventory}
                  onChange={handleChange}
                  className="mt-1 w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <label htmlFor="track_inventory" className="text-sm text-gray-700">
                  <div className="font-medium">Track inventory</div>
                  <div className="text-gray-500">
                    Enable stock quantity tracking for this product
                  </div>
                </label>
              </div>

              {formData.track_inventory && (
                <div className="grid md:grid-cols-2 gap-4 pl-7">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Stock Quantity
                    </label>
                    <input
                      type="number"
                      name="stock_quantity"
                      value={formData.stock_quantity}
                      onChange={handleChange}
                      min="0"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Low Stock Threshold
                    </label>
                    <input
                      type="number"
                      name="low_stock_threshold"
                      value={formData.low_stock_threshold}
                      onChange={handleChange}
                      min="0"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Images */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-purple-600" />
              Product Images
            </h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Image URLs (one per line)
              </label>
              <textarea
                value={formData.images.join('\n')}
                onChange={handleImageUrlsChange}
                rows="4"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm"
              />
            </div>
          </div>

          {/* Shipping */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-purple-600" />
              Shipping Details
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Weight (kg)
                </label>
                <input
                  type="number"
                  name="weight"
                  value={formData.weight}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dimensions (L x W x H cm)
                </label>
                <input
                  type="text"
                  name="dimensions"
                  value={formData.dimensions}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Shipping Information
                </label>
                <textarea
                  name="shipping_info"
                  value={formData.shipping_info}
                  onChange={handleChange}
                  rows="2"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Settings */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5 text-purple-600" />
              Product Settings
            </h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="auto_approve"
                  name="auto_approve_affiliates"
                  checked={formData.auto_approve_affiliates}
                  onChange={handleChange}
                  className="mt-1 w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <label htmlFor="auto_approve" className="text-sm text-gray-700">
                  <div className="font-medium">Auto-approve affiliates</div>
                  <div className="text-gray-500">
                    Automatically approve influencers who apply to promote this product
                  </div>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="active">Active</option>
                  <option value="paused">Paused</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end gap-4 bg-white rounded-lg shadow-sm p-6">
            <button
              type="button"
              onClick={() => navigate('/affiliate/products')}
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
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
