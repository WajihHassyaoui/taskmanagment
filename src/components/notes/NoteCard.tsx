import { Note, useNoteStore } from '@/store/noteStore';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pin, Trash2, Edit3, Tag } from 'lucide-react';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';

interface NoteCardProps {
  note: Note;
  onEdit: (note: Note) => void;
}

export function NoteCard({ note, onEdit }: NoteCardProps) {
  const { deleteNote, updateNote } = useNoteStore();

  return (
    <Card 
      className="group relative h-full flex flex-col hover:shadow-lg transition-all border-l-4" 
      style={{ borderLeftColor: note.color }}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg truncate">{note.title}</CardTitle>
          <div className="flex items-center space-x-1">
            <Button 
              variant="ghost" 
              size="icon" 
              className={cn("h-8 w-8", note.pinned ? "text-primary" : "text-muted-foreground opacity-0 group-hover:opacity-100")}
              onClick={() => updateNote(note.id, { pinned: !note.pinned })}
            >
              <Pin size={16} fill={note.pinned ? "currentColor" : "none"} />
            </Button>
          </div>
        </div>
        {note.tags && (
          <div className="flex flex-wrap gap-1 mt-1">
            {note.tags.split(',').map(tag => (
              <span key={tag} className="text-[10px] bg-accent px-1.5 py-0.5 rounded flex items-center">
                <Tag size={8} className="mr-1" />
                {tag.trim()}
              </span>
            ))}
          </div>
        )}
      </CardHeader>
      
      <CardContent className="flex-1 text-sm text-muted-foreground overflow-hidden">
        <div className="prose prose-sm dark:prose-invert line-clamp-6">
          <ReactMarkdown>{note.content}</ReactMarkdown>
        </div>
      </CardContent>

      <CardFooter className="pt-2 flex justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(note)}>
          <Edit3 size={16} />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteNote(note.id)}>
          <Trash2 size={16} />
        </Button>
      </CardFooter>
    </Card>
  );
}
