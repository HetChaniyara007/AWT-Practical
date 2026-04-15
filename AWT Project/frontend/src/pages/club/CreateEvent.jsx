import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const CATEGORIES = ['technical', 'cultural', 'sports', 'workshop', 'seminar', 'other'];
const STEPS = ['Basic Info', 'Date & Venue', 'Settings'];

const initialForm = {
  title: '', description: '', category: 'other',
  venue: '', startDateTime: '', endDateTime: '', registrationDeadline: '',
  capacity: '', tags: '',
  banner: null,
};

export default function CreateEvent() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  const handleFile = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm((p) => ({ ...p, banner: file }));
      setPreview(URL.createObjectURL(file));
    }
  };

  const validateStep = () => {
    if (step === 0 && (!form.title || !form.description)) {
      toast.error('Title and description are required.'); return false;
    }
    if (step === 1 && (!form.venue || !form.startDateTime || !form.endDateTime || !form.registrationDeadline)) {
      toast.error('Please fill all date and venue fields.'); return false;
    }
    if (step === 2 && (!form.capacity || Number(form.capacity) < 1)) {
      toast.error('Capacity must be at least 1.'); return false;
    }
    return true;
  };

  const nextStep = () => { if (validateStep()) setStep((s) => Math.min(s + 1, 2)); };
  const prevStep = () => setStep((s) => Math.max(s - 1, 0));

  const handleSubmit = async () => {
    if (!validateStep()) return;
    setLoading(true);
    try {
      const data = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (k === 'banner') { if (v) data.append('banner', v); }
        else data.append(k, v);
      });

      await axios.post('/api/events', data, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success('🎉 Event submitted for approval!');
      navigate('/club/events');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create event.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="page-header">
        <h1 className="page-title">Create Event</h1>
        <p className="page-subtitle">Submit a new event request for department approval</p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2">
        {STEPS.map((label, i) => (
          <div key={i} className="flex items-center gap-2 flex-1">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
              i < step ? 'bg-emerald-500 text-white' : i === step ? 'bg-primary-500 text-white shadow-glow' : 'bg-white/8 text-slate-500'
            }`}>
              {i < step ? '✓' : i + 1}
            </div>
            <span className={`text-xs font-medium flex-1 ${i === step ? 'text-white' : 'text-slate-500'}`}>{label}</span>
            {i < STEPS.length - 1 && <div className={`h-px flex-1 ${i < step ? 'bg-emerald-500/50' : 'bg-white/8'}`} />}
          </div>
        ))}
      </div>

      <motion.div
        key={step}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="glass-card p-7 space-y-5"
      >
        {/* Step 0 — Basic Info */}
        {step === 0 && (
          <>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Event Title *</label>
              <input id="input-title" type="text" name="title" value={form.title} onChange={handleChange}
                placeholder="e.g. HackSprint 2024 — 24-Hour Hackathon" className="input-field" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Description *</label>
              <textarea id="input-description" name="description" value={form.description} onChange={handleChange}
                rows={5} placeholder="Describe the event, agenda, prizes, eligibility…" className="input-field resize-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Category</label>
              <select id="input-category" name="category" value={form.category} onChange={handleChange} className="input-field">
                {CATEGORIES.map((c) => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Banner Image (optional)</label>
              <div className="border-2 border-dashed border-white/10 rounded-xl p-4 text-center hover:border-primary-500/40 transition-colors">
                <input type="file" id="input-banner" accept="image/*" onChange={handleFile} className="hidden" />
                {preview ? (
                  <div>
                    <img src={preview} alt="preview" className="w-full h-32 object-cover rounded-lg mb-2" />
                    <label htmlFor="input-banner" className="text-xs text-primary-400 cursor-pointer hover:text-primary-300">Change image</label>
                  </div>
                ) : (
                  <label htmlFor="input-banner" className="cursor-pointer">
                    <div className="text-3xl mb-2">🖼️</div>
                    <p className="text-sm text-slate-400">Click to upload (max 5MB)</p>
                    <p className="text-xs text-slate-600 mt-1">JPEG, PNG, WebP, GIF</p>
                  </label>
                )}
              </div>
            </div>
          </>
        )}

        {/* Step 1 — Date & Venue */}
        {step === 1 && (
          <>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Venue *</label>
              <input id="input-venue" type="text" name="venue" value={form.venue} onChange={handleChange}
                placeholder="e.g. Seminar Hall A, Block 3" className="input-field" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Start Date & Time *</label>
                <input id="input-start" type="datetime-local" name="startDateTime" value={form.startDateTime} onChange={handleChange} className="input-field" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">End Date & Time *</label>
                <input id="input-end" type="datetime-local" name="endDateTime" value={form.endDateTime} onChange={handleChange} className="input-field" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Registration Deadline *</label>
              <input id="input-deadline" type="datetime-local" name="registrationDeadline" value={form.registrationDeadline} onChange={handleChange} className="input-field" />
            </div>
          </>
        )}

        {/* Step 2 — Settings */}
        {step === 2 && (
          <>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Capacity (max students) *</label>
              <input id="input-capacity" type="number" name="capacity" value={form.capacity} onChange={handleChange}
                placeholder="e.g. 200" min="1" className="input-field" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Tags <span className="text-slate-600">(comma separated)</span></label>
              <input id="input-tags" type="text" name="tags" value={form.tags} onChange={handleChange}
                placeholder="hackathon, coding, prizes" className="input-field" />
            </div>

            {/* Summary */}
            <div className="rounded-xl p-4 bg-primary-500/8 border border-primary-500/20 space-y-2">
              <p className="text-xs font-semibold text-primary-300 uppercase tracking-wider mb-3">Review Summary</p>
              {[
                { label: 'Title', value: form.title },
                { label: 'Category', value: form.category },
                { label: 'Venue', value: form.venue },
                { label: 'Capacity', value: form.capacity },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between text-sm">
                  <span className="text-slate-500">{label}</span>
                  <span className="text-white font-medium">{value || '—'}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </motion.div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button onClick={prevStep} disabled={step === 0} className="btn-secondary disabled:opacity-30">← Previous</button>
        {step < 2 ? (
          <button id="btn-next" onClick={nextStep} className="btn-primary">Next →</button>
        ) : (
          <button id="btn-submit" onClick={handleSubmit} disabled={loading} className="btn-primary">
            {loading ? (
              <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Submitting…</>
            ) : '🚀 Submit for Approval'}
          </button>
        )}
      </div>
    </div>
  );
}
