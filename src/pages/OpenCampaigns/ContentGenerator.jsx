/**
 * Content Generator Page for Influencers
 * Allows influencers to generate AI content for their accepted campaigns using trends
 */

import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { api } from '../../services/api';
import { toast } from 'sonner';
import {
    ArrowLeft, Sparkles, TrendingUp, Briefcase, Send,
    Loader2, ChevronDown, ChevronUp, Copy, Check,
    Twitter, Instagram, Video, Linkedin, FileText,
    RefreshCw, Eye, Trash2
} from 'lucide-react';
import './ContentGenerator.css';

export default function ContentGenerator() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const preselectedCampaignId = searchParams.get('campaign');

    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [campaigns, setCampaigns] = useState([]);
    const [trends, setTrends] = useState([]);
    const [generatedContent, setGeneratedContent] = useState(null);
    const [copiedField, setCopiedField] = useState(null);

    const [selectedCampaign, setSelectedCampaign] = useState(null);
    const [selectedTrend, setSelectedTrend] = useState(null);
    const [customTrend, setCustomTrend] = useState('');
    const [platform, setPlatform] = useState('instagram');
    const [contentType, setContentType] = useState('post');

    const [expandedSections, setExpandedSections] = useState({
        tweet: true,
        instagram: true,
        facebook: false,
        tiktok: false,
        linkedin: false
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [campaignsRes, trendsRes] = await Promise.all([
                api.getInfluencerCampaigns(),
                api.getAvailableTrends(30)
            ]);

            setCampaigns(campaignsRes.campaigns || []);
            setTrends(trendsRes.trends || []);

            // Pre-select campaign if provided
            if (preselectedCampaignId && campaignsRes.campaigns) {
                const campaign = campaignsRes.campaigns.find(c => c.id === preselectedCampaignId);
                if (campaign) {
                    setSelectedCampaign(campaign);
                    // Set platform to first from campaign
                    if (campaign.platforms && campaign.platforms.length > 0) {
                        setPlatform(campaign.platforms[0]);
                    }
                    if (campaign.content_types && campaign.content_types.length > 0) {
                        setContentType(campaign.content_types[0]);
                    }
                }
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const handleGenerate = async () => {
        if (!selectedCampaign) {
            toast.error('Please select a campaign');
            return;
        }

        const trendTopic = selectedTrend?.topic || customTrend;
        if (!trendTopic) {
            toast.error('Please select or enter a trend topic');
            return;
        }

        setGenerating(true);
        try {
            const response = await api.generateCampaignContent({
                campaign_id: selectedCampaign.id,
                bid_id: selectedCampaign.bid_id,
                trend_id: selectedTrend?.id || null,
                trend_topic: trendTopic,
                platform,
                content_type: contentType
            });

            setGeneratedContent(response.content);
            toast.success('Content generated successfully!');

            // Expand all sections
            setExpandedSections({
                tweet: true,
                instagram: true,
                facebook: true,
                tiktok: true,
                linkedin: true
            });
        } catch (error) {
            console.error('Error generating content:', error);
            toast.error(error.message || 'Failed to generate content');
        } finally {
            setGenerating(false);
        }
    };

    const copyToClipboard = async (text, field) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedField(field);
            setTimeout(() => setCopiedField(null), 2000);
            toast.success('Copied to clipboard!');
        } catch (error) {
            toast.error('Failed to copy');
        }
    };

    const toggleSection = (section) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    const handleSubmitForApproval = async () => {
        if (!generatedContent?.id) return;

        try {
            await api.submitContentForApproval(generatedContent.id);
            toast.success('Content submitted for brand approval!');
            navigate('/content/my-content');
        } catch (error) {
            toast.error(error.message || 'Failed to submit');
        }
    };

    if (loading) {
        return (
            <div className="content-generator-page loading-state">
                <div className="spinner" />
                <p>Loading your campaigns...</p>
            </div>
        );
    }

    if (campaigns.length === 0) {
        return (
            <div className="content-generator-page empty-state">
                <Briefcase size={48} className="icon" />
                <h2>No Active Campaigns</h2>
                <p>You need to have an accepted bid on a campaign before you can generate content.</p>
                <button className="btn-primary" onClick={() => navigate('/campaigns/open')}>
                    Browse Open Campaigns
                </button>
            </div>
        );
    }

    return (
        <div className="content-generator-page">
            <div className="page-header">
                <button className="back-btn" onClick={() => navigate(-1)}>
                    <ArrowLeft size={20} />
                    Back
                </button>
                <div className="header-content">
                    <h1>
                        <Sparkles size={28} />
                        Content Generator
                    </h1>
                    <p>Generate AI-powered content for your campaigns using trending topics</p>
                </div>
            </div>

            <div className="generator-layout">
                {/* Left Panel - Settings */}
                <div className="generator-sidebar">
                    {/* Campaign Selection */}
                    <div className="sidebar-section">
                        <h3>
                            <Briefcase size={18} />
                            Select Campaign
                        </h3>
                        <div className="campaign-list">
                            {campaigns.map(campaign => (
                                <button
                                    key={campaign.id}
                                    className={`campaign-option ${selectedCampaign?.id === campaign.id ? 'selected' : ''}`}
                                    onClick={() => {
                                        setSelectedCampaign(campaign);
                                        if (campaign.platforms?.length > 0) {
                                            setPlatform(campaign.platforms[0]);
                                        }
                                    }}
                                >
                                    <div className="campaign-option-avatar">
                                        {campaign.brand?.name?.[0] || 'B'}
                                    </div>
                                    <div className="campaign-option-info">
                                        <span className="campaign-option-title">{campaign.title}</span>
                                        <span className="campaign-option-brand">{campaign.brand?.name}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Campaign Details */}
                    {selectedCampaign && (
                        <div className="sidebar-section campaign-details">
                            <h4>Campaign Brief</h4>
                            <p className="brief-description">{selectedCampaign.description}</p>

                            {selectedCampaign.key_messages?.length > 0 && (
                                <div className="brief-item">
                                    <label>Key Messages:</label>
                                    <ul>
                                        {selectedCampaign.key_messages.map((msg, i) => (
                                            <li key={i}>{msg}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {selectedCampaign.hashtags?.length > 0 && (
                                <div className="brief-item">
                                    <label>Hashtags:</label>
                                    <div className="hashtag-list">
                                        {selectedCampaign.hashtags.map((tag, i) => (
                                            <span key={i} className="hashtag">{tag}</span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {selectedCampaign.voice && (
                                <div className="brief-item">
                                    <label>Voice:</label>
                                    <span>{selectedCampaign.voice}</span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Trend Selection */}
                    <div className="sidebar-section">
                        <h3>
                            <TrendingUp size={18} />
                            Select Trend
                        </h3>

                        <div className="custom-trend">
                            <input
                                type="text"
                                placeholder="Or enter custom topic..."
                                value={customTrend}
                                onChange={(e) => {
                                    setCustomTrend(e.target.value);
                                    setSelectedTrend(null);
                                }}
                            />
                        </div>

                        <div className="trends-list">
                            {trends.slice(0, 15).map(trend => (
                                <button
                                    key={trend.id}
                                    className={`trend-option ${selectedTrend?.id === trend.id ? 'selected' : ''}`}
                                    onClick={() => {
                                        setSelectedTrend(trend);
                                        setCustomTrend('');
                                    }}
                                >
                                    <span className="trend-topic">{trend.topic}</span>
                                    {trend.volume && (
                                        <span className="trend-volume">{trend.volume}</span>
                                    )}
                                </button>
                            ))}
                        </div>

                        <button
                            className="btn-secondary btn-sm refresh-btn"
                            onClick={fetchData}
                        >
                            <RefreshCw size={14} />
                            Refresh Trends
                        </button>
                    </div>

                    {/* Platform Selection */}
                    <div className="sidebar-section">
                        <h3>Platform & Type</h3>

                        <div className="form-group">
                            <label>Primary Platform</label>
                            <select value={platform} onChange={(e) => setPlatform(e.target.value)}>
                                <option value="instagram">Instagram</option>
                                <option value="tiktok">TikTok</option>
                                <option value="twitter">Twitter/X</option>
                                <option value="youtube">YouTube</option>
                                <option value="linkedin">LinkedIn</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Content Type</label>
                            <select value={contentType} onChange={(e) => setContentType(e.target.value)}>
                                <option value="post">Post</option>
                                <option value="story">Story</option>
                                <option value="reel">Reel / Short</option>
                                <option value="video">Video</option>
                            </select>
                        </div>
                    </div>

                    {/* Generate Button */}
                    <button
                        className="btn-primary btn-generate"
                        onClick={handleGenerate}
                        disabled={generating || !selectedCampaign || (!selectedTrend && !customTrend)}
                    >
                        {generating ? (
                            <>
                                <Loader2 className="animate-spin" size={20} />
                                Generating...
                            </>
                        ) : (
                            <>
                                <Sparkles size={20} />
                                Generate Content
                            </>
                        )}
                    </button>
                </div>

                {/* Right Panel - Generated Content */}
                <div className="generator-main">
                    {!generatedContent ? (
                        <div className="empty-content">
                            <Sparkles size={64} className="empty-icon" />
                            <h2>Ready to Create</h2>
                            <p>Select a campaign, choose a trending topic, and click generate to create AI-powered content.</p>
                        </div>
                    ) : (
                        <div className="generated-content">
                            <div className="content-header">
                                <div>
                                    <h2>Generated Content</h2>
                                    <p>Topic: <strong>{generatedContent.trend_topic}</strong></p>
                                </div>
                                <div className="content-actions">
                                    <button
                                        className="btn-secondary"
                                        onClick={handleGenerate}
                                        disabled={generating}
                                    >
                                        <RefreshCw size={16} />
                                        Regenerate
                                    </button>
                                    <button
                                        className="btn-primary"
                                        onClick={handleSubmitForApproval}
                                    >
                                        <Send size={16} />
                                        Submit for Approval
                                    </button>
                                </div>
                            </div>

                            {/* Tweet Section */}
                            {generatedContent.tweet && (
                                <div className="content-section">
                                    <button
                                        className="section-header"
                                        onClick={() => toggleSection('tweet')}
                                    >
                                        <div className="section-title">
                                            <Twitter size={20} />
                                            <span>Twitter / X</span>
                                        </div>
                                        {expandedSections.tweet ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                    </button>
                                    {expandedSections.tweet && (
                                        <div className="section-content">
                                            <div className="content-preview tweet-preview">
                                                {generatedContent.tweet}
                                            </div>
                                            <button
                                                className="copy-btn"
                                                onClick={() => copyToClipboard(generatedContent.tweet, 'tweet')}
                                            >
                                                {copiedField === 'tweet' ? <Check size={16} /> : <Copy size={16} />}
                                                {copiedField === 'tweet' ? 'Copied!' : 'Copy'}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Instagram Section */}
                            {generatedContent.instagram_caption && (
                                <div className="content-section">
                                    <button
                                        className="section-header"
                                        onClick={() => toggleSection('instagram')}
                                    >
                                        <div className="section-title">
                                            <Instagram size={20} />
                                            <span>Instagram</span>
                                        </div>
                                        {expandedSections.instagram ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                    </button>
                                    {expandedSections.instagram && (
                                        <div className="section-content">
                                            <div className="subsection">
                                                <h5>Caption</h5>
                                                <div className="content-preview">
                                                    {generatedContent.instagram_caption}
                                                </div>
                                                <button
                                                    className="copy-btn"
                                                    onClick={() => copyToClipboard(generatedContent.instagram_caption, 'instagram')}
                                                >
                                                    {copiedField === 'instagram' ? <Check size={16} /> : <Copy size={16} />}
                                                    {copiedField === 'instagram' ? 'Copied!' : 'Copy'}
                                                </button>
                                            </div>

                                            {generatedContent.instagram_reel_script && (
                                                <div className="subsection">
                                                    <h5>Reel Script</h5>
                                                    <div className="script-preview">
                                                        {typeof generatedContent.instagram_reel_script === 'object' ? (
                                                            <>
                                                                <div className="script-item">
                                                                    <label>Visuals:</label>
                                                                    <p>{generatedContent.instagram_reel_script.visuals}</p>
                                                                </div>
                                                                <div className="script-item">
                                                                    <label>Audio:</label>
                                                                    <p>{generatedContent.instagram_reel_script.audio}</p>
                                                                </div>
                                                                <div className="script-item">
                                                                    <label>Caption:</label>
                                                                    <p>{generatedContent.instagram_reel_script.caption}</p>
                                                                </div>
                                                            </>
                                                        ) : (
                                                            <p>{generatedContent.instagram_reel_script}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Facebook Section */}
                            {generatedContent.facebook_post && (
                                <div className="content-section">
                                    <button
                                        className="section-header"
                                        onClick={() => toggleSection('facebook')}
                                    >
                                        <div className="section-title">
                                            <FileText size={20} />
                                            <span>Facebook</span>
                                        </div>
                                        {expandedSections.facebook ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                    </button>
                                    {expandedSections.facebook && (
                                        <div className="section-content">
                                            <div className="content-preview">
                                                {generatedContent.facebook_post}
                                            </div>
                                            <button
                                                className="copy-btn"
                                                onClick={() => copyToClipboard(generatedContent.facebook_post, 'facebook')}
                                            >
                                                {copiedField === 'facebook' ? <Check size={16} /> : <Copy size={16} />}
                                                {copiedField === 'facebook' ? 'Copied!' : 'Copy'}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* TikTok Section */}
                            {generatedContent.tiktok_idea && (
                                <div className="content-section">
                                    <button
                                        className="section-header"
                                        onClick={() => toggleSection('tiktok')}
                                    >
                                        <div className="section-title">
                                            <Video size={20} />
                                            <span>TikTok</span>
                                        </div>
                                        {expandedSections.tiktok ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                    </button>
                                    {expandedSections.tiktok && (
                                        <div className="section-content">
                                            <div className="script-preview">
                                                {typeof generatedContent.tiktok_idea === 'object' ? (
                                                    <>
                                                        <div className="script-item">
                                                            <label>Hook:</label>
                                                            <p>{generatedContent.tiktok_idea.hook}</p>
                                                        </div>
                                                        <div className="script-item">
                                                            <label>Action:</label>
                                                            <p>{generatedContent.tiktok_idea.action}</p>
                                                        </div>
                                                        <div className="script-item">
                                                            <label>Sound:</label>
                                                            <p>{generatedContent.tiktok_idea.sound}</p>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <p>{generatedContent.tiktok_idea}</p>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* LinkedIn Section */}
                            {generatedContent.linkedin_post && (
                                <div className="content-section">
                                    <button
                                        className="section-header"
                                        onClick={() => toggleSection('linkedin')}
                                    >
                                        <div className="section-title">
                                            <Linkedin size={20} />
                                            <span>LinkedIn</span>
                                        </div>
                                        {expandedSections.linkedin ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                    </button>
                                    {expandedSections.linkedin && (
                                        <div className="section-content">
                                            <div className="content-preview">
                                                {generatedContent.linkedin_post}
                                            </div>
                                            <button
                                                className="copy-btn"
                                                onClick={() => copyToClipboard(generatedContent.linkedin_post, 'linkedin')}
                                            >
                                                {copiedField === 'linkedin' ? <Check size={16} /> : <Copy size={16} />}
                                                {copiedField === 'linkedin' ? 'Copied!' : 'Copy'}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
