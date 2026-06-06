import React, { useEffect, useState } from 'react';
import { Shield, Users, Building2, CheckCircle2, XCircle, AlertTriangle, BarChart3, Search, Mail, ExternalLink, RefreshCw, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const emptyVenueForm = {
  name: '',
  sportTypes: '',
  location: '',
  address: '',
  pricePerHour: '',
  amenities: '',
  description: '',
  imageUrl: '',
  isActive: true,
};

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'https://playnow-backend-khtk.onrender.com').replace(/\/$/, '');
const apiUrl = (path) => `${API_BASE_URL}${path}`;

const toList = (value) => value
  .split(',')
  .map((item) => item.trim())
  .filter(Boolean);

const readResponseBody = async (res) => {
  const text = await res.text();

  if (!text) return {};

  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
};

const getVenueErrorMessage = (body, fallback) => {
  if (body?.message) return body.message;
  if (body?.error) return body.error;
  if (typeof body === 'string') return body;
  return fallback;
};

const AdminPortal = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const [activeSection, setActiveSection] = useState('requests');
  const [requests, setRequests] = useState([
    { id: '1', name: 'Pranav Ram', venue: 'Elite Badminton Club', email: 'pranav@example.com', phone: '+91 90032 12345', status: 'pending', submittedAt: '2024-05-09' },
    { id: '2', name: 'Arjun K', venue: 'Power Turf', email: 'arjun@example.com', phone: '+91 98840 54321', status: 'pending', submittedAt: '2024-05-08' },
  ]);
  const [venues, setVenues] = useState([]);
  const [venueForm, setVenueForm] = useState(emptyVenueForm);
  const [editingVenueId, setEditingVenueId] = useState(null);
  const [venuesLoading, setVenuesLoading] = useState(false);
  const [venueError, setVenueError] = useState('');

  const fetchVenues = async () => {
    setVenuesLoading(true);
    setVenueError('');

    try {
      const token = localStorage.getItem('playnow_token');
      const res = await fetch(apiUrl('/api/venues'), {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();

      if (!res.ok) {
        setVenueError(data.message || 'Failed to load venues');
        return;
      }

      setVenues(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Venue fetch error:', error);
      setVenueError('Unable to load venues');
    } finally {
      setVenuesLoading(false);
    }
  };

  useEffect(() => {
    if (activeSection === 'venues') {
      fetchVenues();
    }
  }, [activeSection]);

  const resetVenueForm = () => {
    setVenueForm(emptyVenueForm);
    setEditingVenueId(null);
  };

  const handleVenueChange = (field, value) => {
    setVenueForm((current) => ({ ...current, [field]: value }));
  };

  const handleVenueSubmit = async (e) => {
    e.preventDefault();
    setVenueError('');

    const token = localStorage.getItem('playnow_token');
    if (!token) {
      setVenueError('Admin token not found. Please login again.');
      return;
    }

    const payload = {
      name: venueForm.name.trim(),
      sportTypes: toList(venueForm.sportTypes),
      location: venueForm.location.trim(),
      address: venueForm.address.trim(),
      pricePerHour: Number(venueForm.pricePerHour),
      amenities: toList(venueForm.amenities),
      description: venueForm.description.trim(),
      isActive: venueForm.isActive,
    };

    if (venueForm.imageUrl.trim()) {
      payload.images = [venueForm.imageUrl.trim()];
    }

    try {
      const venueUrl = editingVenueId ? apiUrl(`/api/venues/${editingVenueId}`) : apiUrl('/api/venues');
      const venueMethod = editingVenueId ? 'PUT' : 'POST';
      const res = await fetch(venueUrl, {
        method: venueMethod,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await readResponseBody(res);

      console.log('[ADMIN VENUE SAVE]', {
        method: venueMethod,
        url: venueUrl,
        status: res.status,
        body: data,
        usesPlayNowToken: Boolean(token),
      });

      if (!res.ok) {
        setVenueError(getVenueErrorMessage(data, 'Failed to save venue'));
        return;
      }

      resetVenueForm();
      fetchVenues();
    } catch (error) {
      console.error('Venue save error:', error);
      setVenueError(`Unable to save venue: ${error.message}`);
    }
  };

  const handleEditVenue = (venue) => {
    setEditingVenueId(venue._id);
    setVenueForm({
      name: venue.name || '',
      sportTypes: (venue.sportTypes || []).join(', '),
      location: venue.location || '',
      address: venue.address || '',
      pricePerHour: venue.pricePerHour || '',
      amenities: (venue.amenities || []).join(', '),
      description: venue.description || '',
      imageUrl: venue.images?.[0] || '',
      isActive: venue.isActive !== false,
    });
  };

  const handleDeleteVenue = async (venue) => {
    if (!window.confirm(`Delete ${venue.name}?`)) return;

    const token = localStorage.getItem('playnow_token');
    if (!token) {
      setVenueError('Admin token not found. Please login again.');
      return;
    }

    try {
      const venueUrl = apiUrl(`/api/venues/${venue._id}`);
      const res = await fetch(venueUrl, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await readResponseBody(res);

      console.log('[ADMIN VENUE DELETE]', {
        method: 'DELETE',
        url: venueUrl,
        status: res.status,
        body: data,
        usesPlayNowToken: Boolean(token),
      });

      if (!res.ok) {
        setVenueError(getVenueErrorMessage(data, 'Failed to delete venue'));
        return;
      }

      if (editingVenueId === venue._id) {
        resetVenueForm();
      }
      fetchVenues();
    } catch (error) {
      console.error('Venue delete error:', error);
      setVenueError(`Unable to delete venue: ${error.message}`);
    }
  };

  const approveOwner = (id) => {
    const ownerId = `OWN-${Math.floor(1000 + Math.random() * 9000)}`;
    const tempPass = `playnow@${Math.floor(100 + Math.random() * 899)}`;
    
    alert(`OWNER APPROVED!\n\nGenerated Credentials:\nOwner ID: ${ownerId}\nTemp Password: ${tempPass}\n\nEmail these to the owner.`);
    setRequests(requests.filter(req => req.id !== id));
  };

  const rejectOwner = (id) => {
    if(window.confirm('Are you sure you want to reject this request?')) {
      setRequests(requests.filter(req => req.id !== id));
    }
  };

  const navItems = [
    { id: 'requests', label: 'Owner Requests', icon: Mail },
    { id: 'users', label: 'Manage Users', icon: Users },
    { id: 'venues', label: 'Manage Venues', icon: Building2 },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

  return (
    <div className="fixed inset-0 bg-[#0a0f1c] flex overflow-hidden z-[100]">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <div className={`
        fixed md:relative z-[120] h-full w-64 bg-[#151b2b] border-r border-gray-800 p-6 flex flex-col shrink-0 transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="flex items-center justify-between mb-10 px-2">
          <div className="flex items-center gap-2">
            <Shield className="text-[#39FF14]" size={24} />
            <span className="font-extrabold text-xl tracking-tighter">ADMIN PANEL</span>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>
        
        <nav className="space-y-2 flex-1 overflow-y-auto pr-2 custom-scrollbar">
          {navItems.map(item => (
            <button 
              key={item.id}
              onClick={() => {
                setActiveSection(item.id);
                setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition ${activeSection === item.id ? 'bg-[#39FF14] text-black' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
            >
              <item.icon size={18} /> {item.label}
              {item.id === 'requests' && requests.length > 0 && (
                <span className={`ml-auto w-5 h-5 rounded-full text-[10px] flex items-center justify-center ${activeSection === 'requests' ? 'bg-black text-[#39FF14]' : 'bg-red-500 text-white'}`}>
                  {requests.length}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="pt-6 border-t border-gray-800">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-500 hover:bg-red-500/10 transition"
          >
            <XCircle size={18} /> Logout Admin
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 h-full">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 border-b border-gray-800 bg-[#151b2b]">
          <div className="flex items-center gap-2">
            <Shield className="text-[#39FF14]" size={20} />
            <span className="font-bold text-sm tracking-tight">ADMIN PANEL</span>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 bg-gray-800 rounded-lg text-white"
          >
            <Menu size={20} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
          <header className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-10">
            <div>
              <h2 className="text-2xl md:text-3xl font-extrabold capitalize">{activeSection.replace('-', ' ')}</h2>
              <p className="text-gray-500 text-sm md:text-base">System Administrator Control Center</p>
            </div>
            <div className="flex items-center gap-2 md:gap-4">
              <div className="relative flex-1 md:flex-none">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                <input type="text" placeholder="Search..." className="w-full md:w-auto bg-[#151b2b] border border-gray-800 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-[#39FF14]" />
              </div>
              <button
                onClick={() => activeSection === 'venues' && fetchVenues()}
                className="bg-[#151b2b] border border-gray-800 p-2 rounded-xl text-gray-400 hover:text-white transition"
              >
                <RefreshCw size={18} />
              </button>
            </div>
          </header>

          {activeSection === 'requests' && (
            <div className="space-y-6">
              {requests.length === 0 ? (
                <div className="bg-[#151b2b] border border-gray-800 rounded-3xl p-12 text-center">
                  <CheckCircle2 size={48} className="text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-400">All requests processed!</h3>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {requests.map(req => (
                    <motion.div 
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      key={req.id} 
                      className="bg-[#151b2b] border border-gray-800 rounded-2xl p-4 md:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-800 rounded-xl flex items-center justify-center shrink-0">
                          <Building2 size={20} className="md:text-[#39FF14]" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-base md:text-lg truncate">{req.venue}</h4>
                          <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] md:text-xs text-gray-500 mt-1">
                            <span>Owner: {req.name}</span>
                            <span className="hidden md:inline">•</span>
                            <span>{req.email}</span>
                            <span className="hidden md:inline">•</span>
                            <span>{req.phone}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 md:gap-3 ml-14 lg:ml-0">
                        <button className="p-2 md:p-3 bg-gray-800 text-gray-400 rounded-xl hover:text-white transition">
                          <ExternalLink size={16} />
                        </button>
                        <button 
                          onClick={() => rejectOwner(req.id)}
                          className="px-3 md:px-4 py-2 bg-red-500/10 text-red-500 rounded-xl text-xs md:text-sm font-bold hover:bg-red-500 hover:text-white transition"
                        >
                          Reject
                        </button>
                        <button 
                          onClick={() => approveOwner(req.id)}
                          className="px-3 md:px-4 py-2 bg-[#39FF14] text-black rounded-xl text-xs md:text-sm font-bold hover:bg-[#32E612] transition"
                        >
                          Approve
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeSection === 'venues' && (
            <div className="space-y-6">
              <form
                onSubmit={handleVenueSubmit}
                className="bg-[#151b2b] border border-gray-800 rounded-3xl p-4 md:p-6 space-y-4"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div>
                    <h3 className="text-xl font-bold">
                      {editingVenueId ? 'Edit Venue' : 'Add Venue'}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Use comma-separated values for sports and amenities.
                    </p>
                  </div>
                  {editingVenueId && (
                    <button
                      type="button"
                      onClick={resetVenueForm}
                      className="text-sm font-bold text-gray-400 hover:text-white"
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>

                {venueError && (
                  <div className="bg-red-500/10 border border-red-500/40 text-red-400 rounded-xl px-4 py-3 text-sm">
                    {venueError}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                      Name
                    </label>
                    <input
                      required
                      value={venueForm.name}
                      onChange={(e) => handleVenueChange('name', e.target.value)}
                      className="w-full bg-[#0a0f1c] border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#39FF14]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                      Sport Types
                    </label>
                    <input
                      required
                      value={venueForm.sportTypes}
                      onChange={(e) => handleVenueChange('sportTypes', e.target.value)}
                      placeholder="Badminton, Football Turf"
                      className="w-full bg-[#0a0f1c] border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#39FF14]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                      Location
                    </label>
                    <input
                      required
                      value={venueForm.location}
                      onChange={(e) => handleVenueChange('location', e.target.value)}
                      className="w-full bg-[#0a0f1c] border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#39FF14]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                      Price Per Hour
                    </label>
                    <input
                      required
                      type="number"
                      min="1"
                      value={venueForm.pricePerHour}
                      onChange={(e) => handleVenueChange('pricePerHour', e.target.value)}
                      className="w-full bg-[#0a0f1c] border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#39FF14]"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                      Address
                    </label>
                    <textarea
                      required
                      value={venueForm.address}
                      onChange={(e) => handleVenueChange('address', e.target.value)}
                      className="w-full bg-[#0a0f1c] border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#39FF14] min-h-20"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                      Amenities
                    </label>
                    <input
                      value={venueForm.amenities}
                      onChange={(e) => handleVenueChange('amenities', e.target.value)}
                      placeholder="Parking, Washroom, Lights"
                      className="w-full bg-[#0a0f1c] border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#39FF14]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                      Image URL Optional
                    </label>
                    <input
                      value={venueForm.imageUrl}
                      onChange={(e) => handleVenueChange('imageUrl', e.target.value)}
                      placeholder="https://..."
                      className="w-full bg-[#0a0f1c] border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#39FF14]"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                      Description
                    </label>
                    <textarea
                      value={venueForm.description}
                      onChange={(e) => handleVenueChange('description', e.target.value)}
                      className="w-full bg-[#0a0f1c] border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#39FF14] min-h-20"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <label className="flex items-center gap-3 text-sm font-bold text-gray-300">
                    <input
                      type="checkbox"
                      checked={venueForm.isActive}
                      onChange={(e) => handleVenueChange('isActive', e.target.checked)}
                      className="w-4 h-4 accent-[#39FF14]"
                    />
                    Venue is active
                  </label>
                  <button
                    type="submit"
                    className="bg-[#39FF14] text-black font-bold px-6 py-3 rounded-xl hover:bg-[#32E612] transition"
                  >
                    {editingVenueId ? 'Update Venue' : 'Create Venue'}
                  </button>
                </div>
              </form>

              <div className="bg-[#151b2b] border border-gray-800 rounded-3xl overflow-hidden">
                <div className="p-4 md:p-6 border-b border-gray-800 flex items-center justify-between">
                  <h3 className="text-xl font-bold">Venue List</h3>
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                    {venues.length} total
                  </span>
                </div>

                {venuesLoading ? (
                  <div className="p-10 text-center text-gray-500 font-bold uppercase tracking-widest text-xs">
                    Loading venues...
                  </div>
                ) : venues.length === 0 ? (
                  <div className="p-10 text-center text-gray-500">
                    No venues found. Create the first venue above.
                  </div>
                ) : (
                  <div className="divide-y divide-gray-800">
                    {venues.map((venue) => (
                      <div key={venue._id} className="p-4 md:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <h4 className="font-bold text-lg truncate">{venue.name}</h4>
                            <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded ${venue.isActive ? 'bg-[#39FF14]/10 text-[#39FF14]' : 'bg-red-500/10 text-red-400'}`}>
                              {venue.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-400">{venue.location}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {(venue.sportTypes || []).join(', ') || 'No sports'} | Rs {venue.pricePerHour}/hr
                          </p>
                          {venue.ownerId?.name && (
                            <p className="text-xs text-gray-600 mt-1">Owner: {venue.ownerId.name}</p>
                          )}
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditVenue(venue)}
                            className="flex-1 lg:flex-none px-4 py-2 bg-gray-800 text-white rounded-xl font-bold text-sm hover:bg-gray-700 transition"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteVenue(venue)}
                            className="flex-1 lg:flex-none px-4 py-2 bg-red-500/10 text-red-400 rounded-xl font-bold text-sm hover:bg-red-500 hover:text-white transition"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeSection !== 'requests' && activeSection !== 'venues' && (
            <div className="bg-[#151b2b] border border-gray-800 rounded-3xl p-8 md:p-12 text-center opacity-50">
              <AlertTriangle size={48} className="text-yellow-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold">Section Under Maintenance</h3>
              <p className="text-gray-500 mt-2 text-sm">The management systems for {activeSection} are currently being updated.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPortal;
