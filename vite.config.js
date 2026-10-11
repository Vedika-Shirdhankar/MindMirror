import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

const r = (p) => resolve(__dirname, p)

export default defineConfig({
  plugins: [
    react({
      include: /\.(jsx|tsx)$/,
    }),
  ],
  resolve: {
    alias: {
      // Journal Studio component aliases — allow JournalStudio.jsx to import without extensions
      './journal-studio/hooks/useJournalStore':        r('src/journal-studio/hooks/useJournalStore.tsx'),
      './journal-studio/components/Toast':             r('src/journal-studio/components/Toast.tsx'),
      './journal-studio/components/JournalHome':       r('src/journal-studio/components/JournalHome.tsx'),
      './journal-studio/components/JournalEditor':     r('src/journal-studio/components/JournalEditor.tsx'),
      './journal-studio/components/PromptSelector':    r('src/journal-studio/components/PromptSelector.tsx'),
      './journal-studio/components/EntryPreview':      r('src/journal-studio/components/EntryPreview.tsx'),
      './journal-studio/components/Modal':             r('src/journal-studio/components/Modal.tsx'),
      './journal-studio/lib/ids':                      r('src/journal-studio/lib/ids.ts'),
      './journal-studio/index.css':                    r('src/journal-studio/index.css'),
    },
    extensions: ['.mjs', '.js', '.jsx', '.ts', '.tsx', '.json', '.css'],
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
})
