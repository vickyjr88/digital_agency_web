import { useState } from 'react';
import { api } from '../../services/api';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Copy, Check, Share2, Calendar, Facebook, Twitter, Clock } from 'lucide-react';

export default function EditContent() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const [data, setData] = useState(() => {
    const item = state?.item || {};
    return {
      id: item.id,
      Brand: item.brand_name || 'Brand',
      Trend: item.trend || item.Trend,
      Tweet: item.tweet || item.Tweet,
      'Facebook Post': item.facebook_post || item['Facebook Post'],
      'Instagram Reel Script': item.instagram_reel_script || item['Instagram Reel Script'],
      'TikTok Idea': item.tiktok_idea || item['TikTok Idea'],
      Timestamp: item.generated_at || item.Timestamp,
      ScheduledAt: item.scheduled_at || null
    };
  });

  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduledAt, setScheduledAt] = useState(data.ScheduledAt ? data.ScheduledAt.split('T')[0] : '');

  if (!state?.item)
    return (
      <div className="p-8">
        No content found. <button onClick={() => navigate('/')}>Go Back</button>
      </div>
    );

  const handleChange = (field, value) => {
    setData({ ...data, [field]: value });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        tweet: data.Tweet,
        facebook_post: data['Facebook Post'],
        instagram_reel_script: data['Instagram Reel Script'],
        tiktok_idea: data['TikTok Idea']
      };

      await api.request(`/content/${data.id}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      });
      alert('Changes saved successfully!');
    } catch (err) {
      alert('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleSchedule = async () => {
    if (!scheduledAt) return;
    setSaving(true);
    try {
      await api.scheduleContent(data.id, scheduledAt);
      setData({ ...data, ScheduledAt: scheduledAt });
      setShowScheduleModal(false);
      alert('Content scheduled successfully!');
    } catch (err) {
      alert('Failed to schedule');
    } finally {
      setSaving(false);
    }
  };

  const shareToTwitter = (text) => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const shareToFacebook = (text) => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const copyToClipboard = (text, field) => {
    const contentToCopy = typeof text === 'object' ? JSON.stringify(text, null, 2) : text;
    navigator.clipboard.writeText(contentToCopy || '');
    setCopied(field);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <header className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft size={20} />
            Back
          </button>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">
              Generated: {new Date(data.Timestamp).toLocaleDateString()}
            </span>
            <button
              onClick={() => setShowScheduleModal(true)}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium shadow-sm"
            >
              <Calendar size={18} />
              {data.ScheduledAt ? `Scheduled: ${new Date(data.ScheduledAt).toLocaleDateString()}` : 'Schedule'}
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium shadow-sm disabled:opacity-50"
            >
              <Save size={18} />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </header>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-gray-50/50">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-xl font-bold text-gray-900">{data.Trend}</h1>
            </div>
          </div>

          <div className="p-8 space-y-8">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Twitter Content</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => shareToTwitter(data.Tweet)}
                    className="text-xs flex items-center gap-1 text-gray-500 hover:text-indigo-600 font-medium"
                  >
                    <Twitter size={14} />
                    Share
                  </button>
                  <button
                    onClick={() => copyToClipboard(data.Tweet, 'tweet')}
                    className="text-xs flex items-center gap-1 text-indigo-600 hover:text-indigo-700 font-medium border-l border-gray-200 pl-2"
                  >
                    {copied === 'tweet' ? <Check size={14} /> : <Copy size={14} />}
                    {copied === 'tweet' ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>
              <textarea
                value={data.Tweet || ''}
                onChange={(event) => handleChange('Tweet', event.target.value)}
                className="w-full h-32 p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-gray-700 leading-relaxed resize-none"
                placeholder="Enter tweet content..."
              />
              <div className="flex justify-end">
                <span className={`text-xs ${data.Tweet?.length > 280 ? 'text-red-500' : 'text-gray-400'}`}>
                  {data.Tweet?.length || 0}/280 characters
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Facebook Post</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => shareToFacebook(data['Facebook Post'])}
                    className="text-xs flex items-center gap-1 text-gray-500 hover:text-indigo-600 font-medium"
                  >
                    <Facebook size={14} />
                    Share
                  </button>
                  <button
                    onClick={() => copyToClipboard(data['Facebook Post'], 'fb')}
                    className="text-xs flex items-center gap-1 text-indigo-600 hover:text-indigo-700 font-medium border-l border-gray-200 pl-2"
                  >
                    {copied === 'fb' ? <Check size={14} /> : <Copy size={14} />}
                    {copied === 'fb' ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>
              <textarea
                value={data['Facebook Post'] || ''}
                onChange={(event) => handleChange('Facebook Post', event.target.value)}
                className="w-full h-40 p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-gray-700 leading-relaxed resize-none"
                placeholder="Enter Facebook post..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Instagram Reel Script</label>
                  <button
                    onClick={() => copyToClipboard(data['Instagram Reel Script'], 'insta')}
                    className="text-xs flex items-center gap-1 text-indigo-600 hover:text-indigo-700 font-medium"
                  >
                    {copied === 'insta' ? <Check size={14} /> : <Copy size={14} />}
                    {copied === 'insta' ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 text-sm text-gray-600 h-96 overflow-y-auto">
                  <FormattedContent content={data['Instagram Reel Script']} />
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-semibold text-gray-700 uppercase tracking-wide">TikTok Idea</label>
                  <button
                    onClick={() => copyToClipboard(data['TikTok Idea'], 'tiktok')}
                    className="text-xs flex items-center gap-1 text-indigo-600 hover:text-indigo-700 font-medium"
                  >
                    {copied === 'tiktok' ? <Check size={14} /> : <Copy size={14} />}
                    {copied === 'tiktok' ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 text-sm text-gray-600 h-96 overflow-y-auto">
                  <FormattedContent content={data['TikTok Idea']} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showScheduleModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Schedule content</h3>
            <div className="space-y-4 mb-8">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Publish Date</label>
                <input
                  type="date"
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <p className="text-sm text-gray-500">
                You can view your scheduled posts in the Brand Dashboard. (Scheduling is currently a mock feature).
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowScheduleModal(false)}
                className="flex-1 py-3 text-gray-600 font-medium hover:bg-gray-50 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSchedule}
                disabled={!scheduledAt || saving}
                className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                {saving ? 'Scheduling...' : 'Confirm Schedule'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FormattedContent({ content }) {
  if (!content) return <span className="text-gray-400 italic">No content available</span>;

  let parsed = content;

  if (typeof content === 'string') {
    try {
      if (content.trim().startsWith('{') || content.trim().startsWith('[')) {
        try {
          parsed = JSON.parse(content);
        } catch (error) {
          // Ignore parse errors and fallback to raw text
        }
      }
    } catch (error) {
      // Ignore parsing guard errors
    }
  }

  if (typeof parsed === 'string') {
    return <div className="whitespace-pre-wrap text-sm leading-relaxed text-gray-600">{parsed}</div>;
  }

  return (
    <div className="space-y-4">
      {Object.entries(parsed).map(([key, value]) => (
        <div key={key} className="bg-white p-3 rounded-lg border border-gray-200">
          <h4 className="font-bold text-indigo-600 mb-2 text-sm uppercase tracking-wide">{key}</h4>
          {Array.isArray(value) ? (
            <ul className="space-y-2">
              {value.map((item, index) => (
                <li key={index} className="text-gray-700 text-sm flex items-start gap-2">
                  <span className="text-indigo-400 mt-1">•</span>
                  <span className="flex-1">{item}</span>
                </li>
              ))}
            </ul>
          ) : typeof value === 'object' && value !== null ? (
            <div className="pl-4 space-y-1">
              {Object.entries(value).map(([subKey, subValue]) => (
                <p key={subKey} className="text-gray-700 text-sm">
                  <span className="font-medium">{subKey}:</span> {subValue}
                </p>
              ))}
            </div>
          ) : (
            <p className="text-gray-700 text-sm leading-relaxed">{value}</p>
          )}
        </div>
      ))}
    </div>
  );
}
