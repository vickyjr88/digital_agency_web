import { useState, useEffect, useRef, useCallback } from 'react';
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
  Loader,
  Upload,
  X,
  ImagePlus,
  Star,
  Download,
  FileText,
} from 'lucide-react';
import { productsApi, systemCategoriesApi } from '../../../services/affiliateApi';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10 MB
const MAX_IMAGE_COUNT = 10;

/**
 * Extract the MinIO object key from a presigned URL.
 * URL format: http(s)://{host}/{bucket}/{object_key}?X-Amz-...
 * We want everything between /{bucket}/ and the query string.
 */
function extractObjectKey(url) {
  try {
    const parsed = new URL(url);
    // pathname = "/{bucket}/{object_key...}"
    const parts = parsed.pathname.split('/');
    // parts[0] = "", parts[1] = bucket, parts[2..] = object key segments
    if (parts.length < 3) return null;
    return parts.slice(2).join('/');
  } catch {
    return null;
  }
}

export default function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState(null);

  // ── Image state ───────────────────────────────────────────────────────────
  // Existing images already stored in MinIO: { url, object_key }
  const [existingImages, setExistingImages] = useState([]);
  // New images picked but not yet uploaded: { id, file, preview }
  const [pendingImages, setPendingImages] = useState([]);
  const [imageDragOver, setImageDragOver] = useState(false);
  const [deletingKey, setDeletingKey] = useState(null); // object_key currently being deleted
  const [uploadingImages, setUploadingImages] = useState(false);
  const imageInputRef = useRef(null);

  // ── Digital file state ────────────────────────────────────────────────────
  // Info about the existing digital file stored in MinIO (from product API response)
  const [existingFile, setExistingFile] = useState(null); // { name, size, type }
  // A new file the user has picked to replace / add
  const [newDigitalFile, setNewDigitalFile] = useState(null); // File object
  const [deletingFile, setDeletingFile] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const fileInputRef = useRef(null);

  const [categories, setCategories] = useState([]);

  useEffect(() => {
    loadProduct();
    loadCategories();
  }, [id]);

  const loadCategories = async () => {
    try {
      const { data } = await systemCategoriesApi.list('product');
      setCategories(data);
    } catch (err) {
      console.error('Failed to load categories', err);
    }
  };

  // Revoke object URLs on unmount to avoid memory leaks
  useEffect(() => {
    return () => {
      pendingImages.forEach(e => { if (e.preview) URL.revokeObjectURL(e.preview); });
    };
  }, []); // eslint-disable-line

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
        sku: product.sku || '',
        weight: product.weight || '',
        dimensions: product.dimensions || '',
        shipping_info: product.shipping_info || '',
        auto_approve_affiliates: product.auto_approve_affiliates || false,
        status: product.status || 'active',
      });

      // Images are stored as presigned URLs; extract the object_key from the URL path.
      // URL pattern: {endpoint}/{bucket}/{object_key}?X-Amz-...
      // object_key pattern: product-images/{product_id}/...
      if (product.images && product.images.length > 0) {
        setExistingImages(product.images.map(url => ({
          url,
          object_key: extractObjectKey(url),
        })));
      }

      // Populate existing digital file info
      if (product.has_digital_file) {
        setExistingFile({
          name: product.digital_file_name,
          size: product.digital_file_size,
          type: product.digital_file_type,
        });
      }
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
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // ── Digital file handlers ─────────────────────────────────────────────────

  const ALLOWED_DIGITAL_TYPES = [
    'application/pdf', 'application/epub+zip', 'application/zip',
    'application/x-zip-compressed', 'video/mp4', 'audio/mpeg', 'audio/mp3',
  ];

  const handleDigitalFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!ALLOWED_DIGITAL_TYPES.includes(file.type)) {
      toast.error('Unsupported file type. Use PDF, EPUB, ZIP, MP4 or MP3.');
      return;
    }
    if (file.size > 200 * 1024 * 1024) {
      toast.error('File is too large. Maximum size is 200 MB.');
      return;
    }
    setNewDigitalFile(file);
  };

  const handleRemoveExistingFile = async () => {
    if (!confirm('Remove the digital file from this product?')) return;
    setDeletingFile(true);
    try {
      await productsApi.deleteFile(id);
      setExistingFile(null);
      setFormData(prev => ({ ...prev, is_digital: false }));
      toast.success('Digital file removed.');
    } catch (err) {
      toast.error('Failed to remove digital file.');
      console.error(err);
    } finally {
      setDeletingFile(false);
    }
  };

  // ── Image picker helpers ──────────────────────────────────────────────────

  const totalImages = existingImages.length + pendingImages.length;

  const addImageFiles = useCallback((files) => {
    const fileArr = Array.from(files);
    const remaining = MAX_IMAGE_COUNT - totalImages;
    if (remaining <= 0) {
      toast.error(`Maximum ${MAX_IMAGE_COUNT} images allowed.`);
      return;
    }
    const toAdd = fileArr.slice(0, remaining);
    const invalid = toAdd.find(f => !ALLOWED_IMAGE_TYPES.includes(f.type));
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
    }));
    setPendingImages(prev => [...prev, ...newEntries]);
  }, [totalImages]);

  const removePendingImage = (entryId) => {
    setPendingImages(prev => {
      const entry = prev.find(e => e.id === entryId);
      if (entry?.preview) URL.revokeObjectURL(entry.preview);
      return prev.filter(e => e.id !== entryId);
    });
  };

  const handleDeleteExisting = async (objectKey, url) => {
    if (!objectKey) {
      // No object_key — just remove from display list (legacy URL)
      setExistingImages(prev => prev.filter(img => img.url !== url));
      return;
    }
    setDeletingKey(objectKey);
    try {
      await productsApi.deleteImage(id, objectKey);
      setExistingImages(prev => prev.filter(img => img.object_key !== objectKey));
      toast.success('Image removed.');
    } catch (err) {
      toast.error('Failed to remove image.');
      console.error(err);
    } finally {
      setDeletingKey(null);
    }
  };

  const handleImageDrop = (e) => {
    e.preventDefault();
    setImageDragOver(false);
    addImageFiles(e.dataTransfer.files);
  };

  // ── Validation ────────────────────────────────────────────────────────────

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

  // ── Submit ────────────────────────────────────────────────────────────────

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
        sku: formData.sku || null,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        dimensions: formData.dimensions || null,
        shipping_info: formData.shipping_info || null,
        auto_approve_affiliates: formData.auto_approve_affiliates,
        status: formData.status,
      };

      await productsApi.update(id, productData);

      // Upload any newly picked images
      if (pendingImages.length > 0) {
        setUploadingImages(true);
        let anyFailed = false;
        for (const entry of pendingImages) {
          if (!entry.file) continue;
          try {
            await productsApi.uploadImage(id, entry.file);
          } catch (imgErr) {
            anyFailed = true;
            console.error('Image upload error:', imgErr);
          }
        }
        setUploadingImages(false);
        if (anyFailed) {
          toast.warning('Product saved but some images failed to upload.');
        }
      }

      // Upload new digital file if one was picked
      if (newDigitalFile) {
        setUploadingFile(true);
        try {
          await productsApi.uploadFile(id, newDigitalFile);
        } catch (fileErr) {
          toast.warning('Product saved but digital file upload failed.');
          console.error('Digital file upload error:', fileErr);
        } finally {
          setUploadingFile(false);
        }
      }

      toast.success('Product updated successfully!');
      navigate('/affiliate/products');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to update product');
      console.error(error);
    } finally {
      setSaving(false);
      setUploadingImages(false);
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

  // ── Loading / null guards ─────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!formData) return null;

  const isBusy = saving || uploadingImages || uploadingFile;

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
              <Package className="w-5 h-5 text-blue-600" />
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select a category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-blue-600" />
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Commission Settings */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Percent className="w-5 h-5 text-blue-600" />
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
                      className="text-blue-600 focus:ring-blue-500"
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
                      className="text-blue-600 focus:ring-blue-500"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                      className="text-blue-600 focus:ring-blue-500"
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
                      className="text-blue-600 focus:ring-blue-500"
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
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Inventory */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-blue-600" />
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
                  className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
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
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Images */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-1 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-blue-600" />
              Product Images
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              Upload up to {MAX_IMAGE_COUNT} images (JPEG, PNG, WebP, GIF · max 10 MB each).
              The first image is the thumbnail. Click the trash icon to remove existing images immediately.
            </p>

            {/* Existing images */}
            {existingImages.length > 0 && (
              <div className="mb-4">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                  Current images
                </p>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                  {existingImages.map((img, idx) => (
                    <div
                      key={img.object_key || img.url}
                      className="relative group rounded-lg overflow-hidden border border-gray-200 aspect-square bg-gray-100"
                    >
                      <img
                        src={img.url}
                        alt={`Product image ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                      {/* Thumbnail badge */}
                      {idx === 0 && pendingImages.length === 0 && (
                        <div className="absolute top-1 left-1 bg-yellow-400 text-yellow-900 text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                          <Star className="w-2.5 h-2.5 fill-current" />
                          Thumb
                        </div>
                      )}
                      {/* Delete button */}
                      <button
                        type="button"
                        disabled={deletingKey === img.object_key}
                        onClick={() => handleDeleteExisting(img.object_key, img.url)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-60"
                        title="Remove image"
                      >
                        {deletingKey === img.object_key
                          ? <Loader className="w-3 h-3 animate-spin" />
                          : <X className="w-3 h-3" />
                        }
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Drop zone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setImageDragOver(true); }}
              onDragLeave={() => setImageDragOver(false)}
              onDrop={handleImageDrop}
              onClick={() => imageInputRef.current?.click()}
              className={`flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 cursor-pointer transition-colors mb-4
                ${imageDragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'}
                ${totalImages >= MAX_IMAGE_COUNT ? 'opacity-50 pointer-events-none' : ''}
              `}
            >
              <ImagePlus className="w-8 h-8 text-blue-400 mb-2" />
              <span className="text-sm font-medium text-blue-700">
                {imageDragOver ? 'Drop images here' : 'Click or drag & drop to add images'}
              </span>
              <span className="text-xs text-gray-400 mt-1">
                {totalImages}/{MAX_IMAGE_COUNT} images
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

            {/* Pending (new) image previews */}
            {pendingImages.length > 0 && (
              <>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                  New images (will upload on save)
                </p>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                  {pendingImages.map((entry, idx) => (
                    <div key={entry.id} className="relative group rounded-lg overflow-hidden border border-blue-200 aspect-square bg-gray-100">
                      <img
                        src={entry.preview}
                        alt={`New image ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                      {/* Thumbnail badge only if first overall */}
                      {existingImages.length === 0 && idx === 0 && (
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
                      {/* File name */}
                      <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] px-1 py-0.5 truncate opacity-0 group-hover:opacity-100 transition-opacity">
                        {entry.file?.name}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Digital Product */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-1 flex items-center gap-2">
              <Download className="w-5 h-5 text-blue-600" />
              Digital Product (optional)
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              Attach a downloadable file (PDF, EPUB, ZIP, MP4, MP3) buyers receive after purchase.
              Uploading a new file replaces the existing one.
            </p>

            {/* Existing file */}
            {existingFile && !newDigitalFile && (
              <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 mb-4">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-blue-600 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-800">{existingFile.name}</p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(existingFile.size)}{existingFile.type ? ` · ${existingFile.type}` : ''}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <label
                    className="text-sm text-blue-700 hover:text-blue-900 font-medium cursor-pointer underline-offset-2 hover:underline"
                    title="Replace file"
                  >
                    Replace
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.epub,.zip,.mp4,.mp3,application/pdf,application/epub+zip,application/zip,video/mp4,audio/mpeg,audio/mp3"
                      onChange={handleDigitalFileChange}
                      className="hidden"
                    />
                  </label>
                  <button
                    type="button"
                    disabled={deletingFile}
                    onClick={handleRemoveExistingFile}
                    className="text-red-500 hover:text-red-700 p-1 rounded disabled:opacity-50"
                    title="Remove file"
                  >
                    {deletingFile
                      ? <Loader className="w-4 h-4 animate-spin" />
                      : <Trash2 className="w-4 h-4" />
                    }
                  </button>
                </div>
              </div>
            )}

            {/* New file picked */}
            {newDigitalFile && (
              <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-4 py-3 mb-4">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-green-600 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-800">{newDigitalFile.name}</p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(newDigitalFile.size)} · {newDigitalFile.type}
                    </p>
                    <p className="text-xs text-green-600 font-medium">Will upload on save</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => { setNewDigitalFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                  className="text-red-500 hover:text-red-700 p-1 rounded"
                  title="Cancel"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Upload zone — show when no existing file and no new file picked */}
            {!existingFile && !newDigitalFile && (
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-blue-300 rounded-lg p-6 cursor-pointer hover:bg-blue-50 transition-colors">
                <Upload className="w-8 h-8 text-blue-400 mb-2" />
                <span className="text-sm font-medium text-blue-700">Click to select file</span>
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

          {/* Shipping */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-blue-600" />
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Settings */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5 text-blue-600" />
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
                  className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              disabled={isBusy}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              {uploadingFile ? (
                <><Upload className="w-4 h-4 animate-pulse" /> Uploading file...</>
              ) : uploadingImages ? (
                <><Upload className="w-4 h-4 animate-pulse" /> Uploading images...</>
              ) : saving ? (
                <><Save className="w-4 h-4" /> Saving...</>
              ) : (
                <><Save className="w-4 h-4" /> Save Changes</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
