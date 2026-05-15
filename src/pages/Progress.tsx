import React from 'react';
import { useStatsStore } from '@/store/statsStore';
import { badges } from '@/lib/achievements';
import { AchievementCard } from '@/components/achievements/AchievementCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Flame, Trophy, Target, Zap } from 'lucide-react';

export default function ProgressPage() {
  const { achievements, dashboardStats, fetchAchievements, fetchDashboardStats } = useStatsStore();

  React.useEffect(() => {
    fetchAchievements();
    fetchDashboardStats();
  }, []);

  const unlockedCount = achievements.filter(a => a.unlocked_at).length;

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Progress & Achievements</h1>
        <p className="text-muted-foreground text-lg mt-1">Track your growth and unlock rewards.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-orange-500/10 border-orange-500/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
            <Flame className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">{dashboardStats?.current_streak || 0} Days</div>
          </CardContent>
        </Card>

        <Card className="bg-yellow-500/10 border-yellow-500/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Badges Unlocked</CardTitle>
            <Trophy className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">{unlockedCount} / {badges.length}</div>
          </CardContent>
        </Card>

        <Card className="bg-indigo-500/10 border-indigo-500/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <Target className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-500">{Math.round(dashboardStats?.weekly_completion_rate || 0)}%</div>
          </CardContent>
        </Card>

        <Card className="bg-blue-500/10 border-blue-500/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Productivity Level</CardTitle>
            <Zap className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">
              {unlockedCount < 2 ? 'Novice' : unlockedCount < 5 ? 'Pro' : 'Master'}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">Achievements</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {badges.map(badge => {
            const achievement = achievements.find(a => a.key === badge.key);
            return (
              <AchievementCard 
                key={badge.key} 
                badge={badge} 
                unlockedAt={achievement?.unlocked_at || null} 
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
