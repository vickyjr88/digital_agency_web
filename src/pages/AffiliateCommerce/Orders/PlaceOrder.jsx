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
import { productsApi, ordersApi, affiliateApi, brandProfileApi, digitalProductsApi } from '../../../services/affiliateApi';
import { useAuth } from '../../../context/AuthContext';
import SEO from '../../../components/SEO';

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
  const [accessToken, setAccessToken] = useState(null);
  const [orderResponse, setOrderResponse] = useState(null);
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
          <Loader className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
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

  // ── Order form ───────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <SEO
        title={`${product.name} - Buy on Dexter Shop`}
        description={product.description || `Buy ${product.name} on Dexter Shop. ${product.is_digital ? 'Instant digital delivery' : 'Fast shipping available'}. KES ${parseFloat(product.price).toLocaleString()}`}
        image={product.images && product.images.length > 0 ? product.images[0] : (product.thumbnail || null)}
        imageAlt={product.name}
        type="product"
        keywords={`${product.category || 'product'}, ${product.name}, ${product.is_digital ? 'digital download' : 'buy online'}, Dexter shop, Kenya e-commerce`}
        product={{
          price: product.price,
          currency: 'KES',
          availability: product.status === 'active' ? 'in stock' : 'out of stock',
          brand: 'Dexter Shop',
          condition: 'new',
        }}
      />
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
                      <FileText className="w-16 h-16 text-blue-300" />
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
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                  <Zap className="w-3 h-3" /> Instant Download
                </span>
              )}
            </div>

            <div className="flex items-center gap-4 mb-4">
              <div className="text-3xl font-bold text-blue-600">
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
                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                  {product.category}
                </span>
              </div>
            )}

            {!product.is_digital && product.shipping_info && (
              <div className="border-t pt-4">
                <h3 className="font-semibold text-gray-900 mb-2">Shipping Information</h3>
                <p className="text-gray-600 text-sm">{product.shipping_info}</p>
              </div>
            )}

            {product.is_digital && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 text-blue-700 font-medium mb-1">
                  <Download className="w-4 h-4" />
                  Instant digital delivery
                </div>
                <p className="text-sm text-blue-600">
                  Payment required via Paystack. You will receive access after successful payment.
                </p>
              </div>
            )}
          </div>

          {/* Order Form */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <ShoppingCart className="w-6 h-6 text-blue-600" />
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Order Total */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-700">Subtotal:</span>
                  <span className="font-semibold text-gray-900">KES {calculateTotal().toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-lg font-bold border-t pt-2">
                  <span className="text-gray-900">Total:</span>
                  <span className="text-blue-600">KES {calculateTotal().toLocaleString()}</span>
                </div>
              </div>

              {/* Info Notice */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
                <p className="font-medium mb-1">{product.is_digital ? '💳 Secure Payment Required' : 'What happens next?'}</p>
                <p>
                  {product.is_digital
                    ? 'You will be redirected to Paystack to complete your payment. After successful payment, you\'ll get instant download access.'
                    : 'You will be redirected to Paystack to complete your payment. After payment, you\'ll receive the seller\'s contact information.'
                  }
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2 font-semibold text-lg"
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
