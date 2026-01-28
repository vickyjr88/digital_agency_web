/**
 * Influencer Profile Settings
 * Component for influencers to update their profile and social media links
 */

import { useState } from 'react';
import { influencerApi } from '../../services/marketplaceApi';

export default function InfluencerProfileSettings({ profile, onUpdate }) {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [formData, setFormData] = useState({
        display_name: profile?.display_name || '',
        bio: profile?.bio || '',
        niche: profile?.niche || '',
        location: profile?.location || '',
        whatsapp_number: profile?.whatsapp_number || '',
        instagram_handle: profile?.instagram?.handle || '',
        tiktok_handle: profile?.tiktok?.handle || '',
        youtube_channel: profile?.youtube?.handle || '',
        twitter_handle: profile?.twitter?.handle || '',
        facebook_handle: profile?.facebook?.handle || '',
        instagram_link: profile?.instagram_link || '',
        tiktok_link: profile?.tiktok_link || '',
        youtube_link: profile?.youtube_link || '',
        twitter_link: profile?.twitter_link || '',
        facebook_link: profile?.facebook_link || '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const updatedProfile = await influencerApi.updateMyProfile(formData);
            setMessage({ type: 'success', text: 'Profile updated successfully!' });
            if (onUpdate) onUpdate(updatedProfile);
        } catch (error) {
            console.error('Update profile error:', error);
            setMessage({ type: 'error', text: error.message || 'Failed to update profile' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="profile-settings">
            {message.text && (
                <div className={`message-banner ${message.type}`}>
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSubmit} className="settings-form">
                <div className="settings-section">
                    <h3>Basic Information</h3>
                    <div className="form-group">
                        <label>Display Name</label>
                        <input
                            type="text"
                            name="display_name"
                            value={formData.display_name}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Bio</label>
                        <textarea
                            name="bio"
                            value={formData.bio}
                            onChange={handleChange}
                            rows={4}
                        />
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Niche</label>
                            <input
                                type="text"
                                name="niche"
                                value={formData.niche}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-group">
                            <label>Location</label>
                            <input
                                type="text"
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                    <div className="form-group">
                        <label>WhatsApp Number</label>
                        <div className="input-with-prefix">
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

                <div className="settings-section">
                    <h3>Social Media Links & Reach</h3>
                    <p className="section-hint">Enter full profile URLs and your current follower counts</p>

                    <div className="social-settings-grid">
                        {/* Instagram */}
                        <div className="social-setting-item">
                            <div className="social-label">
                                <span>📸 Instagram</span>
                            </div>
                            <input
                                type="url"
                                name="instagram_link"
                                value={formData.instagram_link}
                                onChange={handleChange}
                                placeholder="https://instagram.com/username"
                                className="link-input"
                            />
                        </div>

                        {/* TikTok */}
                        <div className="social-setting-item">
                            <div className="social-label">
                                <span>🎵 TikTok</span>
                            </div>
                            <input
                                type="url"
                                name="tiktok_link"
                                value={formData.tiktok_link}
                                onChange={handleChange}
                                placeholder="https://tiktok.com/@username"
                                className="link-input"
                            />
                        </div>

                        {/* YouTube */}
                        <div className="social-setting-item">
                            <div className="social-label">
                                <span>▶️ YouTube</span>
                            </div>
                            <input
                                type="url"
                                name="youtube_link"
                                value={formData.youtube_link}
                                onChange={handleChange}
                                placeholder="https://youtube.com/c/channel"
                                className="link-input"
                            />
                        </div>

                        {/* Facebook */}
                        <div className="social-setting-item">
                            <div className="social-label">
                                <span>👥 Facebook</span>
                            </div>
                            <input
                                type="url"
                                name="facebook_link"
                                value={formData.facebook_link}
                                onChange={handleChange}
                                placeholder="https://facebook.com/profile"
                                className="link-input"
                            />
                        </div>

                        {/* Twitter */}
                        <div className="social-setting-item">
                            <div className="social-label">
                                <span>🐦 Twitter/X</span>
                            </div>
                            <input
                                type="url"
                                name="twitter_link"
                                value={formData.twitter_link}
                                onChange={handleChange}
                                placeholder="https://twitter.com/username"
                                className="link-input"
                            />
                        </div>
                    </div>
                </div>

                <div className="settings-actions">
                    <button type="submit" className="btn-save" disabled={loading}>
                        {loading ? 'Saving Changes...' : 'Save Profile Settings'}
                    </button>
                </div>
            </form>
        </div>
    );
}
