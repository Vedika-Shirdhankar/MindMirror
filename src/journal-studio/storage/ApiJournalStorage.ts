/**
 * ApiJournalStorage.ts
 *
 * Full REST API adapter for MindMirror Journal Studio.
 * Persists entries, collections, drafts, and metadata to MongoDB via the backend.
 * Falls back gracefully to localStorage when unauthenticated or offline.
 */

import type { Collection, Draft, JournalEntry, JournalMeta, JournalStorage } from '../types/journal';
import { StorageError } from './JournalStorage';
import { LocalStorageJournalStorage } from './localStorageAdapter';

const BASE_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api/journal-studio`
  : '/api/journal-studio';

function getToken(): string | null {
  return localStorage.getItem('mm_token');
}

async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new StorageError(errorBody.error || `Request failed with status ${response.status}`);
  }

  const data = await response.json();
  return data.data as T;
}

export class ApiJournalStorage implements JournalStorage {
  private localFallback = new LocalStorageJournalStorage();

  private isOnlineAndAuthed(): boolean {
    return !!getToken() && navigator.onLine;
  }

  async listEntries(): Promise<JournalEntry[]> {
    if (!this.isOnlineAndAuthed()) {
      return this.localFallback.listEntries();
    }
    try {
      return await apiRequest<JournalEntry[]>('/entries');
    } catch (err) {
      console.warn('API listEntries failed, falling back to local:', err);
      return this.localFallback.listEntries();
    }
  }

  async getEntry(id: string): Promise<JournalEntry | null> {
    if (!this.isOnlineAndAuthed()) {
      return this.localFallback.getEntry(id);
    }
    try {
      return await apiRequest<JournalEntry>(`/entries/${encodeURIComponent(id)}`);
    } catch {
      return this.localFallback.getEntry(id);
    }
  }

  async saveEntry(entry: JournalEntry): Promise<JournalEntry> {
    // Keep local copy synced
    await this.localFallback.saveEntry(entry);

    if (!this.isOnlineAndAuthed()) {
      return entry;
    }

    try {
      return await apiRequest<JournalEntry>('/entries', {
        method: 'POST',
        body: JSON.stringify(entry),
      });
    } catch (err) {
      console.warn('API saveEntry failed, saved locally:', err);
      return entry;
    }
  }

  async deleteEntry(id: string): Promise<void> {
    await this.localFallback.deleteEntry(id);

    if (!this.isOnlineAndAuthed()) {
      return;
    }

    try {
      await apiRequest<void>(`/entries/${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
    } catch (err) {
      console.warn('API deleteEntry failed:', err);
    }
  }

  async listCollections(): Promise<Collection[]> {
    if (!this.isOnlineAndAuthed()) {
      return this.localFallback.listCollections();
    }
    try {
      return await apiRequest<Collection[]>('/collections');
    } catch (err) {
      console.warn('API listCollections failed, falling back to local:', err);
      return this.localFallback.listCollections();
    }
  }

  async saveCollections(collections: Collection[]): Promise<void> {
    await this.localFallback.saveCollections(collections);

    if (!this.isOnlineAndAuthed()) {
      return;
    }

    try {
      await apiRequest<Collection[]>('/collections', {
        method: 'PUT',
        body: JSON.stringify({ collections }),
      });
    } catch (err) {
      console.warn('API saveCollections failed:', err);
    }
  }

  async listDrafts(): Promise<Draft[]> {
    if (!this.isOnlineAndAuthed()) {
      return this.localFallback.listDrafts();
    }
    try {
      return await apiRequest<Draft[]>('/drafts');
    } catch (err) {
      console.warn('API listDrafts failed, falling back to local:', err);
      return this.localFallback.listDrafts();
    }
  }

  async saveDraft(draft: Draft): Promise<void> {
    await this.localFallback.saveDraft(draft);

    if (!this.isOnlineAndAuthed()) {
      return;
    }

    try {
      await apiRequest<Draft>('/drafts', {
        method: 'POST',
        body: JSON.stringify(draft),
      });
    } catch (err) {
      console.warn('API saveDraft failed, saved locally:', err);
    }
  }

  async deleteDraft(entryId: string): Promise<void> {
    await this.localFallback.deleteDraft(entryId);

    if (!this.isOnlineAndAuthed()) {
      return;
    }

    try {
      await apiRequest<void>(`/drafts/${encodeURIComponent(entryId)}`, {
        method: 'DELETE',
      });
    } catch (err) {
      console.warn('API deleteDraft failed:', err);
    }
  }

  async getMeta(): Promise<JournalMeta> {
    if (!this.isOnlineAndAuthed()) {
      return this.localFallback.getMeta();
    }
    try {
      return await apiRequest<JournalMeta>('/meta');
    } catch (err) {
      console.warn('API getMeta failed, falling back to local:', err);
      return this.localFallback.getMeta();
    }
  }

  async setMeta(meta: Partial<JournalMeta>): Promise<void> {
    await this.localFallback.setMeta(meta);

    if (!this.isOnlineAndAuthed()) {
      return;
    }

    try {
      await apiRequest<JournalMeta>('/meta', {
        method: 'PATCH',
        body: JSON.stringify(meta),
      });
    } catch (err) {
      console.warn('API setMeta failed:', err);
    }
  }
}
