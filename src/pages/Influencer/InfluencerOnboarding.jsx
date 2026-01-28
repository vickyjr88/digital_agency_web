/**
 * Influencer Onboarding Page
 * Multi-step form for becoming an influencer on Dexter
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { influencerApi } from '../../services/marketplaceApi';
import './InfluencerOnboarding.css';

const STEPS = [
    { id: 1, title: 'Welcome', icon: '👋' },
    { id: 2, title: 'Profile', icon: '👤' },
    { id: 3, title: 'Social Media', icon: '📱' },
    { id: 4, title: 'Review', icon: '✅' },
];

const NICHES = [
    'Fashion & Style',
    'Beauty & Skincare',
    'Fitness & Health',
    'Food & Cooking',
    'Travel & Adventure',
    'Technology & Gaming',
    'Business & Finance',
    'Lifestyle',
    'Entertainment',
    'Education',
    'Parenting & Family',
    'Music & Arts',
    'Sports',
    'Other',
];

export default function InfluencerOnboarding() {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        display_name: '',
        bio: '',
        niche: '',
        location: '',
        instagram_handle: '',
        tiktok_handle: '',
        youtube_channel: '',
        twitter_handle: '',
        facebook_handle: '',
        whatsapp_number: '',
        instagram_followers: '',
        tiktok_followers: '',
        youtube_subscribers: '',
        twitter_followers: '',
        facebook_followers: '',
        instagram_link: '',
        tiktok_link: '',
        youtube_link: '',
        twitter_link: '',
        facebook_link: '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError('');
    };

    const validateStep = () => {
        switch (currentStep) {
            case 2:
                if (!formData.display_name.trim()) {
                    setError('Display name is required');
                    return false;
                }
                if (!formData.niche) {
                    setError('Please select your niche');
                    return false;
                }
                break;
            case 3:
                const hasAnySocial = formData.instagram_handle || formData.tiktok_handle ||
                    formData.youtube_channel || formData.twitter_handle || formData.facebook_handle;
                if (!hasAnySocial) {
                    setError('Please add at least one social media account');
                    return false;
                }
                break;
        }
        return true;
    };

    const nextStep = () => {
        if (validateStep()) {
            setCurrentStep(prev => Math.min(prev + 1, STEPS.length));
        }
    };

    const prevStep = () => {
        setCurrentStep(prev => Math.max(prev - 1, 1));
    };

    const handleSubmit = async () => {
        setLoading(true);
        setError('');

        try {
            const response = await influencerApi.onboard(formData);

            // Success! Redirect to influencer dashboard
            navigate('/influencer/dashboard', {
                state: {
                    message: 'Welcome! Your influencer profile has been created.',
                    profile: response
                }
            });
        } catch (err) {
            setError(err.message || 'Failed to create profile. Please try again.');
            console.error('Onboarding error:', err);
        } finally {
            setLoading(false);
        }
    };

    const renderStep = () => {
        switch (currentStep) {
            case 1:
                return <WelcomeStep />;
            case 2:
                return <ProfileStep formData={formData} handleChange={handleChange} />;
            case 3:
                return <SocialMediaStep formData={formData} handleChange={handleChange} />;
            case 4:
                return <ReviewStep formData={formData} />;
            default:
                return null;
        }
    };

    return (
        <div className="onboarding-page">
            <div className="onboarding-container">
                {/* Progress */}
                <div className="progress-bar">
                    {STEPS.map((step, index) => (
                        <div
                            key={step.id}
                            className={`progress-step ${currentStep >= step.id ? 'active' : ''} ${currentStep > step.id ? 'completed' : ''}`}
                        >
                            <div className="step-icon">{step.icon}</div>
                            <div className="step-title">{step.title}</div>
                            {index < STEPS.length - 1 && <div className="step-line" />}
                        </div>
                    ))}
                </div>

                {/* Content */}
                <div className="onboarding-content">
                    {error && (
                        <div className="error-message">
                            <span>⚠️</span> {error}
                        </div>
                    )}

                    {renderStep()}
                </div>

                {/* Navigation */}
                <div className="onboarding-nav">
                    {currentStep > 1 && (
                        <button
                            className="btn-secondary"
                            onClick={prevStep}
                            disabled={loading}
                        >
                            ← Back
                        </button>
                    )}

                    <div className="spacer" />

                    {currentStep < STEPS.length ? (
                        <button
                            className="btn-primary"
                            onClick={nextStep}
                            disabled={loading}
                        >
                            Continue →
                        </button>
                    ) : (
                        <button
                            className="btn-primary btn-submit"
                            onClick={handleSubmit}
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className="spinner-small"></span>
                                    Creating Profile...
                                </>
                            ) : (
                                <>🚀 Complete Setup</>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

// Step Components
function WelcomeStep() {
    return (
        <div className="welcome-step">
            <div className="welcome-emoji">🎉</div>
            <h1>Become a Dexter Influencer</h1>
            <p className="welcome-subtitle">
                Join our marketplace and connect with brands looking for authentic creators like you.
            </p>

            <div className="benefits-grid">
                <div className="benefit-card">
                    <span className="benefit-icon">💰</span>
                    <h3>Earn Money</h3>
                    <p>Get paid for your creative content and influence</p>
                </div>
                <div className="benefit-card">
                    <span className="benefit-icon">🤝</span>
                    <h3>Brand Partnerships</h3>
                    <p>Connect with brands that align with your values</p>
                </div>
                <div className="benefit-card">
                    <span className="benefit-icon">📈</span>
                    <h3>Grow Your Reach</h3>
                    <p>Expand your audience through brand collaborations</p>
                </div>
                <div className="benefit-card">
                    <span className="benefit-icon">🔒</span>
                    <h3>Secure Payments</h3>
                    <p>Protected payments with our escrow system</p>
                </div>
            </div>

            <p className="welcome-note">
                Setup takes only 5 minutes. Let's get started!
            </p>
        </div>
    );
}

function ProfileStep({ formData, handleChange }) {
    return (
        <div className="profile-step">
            <h2>Tell us about yourself</h2>
            <p className="step-subtitle">This information will be visible on your public profile</p>

            <div className="form-group">
                <label>Display Name *</label>
                <input
                    type="text"
                    name="display_name"
                    value={formData.display_name}
                    onChange={handleChange}
                    placeholder="e.g. Sarah the Foodie"
                    maxLength={100}
                />
                <span className="hint">This is how brands will see you</span>
            </div>

            <div className="form-group">
                <label>Bio</label>
                <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    placeholder="Tell brands what makes you unique..."
                    maxLength={500}
                    rows={4}
                />
                <span className="char-count">{formData.bio.length}/500</span>
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label>Your Niche *</label>
                    <select
                        name="niche"
                        value={formData.niche}
                        onChange={handleChange}
                    >
                        <option value="">Select your niche</option>
                        {NICHES.map(niche => (
                            <option key={niche} value={niche}>{niche}</option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label>Location</label>
                    <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        placeholder="e.g. Nairobi, Kenya"
                    />
                </div>
            </div>
        </div>
    );
}

function SocialMediaStep({ formData, handleChange }) {
    return (
        <div className="social-step">
            <h2>Connect your social media</h2>
            <p className="step-subtitle">Add at least one account. You can verify them later.</p>

            <div className="social-cards">
                <div className="social-card instagram">
                    <div className="social-header">
                        <span className="social-icon">📸</span>
                        <span className="social-name">Instagram</span>
                    </div>
                    <div className="social-input-group">
                        <div className="social-input">
                            <span className="prefix">@</span>
                            <input
                                type="text"
                                name="instagram_handle"
                                value={formData.instagram_handle}
                                onChange={handleChange}
                                placeholder="username"
                            />
                        </div>
                        <div className="social-input">
                            <input
                                type="number"
                                name="instagram_followers"
                                value={formData.instagram_followers}
                                onChange={handleChange}
                                placeholder="Followers"
                            />
                        </div>
                    </div>
                </div>

                <div className="social-card tiktok">
                    <div className="social-header">
                        <span className="social-icon">🎵</span>
                        <span className="social-name">TikTok</span>
                    </div>
                    <div className="social-input-group">
                        <div className="social-input">
                            <span className="prefix">@</span>
                            <input
                                type="text"
                                name="tiktok_handle"
                                value={formData.tiktok_handle}
                                onChange={handleChange}
                                placeholder="username"
                            />
                        </div>
                        <div className="social-input">
                            <input
                                type="number"
                                name="tiktok_followers"
                                value={formData.tiktok_followers}
                                onChange={handleChange}
                                placeholder="Followers"
                            />
                        </div>
                    </div>
                </div>

                <div className="social-card youtube">
                    <div className="social-header">
                        <span className="social-icon">▶️</span>
                        <span className="social-name">YouTube</span>
                    </div>
                    <div className="social-input-group">
                        <div className="social-input">
                            <span className="prefix">youtube.com/</span>
                            <input
                                type="text"
                                name="youtube_channel"
                                value={formData.youtube_channel}
                                onChange={handleChange}
                                placeholder="channel"
                            />
                        </div>
                        <div className="social-input">
                            <input
                                type="number"
                                name="youtube_subscribers"
                                value={formData.youtube_subscribers}
                                onChange={handleChange}
                                placeholder="Subscribers"
                            />
                        </div>
                    </div>
                </div>

                <div className="social-card twitter">
                    <div className="social-header">
                        <span className="social-icon">🐦</span>
                        <span className="social-name">Twitter/X</span>
                    </div>
                    <div className="social-input-group">
                        <div className="social-input">
                            <span className="prefix">@</span>
                            <input
                                type="text"
                                name="twitter_handle"
                                value={formData.twitter_handle}
                                onChange={handleChange}
                                placeholder="username"
                            />
                        </div>
                        <div className="social-input">
                            <input
                                type="number"
                                name="twitter_followers"
                                value={formData.twitter_followers}
                                onChange={handleChange}
                                placeholder="Followers"
                            />
                        </div>
                    </div>
                </div>

                <div className="social-card facebook">
                    <div className="social-header">
                        <span className="social-icon">👥</span>
                        <span className="social-name">Facebook</span>
                    </div>
                    <div className="social-input-group">
                        <div className="social-input">
                            <span className="prefix">facebook.com/</span>
                            <input
                                type="text"
                                name="facebook_handle"
                                value={formData.facebook_handle}
                                onChange={handleChange}
                                placeholder="profile"
                            />
                        </div>
                        <div className="social-input">
                            <input
                                type="number"
                                name="facebook_followers"
                                value={formData.facebook_followers}
                                onChange={handleChange}
                                placeholder="Followers"
                            />
                        </div>
                    </div>
                </div>

                <div className="social-card whatsapp">
                    <div className="social-header">
                        <span className="social-icon">💬</span>
                        <span className="social-name">WhatsApp</span>
                    </div>
                    <div className="social-input">
                        <span className="prefix">+</span>
                        <input
                            type="text"
                            name="whatsapp_number"
                            value={formData.whatsapp_number}
                            onChange={handleChange}
                            placeholder="254..."
                        />
                    </div>
                </div>
            </div>

            <div className="social-note">
                <span>💡</span>
                <p>After completing setup, you'll be able to verify your accounts to unlock more features and boost your credibility.</p>
            </div>
        </div>
    );
}

function ReviewStep({ formData }) {
    const activeSocials = [
        formData.instagram_handle && { icon: '📸', name: 'Instagram', handle: `@${formData.instagram_handle}` },
        formData.tiktok_handle && { icon: '🎵', name: 'TikTok', handle: `@${formData.tiktok_handle}` },
        formData.youtube_channel && { icon: '▶️', name: 'YouTube', handle: formData.youtube_channel, followers: formData.youtube_subscribers },
        formData.twitter_handle && { icon: '🐦', name: 'Twitter', handle: `@${formData.twitter_handle}`, followers: formData.twitter_followers },
        formData.facebook_handle && { icon: '👥', name: 'Facebook', handle: `facebook.com/${formData.facebook_handle}`, followers: formData.facebook_followers },
    ].filter(Boolean);

    const whatsapp = formData.whatsapp_number;

    return (
        <div className="review-step">
            <h2>Review your profile</h2>
            <p className="step-subtitle">Make sure everything looks good before submitting</p>

            <div className="profile-preview">
                <div className="preview-header">
                    <div className="preview-avatar">
                        {formData.display_name?.charAt(0).toUpperCase() || '?'}
                    </div>
                    <div className="preview-info">
                        <h3>{formData.display_name || 'Your Name'}</h3>
                        <span className="preview-niche">{formData.niche || 'Your Niche'}</span>
                        {formData.location && (
                            <span className="preview-location">📍 {formData.location}</span>
                        )}
                    </div>
                </div>

                {formData.bio && (
                    <div className="preview-bio">
                        <p>{formData.bio}</p>
                    </div>
                )}

                <div className="preview-socials">
                    <h4>Connected Accounts</h4>
                    <div className="socials-list">
                        {activeSocials.map((social, i) => (
                            <div key={i} className="social-item">
                                <span className="social-icon">{social.icon}</span>
                                <div className="social-review-info">
                                    <span className="social-handle">{social.handle}</span>
                                    {social.followers && (
                                        <span className="social-followers-preview">{social.followers} followers</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {whatsapp && (
                    <div className="preview-whatsapp">
                        <h4>WhatsApp</h4>
                        <p>+ {whatsapp}</p>
                    </div>
                )}
            </div>

            <div className="submit-note">
                <span>📋</span>
                <p>
                    Your profile will be submitted for verification. This usually takes 24-48 hours.
                    You can start creating packages immediately after submission.
                </p>
            </div>
        </div>
    );
}
