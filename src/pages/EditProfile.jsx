import React, { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'https://playnow-backend-khtk.onrender.com').replace(/\/$/, '');
const usernameRegex = /^[a-z0-9_.]{3,20}$/;

const inputClass = 'w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 text-white font-bold focus:outline-none focus:border-[#39FF14] transition placeholder:text-gray-600';

const EditProfile = () => {
  const { user, updateProfile } = useAuth();
  const [form, setForm] = useState({
    name: '',
    username: '',
    bio: '',
    preferredSports: '',
    city: '',
    area: '',
    playNowId: '',
    phone: '',
    email: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!user) return;

    const loadProfile = async () => {
      setLoading(true);
      setError('');

      try {
        const token = localStorage.getItem('playnow_token');
        const res = await fetch(`${API_BASE_URL}/api/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();

        if (!res.ok) {
          setError(data.message || 'Unable to load profile');
          return;
        }

        setForm({
          name: data.name || '',
          username: data.username || '',
          bio: data.bio || '',
          preferredSports: Array.isArray(data.preferredSports) ? data.preferredSports.join(', ') : '',
          city: data.city || '',
          area: data.area || '',
          playNowId: data.playNowId || '',
          phone: data.phone || '',
          email: data.email || '',
        });
      } catch (err) {
        console.error('Profile load error:', err);
        setError('Unable to load profile');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user]);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const handleChange = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const username = form.username.trim().toLowerCase();
    if (!usernameRegex.test(username)) {
      setError('Username must be 3-20 characters and use lowercase letters, numbers, underscore, or dot only');
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem('playnow_token');
      const res = await fetch(`${API_BASE_URL}/api/users/me`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: form.name,
          username,
          bio: form.bio,
          preferredSports: form.preferredSports,
          city: form.city,
          area: form.area,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Unable to save profile');
        return;
      }

      updateProfile(data);
      setForm((current) => ({
        ...current,
        ...data,
        preferredSports: Array.isArray(data.preferredSports) ? data.preferredSports.join(', ') : current.preferredSports,
      }));
      setSuccess('Profile updated successfully');
    } catch (err) {
      console.error('Profile save error:', err);
      setError('Unable to save profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="pt-20 md:pt-24 pb-24 px-4 max-w-3xl mx-auto min-h-screen w-full">
      <Link to="/dashboard" className="inline-flex items-center gap-2 text-gray-400 hover:text-[#39FF14] font-bold mb-6">
        <ArrowLeft size={16} /> Back to Profile
      </Link>

      <div className="bg-[#151b2b] border border-gray-800 rounded-3xl p-6 md:p-8">
        <h1 className="text-2xl md:text-3xl font-black text-white mb-2">Edit Profile</h1>
        <p className="text-sm text-gray-400 mb-8">Your PlayNow ID is permanent and cannot be edited.</p>

        {loading ? (
          <div className="py-16 flex justify-center">
            <Loader2 className="animate-spin text-[#39FF14]" size={32} />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && <div className="bg-red-500/10 border border-red-500/40 text-red-400 rounded-2xl px-4 py-3 text-sm font-bold">{error}</div>}
            {success && <div className="bg-[#39FF14]/10 border border-[#39FF14]/40 text-[#39FF14] rounded-2xl px-4 py-3 text-sm font-bold">{success}</div>}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <label className="space-y-2">
                <span className="text-xs font-black uppercase tracking-widest text-gray-500">Name</span>
                <input required value={form.name} onChange={(e) => handleChange('name', e.target.value)} className={inputClass} />
              </label>
              <label className="space-y-2">
                <span className="text-xs font-black uppercase tracking-widest text-gray-500">Username</span>
                <input required value={form.username} onChange={(e) => handleChange('username', e.target.value.toLowerCase().replace(/[^a-z0-9_.]/g, ''))} className={inputClass} />
              </label>
              <label className="space-y-2">
                <span className="text-xs font-black uppercase tracking-widest text-gray-500">PlayNow ID</span>
                <input value={form.playNowId} disabled className={`${inputClass} opacity-60 cursor-not-allowed`} />
              </label>
              <label className="space-y-2">
                <span className="text-xs font-black uppercase tracking-widest text-gray-500">Phone</span>
                <input value={form.phone} disabled className={`${inputClass} opacity-60 cursor-not-allowed`} />
              </label>
              <label className="space-y-2">
                <span className="text-xs font-black uppercase tracking-widest text-gray-500">Email</span>
                <input value={form.email} disabled className={`${inputClass} opacity-60 cursor-not-allowed`} />
              </label>
              <label className="space-y-2">
                <span className="text-xs font-black uppercase tracking-widest text-gray-500">Preferred sports</span>
                <input value={form.preferredSports} onChange={(e) => handleChange('preferredSports', e.target.value)} placeholder="Badminton, Pickleball" className={inputClass} />
              </label>
              <label className="space-y-2">
                <span className="text-xs font-black uppercase tracking-widest text-gray-500">City</span>
                <input value={form.city} onChange={(e) => handleChange('city', e.target.value)} className={inputClass} />
              </label>
              <label className="space-y-2">
                <span className="text-xs font-black uppercase tracking-widest text-gray-500">Area</span>
                <input value={form.area} onChange={(e) => handleChange('area', e.target.value)} className={inputClass} />
              </label>
            </div>

            <label className="space-y-2 block">
              <span className="text-xs font-black uppercase tracking-widest text-gray-500">Bio</span>
              <textarea value={form.bio} onChange={(e) => handleChange('bio', e.target.value)} maxLength={300} rows={4} className={`${inputClass} resize-none`} />
            </label>

            <button disabled={saving} type="submit" className="w-full bg-[#39FF14] disabled:bg-gray-700 disabled:text-gray-400 text-black font-black rounded-2xl py-4 hover:bg-[#32E612] transition flex items-center justify-center gap-2">
              {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />} Save Profile
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default EditProfile;
