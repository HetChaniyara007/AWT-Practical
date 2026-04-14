import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { RoleBadge } from '../../components/ui/Badge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const fmt = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '';

const ROLES = ['all', 'student', 'club_admin', 'superadmin'];

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const LIMIT = 20;

  const fetchUsers = () => {
    setLoading(true);
    const params = new URLSearchParams({ page, limit: LIMIT });
    if (roleFilter !== 'all') params.set('role', roleFilter);
    axios.get(`/api/admin/users?${params}`, { withCredentials: true })
      .then((res) => {
        setUsers(res.data.users);
        setTotal(res.data.total);
        setPages(res.data.pages);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, [roleFilter, page]);

  const handleToggle = async (userId, currentStatus) => {
    try {
      await axios.put(`/api/admin/users/${userId}/toggle`, {}, { withCredentials: true });
      toast.success(`User ${currentStatus ? 'deactivated' : 'activated'}.`);
      fetchUsers();
    } catch (err) {
      toast.error('Action failed.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">Users</h1>
        <p className="page-subtitle">{total} total users</p>
      </div>

      {/* Role filter */}
      <div className="flex flex-wrap gap-2">
        {ROLES.map((r) => (
          <button
            key={r} id={`filter-${r}`}
            onClick={() => { setRoleFilter(r); setPage(1); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
              roleFilter === r ? 'bg-primary-500/20 text-primary-300 border-primary-500/40' : 'bg-white/3 text-slate-400 border-white/8 hover:text-slate-300'
            }`}
          >
            {r === 'all' ? 'All' : r === 'club_admin' ? 'Club Admin' : r.charAt(0).toUpperCase() + r.slice(1)}
          </button>
        ))}
      </div>

      <div className="glass-card overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12"><LoadingSpinner /></div>
        ) : users.length === 0 ? (
          <div className="text-center py-12 text-slate-400">No users found.</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Enrollment No.</th>
                <th>Role</th>
                <th>Club</th>
                <th>Joined</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u, i) => (
                <motion.tr key={u._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary-500/20 to-accent/20 flex items-center justify-center text-xs font-bold text-primary-300 flex-shrink-0">
                        {u.name?.[0]}
                      </div>
                      <div>
                        <p className="text-white font-medium text-sm">{u.name}</p>
                        <p className="text-xs text-slate-500">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="font-mono text-xs text-slate-400">{u.enrollmentNo || '—'}</td>
                  <td><RoleBadge role={u.role} /></td>
                  <td className="text-xs text-slate-400">{u.clubRef?.name || '—'}</td>
                  <td className="text-xs">{fmt(u.createdAt)}</td>
                  <td>
                    <span className={`badge ${u.isActive ? 'badge-approved' : 'badge-cancelled'}`}>
                      {u.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    {u.role !== 'superadmin' && (
                      <button
                        id={`btn-toggle-${u._id}`}
                        onClick={() => handleToggle(u._id, u.isActive)}
                        className={`text-xs font-medium ${u.isActive ? 'text-red-400 hover:text-red-300' : 'text-emerald-400 hover:text-emerald-300'}`}
                      >
                        {u.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    )}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {pages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
            <button key={p} onClick={() => setPage(p)}
              className={`w-9 h-9 rounded-xl text-sm font-medium transition-all ${p === page ? 'bg-primary-500 text-white shadow-glow' : 'glass-card text-slate-400 hover:text-white'}`}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
