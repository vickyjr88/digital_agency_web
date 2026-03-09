import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { adminCommerceApi, productsApi } from '../../services/affiliateApi';
import {
    ShoppingCart, Package, Search, Download, RefreshCw, ChevronLeft, ChevronRight,
    ExternalLink, FileText, Filter, Eye
} from 'lucide-react';

const STATUS_COLORS = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    processing: 'bg-indigo-100 text-indigo-800',
    fulfilled: 'bg-green-100 text-green-800',
    shipped: 'bg-cyan-100 text-cyan-800',
    delivered: 'bg-emerald-100 text-emerald-800',
    cancelled: 'bg-red-100 text-red-800',
    refunded: 'bg-gray-100 text-gray-600',
    active: 'bg-green-100 text-green-800',
    draft: 'bg-gray-100 text-gray-600',
    archived: 'bg-red-100 text-red-700',
    out_of_stock: 'bg-orange-100 text-orange-700',
};

const ORDER_STATUSES = ['pending', 'confirmed', 'processing', 'fulfilled', 'shipped', 'delivered', 'cancelled', 'refunded'];
const PRODUCT_STATUSES = ['active', 'draft', 'archived', 'out_of_stock'];

export default function AdminCommerce() {
    const [tab, setTab] = useState('orders'); // orders | products
    const [loading, setLoading] = useState(true);
    const [orders, setOrders] = useState([]);
    const [products, setProducts] = useState([]);
    const [orderMeta, setOrderMeta] = useState({ total: 0, page: 1, pages: 1 });
    const [productMeta, setProductMeta] = useState({ total: 0, page: 1, pages: 1 });
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [page, setPage] = useState(1);

    const fetchOrders = useCallback(async (p = 1) => {
        setLoading(true);
        try {
            const res = await adminCommerceApi.getAllOrders({
                page: p,
                limit: 30,
                status_filter: statusFilter !== 'all' ? statusFilter : undefined,
                search: search || undefined,
            });
            setOrders(res.data.orders);
            setOrderMeta({ total: res.data.total, page: res.data.page, pages: res.data.pages });
        } catch (err) {
            toast.error('Failed to load orders');
        } finally {
            setLoading(false);
        }
    }, [statusFilter, search]);

    const fetchProducts = useCallback(async (p = 1) => {
        setLoading(true);
        try {
            const res = await adminCommerceApi.getAllProducts({
                page: p,
                limit: 30,
                status_filter: statusFilter !== 'all' ? statusFilter : undefined,
                search: search || undefined,
            });
            setProducts(res.data.products);
            setProductMeta({ total: res.data.total, page: res.data.page, pages: res.data.pages });
        } catch (err) {
            toast.error('Failed to load products');
        } finally {
            setLoading(false);
        }
    }, [statusFilter, search]);

    useEffect(() => {
        setPage(1);
        setStatusFilter('all');
        setSearch('');
    }, [tab]);

    useEffect(() => {
        if (tab === 'orders') fetchOrders(page);
        else fetchProducts(page);
    }, [tab, page, statusFilter, search, fetchOrders, fetchProducts]);

    const handleStatusChange = async (orderId, newStatus) => {
        try {
            await adminCommerceApi.updateOrderStatus(orderId, { status: newStatus });
            toast.success(`Order status updated to ${newStatus}`);
            fetchOrders(orderMeta.page);
        } catch (err) {
            toast.error(err?.response?.data?.detail || 'Failed to update status');
        }
    };

    const handleDownloadFromOrder = async (orderId) => {
        try {
            const res = await adminCommerceApi.downloadDigitalProduct(orderId);
            window.open(res.data.download_url, '_blank');
            toast.success(`Downloading ${res.data.file_name}`);
        } catch (err) {
            toast.error(err?.response?.data?.detail || 'Failed to get download link');
        }
    };

    const handleDownloadFromProduct = async (productId) => {
        try {
            const res = await adminCommerceApi.downloadProductFile(productId);
            window.open(res.data.download_url, '_blank');
            toast.success(`Downloading ${res.data.file_name}`);
        } catch (err) {
            toast.error(err?.response?.data?.detail || 'Failed to get download link');
        }
    };

    const statuses = tab === 'orders' ? ORDER_STATUSES : PRODUCT_STATUSES;
    const meta = tab === 'orders' ? orderMeta : productMeta;

    return (
        <div>
            {/* Tab Switcher */}
            <div className="flex gap-2 mb-6">
                <button
                    onClick={() => setTab('orders')}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${tab === 'orders'
                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                            : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                        }`}
                >
                    <ShoppingCart size={16} /> Orders
                </button>
                <button
                    onClick={() => setTab('products')}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${tab === 'products'
                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                            : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                        }`}
                >
                    <Package size={16} /> Products / Offerings
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3 mb-4">
                <div className="relative flex-1 min-w-[200px]">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder={tab === 'orders' ? 'Search by order #, customer name or email...' : 'Search by product name or category...'}
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
                    />
                </div>
                <div className="relative">
                    <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <select
                        value={statusFilter}
                        onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                        className="pl-10 pr-8 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white appearance-none cursor-pointer"
                    >
                        <option value="all">All Statuses</option>
                        {statuses.map(s => (
                            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1).replace(/_/g, ' ')}</option>
                        ))}
                    </select>
                </div>
                <button
                    onClick={() => tab === 'orders' ? fetchOrders(page) : fetchProducts(page)}
                    className="p-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-gray-500"
                    title="Refresh"
                >
                    <RefreshCw size={16} />
                </button>
            </div>

            {/* Stats Bar */}
            <div className="flex items-center justify-between mb-3 text-sm text-gray-500">
                <span>{meta.total} {tab === 'orders' ? 'orders' : 'products'} total</span>
                <span>Page {meta.page} of {meta.pages || 1}</span>
            </div>

            {/* Content */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
                </div>
            ) : tab === 'orders' ? (
                <OrdersTable
                    orders={orders}
                    onStatusChange={handleStatusChange}
                    onDownload={handleDownloadFromOrder}
                />
            ) : (
                <ProductsTable
                    products={products}
                    onDownload={handleDownloadFromProduct}
                />
            )}

            {/* Pagination */}
            {meta.pages > 1 && (
                <div className="flex items-center justify-center gap-3 mt-6">
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page <= 1}
                        className="flex items-center gap-1 px-4 py-2 text-sm font-medium border border-gray-200 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                    >
                        <ChevronLeft size={16} /> Prev
                    </button>
                    <div className="flex gap-1">
                        {Array.from({ length: Math.min(5, meta.pages) }, (_, i) => {
                            let pageNum;
                            if (meta.pages <= 5) pageNum = i + 1;
                            else if (page <= 3) pageNum = i + 1;
                            else if (page >= meta.pages - 2) pageNum = meta.pages - 4 + i;
                            else pageNum = page - 2 + i;
                            return (
                                <button
                                    key={pageNum}
                                    onClick={() => setPage(pageNum)}
                                    className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${page === pageNum ? 'bg-indigo-600 text-white' : 'hover:bg-gray-100 text-gray-600'
                                        }`}
                                >
                                    {pageNum}
                                </button>
                            );
                        })}
                    </div>
                    <button
                        onClick={() => setPage(p => Math.min(meta.pages, p + 1))}
                        disabled={page >= meta.pages}
                        className="flex items-center gap-1 px-4 py-2 text-sm font-medium border border-gray-200 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                    >
                        Next <ChevronRight size={16} />
                    </button>
                </div>
            )}
        </div>
    );
}

function OrdersTable({ orders, onStatusChange, onDownload }) {
    if (orders.length === 0) {
        return (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                <ShoppingCart size={40} className="mx-auto text-gray-200 mb-3" />
                <p className="text-gray-500 font-medium">No orders found</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full border-collapse">
                    <thead>
                        <tr className="text-left bg-gray-50 border-b border-gray-200">
                            <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Order</th>
                            <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                            <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Product</th>
                            <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                            <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {orders.map(order => (
                            <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="p-4">
                                    <div className="font-mono text-xs font-medium text-indigo-600">{order.order_number}</div>
                                    {order.affiliate_code && (
                                        <div className="text-[10px] text-gray-400 mt-0.5">via {order.affiliate_code}</div>
                                    )}
                                </td>
                                <td className="p-4">
                                    <div className="text-sm font-medium text-gray-900">{order.customer_name || '—'}</div>
                                    <div className="text-xs text-gray-500">{order.customer_email}</div>
                                </td>
                                <td className="p-4">
                                    <div className="text-sm text-gray-900 max-w-[180px] truncate">{order.product_name}</div>
                                    <div className="flex items-center gap-1 mt-0.5">
                                        {order.is_digital && (
                                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-purple-50 text-purple-700 text-[10px] font-medium rounded-full">
                                                <FileText size={10} /> Digital
                                            </span>
                                        )}
                                        <span className="text-[10px] text-gray-400">×{order.quantity}</span>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <div className="text-sm font-semibold text-gray-900">
                                        {order.currency} {order.total_amount.toLocaleString()}
                                    </div>
                                    {order.commission_amount > 0 && (
                                        <div className="text-[10px] text-gray-400">
                                            Commission: {order.currency} {order.commission_amount.toLocaleString()}
                                        </div>
                                    )}
                                </td>
                                <td className="p-4">
                                    <select
                                        value={order.status}
                                        onChange={(e) => onStatusChange(order.id, e.target.value)}
                                        className={`px-2 py-1 rounded-full text-xs font-medium border-0 cursor-pointer ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-600'}`}
                                    >
                                        {ORDER_STATUSES.map(s => (
                                            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                                        ))}
                                    </select>
                                </td>
                                <td className="p-4 text-xs text-gray-500 whitespace-nowrap">
                                    {order.created_at ? new Date(order.created_at).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: '2-digit' }) : '—'}
                                </td>
                                <td className="p-4">
                                    <div className="flex gap-1">
                                        {order.is_digital && order.has_digital_file && (
                                            <button
                                                onClick={() => onDownload(order.id)}
                                                className="p-1.5 rounded-lg text-purple-600 hover:bg-purple-50 transition-colors"
                                                title="Download digital file"
                                            >
                                                <Download size={15} />
                                            </button>
                                        )}
                                        {order.payment_reference && (
                                            <span className="p-1.5 text-green-600" title={`Ref: ${order.payment_reference}`}>
                                                <Eye size={15} />
                                            </span>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function ProductsTable({ products, onDownload }) {
    if (products.length === 0) {
        return (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                <Package size={40} className="mx-auto text-gray-200 mb-3" />
                <p className="text-gray-500 font-medium">No products found</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full border-collapse">
                    <thead>
                        <tr className="text-left bg-gray-50 border-b border-gray-200">
                            <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Product</th>
                            <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Brand</th>
                            <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Price</th>
                            <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                            <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Sales</th>
                            <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {products.map(product => (
                            <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        {product.thumbnail ? (
                                            <img
                                                src={product.thumbnail}
                                                alt={product.name}
                                                className="w-10 h-10 rounded-lg object-cover border border-gray-200"
                                            />
                                        ) : (
                                            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                                                <Package size={16} className="text-gray-400" />
                                            </div>
                                        )}
                                        <div>
                                            <div className="text-sm font-medium text-gray-900 max-w-[200px] truncate">{product.name}</div>
                                            <div className="text-[10px] text-gray-400">{product.category || 'Uncategorized'}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4 text-sm text-gray-600">{product.brand_name || 'N/A'}</td>
                                <td className="p-4">
                                    <div className="text-sm font-semibold text-gray-900">
                                        {product.currency} {product.price.toLocaleString()}
                                    </div>
                                    {product.commission_rate > 0 && (
                                        <div className="text-[10px] text-gray-400">
                                            {product.commission_type === 'percentage' ? `${product.commission_rate}% commission` : `Fixed commission`}
                                        </div>
                                    )}
                                </td>
                                <td className="p-4">
                                    {product.is_digital ? (
                                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-50 text-purple-700 text-xs font-medium rounded-full">
                                            <FileText size={12} /> Digital
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full">
                                            <Package size={12} /> Physical
                                        </span>
                                    )}
                                </td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${STATUS_COLORS[product.status] || 'bg-gray-100 text-gray-600'}`}>
                                        {product.status}
                                    </span>
                                </td>
                                <td className="p-4">
                                    <div className="text-sm font-medium text-gray-900">{product.total_orders}</div>
                                    {product.total_sales_amount > 0 && (
                                        <div className="text-[10px] text-gray-400">
                                            {product.currency} {product.total_sales_amount.toLocaleString()}
                                        </div>
                                    )}
                                </td>
                                <td className="p-4">
                                    <div className="flex gap-1">
                                        {product.is_digital && product.has_digital_file && (
                                            <button
                                                onClick={() => onDownload(product.id)}
                                                className="p-1.5 rounded-lg text-purple-600 hover:bg-purple-50 transition-colors"
                                                title={`Download: ${product.digital_file_name || 'digital file'}`}
                                            >
                                                <Download size={15} />
                                            </button>
                                        )}
                                        <a
                                            href={`/shop/p/${product.slug}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                                            title="View product page"
                                        >
                                            <ExternalLink size={15} />
                                        </a>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
