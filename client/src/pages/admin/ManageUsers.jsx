import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import AdminLayout from '../../components/admin/AdminLayout';
import {
  Loader2,
  Users,
  Search,
  Shield,
  ShieldCheck,
  UserCheck,
  UserX,
  Mail,
  Phone,
  Calendar,
} from 'lucide-react';

const ManageUsers = () => {
  const { api } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('All');

  const fetchUsers = async () => {
    try {
      const { data } = await api.get('/admin/users');
      setUsers(data.users || []);
    } catch (err) {
      console.error('Error fetching admin users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [api]);

  const toggleUserStatus = async (id, currentStatus) => {
    try {
      await api.patch(`/admin/users/${id}/status`, { isActive: !currentStatus });
      setUsers(
        users.map((u) => (u._id === id ? { ...u, isActive: !currentStatus } : u))
      );
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update user status');
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesRole = filterRole === 'All' || u.role === filterRole;
    const matchesSearch =
      u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.phone?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesRole && matchesSearch;
  });

  if (loading) {
    return (
      <AdminLayout title="Customer Directory">
        <div className="flex justify-center items-center py-32">
          <Loader2 className="w-10 h-10 animate-spin text-primary-600" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="Customer & Admin Directory"
      subtitle="View registered accounts, verify roles, inspect user profiles, and manage access privileges"
    >
      {/* Search Header */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200/80 flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-primary-500 focus:outline-none"
            placeholder="Search by customer name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3">
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 focus:ring-2 focus:ring-primary-500 focus:outline-none"
          >
            <option value="All">All User Roles</option>
            <option value="customer">Customers Only</option>
            <option value="admin">Admins Only</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100 text-xs">
            <thead className="bg-gray-50 font-semibold text-gray-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5 text-left">User Name</th>
                <th className="px-6 py-3.5 text-left">Contact Info</th>
                <th className="px-6 py-3.5 text-left">Role</th>
                <th className="px-6 py-3.5 text-left">Joined On</th>
                <th className="px-6 py-3.5 text-left">Account Status</th>
                <th className="px-6 py-3.5 text-right">Access Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-10 text-center text-gray-400 font-medium">
                    No users found matching query.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary-100 text-primary-700 font-bold flex items-center justify-center flex-shrink-0">
                          {user.name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <div>
                          <span className="font-bold text-gray-900 block">{user.name}</span>
                          <span className="text-[10px] text-gray-400 font-mono">
                            ID: {user._id.slice(-6)}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-gray-600 space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-gray-400" />
                        <span>{user.email}</span>
                      </div>
                      {user.phone && (
                        <div className="flex items-center gap-1.5 text-gray-500">
                          <Phone className="w-3.5 h-3.5 text-gray-400" />
                          <span>{user.phone}</span>
                        </div>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          user.role === 'admin'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {user.role === 'admin' ? (
                          <ShieldCheck className="w-3 h-3" />
                        ) : (
                          <Users className="w-3 h-3" />
                        )}
                        {user.role}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          user.isActive !== false
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {user.isActive !== false ? 'Active' : 'Suspended'}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right">
                      {user.role !== 'admin' ? (
                        <button
                          onClick={() => toggleUserStatus(user._id, user.isActive !== false)}
                          className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl font-bold text-xs transition-colors ${
                            user.isActive !== false
                              ? 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                              : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                          }`}
                        >
                          {user.isActive !== false ? (
                            <>
                              <UserX className="w-3.5 h-3.5" /> Suspend
                            </>
                          ) : (
                            <>
                              <UserCheck className="w-3.5 h-3.5" /> Activate
                            </>
                          )}
                        </button>
                      ) : (
                        <span className="text-gray-400 text-[11px] italic">SuperAdmin</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
};

export default ManageUsers;
