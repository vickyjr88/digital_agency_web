import { useCallback, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, AlertCircle, Loader, Filter, ArrowUp, ArrowDown, X } from 'lucide-react';
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll';
import { api } from '../../services/api';

export default function AdminUsersList() {
  const navigate = useNavigate();

  const [userTypeFilter, setUserTypeFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [tierFilter, setTierFilter] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showFilters, setShowFilters] = useState(false);

  // Fetch function for infinite scroll
  const fetchUsers = useCallback(async (page, limit, search) => {
    const params = {
      page,
      limit,
      ...(search && { search }),
      ...(userTypeFilter !== 'all' && { user_type: userTypeFilter }),
      ...(roleFilter !== 'all' && { role: roleFilter }),
      ...(tierFilter !== 'all' && { subscription_tier: tierFilter }),
      sort_by: sortBy,
      sort_order: sortOrder
    };

    const response = await api.getAdminUsers(params);

    // Handle both array response and paginated response
    if (Array.isArray(response)) {
      return {
        items: response,
        hasMore: false,
        total: response.length
      };
    }

    return {
      items: response.users || response.items || [],
      hasMore: response.has_more || (response.users?.length === limit),
      total: response.total || 0
    };
  }, [userTypeFilter, roleFilter, tierFilter, sortBy, sortOrder]);

  const {
    items: users,
    loading,
    initialLoading,
    hasMore,
    error,
    searchTerm,
    setSearchTerm,
    lastElementRef,
    refresh
  } = useInfiniteScroll(fetchUsers, { initialLimit: 20, searchDelay: 500 });

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userTypeFilter, roleFilter, tierFilter, sortBy, sortOrder]);

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const renderSortIcon = (field) => {
    if (sortBy !== field) return null;
    return sortOrder === 'asc' ? <ArrowUp size={14} className="ml-1 inline" /> : <ArrowDown size={14} className="ml-1 inline" />;
  };

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
      {/* Header with Search and Filter Toggle */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-lg font-bold text-gray-900">All Users</h2>
        <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center justify-center gap-2 px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${showFilters ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
          >
            <Filter size={16} />
            Filters
          </button>
        </div>
      </div>

      {/* Advanced Filters Panel */}
      {showFilters && (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-wrap gap-4 items-end">
          <div className="space-y-1 flex-1 min-w-[150px]">
            <label className="text-xs font-semibold text-gray-500">User Type</label>
            <select
              value={userTypeFilter}
              onChange={(e) => setUserTypeFilter(e.target.value)}
              className="w-full p-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Types</option>
              <option value="brand">Brand</option>
              <option value="influencer">Influencer</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="space-y-1 flex-1 min-w-[150px]">
            <label className="text-xs font-semibold text-gray-500">Role</label>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full p-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Roles</option>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="space-y-1 flex-1 min-w-[150px]">
            <label className="text-xs font-semibold text-gray-500">Subscription Tier</label>
            <select
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value)}
              className="w-full p-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Tiers</option>
              <option value="free">Free</option>
              <option value="starter">Starter</option>
              <option value="professional">Professional</option>
              <option value="agency">Agency</option>
            </select>
          </div>
          {(userTypeFilter !== 'all' || roleFilter !== 'all' || tierFilter !== 'all') && (
            <button
              onClick={() => {
                setUserTypeFilter('all');
                setRoleFilter('all');
                setTierFilter('all');
              }}
              className="px-4 py-2 text-sm text-gray-500 hover:text-red-600 transition-colors flex items-center gap-2"
            >
              <X size={16} />
              Clear
            </button>
          )}
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center">
                    User {renderSortIcon('name')}
                  </div>
                </th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('user_type')}
                >
                  <div className="flex items-center">
                    Type {renderSortIcon('user_type')}
                  </div>
                </th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('role')}
                >
                  <div className="flex items-center">
                    Role {renderSortIcon('role')}
                  </div>
                </th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('subscription_tier')}
                >
                  <div className="flex items-center">
                    Plan {renderSortIcon('subscription_tier')}
                  </div>
                </th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('created_at')}
                >
                  <div className="flex items-center">
                    Joined {renderSortIcon('created_at')}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.length === 0 && !loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-sm text-gray-500">
                    {searchTerm ? `No users found matching "${searchTerm}"` : 'No users found'}
                  </td>
                </tr>
              ) : (
                users.map((user, index) => {
                  const isLast = index === users.length - 1;
                  return (
                    <tr
                      key={user.id}
                      ref={isLast ? lastElementRef : null}
                      className="hover:bg-gray-50/50 cursor-pointer transition-colors"
                      onClick={() => navigate(`/admin/user/${user.id}`)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs">
                            {user.name?.[0] || user.email?.[0] || '?'}
                          </div>
                          <div>
                            <div className="font-medium text-sm text-gray-900">{user.name || 'No name'}</div>
                            <div className="text-xs text-gray-500">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${user.user_type?.toLowerCase() === 'admin'
                            ? 'bg-purple-100 text-purple-700'
                            : user.user_type?.toLowerCase() === 'influencer'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}>
                          {user.user_type || 'brand'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${user.role?.toLowerCase() === 'admin' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                          }`}>
                          {user.role || 'user'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 capitalize">{user.subscription_tier || 'free'}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
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
        {!hasMore && users.length > 0 && (
          <div className="py-4 text-center text-sm text-gray-500 border-t border-gray-100">
            You've reached the end of the list ({users.length} users)
          </div>
        )}
      </div>
    </div>
  );
}
