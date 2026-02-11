import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Save,
  Package,
  DollarSign,
  Percent,
  Image as ImageIcon,
  Tag,
  FileText,
  Settings,
  Download,
  Plus,
  Trash2
} from 'lucide-react';
import { productsApi } from '../../../services/affiliateApi';

export default function CreateProduct() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    price: '',
    compare_at_price: '',
    commission_type: 'percentage',
    commission_rate: '',
    fixed_commission: '',
    platform_fee_type: 'percentage',
    platform_fee_rate: '10.00',
    platform_fee_fixed: '',
    stock_quantity: '',
    track_inventory: false,
    low_stock_threshold: '10',
    images: [],
    thumbnail: '',
    sku: '',
    weight: '',
    dimensions: '',
    shipping_info: '',
    auto_approve_affiliates: false,
    status: 'active',
    is_digital: false
  });

  // Digital file entries (managed locally, saved after product creation)
  const [digitalFiles, setDigitalFiles] = useState([]);
  const [newFile, setNewFile] = useState({ file_name: '', file_url: '', file_type: '', is_preview: false });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await productsApi.getCategories();
      setCategories(response.data);
    } catch (error) {
      console.error('Failed to load categories:', error);
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

  const addDigitalFile = () => {
    if (!newFile.file_name || !newFile.file_url) {
      toast.error('File name and URL are required');
      return;
    }
    setDigitalFiles(prev => [...prev, { ...newFile, id: Date.now() }]);
    setNewFile({ file_name: '', file_url: '', file_type: '', is_preview: false });
  };

  const removeDigitalFile = (id) => {
    setDigitalFiles(prev => prev.filter(f => f.id !== id));
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

    setLoading(true);

    try {
      // Prepare data for API
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
        track_inventory: formData.is_digital ? false : formData.track_inventory,
        low_stock_threshold: formData.track_inventory && formData.low_stock_threshold ? parseInt(formData.low_stock_threshold) : null,
        images: formData.images,
        thumbnail: formData.thumbnail,
        sku: formData.sku || null,
        weight: formData.is_digital ? null : (formData.weight ? parseFloat(formData.weight) : null),
        dimensions: formData.is_digital ? null : (formData.dimensions || null),
        shipping_info: formData.is_digital ? null : (formData.shipping_info || null),
        requires_shipping: !formData.is_digital,
        auto_approve_affiliates: formData.auto_approve_affiliates,
        status: formData.status,
        is_digital: formData.is_digital
      };

      const response = await productsApi.create(productData);
      const productId = response.data?.id;

      // If digital product, save digital files
      if (formData.is_digital && digitalFiles.length > 0 && productId) {
        const { digitalProductsApi } = await import('../../../services/affiliateApi');
        for (const file of digitalFiles) {
          try {
            await digitalProductsApi.addFile(productId, {
              file_name: file.file_name,
              file_url: file.file_url,
              file_type: file.file_type || null,
              is_preview: file.is_preview
            });
          } catch (fileError) {
            console.error('Failed to add digital file:', fileError);
            toast.error(`Failed to attach file: ${file.file_name}`);
          }
        }
      }

      toast.success('Product created successfully!');
      navigate('/affiliate/products');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create product');
      console.error(error);
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
            onClick={() => navigate('/affiliate/products')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Products
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Create New Product</h1>
          <p className="text-gray-600 mt-2">
            Add a new product for influencers to promote
          </p>
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
                  placeholder="Premium Sneakers"
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
                  placeholder="Describe your product..."
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
                    placeholder="Fashion, Electronics, etc."
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
                    placeholder="PROD-001"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Product Type Toggle */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Download className="w-5 h-5 text-purple-600" />
              Product Type
            </h2>
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="is_digital"
                name="is_digital"
                checked={formData.is_digital}
                onChange={handleChange}
                className="mt-1 w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
              />
              <label htmlFor="is_digital" className="text-sm text-gray-700">
                <div className="font-medium">Digital Product (Downloadable)</div>
                <div className="text-gray-500">
                  This is a downloadable product like an e-book, template, or digital guide.
                  Customers get instant download access after ordering.
                </div>
              </label>
            </div>
            {formData.is_digital && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
                📥 <strong>Digital product:</strong> Shipping, inventory, and weight fields are hidden.
                Orders will be auto-fulfilled with download links.
              </div>
            )}
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
                  placeholder="5000"
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
                  placeholder="7000"
                  step="0.01"
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">Original price for discount display</p>
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
                    placeholder="15"
                    step="0.01"
                    min="0"
                    max="100"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Percentage of product price paid to influencer
                  </p>
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
                    placeholder="750"
                    step="0.01"
                    min="0"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Fixed amount paid to influencer per sale
                  </p>
                </div>
              )}

              {/* Platform Fee */}
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
                      placeholder="10"
                      step="0.01"
                      min="0"
                      max="100"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Percentage deducted from influencer commission (default: 10%)
                    </p>
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
                      placeholder="75"
                      step="0.01"
                      min="0"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Fixed amount deducted from influencer commission
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Inventory — hidden for digital products */}
          {!formData.is_digital && (
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
                        placeholder="100"
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
                        placeholder="10"
                        min="0"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

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
                placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
                rows="4"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">
                First image will be used as thumbnail
              </p>
            </div>
          </div>

          {/* Shipping — hidden for digital products */}
          {!formData.is_digital && (
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
                    placeholder="0.5"
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
                    placeholder="30 x 20 x 10"
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
                    placeholder="Shipping details, delivery time, etc."
                    rows="2"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Digital Files — shown only for digital products */}
          {formData.is_digital && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Download className="w-5 h-5 text-purple-600" />
                Digital Files
              </h2>
              <p className="text-sm text-gray-500 mb-4">
                Add files that customers will receive after purchase. Mark one as "Preview" to offer a free sample.
              </p>

              {/* Existing files list */}
              {digitalFiles.length > 0 && (
                <div className="space-y-2 mb-4">
                  {digitalFiles.map((file) => (
                    <div key={file.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <FileText className="w-5 h-5 text-purple-600 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">{file.file_name}</div>
                        <div className="text-xs text-gray-500 truncate">{file.file_url}</div>
                      </div>
                      {file.is_preview && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Preview</span>
                      )}
                      <button
                        type="button"
                        onClick={() => removeDigitalFile(file.id)}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add new file form */}
              <div className="border border-dashed border-gray-300 rounded-lg p-4 space-y-3">
                <div className="grid md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">File Name *</label>
                    <input
                      type="text"
                      value={newFile.file_name}
                      onChange={(e) => setNewFile(prev => ({ ...prev, file_name: e.target.value }))}
                      placeholder="my-ebook.pdf"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">File Type</label>
                    <select
                      value={newFile.file_type}
                      onChange={(e) => setNewFile(prev => ({ ...prev, file_type: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="">Select type</option>
                      <option value="application/pdf">PDF</option>
                      <option value="application/epub+zip">EPUB</option>
                      <option value="application/zip">ZIP</option>
                      <option value="image/png">PNG</option>
                      <option value="image/jpeg">JPEG</option>
                      <option value="video/mp4">MP4</option>
                      <option value="audio/mpeg">MP3</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">File URL *</label>
                  <input
                    type="url"
                    value={newFile.file_url}
                    onChange={(e) => setNewFile(prev => ({ ...prev, file_url: e.target.value }))}
                    placeholder="https://storage.example.com/my-ebook.pdf"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm text-gray-600">
                    <input
                      type="checkbox"
                      checked={newFile.is_preview}
                      onChange={(e) => setNewFile(prev => ({ ...prev, is_preview: e.target.checked }))}
                      className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    />
                    Free preview file
                  </label>
                  <button
                    type="button"
                    onClick={addDigitalFile}
                    className="flex items-center gap-1 px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 text-sm font-medium"
                  >
                    <Plus className="w-4 h-4" />
                    Add File
                  </button>
                </div>
              </div>
            </div>
          )}

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
              disabled={loading}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {loading ? 'Creating...' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
