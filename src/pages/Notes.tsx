import React from 'react';
import { useNoteStore, Note } from '@/store/noteStore';
import { NoteCard } from '@/components/notes/NoteCard';
import { NoteEditor } from '@/components/notes/NoteEditor';
import { Button } from '@/components/ui/button';
import { Plus, Search, Grid, List } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export default function NotesPage() {
  const { notes, fetchNotes } = useNoteStore();
  const [isEditing, setIsEditing] = React.useState(false);
  const [currentNote, setCurrentNote] = React.useState<Note | undefined>();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('grid');

  React.useEffect(() => {
    fetchNotes();
  }, []);

  const handleEdit = (note: Note) => {
    setCurrentNote(note);
    setIsEditing(true);
  };

  const handleCreate = () => {
    setCurrentNote(undefined);
    setIsEditing(true);
  };

  const filteredNotes = notes.filter(n => 
    n.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (n.content && n.content.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (isEditing) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
        <NoteEditor 
          note={currentNote} 
          onComplete={() => {
            setIsEditing(false);
            fetchNotes();
          }} 
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">My Notes</h1>
        <Button onClick={handleCreate}>
          <Plus size={20} className="mr-2" />
          New Note
        </Button>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <Input 
            placeholder="Search notes..." 
            className="pl-10" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex border rounded-md">
          <Button 
            variant={viewMode === 'grid' ? 'secondary' : 'ghost'} 
            size="icon"
            onClick={() => setViewMode('grid')}
          >
            <Grid size={20} />
          </Button>
          <Button 
            variant={viewMode === 'list' ? 'secondary' : 'ghost'} 
            size="icon"
            onClick={() => setViewMode('list')}
          >
            <List size={20} />
          </Button>
        </div>
      </div>

      {filteredNotes.length === 0 ? (
        <div className="text-center py-20 bg-accent/10 rounded-xl border-2 border-dashed">
          <p className="text-muted-foreground">No notes found. Start writing your first thought!</p>
        </div>
      ) : (
        <div className={cn(
          "grid gap-4",
          viewMode === 'grid' ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"
        )}>
          {filteredNotes.map(note => (
            <NoteCard key={note.id} note={note} onEdit={handleEdit} />
          ))}
        </div>
      )}
    </div>
  );
}

