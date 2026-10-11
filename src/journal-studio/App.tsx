import { useEffect, useState } from 'react';
import type { Draft, JournalEntry } from './types/journal';
import { JournalProvider, useJournalStore } from './hooks/useJournalStore';
import { ToastProvider, useToast } from './components/Toast';
import { JournalHome } from './components/JournalHome';
import { JournalEditor } from './components/JournalEditor';
import { PromptSelector } from './components/PromptSelector';
import { EntryPreview } from './components/EntryPreview';
import { ConfirmDialog } from './components/Modal';
import { uid, nowIso } from './lib/ids';

type View =
  | { name: 'home' }
  | { name: 'prompts' }
  | { name: 'editor'; key: string; entry: JournalEntry; isNew: boolean; restored?: boolean }
  | { name: 'view'; id: string };

const blankEntry = (prompt: string | null = null): JournalEntry => ({
  id: uid('entry'), title: '', content: '', createdAt: nowIso(), updatedAt: nowIso(),
  mood: null, prompt, favorite: false, theme: 'cream', stickers: [], collectionId: null,
});

function Shell() {
  const store = useJournalStore();
  const toast = useToast();
  const [view, setView] = useState<View>({ name: 'home' });
  const [deleting, setDeleting] = useState(false);

  const home = () => { setView({ name: 'home' }); window.scrollTo({ top: 0 }); };
  const startEditor = (entry: JournalEntry, isNew: boolean, restored = false) => {
    setView({ name: 'editor', key: `${entry.id}:${Date.now()}`, entry, isNew, restored });
    window.scrollTo({ top: 0 });
  };

  const editSaved = (id: string) => {
    const saved = store.entries.find((e) => e.id === id);
    if (!saved) return;
    // If there are unsaved changes from an earlier session, pick them up again.
    const draft = store.drafts.find((d) => d.entry.id === id);
    if (draft) { startEditor(draft.entry, draft.isNew, true); toast('Restored your unsaved changes'); }
    else startEditor(saved, false);
  };

  if (view.name === 'prompts') {
    return (
      <PromptSelector
        onBack={home}
        onWriteFreely={() => startEditor(blankEntry(), true)}
        onSelect={(prompt) => startEditor(blankEntry(prompt), true)}
      />
    );
  }

  if (view.name === 'editor') {
    return <JournalEditor key={view.key} initial={view.entry} isNew={view.isNew} restoredDraft={view.restored} onExit={home} />;
  }

  if (view.name === 'view') {
    const entry = store.entries.find((e) => e.id === view.id);
    if (!entry) return <Redirect onRedirect={home} />;
    return (
      <>
        <EntryPreview
          entry={entry} collections={store.collections} mode="saved" backLabel="Back to journal"
          onBack={home} onEdit={() => editSaved(entry.id)}
          onToggleFavorite={() => void store.toggleFavorite(entry.id)}
          onDelete={() => setDeleting(true)}
        />
        {deleting && (
          <ConfirmDialog
            title="Delete this entry?" tone="danger" confirmLabel="Delete entry"
            message={<>“{entry.title || 'Untitled entry'}” and its stickers will be removed from this browser. This cannot be undone.</>}
            onCancel={() => setDeleting(false)}
            onConfirm={async () => { setDeleting(false); await store.deleteEntry(entry.id); toast('Entry deleted'); home(); }}
          />
        )}
      </>
    );
  }

  return (
    <JournalHome
      onWriteFreely={() => startEditor(blankEntry(), true)}
      onStartWithPrompt={() => setView({ name: 'prompts' })}
      onOpen={(id) => setView({ name: 'view', id })}
      onEdit={editSaved}
      onResumeDraft={(d: Draft) => startEditor(d.entry, d.isNew, true)}
    />
  );
}

export default function App() {
  return (
    <JournalProvider>
      <ToastProvider>
        <ErrorBanner />
        <Shell />
      </ToastProvider>
    </JournalProvider>
  );
}

/** Sends the person home from an effect (never set state during render). */
function Redirect({ onRedirect }: { onRedirect: () => void }) {
  useEffect(() => { onRedirect(); }, [onRedirect]);
  return null;
}

function ErrorBanner() {
  const { error, clearError } = useJournalStore();
  if (!error) return null;
  return (
    <div role="alert" className="fixed inset-x-0 top-0 z-[130] flex items-center justify-center gap-3 bg-[#FBE3E4] px-4 py-3 text-sm font-medium text-[#8d2f2f]">
      <span>{error}</span>
      <button className="underline" onClick={clearError}>Dismiss</button>
    </div>
  );
}
