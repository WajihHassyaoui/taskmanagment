import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  CheckSquare, 
  Calendar, 
  StickyNote, 
  TrendingUp, 
  Flame,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useStatsStore } from '@/store/statsStore';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: CheckSquare, label: 'Tasks', path: '/tasks' },
  { icon: Calendar, label: 'Calendar', path: '/calendar' },
  { icon: StickyNote, label: 'Notes', path: '/notes' },
  { icon: TrendingUp, label: 'Progress', path: '/progress' },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = React.useState(false);
  const { dashboardStats } = useStatsStore();
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div 
      className={cn(
        "flex flex-col h-screen bg-card border-r transition-all duration-300",
        collapsed ? "w-20" : "w-64"
      )}
    >
      <div className="p-6 flex items-center justify-between">
        {!collapsed && <h1 className="text-xl font-bold text-primary">Yalla Task Go</h1>}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto"
        >
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </Button>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => cn(
              "flex items-center p-3 rounded-lg transition-colors",
              isActive 
                ? "bg-primary text-primary-foreground" 
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              collapsed && "justify-center"
            )}
          >
            <item.icon size={24} />
            {!collapsed && <span className="ml-3 font-medium">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t space-y-2">
        <div className={cn(
          "flex items-center p-3 rounded-lg bg-orange-500/10 text-orange-500",
          collapsed && "justify-center"
        )}>
          <Flame size={24} className={cn(dashboardStats?.current_streak && "animate-pulse")} />
          {!collapsed && (
            <div className="ml-3">
              <p className="text-xs font-bold uppercase tracking-wider">Streak</p>
              <p className="text-lg font-bold">{dashboardStats?.current_streak || 0} Days</p>
            </div>
          )}
        </div>
        <Button
          variant="ghost"
          className={cn('w-full justify-start text-muted-foreground', collapsed && 'justify-center px-0')}
          onClick={handleLogout}
        >
          <LogOut size={20} />
          {!collapsed && <span className="ml-3">Sign out</span>}
        </Button>
        {!collapsed && user && (
          <p className="text-xs text-muted-foreground truncate px-1">@{user.username}</p>
        )}
      </div>
    </div>
  );
}
