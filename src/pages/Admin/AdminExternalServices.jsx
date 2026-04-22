import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { toast } from 'sonner';
import { Key, Plus, Trash2, Copy, ShieldCheck, Globe } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminExternalServices() {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newAppName, setNewAppName] = useState('');
    const [newKey, setNewKey] = useState(null);

    useEffect(() => {
        fetchServices();
    }, []);

    const fetchServices = async () => {
        setLoading(true);
        try {
            const res = await api.getExternalServices();
            setServices(res);
        } catch (error) {
            console.error('Error fetching external services:', error);
            toast.error('Failed to load external services');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!newAppName.trim()) return;

        try {
            const res = await api.registerExternalApp(newAppName);
            toast.success('External application registered');
            setNewKey(res.access_key);
            setNewAppName('');
            fetchServices();
        } catch (error) {
            console.error('Error registering app:', error);
            toast.error(error.message || 'Failed to register app');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this external service? Access keys for this app will stop working immediately.')) return;

        try {
            await api.deleteExternalService(id);
            toast.success('Service deleted');
            fetchServices();
        } catch (error) {
            console.error('Error deleting service:', error);
            toast.error('Failed to delete service');
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        toast.success('Copied to clipboard');
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">External Services</h2>
                    <p className="text-gray-500">Manage API access for external applications</p>
                </div>
                <button
                    onClick={() => { setShowCreateModal(true); setNewKey(null); }}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors shadow-sm"
                >
                    <Plus size={18} />
                    Register New App
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full border-collapse">
                        <thead>
                            <tr className="text-left bg-gray-50 border-b border-gray-200">
                                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Application Name</th>
                                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Access Key</th>
                                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Created</th>
                                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="p-12 text-center text-gray-500">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                                        Loading services...
                                    </td>
                                </tr>
                            ) : services.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="p-12 text-center text-gray-500 italic">
                                        No external services registered yet
                                    </td>
                                </tr>
                            ) : (
                                services.map(service => (
                                    <tr key={service.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600">
                                                    <Globe size={16} />
                                                </div>
                                                <span className="font-medium text-gray-900">{service.name}</span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <code className="bg-gray-100 px-2 py-1 rounded text-xs text-gray-600 font-mono">
                                                    {service.api_key.substring(0, 10)}...{service.api_key.substring(service.api_key.length - 4)}
                                                </code>
                                                <button
                                                    onClick={() => copyToClipboard(service.api_key)}
                                                    className="p-1 text-gray-400 hover:text-indigo-600 transition-colors"
                                                    title="Copy full key"
                                                >
                                                    <Copy size={14} />
                                                </button>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${service.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {service.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-sm text-gray-500">
                                            {new Date(service.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="p-4 text-right">
                                            <button
                                                onClick={() => handleDelete(service.id)}
                                                className="p-2 text-gray-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50"
                                                title="Delete App"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl"
                    >
                        {newKey ? (
                            <div className="text-center space-y-6">
                                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                                    <ShieldCheck size={32} />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-xl font-bold text-gray-900">App Registered!</h3>
                                    <p className="text-sm text-gray-500">Copy this key now. For security, it won't be shown again.</p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 relative group">
                                    <p className="text-xs font-mono text-gray-800 break-all">{newKey}</p>
                                    <button
                                        onClick={() => copyToClipboard(newKey)}
                                        className="absolute top-2 right-2 p-2 bg-white rounded-lg shadow-sm border border-gray-100 text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <Copy size={16} />
                                    </button>
                                </div>
                                <button
                                    onClick={() => setShowCreateModal(false)}
                                    className="w-full py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-colors"
                                >
                                    Done
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-xl font-bold text-gray-900">Register External App</h3>
                                    <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600">
                                        <Plus size={24} className="rotate-45" />
                                    </button>
                                </div>
                                <form onSubmit={handleCreate} className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-700">Application Name</label>
                                        <input
                                            type="text"
                                            value={newAppName}
                                            onChange={(e) => setNewAppName(e.target.value)}
                                            placeholder="e.g. My Delivery App"
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                            required
                                            autoFocus
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
                                    >
                                        Generate Access Key
                                    </button>
                                </form>
                            </div>
                        )}
                    </motion.div>
                </div>
            )}
        </div>
    );
}
