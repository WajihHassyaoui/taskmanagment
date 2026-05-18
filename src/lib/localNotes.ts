import type { Note } from '@/store/noteStore';

function storageKey(userId: string) {
  return `yalla-task-go-notes-${userId}`;
}

function readAll(userId: string): Note[] {
  try {
    const raw = localStorage.getItem(storageKey(userId));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Note[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAll(userId: string, notes: Note[]) {
  localStorage.setItem(storageKey(userId), JSON.stringify(notes));
}

function nowString(): string {
  return new Date().toISOString().slice(0, 19).replace('T', ' ');
}

export function localGetNotes(userId: string): Note[] {
  return readAll(userId).sort(
    (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
  );
}

export function localCreateNote(
  userId: string,
  input: {
    title: string;
    content?: string | null;
    tags?: string | null;
    color?: string;
    pinned?: boolean;
    task_id?: string | null;
  }
): Note {
  const notes = readAll(userId);
  const now = nowString();
  const note: Note = {
    id: crypto.randomUUID(),
    title: input.title,
    content: input.content ?? '',
    tags: input.tags ?? '',
    color: input.color ?? '#ffffff',
    pinned: input.pinned ?? false,
    task_id: input.task_id ?? undefined,
    created_at: now,
    updated_at: now,
  };
  writeAll(userId, [note, ...notes]);
  return note;
}

export function localUpdateNote(
  userId: string,
  id: string,
  patch: Partial<Note>
): Note {
  const notes = readAll(userId);
  const index = notes.findIndex((n) => n.id === id);
  if (index === -1) throw new Error('Note not found');
  const updated = { ...notes[index], ...patch, updated_at: nowString() };
  notes[index] = updated;
  writeAll(userId, notes);
  return updated;
}

export function localDeleteNote(userId: string, id: string): void {
  writeAll(
    userId,
    readAll(userId).filter((n) => n.id !== id)
  );
}
