import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Package,
  Filter,
  Search,
  User,
  Phone,
  Mail,
  MapPin,
  DollarSign,
  TrendingUp,
  CheckCircle,
  Clock,
  XCircle,
  Loader,
  Eye
} from 'lucide-react';
import { ordersApi } from '../../../services/affiliateApi';

export default function BrandOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [updatingStatus, setUpdatingStatus] = useState(null);

  useEffect(() => {
    loadOrders();
  }, [statusFilter]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const status = statusFilter === 'all' ? null : statusFilter;
      const response = await ordersApi.getBrandOrders(status);
      setOrders(response.data);
    } catch (error) {
      toast.error('Failed to load orders');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      setUpdatingStatus(orderId);
      await ordersApi.updateStatus(orderId, { status: newStatus });
      toast.success(`Order marked as ${newStatus}`);
      loadOrders();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to update status');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const filteredOrders = orders.filter(order =>
    order.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.customer_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.product?.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'contacted': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-purple-100 text-purple-800';
      case 'fulfilled': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'fulfilled': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      default: return <Package className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
          <p className="text-gray-600 mt-2">
            Manage customer orders and mark them as fulfilled
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Package className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">
                  {orders.filter(o => o.status === 'pending').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-gray-900">
                  {orders.filter(o => o.status === 'in_progress').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Fulfilled</p>
                <p className="text-2xl font-bold text-gray-900">
                  {orders.filter(o => o.status === 'fulfilled').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Cancelled</p>
                <p className="text-2xl font-bold text-gray-900">
                  {orders.filter(o => o.status === 'cancelled').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search orders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">All Orders</option>
                <option value="pending">Pending</option>
                <option value="contacted">Contacted</option>
                <option value="in_progress">In Progress</option>
                <option value="fulfilled">Fulfilled</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchQuery ? 'No orders found' : 'No orders yet'}
            </h3>
            <p className="text-gray-600">
              {searchQuery
                ? 'Try adjusting your search terms'
                : 'Orders from your products will appear here'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                  {/* Product Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {order.order_number}
                          </h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(order.status)}`}>
                            {getStatusIcon(order.status)}
                            {order.status.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="text-gray-600">
                          {order.product?.name} x {order.quantity}
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatDate(order.created_at)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Order Total</p>
                        <p className="text-2xl font-bold text-purple-600">
                          KES {parseFloat(order.total_amount).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* Customer Info */}
                    <div className="grid md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg mb-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="font-medium text-gray-700">Customer:</span>
                          <span className="text-gray-900">{order.customer_name}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <a href={`tel:${order.customer_phone}`} className="text-purple-600 hover:underline">
                            {order.customer_phone}
                          </a>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <a href={`mailto:${order.customer_email}`} className="text-purple-600 hover:underline">
                            {order.customer_email}
                          </a>
                        </div>
                      </div>
                      <div className="space-y-2">
                        {order.delivery_address && (
                          <div className="flex items-start gap-2 text-sm">
                            <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                            <div>
                              <span className="font-medium text-gray-700">Address:</span>
                              <p className="text-gray-900">{order.delivery_address}</p>
                            </div>
                          </div>
                        )}
                        {order.notes && (
                          <div className="text-sm">
                            <span className="font-medium text-gray-700">Notes:</span>
                            <p className="text-gray-900">{order.notes}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Commission Info */}
                    {order.affiliate_link && (
                      <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-5 h-5 text-green-600" />
                          <div>
                            <p className="text-sm font-medium text-green-900">
                              Commission: KES {parseFloat(order.commission?.net_commission || 0).toLocaleString()}
                            </p>
                            <p className="text-xs text-green-700">
                              To @{order.affiliate_link?.influencer?.instagram_handle || 'Influencer'}
                            </p>
                          </div>
                        </div>
                        {order.status === 'fulfilled' && (
                          <span className="text-xs font-medium text-green-700 bg-green-100 px-2 py-1 rounded">
                            Paid
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="lg:w-48 flex flex-col gap-2">
                    {order.status !== 'fulfilled' && order.status !== 'cancelled' && (
                      <>
                        {order.status === 'pending' && (
                          <button
                            onClick={() => handleStatusUpdate(order.id, 'contacted')}
                            disabled={updatingStatus === order.id}
                            className="px-4 py-2 border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50 disabled:opacity-50 text-sm font-medium"
                          >
                            {updatingStatus === order.id ? 'Updating...' : 'Mark Contacted'}
                          </button>
                        )}
                        {(order.status === 'pending' || order.status === 'contacted') && (
                          <button
                            onClick={() => handleStatusUpdate(order.id, 'in_progress')}
                            disabled={updatingStatus === order.id}
                            className="px-4 py-2 border border-purple-300 text-purple-700 rounded-lg hover:bg-purple-50 disabled:opacity-50 text-sm font-medium"
                          >
                            {updatingStatus === order.id ? 'Updating...' : 'Mark In Progress'}
                          </button>
                        )}
                        <button
                          onClick={() => {
                            if (confirm('Mark this order as fulfilled? This will immediately pay commission to the influencer.')) {
                              handleStatusUpdate(order.id, 'fulfilled');
                            }
                          }}
                          disabled={updatingStatus === order.id}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm font-medium flex items-center justify-center gap-2"
                        >
                          {updatingStatus === order.id ? (
                            <>
                              <Loader className="w-4 h-4 animate-spin" />
                              Updating...
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-4 h-4" />
                              Mark Fulfilled
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Cancel this order?')) {
                              handleStatusUpdate(order.id, 'cancelled');
                            }
                          }}
                          disabled={updatingStatus === order.id}
                          className="px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 disabled:opacity-50 text-sm font-medium"
                        >
                          {updatingStatus === order.id ? 'Updating...' : 'Cancel Order'}
                        </button>
                      </>
                    )}
                    {order.status === 'fulfilled' && (
                      <div className="px-4 py-2 bg-green-100 text-green-800 rounded-lg text-center font-medium text-sm">
                        Order Completed
                      </div>
                    )}
                    {order.status === 'cancelled' && (
                      <div className="px-4 py-2 bg-red-100 text-red-800 rounded-lg text-center font-medium text-sm">
                        Order Cancelled
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
