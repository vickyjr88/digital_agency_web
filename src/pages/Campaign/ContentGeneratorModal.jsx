import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Sparkles, RefreshCw, Send, Check } from 'lucide-react';
import { api } from '../../services/api';
// Assuming we have a service for campaign-content, or likely adding it to api.js
// If not, we'll assume we can use api.post('/campaign-content/...')

export default function ContentGeneratorModal({ campaignId, onClose, onSuccess }) {
    const navigate = useNavigate();
    const [step, setStep] = useState('trend'); // trend, generate, review
    const [loading, setLoading] = useState(false);
    const [trends, setTrends] = useState([]);
    const [selectedTrend, setSelectedTrend] = useState(null);
    const [customTopic, setCustomTopic] = useState('');
    const [generatedContent, setGeneratedContent] = useState(null);
    const [platform, setPlatform] = useState('instagram');
    const [contentType, setContentType] = useState('post');

    useEffect(() => {
        fetchTrends();
    }, []);

    const fetchTrends = async () => {
        try {
            const response = await api.getAvailableTrends();
            setTrends(response.trends || []);
        } catch (error) {
            console.error('Failed to fetch trends', error);
        }
    };

    const handleGenerate = async () => {
        const topic = selectedTrend?.topic || customTopic;
        if (!topic) return;

        setLoading(true);
        try {
            const response = await api.generateCampaignContent({
                campaign_id: campaignId,
                trend_id: selectedTrend?.id,
                trend_topic: topic,
                platform,
                content_type: contentType
            });

            // Navigate to edit page immediately
            onClose(); // Close modal
            navigate(`/campaign-content/${response.content.id}/edit`);

        } catch (error) {
            console.error('Generation failed', error);
            // alert('Failed to generate content: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!generatedContent?.id) return;

        setLoading(true);
        try {
            await api.submitContentForApproval(generatedContent.id);
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Submission failed', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content generator-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '800px' }}>
                <div className="modal-header">
                    <h2>
                        <Sparkles className="icon-blue" size={24} style={{ marginRight: '10px' }} />
                        AI Content Generator
                    </h2>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </div>

                <div className="modal-body">
                    {/* Step 1: Select Trend */}
                    {step === 'trend' && (
                        <div className="trend-selection">
                            <h3>1. Choose a Trend or Topic</h3>
                            <p className="hint">Select a trending topic to base your content on, or write your own.</p>

                            <div className="trend-grid">
                                {trends.map(trend => (
                                    <div
                                        key={trend.id}
                                        className={`trend-card ${selectedTrend?.id === trend.id ? 'selected' : ''}`}
                                        onClick={() => {
                                            setSelectedTrend(trend);
                                            setCustomTopic('');
                                        }}
                                    >
                                        <span className="trend-topic">{trend.topic}</span>
                                        <span className="trend-meta">{trend.volume || 'Trending'} • {trend.source}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="custom-topic-input">
                                <label>Or enter a custom topic:</label>
                                <input
                                    type="text"
                                    value={customTopic}
                                    onChange={(e) => {
                                        setCustomTopic(e.target.value);
                                        setSelectedTrend(null);
                                    }}
                                    placeholder="e.g., Summer productivity hacks..."
                                />
                            </div>

                            <div className="platform-options" style={{ marginTop: '20px' }}>
                                <div className="form-group">
                                    <label>Platform</label>
                                    <select value={platform} onChange={e => setPlatform(e.target.value)}>
                                        <option value="instagram">Instagram</option>
                                        <option value="tiktok">TikTok</option>
                                        <option value="twitter">Twitter/X</option>
                                        <option value="linkedin">LinkedIn</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Content Type</label>
                                    <select value={contentType} onChange={e => setContentType(e.target.value)}>
                                        <option value="post">Post</option>
                                        <option value="story">Story</option>
                                        <option value="reel">Reel / Video</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Review & Submit */}
                    {step === 'review' && generatedContent && (
                        <div className="content-review">
                            <h3>2. Review Generated Content</h3>

                            <div className="generated-result">
                                {generatedContent.tweet && (
                                    <div className="result-block">
                                        <label>Tweet</label>
                                        <div className="content-box">{generatedContent.tweet}</div>
                                    </div>
                                )}
                                {generatedContent.instagram_caption && (
                                    <div className="result-block">
                                        <label>Caption</label>
                                        <div className="content-box">{generatedContent.instagram_caption}</div>
                                    </div>
                                )}
                                {generatedContent.instagram_reel_script && (
                                    <div className="result-block">
                                        <label>Reel Script</label>
                                        <div className="content-box">
                                            <p><strong>Visuals:</strong> {generatedContent.instagram_reel_script.visuals}</p>
                                            <p><strong>Audio:</strong> {generatedContent.instagram_reel_script.audio}</p>
                                            <p><strong>Caption:</strong> {generatedContent.instagram_reel_script.caption}</p>
                                        </div>
                                    </div>
                                )}
                                {generatedContent.tiktok_idea && (
                                    <div className="result-block">
                                        <label>TikTok Concept</label>
                                        <div className="content-box">
                                            <p><strong>Hook:</strong> {generatedContent.tiktok_idea.hook}</p>
                                            <p><strong>Action:</strong> {generatedContent.tiktok_idea.action}</p>
                                            <p><strong>Sound:</strong> {generatedContent.tiktok_idea.sound}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className="modal-footer">
                    {step === 'trend' ? (
                        <button
                            className="btn-primary"
                            disabled={loading || (!selectedTrend && !customTopic)}
                            onClick={handleGenerate}
                        >
                            {loading ? <><Loader2 className="animate-spin" size={16} /> Generating...</> : <><Sparkles size={16} /> Generate Content</>}
                        </button>
                    ) : (
                        <>
                            <button className="btn-secondary" onClick={() => setStep('trend')}>
                                <RefreshCw size={16} /> Try Again
                            </button>
                            <button
                                className="btn-primary"
                                disabled={loading}
                                onClick={handleSubmit}
                            >
                                {loading ? 'Submitting...' : 'Use This Content'}
                            </button>
                        </>
                    )}
                </div>
            </div>
            <style jsx>{`
                .trend-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
                    gap: 10px;
                    margin: 15px 0;
                    max-height: 300px;
                    overflow-y: auto;
                }
                .trend-card {
                    border: 1px solid #e5e7eb;
                    padding: 10px;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .trend-card:hover { border-color: #3b82f6; background: #eff6ff; }
                .trend-card.selected { border-color: #2563eb; background: #dbeafe; ring: 2px solid #2563eb; }
                .trend-topic { font-weight: 600; display: block; margin-bottom: 4px; }
                .trend-meta { font-size: 0.8em; color: #6b7280; }
                .content-box {
                    background: #f9fafb;
                    padding: 15px;
                    border-radius: 8px;
                    border: 1px solid #e5e7eb;
                    white-space: pre-wrap;
                }
                .result-block { margin-bottom: 15px; }
                .result-block label { font-weight: 600; display: block; margin-bottom: 5px; color: #374151; }
                .icon-blue { color: #3b82f6; }
            `}</style>
        </div>
    );
}
