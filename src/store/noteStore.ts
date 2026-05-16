import { create } from 'zustand';
import { invoke } from '@/lib/tauri';

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
      const notes = await invoke<Note[]>('get_notes');
      set({ notes, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },
  addNote: async (note) => {
    try {
      const newNote = await invoke<Note>('create_note', { note });
      set((state) => ({ notes: [newNote, ...state.notes] }));
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },
  updateNote: async (id, note) => {
    try {
      const updatedNote = await invoke<Note>('update_note', { id, note });
      set((state) => ({
        notes: state.notes.map((n) => (n.id === id ? updatedNote : n)),
      }));
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },
  deleteNote: async (id) => {
    try {
      await invoke('delete_note', { id });
      set((state) => ({
        notes: state.notes.filter((n) => n.id !== id),
      }));
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },
}));
