import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Package,
  ShoppingCart,
  User,
  Mail,
  Phone,
  MapPin,
  Clock,
  CheckCircle,
  MessageCircle,
  ExternalLink,
  AlertCircle,
  Loader,
  Download,
  FileText,
  Zap,
  CreditCard,
} from 'lucide-react';
import { productsApi, ordersApi, affiliateApi, brandProfileApi } from '../../../services/affiliateApi';
import { useAuth } from '../../../context/AuthContext';

export default function PlaceOrder() {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const affiliateCode = searchParams.get('ref');
  const { user, isAuthenticated } = useAuth();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [product, setProduct] = useState(null);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderResult, setOrderResult] = useState(null);   // full order response
  const [brandContact, setBrandContact] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    delivery_address: '',
    notes: ''
  });

  useEffect(() => {
    loadProduct();
    if (affiliateCode) {
      trackClick();
    }
  }, [slug, affiliateCode]);

  // Prepopulate form with user details if logged in
  useEffect(() => {
    if (isAuthenticated && user) {
      setFormData(prev => ({
        ...prev,
        customer_name: user.full_name || user.username || prev.customer_name,
        customer_email: user.email || prev.customer_email,
        customer_phone: user.phone || prev.customer_phone,
      }));
    }
  }, [isAuthenticated, user]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const response = await productsApi.getBySlug(slug);
      setProduct(response.data);
    } catch (error) {
      toast.error('Product not found');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const trackClick = async () => {
    try {
      await affiliateApi.trackClick(affiliateCode, slug);
    } catch (error) {
      console.error('Failed to track click:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const calculateTotal = () => {
    const basePrice = parseFloat(product.price);
    return basePrice * quantity;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const orderData = {
        product_id: product.id,
        quantity: quantity,
        variant_id: selectedVariant?.id || null,
        customer_name: formData.customer_name,
        customer_email: formData.customer_email,
        customer_phone: formData.customer_phone,
        customer_notes: formData.notes || null,
        affiliate_code: affiliateCode || null
      };

      // Initialize Paystack payment
      const response = await ordersApi.initializePayment(orderData);

      if (response.data.status === 'success' && response.data.authorization_url) {
        // Redirect to Paystack payment page
        window.location.href = response.data.authorization_url;
      } else {
        toast.error('Failed to initialize payment');
        setSubmitting(false);
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to initialize payment');
      console.error(error);
      setSubmitting(false);
    }
  };

  const handleDownload = async () => {
    if (!orderResult) return;
    setDownloadLoading(true);
    try {
      // Use the download_url that came back with the order (fresh presigned URL already)
      if (orderResult.download_url) {
        window.open(orderResult.download_url, '_blank', 'noopener,noreferrer');
        return;
      }
      // Fallback: request a new presigned URL
      const res = await productsApi.getDownloadUrl(product.id, orderResult.id);
      window.open(res.data.download_url, '_blank', 'noopener,noreferrer');
    } catch (err) {
      toast.error('Could not generate download link. Please try again.');
      console.error(err);
    } finally {
      setDownloadLoading(false);
    }
  };

  // ── Loading ──────────────────────────────────────────────────────────────
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

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h2>
          <p className="text-gray-600">The product you're looking for doesn't exist or is no longer available.</p>
        </div>
      </div>
    );
  }

  // ── Digital order success ────────────────────────────────────────────────
  if (orderPlaced && product.is_digital) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Purchase Successful!</h1>
            <p className="text-gray-500 mb-6">
              Your digital product is ready. Click the button below to download it.
              The link is valid for 24 hours.
            </p>

            {/* Product summary */}
            <div className="flex items-center gap-4 bg-gray-50 rounded-xl p-4 mb-6 text-left">
              <div className="w-14 h-14 bg-purple-100 rounded-lg flex items-center justify-center shrink-0">
                <FileText className="w-7 h-7 text-purple-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 truncate">{product.name}</p>
                {orderResult?.download_file_name && (
                  <p className="text-sm text-gray-500 truncate">{orderResult.download_file_name}</p>
                )}
                <p className="text-sm font-medium text-purple-600">
                  KES {calculateTotal().toLocaleString()}
                </p>
              </div>
            </div>

            <button
              onClick={handleDownload}
              disabled={downloadLoading}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:opacity-50 font-semibold text-lg transition-colors mb-4"
            >
              {downloadLoading ? (
                <Loader className="w-5 h-5 animate-spin" />
              ) : (
                <Download className="w-5 h-5" />
              )}
              {downloadLoading ? 'Preparing download...' : 'Download Your File'}
            </button>

            <p className="text-xs text-gray-400">
              Order #{orderResult?.order_number} · Link expires in 24 hours
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ── Physical order success ───────────────────────────────────────────────
  if (orderPlaced && brandContact) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4">
          {/* Success Message */}
          <div className="bg-white rounded-lg shadow-lg p-8 text-center mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Placed Successfully!</h1>
            <p className="text-gray-600 mb-6">
              Thank you for your order. Please contact the seller to complete your purchase.
            </p>

            {/* Order Summary */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-4">
                {product.thumbnail ? (
                  <img src={product.thumbnail} alt={product.name} className="w-20 h-20 object-cover rounded" />
                ) : (
                  <div className="w-20 h-20 bg-gray-200 rounded flex items-center justify-center">
                    <Package className="w-8 h-8 text-gray-400" />
                  </div>
                )}
                <div className="flex-1 text-left">
                  <h3 className="font-semibold text-gray-900">{product.name}</h3>
                  <p className="text-sm text-gray-600">Quantity: {quantity}</p>
                  <p className="text-lg font-bold text-purple-600">KES {calculateTotal().toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Brand Contact Information */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <MessageCircle className="w-6 h-6 text-purple-600" />
              Contact the Seller
            </h2>

            <div className="space-y-4 mb-8">
              {brandContact.whatsapp_number && (
                <div className="flex items-start gap-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <MessageCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 mb-1">WhatsApp</p>
                    <p className="text-gray-700 mb-3">{brandContact.whatsapp_number}</p>
                    <a
                      href={`https://wa.me/${brandContact.whatsapp_number.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <MessageCircle className="w-4 h-4" />
                      Chat on WhatsApp
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              )}

              {brandContact.phone_number && (
                <div className="flex items-start gap-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <Phone className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 mb-1">Phone Number</p>
                    <p className="text-gray-700 mb-3">{brandContact.phone_number}</p>
                    <a
                      href={`tel:${brandContact.phone_number}`}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Phone className="w-4 h-4" />
                      Call Now
                    </a>
                  </div>
                </div>
              )}

              {brandContact.business_email && (
                <div className="flex items-start gap-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <Mail className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 mb-1">Email</p>
                    <p className="text-gray-700 mb-3">{brandContact.business_email}</p>
                    <a
                      href={`mailto:${brandContact.business_email}`}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      <Mail className="w-4 h-4" />
                      Send Email
                    </a>
                  </div>
                </div>
              )}

              {brandContact.business_location && (
                <div className="flex items-start gap-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <MapPin className="w-6 h-6 text-gray-600 flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 mb-1">Location</p>
                    <p className="text-gray-700">{brandContact.business_location}</p>
                  </div>
                </div>
              )}

              {brandContact.business_hours && (
                <div className="flex items-start gap-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <Clock className="w-6 h-6 text-gray-600 flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 mb-1">Business Hours</p>
                    <p className="text-gray-700">{brandContact.business_hours}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-3">Next Steps:</h3>
              <ol className="list-decimal list-inside space-y-2 text-gray-700">
                <li>Contact the seller using the information above</li>
                <li>Confirm product availability and pricing</li>
                <li>Arrange payment and delivery directly with the seller</li>
                <li>Complete your purchase</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Order form ───────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Product Details */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="mb-6">
              {product.images && product.images.length > 0 ? (
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-64 object-cover rounded-lg"
                />
              ) : (
                <div className="w-full h-64 bg-gray-100 rounded-lg flex flex-col items-center justify-center gap-2">
                  {product.is_digital ? (
                    <>
                      <FileText className="w-16 h-16 text-purple-300" />
                      <span className="text-sm text-gray-400">Digital Product</span>
                    </>
                  ) : (
                    <Package className="w-16 h-16 text-gray-300" />
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
              {product.is_digital && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">
                  <Zap className="w-3 h-3" /> Instant Download
                </span>
              )}
            </div>

            <div className="flex items-center gap-4 mb-4">
              <div className="text-3xl font-bold text-purple-600">
                KES {parseFloat(product.price).toLocaleString()}
              </div>
              {product.compare_at_price && parseFloat(product.compare_at_price) > parseFloat(product.price) && (
                <div className="text-lg text-gray-500 line-through">
                  KES {parseFloat(product.compare_at_price).toLocaleString()}
                </div>
              )}
            </div>

            {product.description && (
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                <p className="text-gray-600">{product.description}</p>
              </div>
            )}

            {product.category && (
              <div className="mb-4">
                <span className="inline-block px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full">
                  {product.category}
                </span>
              </div>
            )}

            {product.is_digital && (
              <div className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <div className="flex items-center gap-2 text-purple-700 font-medium mb-1">
                  <Download className="w-4 h-4" />
                  Instant digital delivery
                </div>
                <p className="text-sm text-purple-600">
                  You will receive a secure download link immediately after purchase. Link valid for 24 hours.
                </p>
              </div>
            )}
          </div>

          {/* Order Form */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <ShoppingCart className="w-6 h-6 text-purple-600" />
              {product.is_digital ? 'Get Instant Access' : 'Place Your Order'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Quantity (hide for digital – usually 1 licence) */}
              {!product.is_digital && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    min="1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              )}

              {/* Customer Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <User className="w-4 h-4" /> Your Name *
                </label>
                <input
                  type="text"
                  name="customer_name"
                  value={formData.customer_name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Mail className="w-4 h-4" /> Email Address *
                </label>
                <input
                  type="email"
                  name="customer_email"
                  value={formData.customer_email}
                  onChange={handleChange}
                  placeholder="john@example.com"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                {product.is_digital && (
                  <p className="text-xs text-gray-400 mt-1">Your order confirmation will be linked to this email.</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Phone className="w-4 h-4" /> Phone Number *
                </label>
                <input
                  type="tel"
                  name="customer_phone"
                  value={formData.customer_phone}
                  onChange={handleChange}
                  placeholder="+254712345678"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              {/* Delivery Address – only for physical products */}
              {!product.is_digital && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <MapPin className="w-4 h-4" /> Delivery Address (Optional)
                  </label>
                  <textarea
                    name="delivery_address"
                    value={formData.delivery_address}
                    onChange={handleChange}
                    placeholder="123 Main Street, Nairobi"
                    rows="2"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {product.is_digital ? 'Notes (Optional)' : 'Additional Notes (Optional)'}
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Any special requests or questions..."
                  rows="2"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              {/* Order Total */}
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-700">Subtotal:</span>
                  <span className="font-semibold text-gray-900">KES {calculateTotal().toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-lg font-bold border-t pt-2">
                  <span className="text-gray-900">Total:</span>
                  <span className="text-purple-600">KES {calculateTotal().toLocaleString()}</span>
                </div>
              </div>

              {/* Info Notice */}
              {product.is_digital ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm text-green-800">
                  <p className="font-medium mb-1 flex items-center gap-1">
                    <Zap className="w-4 h-4" /> Instant delivery
                  </p>
                  <p>After clicking the button below, you will immediately see your download link. No waiting required.</p>
                </div>
              ) : (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
                  <p className="font-medium mb-1">What happens next?</p>
                  <p>After placing your order, you'll receive the seller's contact information. Contact them directly to complete your purchase.</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center gap-2 font-semibold text-lg"
              >
                {submitting ? (
                  <><Loader className="w-5 h-5 animate-spin" /> Processing...</>
                ) : product.is_digital ? (
                  <><CreditCard className="w-5 h-5" /> Pay KES {calculateTotal().toLocaleString()}</>
                ) : (
                  <><CreditCard className="w-5 h-5" /> Pay KES {calculateTotal().toLocaleString()}</>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
