import React from 'react';
import { Bell, Moon, Sun, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function TopBar() {
  const [isDark, setIsDark] = React.useState(true);

  React.useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  return (
    <div className="h-16 border-b bg-card flex items-center justify-between px-6">
      <div className="relative w-96">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
        <Input 
          placeholder="Search tasks, notes..." 
          className="pl-10 bg-accent/50 border-none focus-visible:ring-1" 
        />
      </div>

      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon">
          <Bell size={20} />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setIsDark(!isDark)}
        >
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </Button>
        <div className="flex items-center space-x-3 pl-4 border-l">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
            JD
          </div>
          <span className="font-medium">John Doe</span>
        </div>
      </div>
    </div>
  );
}
