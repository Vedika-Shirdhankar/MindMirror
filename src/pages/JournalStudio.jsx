/**
 * JournalStudio.jsx
 *
 * Integrates the journal-studio-prototype into MindMirror as a full-page
 * experience mounted at /journal-studio.
 */

import { useState } from 'react'
import { JournalProvider, useJournalStore } from './journal-studio/hooks/useJournalStore'
import { ToastProvider, useToast } from './journal-studio/components/Toast'
import { JournalHome } from './journal-studio/components/JournalHome'
import { JournalEditor } from './journal-studio/components/JournalEditor'
import { PromptSelector } from './journal-studio/components/PromptSelector'
import { EntryPreview } from './journal-studio/components/EntryPreview'
import { ConfirmDialog } from './journal-studio/components/Modal'
import { uid, nowIso } from './journal-studio/lib/ids'
import '@fontsource/figtree/400.css'
import '@fontsource/figtree/600.css'
import '@fontsource/caveat/400.css'
import '@fontsource/caveat/700.css'
import '@fontsource/fraunces/600.css'
import './journal-studio/index.css'

const blankEntry = (prompt = null) => ({
  id: uid('entry'),
  title: '',
  content: '',
  createdAt: nowIso(),
  updatedAt: nowIso(),
  mood: null,
  prompt,
  favorite: false,
  theme: 'cream',
  stickers: [],
  collectionId: null,
})

function Shell() {
  const store = useJournalStore()
  const toast = useToast()
  const [view, setView] = useState({ name: 'home' })
  const [deleting, setDeleting] = useState(false)

  const home = () => { setView({ name: 'home' }); window.scrollTo({ top: 0 }) }

  const startEditor = (entry, isNew, restored = false) => {
    setView({ name: 'editor', key: `${entry.id}:${Date.now()}`, entry, isNew, restored })
    window.scrollTo({ top: 0 })
  }

  const editSaved = (id) => {
    const saved = store.entries.find((e) => e.id === id)
    if (!saved) return
    const draft = store.drafts.find((d) => d.entry.id === id)
    if (draft) { startEditor(draft.entry, draft.isNew, true); toast('Restored your unsaved changes') }
    else startEditor(saved, false)
  }

  if (view.name === 'prompts') {
    return (
      <PromptSelector
        onBack={home}
        onWriteFreely={() => startEditor(blankEntry(), true)}
        onSelect={(prompt) => startEditor(blankEntry(prompt), true)}
      />
    )
  }

  if (view.name === 'editor') {
    return <JournalEditor key={view.key} initial={view.entry} isNew={view.isNew} restoredDraft={view.restored} onExit={home} />
  }

  if (view.name === 'view') {
    const entry = store.entries.find((e) => e.id === view.id)
    if (!entry) { home(); return null }
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
            message={<>"{entry.title || 'Untitled entry'}" and its stickers will be removed. This cannot be undone.</>}
            onCancel={() => setDeleting(false)}
            onConfirm={async () => { setDeleting(false); await store.deleteEntry(entry.id); toast('Entry deleted'); home() }}
          />
        )}
      </>
    )
  }

  return (
    <JournalHome
      onWriteFreely={() => startEditor(blankEntry(), true)}
      onStartWithPrompt={() => setView({ name: 'prompts' })}
      onOpen={(id) => setView({ name: 'view', id })}
      onEdit={editSaved}
      onResumeDraft={(d) => startEditor(d.entry, d.isNew, true)}
    />
  )
}

function ErrorBanner() {
  const { error, clearError } = useJournalStore()
  if (!error) return null
  return (
    <div role="alert" className="fixed inset-x-0 top-0 z-[130] flex items-center justify-center gap-3 bg-[#FBE3E4] px-4 py-3 text-sm font-medium text-[#8d2f2f]">
      <span>{error}</span>
      <button className="underline" onClick={clearError}>Dismiss</button>
    </div>
  )
}

export default function JournalStudio() {
  return (
    <div
      id="journal-studio-root"
      style={{
        minHeight: '100vh',
        background: '#FBF5E9',
        color: '#3A3040',
        fontFamily: "'Figtree', ui-sans-serif, system-ui, sans-serif",
      }}
    >
      <JournalProvider>
        <ToastProvider>
          <ErrorBanner />
          <Shell />
        </ToastProvider>
      </JournalProvider>
    </div>
  )
}
