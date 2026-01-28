/**
 * Create Package Page
 * Form for influencers to create new packages
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
    const [loading, setLoading] = useState(false);
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
                price: parseInt(formData.price),
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

            await packageApi.create(payload);
            navigate('/influencer/dashboard', {
                state: { message: 'Package created successfully!' }
            });
        } catch (err) {
            console.error('Create package error:', err);
            setError(err.message || 'Failed to create package');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="onboarding-page">
            <div className="onboarding-container" style={{ maxWidth: '700px' }}>
                <h1 style={{ marginBottom: '1rem' }}>Create New Package</h1>
                <p className="step-subtitle">Define what you're offering to brands</p>

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
                                min={500}
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
                            {loading ? 'Creating...' : 'Create Package'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
