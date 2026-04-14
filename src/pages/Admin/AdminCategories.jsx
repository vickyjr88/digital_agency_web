import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { systemCategoriesApi } from '../../services/affiliateApi';
import { Loader, Trash2, Plus, ArrowLeft, Tag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AdminCategories() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('ALL'); // 'ALL', 'product', 'brand'
  
  // Create state
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState('product'); // default 'product'
  const [creatingStatus, setCreatingStatus] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const { data } = await systemCategoriesApi.list();
      setCategories(data || []);
    } catch (err) {
      toast.error('Failed to load categories');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;

    try {
      setCreatingStatus(true);
      const { data } = await systemCategoriesApi.create({
        name: newName.trim(),
        type: newType,
      });
      setCategories(prev => [...prev, data]);
      toast.success('Category created successfully');
      setNewName('');
      setIsCreating(false);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to create category (name might already exist)');
    } finally {
      setCreatingStatus(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category? Proceed with caution.')) return;
    
    try {
      await systemCategoriesApi.delete(id);
      setCategories(prev => prev.filter(c => c.id !== id));
      toast.success('Category deleted');
    } catch (err) {
      toast.error('Failed to delete category');
    }
  };

  const filteredCategories = categories.filter(c => filterType === 'ALL' || c.type === filterType);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Optional: Add AdminSidebar component if available */}
      
      <div className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <button
                onClick={() => navigate('/admin')}
                className="flex items-center text-sm text-gray-500 hover:text-gray-900 mb-2"
              >
                <ArrowLeft className="w-4 h-4 mr-1" /> Back to Dashboard
              </button>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <Tag className="w-6 h-6 text-blue-600" />
                Category Management
              </h1>
              <p className="text-gray-500 mt-1">Manage system-wide Product and Brand categories</p>
            </div>
            <button
              onClick={() => setIsCreating(true)}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" /> Add Category
            </button>
          </div>

          {/* Creation Form */}
          {isCreating && (
            <div className="bg-white p-6 rounded-xl shadow-sm mb-6 border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Create New Category</h2>
              <form onSubmit={handleCreate} className="flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-1 w-full flex flex-col">
                  <label className="text-sm font-medium text-gray-700 mb-1">Category Name</label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. Fitness Supplements"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="w-full md:w-1/4 flex flex-col">
                  <label className="text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="product">Product</option>
                    <option value="brand">Brand</option>
                  </select>
                </div>
                <div className="flex gap-2 pb-0">
                  <button
                    type="button"
                    onClick={() => setIsCreating(false)}
                    className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creatingStatus}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {creatingStatus ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Filters */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 font-medium flex gap-4">
            <button
              onClick={() => setFilterType('ALL')}
              className={`px-4 py-2 rounded-lg ${filterType === 'ALL' ? 'bg-blue-50 text-blue-700' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              All Categories
            </button>
            <button
              onClick={() => setFilterType('product')}
              className={`px-4 py-2 rounded-lg ${filterType === 'product' ? 'bg-blue-50 text-blue-700' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              Product
            </button>
            <button
              onClick={() => setFilterType('brand')}
              className={`px-4 py-2 rounded-lg ${filterType === 'brand' ? 'bg-blue-50 text-blue-700' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              Brand
            </button>
          </div>

          {/* List */}
          {loading ? (
            <div className="flex justify-center p-12">
              <Loader className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Slug</th>
                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Type</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredCategories.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                        No categories found.
                      </td>
                    </tr>
                  ) : (
                    filteredCategories.map((cat) => (
                      <tr key={cat.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium text-gray-900">{cat.name}</td>
                        <td className="px-6 py-4 text-sm text-gray-500 font-mono bg-gray-50">{cat.slug}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                            ${cat.type === 'brand' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'}`}>
                            {cat.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleDelete(cat.id)}
                            className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Category"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
