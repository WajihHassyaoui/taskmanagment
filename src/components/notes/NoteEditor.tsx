import React from 'react';
import { useNoteStore, Note } from '@/store/noteStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface NoteEditorProps {
  note?: Note;
  onComplete: () => void;
}

export function NoteEditor({ note, onComplete }: NoteEditorProps) {
  const { addNote, updateNote } = useNoteStore();
  const [title, setTitle] = React.useState(note?.title || '');
  const [content, setContent] = React.useState(note?.content || '');
  const [tags, setTags] = React.useState(note?.tags || '');
  const [color, setColor] = React.useState(note?.color || '#6366f1');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (note) {
      await updateNote(note.id, { title, content, tags, color });
    } else {
      await addNote({ title, content, tags, color });
    }
    onComplete();
  };

  const colors = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#8b5cf6', '#06b6d4'];

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{note ? 'Edit Note' : 'Create New Note'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input 
            placeholder="Title" 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-lg font-bold"
          />
          
          <div className="flex space-x-2">
            {colors.map(c => (
              <button
                key={c}
                type="button"
                className={cn(
                  "w-6 h-6 rounded-full border-2 transition-transform",
                  color === c ? "scale-125 border-white" : "border-transparent"
                )}
                style={{ backgroundColor: c }}
                onClick={() => setColor(c)}
              />
            ))}
          </div>

          <textarea
            className="w-full h-64 p-3 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="Write your thoughts in markdown..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />

          <Input 
            placeholder="Tags (comma separated)" 
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onComplete}>Cancel</Button>
            <Button type="submit">{note ? 'Save Changes' : 'Create Note'}</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

