import { useState } from 'react';
import { api } from '../../services/api';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Copy, Check } from 'lucide-react';

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
      Timestamp: item.generated_at || item.Timestamp
    };
  });

  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(null);

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
      navigate('/dashboard');
    } catch (err) {
      alert('Failed to save');
    } finally {
      setSaving(false);
    }
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
                <button
                  onClick={() => copyToClipboard(data.Tweet, 'tweet')}
                  className="text-xs flex items-center gap-1 text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  {copied === 'tweet' ? <Check size={14} /> : <Copy size={14} />}
                  {copied === 'tweet' ? 'Copied!' : 'Copy'}
                </button>
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
                <button
                  onClick={() => copyToClipboard(data['Facebook Post'], 'fb')}
                  className="text-xs flex items-center gap-1 text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  {copied === 'fb' ? <Check size={14} /> : <Copy size={14} />}
                  {copied === 'fb' ? 'Copied!' : 'Copy'}
                </button>
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
