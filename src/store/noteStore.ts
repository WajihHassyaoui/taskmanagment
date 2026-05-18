import { create } from 'zustand';
import { isTauriApp, invoke } from '@/lib/tauri';
import { requireUserId } from '@/lib/userData';
import {
  localCreateNote,
  localDeleteNote,
  localGetNotes,
  localUpdateNote,
} from '@/lib/localNotes';

export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string;
  color: string;
  pinned: boolean;
  task_id?: string;
  created_at: string;
  updated_at: string;
}

interface NoteState {
  notes: Note[];
  loading: boolean;
  error: string | null;
  fetchNotes: () => Promise<void>;
  addNote: (note: Partial<Note>) => Promise<void>;
  updateNote: (id: string, note: Partial<Note>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
}

export const useNoteStore = create<NoteState>((set) => ({
  notes: [],
  loading: false,
  error: null,
  fetchNotes: async () => {
    set({ loading: true });
    try {
      const userId = requireUserId();
      const notes = isTauriApp()
        ? await invoke<Note[]>('get_notes')
        : localGetNotes(userId);
      set({ notes, loading: false, error: null });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },
  addNote: async (note) => {
    try {
      const userId = requireUserId();
      const payload = {
        title: note.title ?? '',
        content: note.content ?? null,
        tags: note.tags ?? null,
        color: note.color,
        pinned: note.pinned,
        task_id: note.task_id ?? null,
      };
      const newNote = isTauriApp()
        ? await invoke<Note>('create_note', { note: payload })
        : localCreateNote(userId, payload);
      set((state) => ({ notes: [newNote, ...state.notes], error: null }));
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },
  updateNote: async (id, note) => {
    try {
      const userId = requireUserId();
      if (isTauriApp()) {
        const updatedNote = await invoke<Note>('update_note', { id, note });
        set((state) => ({
          notes: state.notes.map((n) => (n.id === id ? updatedNote : n)),
          error: null,
        }));
      } else {
        const updatedNote = localUpdateNote(userId, id, note);
        set((state) => ({
          notes: state.notes.map((n) => (n.id === id ? updatedNote : n)),
          error: null,
        }));
      }
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },
  deleteNote: async (id) => {
    try {
      const userId = requireUserId();
      if (isTauriApp()) {
        await invoke('delete_note', { id });
      } else {
        localDeleteNote(userId, id);
      }
      set((state) => ({
        notes: state.notes.filter((n) => n.id !== id),
        error: null,
      }));
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },
}));
