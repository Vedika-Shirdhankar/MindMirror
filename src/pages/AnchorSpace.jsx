import React, { useState, useEffect, useCallback } from 'react';
import { Heart, Sparkles, Plus, AlertCircle, Trash2, X, Loader2 } from 'lucide-react';
import { getToken } from '../lib/api';

const CATEGORIES = ['anxious', 'sad', 'overthinking', 'tired', 'lost', 'unmotivated'];

const CATEGORY_META = {
  anxious:      { emoji: '🌀', color: 'from-violet-50 to-indigo-50', badge: 'bg-violet-100 text-violet-700' },
  sad:          { emoji: '💧', color: 'from-blue-50 to-sky-50',      badge: 'bg-blue-100 text-blue-700' },
  overthinking: { emoji: '🌊', color: 'from-cyan-50 to-teal-50',    badge: 'bg-cyan-100 text-cyan-700' },
  tired:        { emoji: '🌙', color: 'from-slate-50 to-gray-50',   badge: 'bg-slate-100 text-slate-600' },
  lost:         { emoji: '🧭', color: 'from-amber-50 to-yellow-50', badge: 'bg-amber-100 text-amber-700' },
  unmotivated:  { emoji: '🌱', color: 'from-green-50 to-emerald-50',badge: 'bg-green-100 text-green-700' },
};

// Authenticated fetch helper — injects Bearer token automatically
async function authFetch(path, options = {}) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`/api${path}`, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `Request failed: ${res.status}`);
  return data;
}

export default function AnchorSpace() {
  const [anchors, setAnchors] = useState({});
  const [activeTab, setActiveTab] = useState('anxious');
  const [quickAccessOpen, setQuickAccessOpen] = useState(false);
  const [emergencyAnchors, setEmergencyAnchors] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newItem, setNewItem] = useState({ type: 'quote', content: '', tags: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(null);

  const fetchAnchors = useCallback(async () => {
    try {
      setLoading(true);
      const data = await authFetch('/anchor');
      if (data.success) setAnchors(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnchors();
  }, [fetchAnchors]);

  const handleQuickAccess = async () => {
    try {
      const data = await authFetch(`/anchor/${activeTab}`);
      if (data.success) {
        setEmergencyAnchors(data.data.slice(0, 3));
        setQuickAccessOpen(true);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await authFetch('/anchor', {
        method: 'POST',
        body: JSON.stringify({
          ...newItem,
          category: activeTab,
          tags: newItem.tags.split(',').map((t) => t.trim()).filter(Boolean),
        }),
      });
      setNewItem({ type: 'quote', content: '', tags: '' });
      setIsAdding(false);
      await fetchAnchors();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    setDeleting(id);
    try {
      await authFetch(`/anchor/${id}`, { method: 'DELETE' });
      setAnchors((prev) => {
        const updated = { ...prev };
        if (updated[activeTab]) {
          updated[activeTab] = updated[activeTab].filter((item) => item._id !== id);
        }
        return updated;
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setDeleting(null);
    }
  };

  const meta = CATEGORY_META[activeTab] || {};
  const currentAnchors = anchors[activeTab] || [];

  return (
    <div className="anchor-sanctuary max-w-5xl mx-auto p-6 space-y-8 text-slate-800">
      {/* Error Toast */}
      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
          <AlertCircle size={16} className="shrink-0" />
          <span>{error}</span>
          <button onClick={() => setError('')} className="ml-auto text-red-400 hover:text-red-600">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">My Anchor Space</h1>
          <p className="text-slate-500 mt-1">When things feel heavy, come back here.</p>
        </div>

        <button
          onClick={handleQuickAccess}
          className="flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white font-medium px-5 py-3 rounded-2xl shadow-lg shadow-rose-200 transition-all active:scale-95"
        >
          <AlertCircle size={18} />
          <span>I'm not okay right now</span>
        </button>
      </header>

      {/* Category Tabs */}
      <nav className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveTab(cat)}
            className={`flex items-center gap-1.5 capitalize px-4 py-2 rounded-xl text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === cat
                ? 'bg-slate-900 text-white shadow-md'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <span>{CATEGORY_META[cat]?.emoji}</span>
            {cat}
          </button>
        ))}
      </nav>

      {/* Main Content */}
      <main>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-medium capitalize text-slate-800">
            {meta.emoji} {activeTab} Comforts
          </h2>
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
          >
            <Plus size={16} /> Save something comforting
          </button>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="animate-spin text-slate-400" size={28} />
          </div>
        ) : currentAnchors.length > 0 ? (
          <div className="anchor-wall grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {currentAnchors.map((item) => (
              <div
                key={item._id}
                className={`anchor-note p-5 rounded-2xl border border-slate-100 bg-gradient-to-br ${meta.color} backdrop-blur-sm shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow group`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md ${meta.badge}`}>
                      {item.type}
                    </span>
                    <button
                      onClick={() => handleDelete(item._id)}
                      disabled={deleting === item._id}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-300 hover:text-red-400"
                    >
                      {deleting === item._id
                        ? <Loader2 size={14} className="animate-spin" />
                        : <Trash2 size={14} />
                      }
                    </button>
                  </div>
                  <p className="mt-3 text-slate-700 leading-relaxed font-serif text-[15px]">
                    "{item.content}"
                  </p>
                </div>
                {item.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-4">
                    {item.tags.map((tag, idx) => (
                      <span key={idx} className="text-[10px] bg-white/60 text-slate-500 px-2 py-0.5 rounded-md">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 px-4 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
            <Heart className="mx-auto text-slate-300 mb-3" size={32} />
            <p className="text-slate-500 max-w-sm mx-auto text-sm leading-relaxed">
              One day, you'll need this space. Start building it gently — add a quote, a reminder, anything that brings you back.
            </p>
            <button
              onClick={() => setIsAdding(true)}
              className="mt-4 inline-flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
            >
              <Plus size={14} /> Add your first anchor
            </button>
          </div>
        )}
      </main>

      {/* Quick Access Modal ("I'm not okay") */}
      {quickAccessOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl relative space-y-4">
            <button
              onClick={() => setQuickAccessOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X size={20} />
            </button>
            <div className="flex items-center gap-2 text-rose-500">
              <Sparkles size={20} />
              <h3 className="text-lg font-semibold">Breathe. We've got you.</h3>
            </div>
            <p className="text-sm text-slate-500">
              Here are things you saved for when you feel <strong className="text-slate-700">{activeTab}</strong>:
            </p>

            <div className="space-y-3">
              {emergencyAnchors.length > 0 ? (
                emergencyAnchors.map((item) => (
                  <div key={item._id} className="p-4 bg-rose-50/60 border border-rose-100 rounded-2xl">
                    <span className="text-[10px] font-bold uppercase text-rose-400">{item.type}</span>
                    <p className="text-slate-800 text-sm mt-1 leading-relaxed font-serif">"{item.content}"</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-6">
                  <p className="text-sm text-slate-400 italic mb-3">No saved anchors for this category yet.</p>
                  <button
                    onClick={() => { setQuickAccessOpen(false); setIsAdding(true); }}
                    className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                  >
                    Add one now →
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Anchor Modal */}
      {isAdding && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <form onSubmit={handleCreate} className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-800">
                {meta.emoji} Add a {activeTab} Anchor
              </h3>
              <button type="button" onClick={() => setIsAdding(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-500">Type</label>
              <select
                value={newItem.type}
                onChange={(e) => setNewItem({ ...newItem, type: e.target.value })}
                className="w-full mt-1 p-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              >
                <option value="quote">Quote</option>
                <option value="note">Personal Note</option>
                <option value="video">Video URL</option>
                <option value="image">Image URL</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-500">Content</label>
              <textarea
                required
                rows={4}
                value={newItem.content}
                onChange={(e) => setNewItem({ ...newItem, content: e.target.value })}
                placeholder="What words, reminder, or link helped you feel better?"
                className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-500">Tags <span className="text-slate-400">(comma separated)</span></label>
              <input
                type="text"
                value={newItem.tags}
                onChange={(e) => setNewItem({ ...newItem, tags: e.target.value })}
                placeholder="exams, panic, breathe"
                className="w-full mt-1 p-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-4 py-2 text-sm text-slate-500 hover:text-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-1.5 px-5 py-2 text-sm bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-700 disabled:opacity-60 transition-colors"
              >
                {saving && <Loader2 size={14} className="animate-spin" />}
                {saving ? 'Saving...' : 'Save Anchor'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
