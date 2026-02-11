import { useState } from 'react';
import { toast } from 'sonner';
import {
    Download,
    Mail,
    FileText,
    Search,
    Clock,
    CheckCircle,
    AlertCircle,
    Loader,
    Package,
    ExternalLink
} from 'lucide-react';
import { digitalProductsApi } from '../../../services/affiliateApi';

export default function DigitalLibrary() {
    const [email, setEmail] = useState('');
    const [purchases, setPurchases] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);

    const handleLookup = async (e) => {
        e.preventDefault();
        if (!email) {
            toast.error('Please enter your email address');
            return;
        }

        setLoading(true);
        try {
            const response = await digitalProductsApi.lookupPurchases(email);
            setPurchases(response.data || []);
            setSearched(true);
            if (!response.data || response.data.length === 0) {
                toast.info('No digital purchases found for this email.');
            }
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Failed to look up purchases');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'active':
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3" /> Active
                    </span>
                );
            case 'expired':
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        <AlertCircle className="w-3 h-3" /> Expired
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {status}
                    </span>
                );
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-3xl mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-10">
                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Download className="w-8 h-8 text-purple-600" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Digital Library</h1>
                    <p className="text-gray-600">
                        Enter your email to access your digital product downloads.
                    </p>
                </div>

                {/* Email Lookup Form */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                    <form onSubmit={handleLookup} className="flex gap-3">
                        <div className="flex-1 relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your purchase email..."
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2 font-medium"
                        >
                            {loading ? (
                                <Loader className="w-5 h-5 animate-spin" />
                            ) : (
                                <Search className="w-5 h-5" />
                            )}
                            Look Up
                        </button>
                    </form>
                </div>

                {/* Purchases List */}
                {searched && (
                    <div className="space-y-4">
                        {purchases.length === 0 ? (
                            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                                <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                <h3 className="text-lg font-medium text-gray-900 mb-1">No Purchases Found</h3>
                                <p className="text-gray-500 text-sm">
                                    No digital purchases were found for <strong>{email}</strong>.
                                    Make sure you're using the same email used when ordering.
                                </p>
                            </div>
                        ) : (
                            <>
                                <h2 className="text-xl font-semibold text-gray-900">
                                    {purchases.length} Purchase{purchases.length !== 1 ? 's' : ''} Found
                                </h2>
                                {purchases.map((purchase) => {
                                    const downloadUrl = purchase.access_token
                                        ? digitalProductsApi.getDownloadUrl(purchase.access_token)
                                        : null;

                                    return (
                                        <div key={purchase.id} className="bg-white rounded-lg shadow-sm p-6">
                                            <div className="flex items-start gap-4">
                                                <div className="w-14 h-14 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                                    <FileText className="w-7 h-7 text-purple-600" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 flex-wrap mb-1">
                                                        <h3 className="font-semibold text-gray-900 text-lg">
                                                            {purchase.product_name || 'Digital Product'}
                                                        </h3>
                                                        {getStatusBadge(purchase.status)}
                                                    </div>

                                                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                                                        <span className="flex items-center gap-1">
                                                            <Clock className="w-4 h-4" />
                                                            {new Date(purchase.purchased_at || purchase.created_at).toLocaleDateString()}
                                                        </span>
                                                        {purchase.download_count !== undefined && (
                                                            <span className="flex items-center gap-1">
                                                                <Download className="w-4 h-4" />
                                                                {purchase.download_count} download{purchase.download_count !== 1 ? 's' : ''}
                                                            </span>
                                                        )}
                                                    </div>

                                                    {purchase.status === 'active' && downloadUrl && (
                                                        <a
                                                            href={downloadUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                                                        >
                                                            <Download className="w-4 h-4" />
                                                            Download
                                                            <ExternalLink className="w-3 h-3" />
                                                        </a>
                                                    )}

                                                    {purchase.status === 'expired' && (
                                                        <p className="text-sm text-red-600 mt-1">
                                                            This download has expired. Contact the seller for assistance.
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
