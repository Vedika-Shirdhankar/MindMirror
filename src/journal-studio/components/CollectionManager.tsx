import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type { Collection } from '../types/journal';
import { uid } from '../lib/ids';
import { Modal } from './Modal';

/** Chips for choosing which collection an entry belongs to. */
export function CollectionPicker({ collections, value, onChange, onManage }: {
  collections: Collection[];
  value: string | null;
  onChange: (id: string | null) => void;
  onManage?: () => void;
}) {
  return (
    <div>
      <p className="mb-3 text-[13px] text-ink-mute">File this entry somewhere, or leave it loose.</p>
      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Collection">
        <button className="chip" role="radio" aria-checked={value === null} aria-pressed={value === null} onClick={() => onChange(null)}>None</button>
        {collections.map((c) => (
          <button key={c.id} className="chip" role="radio" aria-checked={value === c.id} aria-pressed={value === c.id} onClick={() => onChange(value === c.id ? null : c.id)}>
            <span aria-hidden>{c.emoji}</span> {c.name}
          </button>
        ))}
      </div>
      {onManage && <button className="btn-ghost mt-3 !min-h-[40px] text-sm" onClick={onManage}>Edit collections</button>}
    </div>
  );
}

/** Lightweight add / rename / remove for collections. */
export function CollectionManager({ collections, counts, onSave, onClose }: {
  collections: Collection[];
  counts: Record<string, number>;
  onSave: (next: Collection[]) => Promise<void> | void;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState<Collection[]>(collections);
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('📔');
  const [busy, setBusy] = useState(false);

  const add = () => {
    const n = name.trim();
    if (!n) return;
    setDraft((d) => [...d, { id: uid('col'), name: n, emoji: emoji.trim() || '📔' }]);
    setName('');
  };

  const save = async () => {
    setBusy(true);
    try { await onSave(draft.filter((c) => c.name.trim())); onClose(); } finally { setBusy(false); }
  };

  const removed = collections.filter((c) => !draft.some((d) => d.id === c.id));
  const affected = removed.reduce((n, c) => n + (counts[c.id] ?? 0), 0);

  return (
    <Modal
      title="Your collections" onClose={onClose}
      footer={<><button className="btn-soft" onClick={onClose}>Cancel</button><button className="btn-primary" onClick={save} disabled={busy}>Save collections</button></>}
    >
      <ul className="space-y-2">
        {draft.map((c) => (
          <li key={c.id} className="flex items-center gap-2">
            <input
              aria-label={`Emoji for ${c.name}`} className="field !w-14 !px-0 text-center text-xl" maxLength={4} value={c.emoji}
              onChange={(e) => setDraft((d) => d.map((x) => (x.id === c.id ? { ...x, emoji: e.target.value } : x)))}
            />
            <input
              aria-label="Collection name" className="field" value={c.name} maxLength={40}
              onChange={(e) => setDraft((d) => d.map((x) => (x.id === c.id ? { ...x, name: e.target.value } : x)))}
            />
            <span className="w-8 shrink-0 text-center text-sm text-ink-mute" title="Entries in this collection">{counts[c.id] ?? 0}</span>
            <button className="icon-btn" aria-label={`Remove ${c.name}`} onClick={() => setDraft((d) => d.filter((x) => x.id !== c.id))}><Trash2 size={18} /></button>
          </li>
        ))}
        {draft.length === 0 && <li className="text-sm text-ink-mute">No collections yet. Add one below.</li>}
      </ul>
      {affected > 0 && (
        <p className="mt-3 rounded-2xl bg-blush-50 px-4 py-3 text-sm text-[#8d2f2f]">
          {affected} {affected === 1 ? 'entry' : 'entries'} will become unfiled. The entries themselves are kept.
        </p>
      )}
      <div className="mt-5 flex items-center gap-2 border-t border-blush-100 pt-5">
        <input aria-label="New collection emoji" className="field !w-14 !px-0 text-center text-xl" maxLength={4} value={emoji} onChange={(e) => setEmoji(e.target.value)} />
        <input
          aria-label="New collection name" className="field" placeholder="New collection name" value={name} maxLength={40}
          onChange={(e) => setName(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') add(); }}
        />
        <button className="btn-lav shrink-0" onClick={add} disabled={!name.trim()}><Plus size={18} /> Add</button>
      </div>
    </Modal>
  );
}
