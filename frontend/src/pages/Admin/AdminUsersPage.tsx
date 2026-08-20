import React, { useState, useEffect } from 'react';
import { Users, Search, CheckCircle2, XCircle } from 'lucide-react';
import { adminApi } from '../../services/api';
import { User } from '../../types';
import { useToast } from '../../context/ToastContext';

export const AdminUsersPage: React.FC = () => {
  const { success, error: toastError } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getUsers({
        role: roleFilter !== 'ALL' ? roleFilter : undefined,
        limit: 50,
      });
      if (res.data.success && res.data.data) {
        setUsers(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const handleToggleStatus = async (userId: string) => {
    try {
      const res = await adminApi.toggleUserStatus(userId);
      if (res.data.success) {
        success('User account status updated');
        fetchUsers();
      }
    } catch (err: any) {
      toastError(err.response?.data?.error || 'Failed to update user');
    }
  };

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
          User Account Management
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Review all registered customer, farmer, and admin accounts.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Search */}
        <div className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3 max-w-sm w-full">
          <Search className="w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs outline-none bg-transparent"
          />
        </div>

        {/* Role Filters */}
        <div className="flex items-center gap-2">
          {['ALL', 'CUSTOMER', 'FARMER', 'ADMIN'].map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                roleFilter === r
                  ? 'bg-purple-700 text-white shadow-md'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-gray-400">Loading accounts...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-xs text-gray-400">No users found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-500 font-bold uppercase tracking-wider text-[10px] border-b border-gray-100">
                <tr>
                  <th className="py-4 px-6">User / Contact</th>
                  <th className="py-4 px-4">Role</th>
                  <th className="py-4 px-4">Location</th>
                  <th className="py-4 px-4">Joined Date</th>
                  <th className="py-4 px-4">Account Status</th>
                  <th className="py-4 px-6 text-right">Moderation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50/70 transition">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            u.avatar ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(
                              u.name
                            )}&background=6b21a8&color=fff`
                          }
                          alt={u.name}
                          className="w-10 h-10 rounded-xl object-cover border border-gray-200"
                        />
                        <div>
                          <p className="font-bold text-gray-900">{u.name}</p>
                          <p className="text-[11px] text-gray-500">{u.email}</p>
                          <span className="text-[10px] text-gray-400">{u.phone || 'No phone'}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          u.role === 'FARMER'
                            ? 'bg-amber-100 text-amber-800'
                            : u.role === 'ADMIN'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>

                    <td className="py-4 px-4 text-gray-600">
                      {u.city ? `${u.city}, ${u.state || ''}` : 'Not provided'}
                    </td>

                    <td className="py-4 px-4 text-gray-500">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>

                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          u.isActive
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {u.isActive ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Active
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3 text-rose-600" /> Deactivated
                          </>
                        )}
                      </span>
                    </td>

                    <td className="py-4 px-6 text-right">
                      {u.role !== 'ADMIN' && (
                        <button
                          onClick={() => handleToggleStatus(u.id)}
                          className={`px-3 py-1.5 rounded-xl font-bold transition text-[11px] ${
                            u.isActive
                              ? 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                              : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                          }`}
                        >
                          {u.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
