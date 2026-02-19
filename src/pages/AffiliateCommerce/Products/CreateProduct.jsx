import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
  Upload,
  Trash2,
  Download,
  Star,
  X,
  ImagePlus,
  AlertCircle,
  Building2,
} from 'lucide-react';
import { productsApi, brandProfileApi, brandsApi } from '../../../services/affiliateApi';

export default function CreateProduct() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  // Brand / profile selection
  const [brandProfiles, setBrandProfiles] = useState([]);        // brands that have a profile
  const [selectedProfile, setSelectedProfile] = useState(null);  // chosen BrandProfile
  const [profileChecked, setProfileChecked] = useState(false);
  const [showBrandPicker, setShowBrandPicker] = useState(false);

  // ── Digital file ──────────────────────────────────────────────────────────
  const [digitalFile, setDigitalFile] = useState(null);          // File object
  const [uploadingFile, setUploadingFile] = useState(false);
  const fileInputRef = useRef(null);

  // ── Product images ────────────────────────────────────────────────────────
  // Each entry: { id (local uuid), file: File | null, preview: string, uploading: boolean }
  // After product creation, files are uploaded and entries replaced with { url, objectKey }
  const [pendingImages, setPendingImages] = useState([]);   // pre-submit staging
  const [imageDragOver, setImageDragOver] = useState(false);
  const imageInputRef = useRef(null);
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
    sku: '',
    weight: '',
    dimensions: '',
    shipping_info: '',
    auto_approve_affiliates: false,
    is_digital: false,
    status: 'active',
  });

  useEffect(() => {
    checkBrandProfile();
    loadCategories();
  }, []);

  const checkBrandProfile = async () => {
    try {
      const res = await brandProfileApi.listMyProfiles();
      const profiles = res.data || [];
      setBrandProfiles(profiles);
      // Auto-select if only one profile
      if (profiles.length === 1) setSelectedProfile(profiles[0]);
      else if (profiles.length > 1) setShowBrandPicker(true);
    } catch {
      setBrandProfiles([]);
    } finally {
      setProfileChecked(true);
    }
  };

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

  const handleDigitalFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowed = ['application/pdf', 'application/epub+zip', 'application/zip',
      'application/x-zip-compressed', 'video/mp4', 'audio/mpeg', 'audio/mp3'];
    if (!allowed.includes(file.type)) {
      toast.error('Unsupported file type. Use PDF, EPUB, ZIP, MP4 or MP3.');
      return;
    }
    if (file.size > 200 * 1024 * 1024) {
      toast.error('File is too large. Maximum size is 200 MB.');
      return;
    }
    setDigitalFile(file);
    // Mark product as digital automatically
    setFormData(prev => ({ ...prev, is_digital: true }));
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // ── Image picker helpers ───────────────────────────────────────────────────

  const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10 MB
  const MAX_IMAGE_COUNT = 10;

  const addImageFiles = useCallback((files) => {
    const fileArr = Array.from(files);
    const remaining = MAX_IMAGE_COUNT - pendingImages.length;
    if (remaining <= 0) {
      toast.error(`Maximum ${MAX_IMAGE_COUNT} images allowed.`);
      return;
    }
    const toAdd = fileArr.slice(0, remaining);
    const invalid = fileArr.find(f => !ALLOWED_IMAGE_TYPES.includes(f.type));
    if (invalid) {
      toast.error('Only JPEG, PNG, WebP or GIF images are supported.');
      return;
    }
    const oversized = toAdd.find(f => f.size > MAX_IMAGE_SIZE);
    if (oversized) {
      toast.error('Each image must be under 10 MB.');
      return;
    }
    const newEntries = toAdd.map(file => ({
      id: crypto.randomUUID(),
      file,
      preview: URL.createObjectURL(file),
      uploading: false,
    }));
    setPendingImages(prev => [...prev, ...newEntries]);
  }, [pendingImages]);

  const removePendingImage = (id) => {
    setPendingImages(prev => {
      const entry = prev.find(e => e.id === id);
      if (entry?.preview) URL.revokeObjectURL(entry.preview);
      return prev.filter(e => e.id !== id);
    });
  };

  const handleImageDrop = (e) => {
    e.preventDefault();
    setImageDragOver(false);
    addImageFiles(e.dataTransfer.files);
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

    // Require a file if product is marked as digital
    if (formData.is_digital && !digitalFile) {
      toast.error('Please attach a digital file (PDF, EPUB, ZIP, MP4 or MP3) for this product.');
      return;
    }

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
        track_inventory: formData.track_inventory,
        low_stock_threshold: formData.track_inventory && formData.low_stock_threshold ? parseInt(formData.low_stock_threshold) : null,
        images: [],
        thumbnail: null,
        sku: formData.sku || null,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        dimensions: formData.dimensions || null,
        shipping_info: formData.shipping_info || null,
        auto_approve_affiliates: formData.auto_approve_affiliates,
        is_digital: formData.is_digital,
        status: formData.status
      };

      const createRes = await productsApi.create(productData);
      const newProduct = createRes.data;

      // Upload product images in sequence
      if (pendingImages.length > 0 && newProduct?.id) {
        setUploadingFile(true);
        let anyFailed = false;
        for (const entry of pendingImages) {
          if (!entry.file) continue;
          try {
            await productsApi.uploadImage(newProduct.id, entry.file);
          } catch (imgErr) {
            anyFailed = true;
            console.error('Image upload error:', imgErr);
          }
        }
        if (anyFailed) {
          toast.warning('Product created but some images failed to upload.');
        }
        setUploadingFile(false);
      }

      // Upload digital file if provided
      if (digitalFile && newProduct?.id) {
        setUploadingFile(true);
        try {
          await productsApi.uploadFile(newProduct.id, digitalFile);
          toast.success('Product created and digital file uploaded!');
        } catch (uploadErr) {
          toast.warning('Product created but file upload failed. You can re-upload from the product page.');
          console.error('File upload error:', uploadErr);
        } finally {
          setUploadingFile(false);
        }
      } else {
        toast.success('Product created successfully!');
      }

      navigate('/affiliate/products');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create product');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // ── Gates ─────────────────────────────────────────────────────────────────
  if (!profileChecked) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // No brand profiles at all → prompt to set one up
  if (brandProfiles.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <AlertCircle className="w-8 h-8 text-amber-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Brand profile required</h2>
          <p className="text-gray-500 mb-8">
            Before you can list products, set up a brand profile for one of your brands. This gives buyers a way to contact you.
          </p>
          <Link
            to="/affiliate/brand-profile"
            className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 font-semibold transition-colors"
          >
            <Building2 className="w-5 h-5" />
            Set up brand profile
          </Link>
          <button
            onClick={() => navigate('/affiliate/products')}
            className="block w-full mt-3 text-sm text-gray-500 hover:text-gray-700"
          >
            Back to products
          </button>
        </div>
      </div>
    );
  }

  // Multiple profiles → show picker modal until one is chosen
  if (showBrandPicker && !selectedProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-lg w-full">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Select a brand</h2>
          <p className="text-gray-500 mb-6">Choose which brand this product will be listed under.</p>
          <div className="space-y-3">
            {brandProfiles.map(profile => (
              <button
                key={profile.id}
                onClick={() => { setSelectedProfile(profile); setShowBrandPicker(false); }}
                className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-gray-200 hover:border-purple-400 hover:bg-purple-50 text-left transition-all"
              >
                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center text-purple-700 font-bold text-lg shrink-0">
                  {(profile.brand_name || '?').charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{profile.brand_name || 'Unnamed brand'}</p>
                  {profile.business_category && (
                    <p className="text-sm text-gray-500">{profile.business_category}</p>
                  )}
                </div>
              </button>
            ))}
          </div>
          <button
            onClick={() => navigate('/affiliate/products')}
            className="block w-full mt-4 text-sm text-gray-500 hover:text-gray-700 text-center"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

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
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Create New Product</h1>
              <p className="text-gray-600 mt-2">Add a new product for influencers to promote</p>
            </div>
            {selectedProfile && (
              <div className="flex items-center gap-2 bg-purple-50 border border-purple-200 rounded-xl px-4 py-2 text-sm shrink-0">
                <Building2 className="w-4 h-4 text-purple-600" />
                <span className="text-purple-800 font-medium">{selectedProfile.brand_name}</span>
                {brandProfiles.length > 1 && (
                  <button
                    type="button"
                    onClick={() => { setSelectedProfile(null); setShowBrandPicker(true); }}
                    className="ml-1 text-purple-500 hover:text-purple-700 underline text-xs"
                  >
                    Change
                  </button>
                )}
              </div>
            )}
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

          {/* Images */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-1 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-purple-600" />
              Product Images
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              Upload up to 10 images (JPEG, PNG, WebP, GIF · max 10 MB each). The first image becomes the thumbnail.
            </p>

            {/* Drop zone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setImageDragOver(true); }}
              onDragLeave={() => setImageDragOver(false)}
              onDrop={handleImageDrop}
              onClick={() => imageInputRef.current?.click()}
              className={`flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 cursor-pointer transition-colors mb-4
                ${imageDragOver ? 'border-purple-500 bg-purple-50' : 'border-gray-300 hover:border-purple-400 hover:bg-gray-50'}
                ${pendingImages.length >= 10 ? 'opacity-50 pointer-events-none' : ''}
              `}
            >
              <ImagePlus className="w-8 h-8 text-purple-400 mb-2" />
              <span className="text-sm font-medium text-purple-700">
                {imageDragOver ? 'Drop images here' : 'Click or drag & drop images'}
              </span>
              <span className="text-xs text-gray-400 mt-1">
                {pendingImages.length}/{MAX_IMAGE_COUNT} images added
              </span>
              <input
                ref={imageInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                multiple
                onChange={(e) => { addImageFiles(e.target.files); e.target.value = ''; }}
                className="hidden"
              />
            </div>

            {/* Image previews */}
            {pendingImages.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                {pendingImages.map((entry, idx) => (
                  <div key={entry.id} className="relative group rounded-lg overflow-hidden border border-gray-200 aspect-square bg-gray-100">
                    <img
                      src={entry.preview}
                      alt={`Preview ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />

                    {/* Thumbnail badge */}
                    {idx === 0 && (
                      <div className="absolute top-1 left-1 bg-yellow-400 text-yellow-900 text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                        <Star className="w-2.5 h-2.5 fill-current" />
                        Thumb
                      </div>
                    )}

                    {/* Remove button */}
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); removePendingImage(entry.id); }}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>

                    {/* File name tooltip */}
                    <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] px-1 py-0.5 truncate opacity-0 group-hover:opacity-100 transition-opacity">
                      {entry.file?.name}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Digital Product */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-1 flex items-center gap-2">
              <Download className="w-5 h-5 text-purple-600" />
              Digital Product (optional)
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              Attach a file (PDF, EPUB, ZIP, MP4, MP3) that buyers receive instantly after purchase.
            </p>

            <div className="flex items-start gap-3 mb-4">
              <input
                type="checkbox"
                id="is_digital"
                name="is_digital"
                checked={formData.is_digital}
                onChange={handleChange}
                className="mt-1 w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
              />
              <label htmlFor="is_digital" className="text-sm text-gray-700">
                <div className="font-medium">This is a digital product</div>
                <div className="text-gray-500">Buyers will receive an instant download link after purchase</div>
              </label>
            </div>

            {formData.is_digital && (
              <div className="pl-7">
                {digitalFile ? (
                  <div className="flex items-center justify-between bg-purple-50 border border-purple-200 rounded-lg px-4 py-3">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-purple-600 shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-gray-800">{digitalFile.name}</p>
                        <p className="text-xs text-gray-500">{formatFileSize(digitalFile.size)} · {digitalFile.type}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => { setDigitalFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                      className="text-red-500 hover:text-red-700 p-1 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center border-2 border-dashed border-purple-300 rounded-lg p-6 cursor-pointer hover:bg-purple-50 transition-colors">
                    <Upload className="w-8 h-8 text-purple-400 mb-2" />
                    <span className="text-sm font-medium text-purple-700">Click to select file</span>
                    <span className="text-xs text-gray-500 mt-1">PDF, EPUB, ZIP, MP4, MP3 · Max 200 MB</span>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.epub,.zip,.mp4,.mp3,application/pdf,application/epub+zip,application/zip,video/mp4,audio/mpeg,audio/mp3"
                      onChange={handleDigitalFileChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            )}
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
              disabled={loading || uploadingFile}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2"
            >
              {uploadingFile ? (
                <><Upload className="w-4 h-4 animate-pulse" /> Uploading...</>
              ) : loading ? (
                <><Save className="w-4 h-4" /> Creating...</>
              ) : (
                <><Save className="w-4 h-4" /> Create Product</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
