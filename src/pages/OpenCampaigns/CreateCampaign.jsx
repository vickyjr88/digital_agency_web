/**
 * Create Open Campaign Page
 * Allows brands to create campaigns that influencers can bid on
 * Enhanced with content generation fields for AI content creation
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { toast } from 'sonner';
import {
    ArrowLeft, Briefcase, DollarSign, Calendar,
    Instagram, Youtube, Twitter, Video, Image, FileText,
    Plus, X, Loader2, MessageSquare, Hash, Target,
    Megaphone, Sparkles, ChevronDown, ChevronUp, Facebook
} from 'lucide-react';
import './OpenCampaigns.css';

const PLATFORMS = [
    { id: 'instagram', label: 'Instagram', icon: Instagram },
    { id: 'tiktok', label: 'TikTok', icon: Video },
    { id: 'youtube', label: 'YouTube', icon: Youtube },
    { id: 'twitter', label: 'Twitter/X', icon: Twitter },
    { id: 'facebook', label: 'Facebook', icon: Facebook },
];

const CONTENT_TYPES = [
    { id: 'post', label: 'Post', icon: Image },
    { id: 'story', label: 'Story', icon: FileText },
    { id: 'reel', label: 'Reel/Short', icon: Video },
    { id: 'video', label: 'Video', icon: Video },
];

const VOICE_OPTIONS = [
    'Professional', 'Casual', 'Playful', 'Inspirational',
    'Educational', 'Bold', 'Friendly', 'Sophisticated'
];

const CONTENT_STYLES = [
    { id: 'educational', label: 'Educational' },
    { id: 'entertaining', label: 'Entertaining' },
    { id: 'inspirational', label: 'Inspirational' },
    { id: 'promotional', label: 'Promotional' },
    { id: 'storytelling', label: 'Storytelling' },
];

export default function CreateCampaign() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [brands, setBrands] = useState([]);
    const [loadingBrands, setLoadingBrands] = useState(true);
    const [showAdvanced, setShowAdvanced] = useState(false);

    const [formData, setFormData] = useState({
        brand_id: '',
        title: '',
        description: '',
        budget: '',
        platforms: [],
        content_types: [],
        deadline: '',
        requirements: '',
        // Content Generation Fields
        voice: '',
        sample_tone: '',
        key_messages: [],
        hashtags: [],
        target_audience: '',
        content_style: '',
        content_themes: [],
        product_name: '',
        product_description: '',
        product_url: '',
        content_dos: [],
        content_donts: []
    });

    // For array inputs
    const [newHashtag, setNewHashtag] = useState('');
    const [newKeyMessage, setNewKeyMessage] = useState('');
    const [newDo, setNewDo] = useState('');
    const [newDont, setNewDont] = useState('');
    const [newTheme, setNewTheme] = useState('');

    useEffect(() => {
        fetchBrands();
    }, []);

    const fetchBrands = async () => {
        try {
            const data = await api.request('/brands');
            setBrands(data);
            if (data.length > 0) {
                setFormData(prev => ({ ...prev, brand_id: data[0].id }));
            }
        } catch (error) {
            console.error('Error fetching brands:', error);
            toast.error('Failed to load brands');
        } finally {
            setLoadingBrands(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const togglePlatform = (platformId) => {
        setFormData(prev => ({
            ...prev,
            platforms: prev.platforms.includes(platformId)
                ? prev.platforms.filter(p => p !== platformId)
                : [...prev.platforms, platformId]
        }));
    };

    const toggleContentType = (typeId) => {
        setFormData(prev => ({
            ...prev,
            content_types: prev.content_types.includes(typeId)
                ? prev.content_types.filter(t => t !== typeId)
                : [...prev.content_types, typeId]
        }));
    };

    // Array field helpers
    const addToArray = (field, value, setValue) => {
        if (!value.trim()) return;
        const formattedValue = field === 'hashtags' && !value.startsWith('#') ? `#${value}` : value;
        if (!formData[field].includes(formattedValue)) {
            setFormData(prev => ({
                ...prev,
                [field]: [...prev[field], formattedValue]
            }));
        }
        setValue('');
    };

    const removeFromArray = (field, index) => {
        setFormData(prev => ({
            ...prev,
            [field]: prev[field].filter((_, i) => i !== index)
        }));
    };

    const formatCurrency = (value) => {
        const num = parseInt(value) || 0;
        return new Intl.NumberFormat('en-KE', {
            style: 'currency',
            currency: 'KES',
            minimumFractionDigits: 0
        }).format(num);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.brand_id) {
            toast.error('Please select a brand');
            return;
        }

        if (formData.platforms.length === 0) {
            toast.error('Please select at least one platform');
            return;
        }

        if (formData.content_types.length === 0) {
            toast.error('Please select at least one content type');
            return;
        }

        setLoading(true);
        try {
            const payload = {
                ...formData,
                budget: parseInt(formData.budget) * 100, // Convert to cents
                deadline: formData.deadline ? new Date(formData.deadline).toISOString() : null,
                // Only include arrays if they have items
                key_messages: formData.key_messages.length > 0 ? formData.key_messages : null,
                hashtags: formData.hashtags.length > 0 ? formData.hashtags : null,
                content_themes: formData.content_themes.length > 0 ? formData.content_themes : null,
                content_dos: formData.content_dos.length > 0 ? formData.content_dos : null,
                content_donts: formData.content_donts.length > 0 ? formData.content_donts : null,
            };

            const response = await api.createOpenCampaign(payload);
            toast.success('Campaign created! Influencers can now bid.');
            navigate(`/campaigns/open/${response.campaign_id}`);
        } catch (error) {
            console.error('Error creating campaign:', error);
            toast.error(error.message || 'Failed to create campaign');
        } finally {
            setLoading(false);
        }
    };

    if (loadingBrands) {
        return (
            <div className="create-campaign-page loading-state">
                <div className="spinner" />
                <p>Loading your brands...</p>
            </div>
        );
    }

    if (brands.length === 0) {
        return (
            <div className="create-campaign-page empty-state">
                <Briefcase size={48} className="icon" />
                <h2>No Brands Found</h2>
                <p>You need to create a brand before you can create a campaign.</p>
                <button className="btn-primary" onClick={() => navigate('/brands/new')}>
                    <Plus size={18} />
                    Create Brand
                </button>
            </div>
        );
    }

    return (
        <div className="create-campaign-page">
            <div className="page-header">
                <button className="back-btn" onClick={() => navigate(-1)}>
                    <ArrowLeft size={20} />
                    Back
                </button>
                <div className="header-content">
                    <h1>Create Campaign</h1>
                    <p>Create a campaign brief and let influencers bid to work with you</p>
                </div>
            </div>

            <form className="campaign-form" onSubmit={handleSubmit}>
                {/* Brand Selection */}
                <div className="form-section">
                    <h3>
                        <Briefcase size={20} />
                        Select Brand
                    </h3>
                    <div className="brand-selector">
                        {brands.map(brand => (
                            <label
                                key={brand.id}
                                className={`brand-option ${formData.brand_id === brand.id ? 'selected' : ''}`}
                            >
                                <input
                                    type="radio"
                                    name="brand_id"
                                    value={brand.id}
                                    checked={formData.brand_id === brand.id}
                                    onChange={handleChange}
                                />
                                <div className="brand-avatar">
                                    {brand.name[0]}
                                </div>
                                <div className="brand-info">
                                    <span className="brand-name">{brand.name}</span>
                                    <span className="brand-industry">{brand.industry || 'General'}</span>
                                </div>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Campaign Details */}
                <div className="form-section">
                    <h3>Campaign Details</h3>

                    <div className="form-group">
                        <label htmlFor="title">Campaign Title *</label>
                        <input
                            id="title"
                            name="title"
                            type="text"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="e.g., Summer Product Launch"
                            required
                            minLength={5}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="description">Description *</label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Describe your campaign goals, target audience, and what you're looking for from influencers..."
                            rows={5}
                            required
                            minLength={20}
                        />
                    </div>
                </div>

                {/* Budget */}
                <div className="form-section">
                    <h3>
                        <DollarSign size={20} />
                        Budget
                    </h3>
                    <div className="form-group">
                        <label htmlFor="budget">Total Budget (KES) *</label>
                        <div className="budget-input-wrapper">
                            <span className="currency-prefix">KES</span>
                            <input
                                id="budget"
                                name="budget"
                                type="number"
                                value={formData.budget}
                                onChange={handleChange}
                                placeholder="50000"
                                required
                                min={10}
                            />
                        </div>
                        {formData.budget && (
                            <p className="budget-preview">
                                Budget: {formatCurrency(formData.budget)}
                            </p>
                        )}
                        <p className="hint">
                            Minimum budget is KES 100. Multiple influencers can work on your campaign as long as the total stays within budget.
                        </p>
                    </div>
                </div>

                {/* Platforms */}
                <div className="form-section">
                    <h3>Target Platforms *</h3>
                    <div className="chip-selector">
                        {PLATFORMS.map(platform => (
                            <button
                                key={platform.id}
                                type="button"
                                className={`chip ${formData.platforms.includes(platform.id) ? 'selected' : ''}`}
                                onClick={() => togglePlatform(platform.id)}
                            >
                                <platform.icon size={16} />
                                {platform.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content Types */}
                <div className="form-section">
                    <h3>Content Types *</h3>
                    <div className="chip-selector">
                        {CONTENT_TYPES.map(type => (
                            <button
                                key={type.id}
                                type="button"
                                className={`chip ${formData.content_types.includes(type.id) ? 'selected' : ''}`}
                                onClick={() => toggleContentType(type.id)}
                            >
                                <type.icon size={16} />
                                {type.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Timeline */}
                <div className="form-section">
                    <h3>
                        <Calendar size={20} />
                        Timeline
                    </h3>
                    <div className="form-group">
                        <label htmlFor="deadline">Deadline (Optional)</label>
                        <input
                            id="deadline"
                            name="deadline"
                            type="date"
                            value={formData.deadline}
                            onChange={handleChange}
                            min={new Date().toISOString().split('T')[0]}
                        />
                    </div>
                </div>

                {/* Content Generation Section */}
                <div className="form-section content-gen-section">
                    <button
                        type="button"
                        className="section-toggle"
                        onClick={() => setShowAdvanced(!showAdvanced)}
                    >
                        <div className="toggle-header">
                            <Sparkles size={20} />
                            <div>
                                <h3>Content Generation Settings</h3>
                                <p>Help influencers create on-brand content</p>
                            </div>
                        </div>
                        {showAdvanced ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>

                    {showAdvanced && (
                        <div className="advanced-fields">
                            {/* Product Info */}
                            <div className="field-group">
                                <h4>
                                    <Megaphone size={18} />
                                    Product / Service
                                </h4>

                                <div className="form-group">
                                    <label htmlFor="product_name">Product Name</label>
                                    <input
                                        id="product_name"
                                        name="product_name"
                                        type="text"
                                        value={formData.product_name}
                                        onChange={handleChange}
                                        placeholder="e.g., Summer Collection 2026"
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="product_description">Product Description</label>
                                    <textarea
                                        id="product_description"
                                        name="product_description"
                                        value={formData.product_description}
                                        onChange={handleChange}
                                        placeholder="Describe the product features, benefits, and unique selling points..."
                                        rows={3}
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="product_url">Product URL</label>
                                    <input
                                        id="product_url"
                                        name="product_url"
                                        type="url"
                                        value={formData.product_url}
                                        onChange={handleChange}
                                        placeholder="https://yoursite.com/product"
                                    />
                                </div>
                            </div>

                            {/* Voice & Style */}
                            <div className="field-group">
                                <h4>
                                    <MessageSquare size={18} />
                                    Voice & Style
                                </h4>

                                <div className="form-group">
                                    <label htmlFor="voice">Brand Voice</label>
                                    <select
                                        id="voice"
                                        name="voice"
                                        value={formData.voice}
                                        onChange={handleChange}
                                    >
                                        <option value="">Select voice...</option>
                                        {VOICE_OPTIONS.map(v => (
                                            <option key={v} value={v.toLowerCase()}>{v}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="content_style">Content Style</label>
                                    <select
                                        id="content_style"
                                        name="content_style"
                                        value={formData.content_style}
                                        onChange={handleChange}
                                    >
                                        <option value="">Select style...</option>
                                        {CONTENT_STYLES.map(s => (
                                            <option key={s.id} value={s.id}>{s.label}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="sample_tone">Sample Tone (Example text)</label>
                                    <textarea
                                        id="sample_tone"
                                        name="sample_tone"
                                        value={formData.sample_tone}
                                        onChange={handleChange}
                                        placeholder="Paste an example of your preferred writing style..."
                                        rows={3}
                                    />
                                </div>
                            </div>

                            {/* Target Audience */}
                            <div className="field-group">
                                <h4>
                                    <Target size={18} />
                                    Target Audience
                                </h4>

                                <div className="form-group">
                                    <label htmlFor="target_audience">Who is the content for?</label>
                                    <textarea
                                        id="target_audience"
                                        name="target_audience"
                                        value={formData.target_audience}
                                        onChange={handleChange}
                                        placeholder="e.g., Young professionals aged 25-35 interested in sustainable fashion..."
                                        rows={2}
                                    />
                                </div>
                            </div>

                            {/* Key Messages */}
                            <div className="field-group">
                                <h4>Key Messages</h4>
                                <div className="array-input">
                                    <input
                                        type="text"
                                        value={newKeyMessage}
                                        onChange={(e) => setNewKeyMessage(e.target.value)}
                                        placeholder="Add key message..."
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                addToArray('key_messages', newKeyMessage, setNewKeyMessage);
                                            }
                                        }}
                                    />
                                    <button
                                        type="button"
                                        className="btn-add"
                                        onClick={() => addToArray('key_messages', newKeyMessage, setNewKeyMessage)}
                                    >
                                        <Plus size={16} />
                                    </button>
                                </div>
                                <div className="tags-list">
                                    {formData.key_messages.map((msg, i) => (
                                        <span key={i} className="tag">
                                            {msg}
                                            <button type="button" onClick={() => removeFromArray('key_messages', i)}>
                                                <X size={14} />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Hashtags */}
                            <div className="field-group">
                                <h4>
                                    <Hash size={18} />
                                    Brand Hashtags
                                </h4>
                                <div className="array-input">
                                    <input
                                        type="text"
                                        value={newHashtag}
                                        onChange={(e) => setNewHashtag(e.target.value)}
                                        placeholder="Add hashtag..."
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                addToArray('hashtags', newHashtag, setNewHashtag);
                                            }
                                        }}
                                    />
                                    <button
                                        type="button"
                                        className="btn-add"
                                        onClick={() => addToArray('hashtags', newHashtag, setNewHashtag)}
                                    >
                                        <Plus size={16} />
                                    </button>
                                </div>
                                <div className="tags-list">
                                    {formData.hashtags.map((tag, i) => (
                                        <span key={i} className="tag hashtag">
                                            {tag}
                                            <button type="button" onClick={() => removeFromArray('hashtags', i)}>
                                                <X size={14} />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Content Do's and Don'ts */}
                            <div className="dos-donts-grid">
                                <div className="field-group dos">
                                    <h4 className="text-green">✓ Content Do's</h4>
                                    <div className="array-input">
                                        <input
                                            type="text"
                                            value={newDo}
                                            onChange={(e) => setNewDo(e.target.value)}
                                            placeholder="Things to include..."
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    addToArray('content_dos', newDo, setNewDo);
                                                }
                                            }}
                                        />
                                        <button
                                            type="button"
                                            className="btn-add"
                                            onClick={() => addToArray('content_dos', newDo, setNewDo)}
                                        >
                                            <Plus size={16} />
                                        </button>
                                    </div>
                                    <div className="tags-list vertical">
                                        {formData.content_dos.map((item, i) => (
                                            <span key={i} className="tag do-tag">
                                                ✓ {item}
                                                <button type="button" onClick={() => removeFromArray('content_dos', i)}>
                                                    <X size={14} />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="field-group donts">
                                    <h4 className="text-red">✗ Content Don'ts</h4>
                                    <div className="array-input">
                                        <input
                                            type="text"
                                            value={newDont}
                                            onChange={(e) => setNewDont(e.target.value)}
                                            placeholder="Things to avoid..."
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    addToArray('content_donts', newDont, setNewDont);
                                                }
                                            }}
                                        />
                                        <button
                                            type="button"
                                            className="btn-add"
                                            onClick={() => addToArray('content_donts', newDont, setNewDont)}
                                        >
                                            <Plus size={16} />
                                        </button>
                                    </div>
                                    <div className="tags-list vertical">
                                        {formData.content_donts.map((item, i) => (
                                            <span key={i} className="tag dont-tag">
                                                ✗ {item}
                                                <button type="button" onClick={() => removeFromArray('content_donts', i)}>
                                                    <X size={14} />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Requirements */}
                <div className="form-section">
                    <h3>Additional Requirements</h3>
                    <div className="form-group">
                        <label htmlFor="requirements">Special Requirements (Optional)</label>
                        <textarea
                            id="requirements"
                            name="requirements"
                            value={formData.requirements}
                            onChange={handleChange}
                            placeholder="Any specific requirements for influencers (e.g., minimum followers, specific niches, etc.)"
                            rows={3}
                        />
                    </div>
                </div>

                {/* Submit */}
                <div className="form-actions">
                    <button type="button" className="btn-secondary" onClick={() => navigate(-1)}>
                        Cancel
                    </button>
                    <button type="submit" className="btn-primary" disabled={loading}>
                        {loading ? (
                            <>
                                <Loader2 className="animate-spin" size={18} />
                                Creating...
                            </>
                        ) : (
                            <>
                                <Plus size={18} />
                                Create Campaign
                            </>
                        )}
                    </button>
                </div>
            </form >
        </div >
    );
}
