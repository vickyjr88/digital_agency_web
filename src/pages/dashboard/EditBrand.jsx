import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Briefcase, Hash, MessageSquare, Save, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function EditBrand() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        industry: '',
        description: '',
        voice: 'Professional',
        hashtags: '',
        custom_instructions: ''
    });

    useEffect(() => {
        fetchBrand();
    }, [id]);

    const fetchBrand = async () => {
        try {
            const data = await api.request(`/brands/${id}`);
            setFormData({
                name: data.name || '',
                industry: data.industry || '',
                description: data.description || '',
                voice: data.voice || 'Professional',
                hashtags: data.hashtags ? data.hashtags.join(', ') : '',
                custom_instructions: data.custom_instructions || ''
            });
        } catch (err) {
            setError(err.message);
            toast.error('Failed to load brand details');
        } finally {
            setFetching(false);
        }
    };

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        setError('');

        try {
            const hashtagsArray = formData.hashtags
                .split(',')
                .map((tag) => tag.trim())
                .filter((tag) => tag.length > 0)
                .map((tag) => (tag.startsWith('#') ? tag : `#${tag}`));

            const payload = {
                ...formData,
                hashtags: hashtagsArray,
                content_focus: [] // Keep existing or empty
            };

            await api.request(`/brands/${id}`, {
                method: 'PUT',
                body: JSON.stringify(payload)
            });
            toast.success('Brand updated successfully');
            setTimeout(() => navigate(`/brand/${id}`), 500);
        } catch (err) {
            setError(err.message);
            toast.error('Failed to update brand');
        } finally {
            setLoading(false);
        }
    };

    if (fetching) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;

    return (
        <div className="bg-gray-50 p-8 font-sans flex justify-center h-full">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-2xl">
                <button
                    onClick={() => navigate(`/brand/${id}`)}
                    className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-6 transition-colors"
                >
                    <ArrowLeft size={18} /> Back to Brand
                </button>

                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                    <div className="p-8 border-b border-gray-100 bg-gray-50/50">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600">
                                <Briefcase size={24} />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Edit Brand</h1>
                                <p className="text-gray-500">Update your brand identity</p>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 space-y-6">
                        {error && (
                            <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3 border border-red-100">
                                <AlertCircle size={20} />
                                {error}
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Brand Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Industry</label>
                                <input
                                    type="text"
                                    name="industry"
                                    value={formData.industry}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows={3}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                    <MessageSquare size={16} /> Brand Voice
                                </label>
                                <select
                                    name="voice"
                                    value={formData.voice}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all bg-white"
                                >
                                    <option value="Professional">Professional</option>
                                    <option value="Casual">Casual</option>
                                    <option value="Humorous">Humorous</option>
                                    <option value="Energetic">Energetic</option>
                                    <option value="Authoritative">Authoritative</option>
                                    <option value="Friendly">Friendly</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                    <Hash size={16} /> Hashtags
                                </label>
                                <input
                                    type="text"
                                    name="hashtags"
                                    value={formData.hashtags}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                    placeholder="e.g. tech, innovation (comma separated)"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Custom Instructions (Optional)</label>
                            <textarea
                                name="custom_instructions"
                                value={formData.custom_instructions}
                                onChange={handleChange}
                                rows={2}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none"
                            />
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-4 px-6 rounded-xl transition-all shadow-lg shadow-indigo-200 disabled:opacity-70"
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <Save size={20} /> Save Changes
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </motion.div>
        </div>
    );
}
