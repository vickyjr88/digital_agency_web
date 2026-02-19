import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Loader,
  CheckCircle,
  XCircle,
  Download,
  FileText,
  MessageCircle,
  Mail,
  Phone,
  MapPin,
  Clock,
  ExternalLink,
  Package,
} from 'lucide-react';
import { ordersApi, productsApi } from '../../../services/affiliateApi';

export default function PaymentVerify() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const reference = searchParams.get('reference');

  const [verifying, setVerifying] = useState(true);
  const [paymentResult, setPaymentResult] = useState(null);
  const [downloadLoading, setDownloadLoading] = useState(false);

  useEffect(() => {
    if (reference) {
      verifyPayment();
    } else {
      setVerifying(false);
      toast.error('No payment reference found');
    }
  }, [reference]);

  const verifyPayment = async () => {
    try {
      setVerifying(true);
      const response = await ordersApi.verifyPayment(reference);
      setPaymentResult(response.data);

      if (response.data.status === 'success') {
        toast.success('Payment successful!');
      } else {
        toast.error('Payment failed or was cancelled');
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to verify payment');
      console.error(error);
      setPaymentResult({ status: 'error', message: 'Verification failed' });
    } finally {
      setVerifying(false);
    }
  };

  const handleDownload = async () => {
    if (!paymentResult?.download_url) return;
    setDownloadLoading(true);
    try {
      window.open(paymentResult.download_url, '_blank', 'noopener,noreferrer');
    } catch (err) {
      toast.error('Could not open download link. Please try again.');
      console.error(err);
    } finally {
      setDownloadLoading(false);
    }
  };

  // ── Loading ──────────────────────────────────────────────────────────────
  if (verifying) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Verifying your payment...</p>
          <p className="text-sm text-gray-400 mt-2">Please wait</p>
        </div>
      </div>
    );
  }

  // ── Payment Failed ───────────────────────────────────────────────────────
  if (!paymentResult || paymentResult.status === 'failed' || paymentResult.status === 'error') {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-12 h-12 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Failed</h1>
            <p className="text-gray-500 mb-6">
              {paymentResult?.message || 'Your payment was not successful. Please try again.'}
            </p>
            <div className="flex gap-3 justify-center">
              <Link
                to="/shop"
                className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-medium"
              >
                Back to Shop
              </Link>
              <button
                onClick={() => navigate(-1)}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Digital Product Success ──────────────────────────────────────────────
  if (paymentResult.status === 'success' && paymentResult.download_url) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
            <p className="text-gray-500 mb-6">
              Your digital product is ready. Click the button below to download it.
              The link is valid for 24 hours.
            </p>

            {/* Order Info */}
            <div className="flex items-center gap-4 bg-gray-50 rounded-xl p-4 mb-6 text-left">
              <div className="w-14 h-14 bg-purple-100 rounded-lg flex items-center justify-center shrink-0">
                <FileText className="w-7 h-7 text-purple-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900">Order #{paymentResult.order_number}</p>
                {paymentResult.download_file_name && (
                  <p className="text-sm text-gray-500 truncate">{paymentResult.download_file_name}</p>
                )}
                <p className="text-sm font-medium text-purple-600">
                  KES {(paymentResult.amount / 100).toLocaleString()}
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

            <Link
              to="/shop"
              className="inline-block text-sm text-gray-500 hover:text-gray-700"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Physical Product Success ─────────────────────────────────────────────
  if (paymentResult.status === 'success' && paymentResult.brand_contact) {
    const brandContact = paymentResult.brand_contact;

    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4">
          {/* Success Message */}
          <div className="bg-white rounded-lg shadow-lg p-8 text-center mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
            <p className="text-gray-600 mb-6">
              Order #{paymentResult.order_number} has been placed. Please contact the seller to arrange delivery.
            </p>

            {/* Order Summary */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-purple-100 rounded flex items-center justify-center">
                  <Package className="w-8 h-8 text-purple-600" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-semibold text-gray-900">Order Confirmed</p>
                  <p className="text-lg font-bold text-purple-600">
                    KES {(paymentResult.amount / 100).toLocaleString()}
                  </p>
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

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Next Steps:</h3>
              <ol className="list-decimal list-inside space-y-2 text-gray-700">
                <li>Contact the seller using the information above</li>
                <li>Confirm product availability and delivery details</li>
                <li>Arrange delivery or pickup with the seller</li>
              </ol>
            </div>

            <Link
              to="/shop"
              className="block text-center px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-medium"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Default Success (no specific product type) ───────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
          <p className="text-gray-500 mb-6">
            Your order has been confirmed. Order #{paymentResult.order_number}
          </p>
          <Link
            to="/shop"
            className="inline-block px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
