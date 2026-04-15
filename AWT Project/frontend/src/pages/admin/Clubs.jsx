import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import Modal from '../../components/ui/Modal';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export default function AdminClubs() {
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', tags: '', foundedYear: '', adminEmail: '' });
  const [creating, setCreating] = useState(false);

  const fetchClubs = () => {
    axios.get('/api/clubs', { withCredentials: true }).then((res) => setClubs(res.data.clubs)).finally(() => setLoading(false));
  };

  useEffect(() => { fetchClubs(); }, []);

  const handleCreate = async () => {
    if (!form.name) return toast.error('Club name is required.');
    setCreating(true);
    try {
      const body = { ...form, tags: form.tags ? form.tags.split(',').map((t) => t.trim()) : [] };
      await axios.post('/api/clubs', body, { withCredentials: true });
      toast.success('Club created!');
      setModalOpen(false);
      setForm({ name: '', description: '', tags: '', foundedYear: '', adminEmail: '' });
      fetchClubs();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create club.');
    } finally {
      setCreating(false);
    }
  };

  const handleDeactivate = async (id) => {
    if (!confirm('Deactivate this club?')) return;
    try {
      await axios.delete(`/api/clubs/${id}`, { withCredentials: true });
      toast.success('Club deactivated.');
      fetchClubs();
    } catch (err) {
      toast.error('Failed to deactivate club.');
    }
  };

  if (loading) return <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="page-header mb-0">
          <h1 className="page-title">Clubs</h1>
          <p className="page-subtitle">{clubs.length} active clubs</p>
        </div>
        <button id="btn-create-club" onClick={() => setModalOpen(true)} className="btn-primary">+ Create Club</button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {clubs.map((club, i) => (
          <motion.div key={club._id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            className="glass-card p-5"
          >
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500/20 to-accent/20 border border-primary-500/20 flex items-center justify-center text-lg font-black text-primary-300 flex-shrink-0">
                {club.name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-white truncate">{club.name}</h3>
                <p className="text-xs text-slate-500">Founded {club.foundedYear}</p>
              </div>
            </div>
            <p className="text-sm text-slate-400 line-clamp-2 mb-3">{club.description || 'No description.'}</p>
            {club.adminUser && (
              <div className="text-xs text-slate-500 mb-3">
                Admin: <span className="text-slate-300">{club.adminUser.name}</span>
              </div>
            )}
            {club.tags?.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {club.tags.slice(0, 3).map((t) => (
                  <span key={t} className="px-2 py-0.5 rounded-md bg-white/5 text-xs text-slate-500">#{t}</span>
                ))}
              </div>
            )}
            <button onClick={() => handleDeactivate(club._id)} className="text-xs text-red-400 hover:text-red-300">
              Deactivate
            </button>
          </motion.div>
        ))}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Create New Club">
        <div className="space-y-4">
          {[
            { label: 'Club Name *', name: 'name', placeholder: 'e.g. TechVerse Club' },
            { label: 'Description', name: 'description', placeholder: 'Brief description of the club' },
            { label: 'Tags (comma separated)', name: 'tags', placeholder: 'coding, AI, robotics' },
            { label: 'Founded Year', name: 'foundedYear', placeholder: '2020' },
            { label: 'Club Admin Email (optional)', name: 'adminEmail', placeholder: 'clubadmin@college.edu' },
          ].map(({ label, name, placeholder }) => (
            <div key={name}>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">{label}</label>
              {name === 'description' ? (
                <textarea rows={3} className="input-field resize-none" placeholder={placeholder}
                  value={form[name]} onChange={(e) => setForm((p) => ({ ...p, [name]: e.target.value }))} />
              ) : (
                <input type="text" className="input-field" placeholder={placeholder}
                  value={form[name]} onChange={(e) => setForm((p) => ({ ...p, [name]: e.target.value }))} />
              )}
            </div>
          ))}
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
            <button id="btn-confirm-create-club" onClick={handleCreate} disabled={creating} className="btn-primary">
              {creating ? 'Creating…' : 'Create Club'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
