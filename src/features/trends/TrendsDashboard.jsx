import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, RefreshCw, Zap, Loader } from 'lucide-react';

export default function TrendsDashboard({ brands }) {
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTrend, setSelectedTrend] = useState(null);
  const [selectedBrandId, setSelectedBrandId] = useState('');
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchTrends();
  }, []);

  const fetchTrends = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/trends', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setTrends(data);
    } catch (error) {
      console.error('Failed to fetch trends:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshTrends = async () => {
    setRefreshing(true);
    try {
      const token = localStorage.getItem('token');
      await fetch('/api/trends/refresh', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetchTrends();
    } catch (error) {
      console.error('Failed to refresh trends:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleGenerate = async () => {
    if (!selectedBrandId || !selectedTrend) return;

    setGenerating(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/generate/${selectedBrandId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          trend: selectedTrend.topic,
          trend_id: selectedTrend.id
        })
      });

      if (res.ok) {
  await res.json();
        setSelectedTrend(null);
        setSelectedBrandId('');
        alert('Content generated successfully! Check your brand dashboard.');
      } else {
        alert('Generation failed. Please try again.');
      }
    } catch (error) {
      console.error('Generation error:', error);
    } finally {
      setGenerating(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading trends...</div>;

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
            <TrendingUp className="text-indigo-600" size={24} />
            Trending Now
          </h2>
          <p className="text-sm sm:text-base text-gray-500 mt-1">Real-time trends from Google & Twitter. Pick one to generate content.</p>
        </div>
        <button
          onClick={handleRefreshTrends}
          disabled={refreshing}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium min-h-[44px]"
        >
          <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
          {refreshing ? 'Refreshing...' : 'Refresh Trends'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {trends.map((trend, index) => (
          <motion.div
            key={trend.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`bg-white rounded-xl shadow-sm border p-5 sm:p-6 cursor-pointer transition-all min-h-[120px] ${
              selectedTrend?.id === trend.id
                ? 'border-indigo-500 ring-2 ring-indigo-100'
                : 'border-gray-100 hover:border-indigo-200 hover:shadow-md active:scale-[0.98]'
            }`}
            onClick={() => setSelectedTrend(trend)}
          >
            <div className="flex justify-between items-start mb-3">
              <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1.5 rounded-md uppercase tracking-wide">
                {trend.source}
              </span>
              <span className="text-xs text-gray-400">
                {new Date(trend.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2 line-clamp-2">{trend.topic}</h3>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <TrendingUp size={14} />
              <span>{trend.volume || 'High Volume'}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {selectedTrend && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            className="bg-white w-full max-w-lg rounded-t-2xl sm:rounded-2xl p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">Generate Content</h3>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Selected Trend</label>
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 font-medium text-gray-900 text-base">
                {selectedTrend.topic}
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Choose Brand</label>
              <select
                value={selectedBrandId}
                onChange={(event) => setSelectedBrandId(event.target.value)}
                className="w-full p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-base min-h-[48px]"
              >
                <option value="">Select a brand...</option>
                {brands.map((brand) => (
                  <option key={brand.id} value={brand.id}>
                    {brand.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setSelectedTrend(null)}
                className="flex-1 py-4 text-gray-600 font-medium hover:bg-gray-50 rounded-xl transition-colors min-h-[48px]"
              >
                Cancel
              </button>
              <button
                onClick={handleGenerate}
                disabled={!selectedBrandId || generating}
                className="flex-1 py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed min-h-[48px]"
              >
                {generating ? (
                  <>
                    <Loader className="animate-spin" size={20} /> Generating...
                  </>
                ) : (
                  <>
                    <Zap size={20} /> Generate
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
