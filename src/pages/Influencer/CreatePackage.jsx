import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { packageApi } from '../../services/marketplaceApi';
import './InfluencerOnboarding.css'; // Reuse existing styles

const PLATFORMS = [
    { id: 'instagram', name: 'Instagram', icon: '📸' },
    { id: 'tiktok', name: 'TikTok', icon: '🎵' },
    { id: 'youtube', name: 'YouTube', icon: '▶️' },
    { id: 'twitter', name: 'Twitter/X', icon: '🐦' },
];

const CONTENT_TYPES = [
    { id: 'post', name: 'Post' },
    { id: 'story', name: 'Story' },
    { id: 'reel', name: 'Reel' },
    { id: 'video', name: 'Video' },
    { id: 'tweet', name: 'Tweet' },
    { id: 'carousel', name: 'Carousel' },
];

export default function CreatePackage() {
    const navigate = useNavigate();
    const { packageId } = useParams();
    const isEditMode = !!packageId;

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(isEditMode);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        platform: 'instagram',
        content_type: 'post',
        deliverables_count: 1,
        price: 5000,
        timeline_days: 3,
        revisions_included: 2,
        exclusions: '',
        // Requirements
        req_brand_guidelines: true,
        req_product_samples: false,
        req_hashtags: '',
        req_mentions: '',
        req_content_rights: 'shared',
    });

    useEffect(() => {
        if (isEditMode) {
            fetchPackageData();
        }
    }, [packageId]);

    const fetchPackageData = async () => {
        try {
            setFetching(true);
            const pkg = await packageApi.getById(packageId);

            setFormData({
                name: pkg.name || '',
                description: pkg.description || '',
                platform: pkg.platform?.toLowerCase() || 'instagram',
                content_type: pkg.content_type || 'post',
                deliverables_count: pkg.deliverables_count || 1,
                price: (pkg.price || 0) / 100, // Convert cents to KES for form
                timeline_days: pkg.timeline_days || 3,
                revisions_included: pkg.revisions_included || 2,
                exclusions: pkg.exclusions || '',
                // Requirements
                req_brand_guidelines: pkg.requirements?.brand_guidelines ?? true,
                req_product_samples: pkg.requirements?.product_samples ?? false,
                req_hashtags: pkg.requirements?.hashtags_required?.join(', ') || '',
                req_mentions: pkg.requirements?.mentions_required?.join(', ') || '',
                req_content_rights: pkg.requirements?.content_rights || 'shared',
            });
        } catch (err) {
            console.error('Error fetching package:', err);
            setError('Failed to load package data');
        } finally {
            setFetching(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Transform form data to API schema
            const payload = {
                name: formData.name,
                description: formData.description,
                platform: formData.platform,
                content_type: formData.content_type,
                deliverables_count: parseInt(formData.deliverables_count),
                price: parseInt(formData.price), // Backend now handles * 100
                timeline_days: parseInt(formData.timeline_days),
                revisions_included: parseInt(formData.revisions_included),
                exclusions: formData.exclusions,
                requirements: {
                    brand_guidelines: formData.req_brand_guidelines,
                    product_samples: formData.req_product_samples,
                    hashtags_required: formData.req_hashtags.split(',').map(tag => tag.trim()).filter(Boolean),
                    mentions_required: formData.req_mentions.split(',').map(tag => tag.trim()).filter(Boolean),
                    content_rights: formData.req_content_rights,
                }
            };

            if (isEditMode) {
                await packageApi.update(packageId, payload);
            } else {
                await packageApi.create(payload);
            }

            navigate('/influencer/dashboard', {
                state: { message: `Package ${isEditMode ? 'updated' : 'created'} successfully!` }
            });
        } catch (err) {
            console.error(`${isEditMode ? 'Update' : 'Create'} package error:`, err);
            setError(err.message || `Failed to ${isEditMode ? 'update' : 'create'} package`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="onboarding-page">
            <div className="onboarding-container" style={{ maxWidth: '700px' }}>
                <h1 style={{ marginBottom: '1rem' }}>{isEditMode ? 'Edit Package' : 'Create New Package'}</h1>
                <p className="step-subtitle">
                    {isEditMode ? `Updating ${formData.name}` : "Define what you're offering to brands"}
                </p>

                {fetching ? (
                    <div className="dashboard-loading">
                        <div className="spinner"></div>
                        <p>Loading package data...</p>
                    </div>
                ) : (
                    <>
                        {error && (
                            <div className="error-message">
                                <span>⚠️</span> {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Package Name *</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="e.g. 1 Instagram Reel + Story"
                                    minLength={5}
                                    maxLength={100}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Description *</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder="Describe what you will deliver and your creative approach..."
                                    minLength={20}
                                    maxLength={2000}
                                    rows={4}
                                    required
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Platform</label>
                                    <select name="platform" value={formData.platform} onChange={handleChange}>
                                        {PLATFORMS.map(p => (
                                            <option key={p.id} value={p.id}>{p.icon} {p.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Content Type</label>
                                    <select name="content_type" value={formData.content_type} onChange={handleChange}>
                                        {CONTENT_TYPES.map(t => (
                                            <option key={t.id} value={t.id}>{t.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Price (KES) *</label>
                                    <input
                                        type="number"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleChange}
                                        min={10}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Delivery Days *</label>
                                    <input
                                        type="number"
                                        name="timeline_days"
                                        value={formData.timeline_days}
                                        onChange={handleChange}
                                        min={1}
                                        max={60}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Deliverables Count</label>
                                    <input
                                        type="number"
                                        name="deliverables_count"
                                        value={formData.deliverables_count}
                                        onChange={handleChange}
                                        min={1}
                                        max={20}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Revisions Included</label>
                                    <input
                                        type="number"
                                        name="revisions_included"
                                        value={formData.revisions_included}
                                        onChange={handleChange}
                                        min={0}
                                        max={5}
                                    />
                                </div>
                            </div>

                            <h3>Requirements</h3>
                            <div className="form-group">
                                <label>
                                    <input
                                        type="checkbox"
                                        name="req_brand_guidelines"
                                        checked={formData.req_brand_guidelines}
                                        onChange={handleChange}
                                        style={{ width: 'auto', marginRight: '10px' }}
                                    />
                                    I need brand guidelines
                                </label>
                            </div>

                            <div className="form-group">
                                <label>
                                    <input
                                        type="checkbox"
                                        name="req_product_samples"
                                        checked={formData.req_product_samples}
                                        onChange={handleChange}
                                        style={{ width: 'auto', marginRight: '10px' }}
                                    />
                                    I need product samples shipped to me
                                </label>
                            </div>

                            <div className="onboarding-nav">
                                <button
                                    type="button"
                                    className="btn-secondary"
                                    onClick={() => navigate('/influencer/dashboard')}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn-primary"
                                    disabled={loading}
                                >
                                    {loading ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Update Package' : 'Create Package')}
                                </button>
                            </div>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
}
