import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, AlertCircle, Loader } from 'lucide-react';
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll';
import { api } from '../../services/api';

export default function AdminBrandsList() {
  const navigate = useNavigate();

  // Fetch function for infinite scroll
  const fetchBrands = useCallback(async (page, limit, search) => {
    const params = {
      page,
      limit,
      ...(search && { search }),
    };

    const response = await api.getAdminBrands(params);

    // Handle both array response and paginated response
    if (Array.isArray(response)) {
      return {
        items: response,
        hasMore: false,
        total: response.length
      };
    }

    return {
      items: response.brands || response.items || [],
      hasMore: response.has_more || (response.brands?.length === limit),
      total: response.total || 0
    };
  }, []);

  const {
    items: brands,
    loading,
    initialLoading,
    hasMore,
    error,
    searchTerm,
    setSearchTerm,
    lastElementRef
  } = useInfiniteScroll(fetchBrands, { initialLimit: 20, searchDelay: 500 });

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="animate-spin text-indigo-600" size={32} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-red-600 flex flex-col items-center gap-2">
        <AlertCircle size={24} />
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with Search */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-lg font-bold text-gray-900">All Brands</h2>
        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search brands or owners..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none w-full sm:w-64"
          />
        </div>
      </div>

      {/* Brands Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Brand</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Industry</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Owner</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {brands.length === 0 && !loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-sm text-gray-500">
                    {searchTerm ? `No brands found matching "${searchTerm}"` : 'No brands found'}
                  </td>
                </tr>
              ) : (
                brands.map((brand, index) => {
                  const isLast = index === brands.length - 1;
                  return (
                    <tr
                      key={brand.id}
                      ref={isLast ? lastElementRef : null}
                      className="hover:bg-gray-50/50 cursor-pointer transition-colors"
                      onClick={() => navigate(`/brand/${brand.id}`)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {brand.logo_url ? (
                            <img src={brand.logo_url} alt={brand.name} className="w-8 h-8 rounded-lg object-cover" />
                          ) : (
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs">
                              {brand.name?.[0] || '?'}
                            </div>
                          )}
                          <div>
                            <div className="font-medium text-sm text-gray-900">{brand.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{brand.industry || 'N/A'}</td>
                      <td className="px-6 py-4">
                        {brand.owner ? (
                          <div>
                            <div className="text-sm text-gray-900">{brand.owner.name || 'No name'}</div>
                            <div className="text-xs text-gray-500">{brand.owner.email}</div>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500">No owner</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                          brand.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {brand.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {brand.created_at ? new Date(brand.created_at).toLocaleDateString() : 'N/A'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Loading indicator at bottom */}
        {loading && (
          <div className="flex items-center justify-center py-4 border-t border-gray-100">
            <Loader className="animate-spin text-indigo-600" size={20} />
            <span className="ml-2 text-sm text-gray-500">Loading more...</span>
          </div>
        )}

        {/* End of list indicator */}
        {!hasMore && brands.length > 0 && (
          <div className="py-4 text-center text-sm text-gray-500 border-t border-gray-100">
            You've reached the end of the list ({brands.length} brands)
          </div>
        )}
      </div>
    </div>
  );
}
