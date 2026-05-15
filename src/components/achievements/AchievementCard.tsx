import { Badge as BadgeData } from '@/lib/achievements';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import * as Icons from 'lucide-react';

interface AchievementCardProps {
  badge: BadgeData;
  unlockedAt: string | null;
}

export function AchievementCard({ badge, unlockedAt }: AchievementCardProps) {
  const Icon = (Icons as any)[badge.icon] || Icons.Trophy;

  return (
    <Card className={cn(
      "relative overflow-hidden transition-all",
      unlockedAt ? "border-primary bg-primary/5" : "opacity-50 grayscale"
    )}>
      <CardContent className="p-4 flex items-center space-x-4">
        <div className={cn(
          "p-3 rounded-full",
          unlockedAt ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
        )}>
          <Icon size={24} />
        </div>
        <div>
          <h3 className="font-bold">{badge.title}</h3>
          <p className="text-xs text-muted-foreground">{badge.description}</p>
          {unlockedAt && (
            <p className="text-[10px] text-primary mt-1 font-medium">
              Unlocked on {new Date(unlockedAt).toLocaleDateString()}
            </p>
          )}
        </div>
      </CardContent>
      {!unlockedAt && (
        <div className="absolute top-2 right-2">
          <Icons.Lock size={12} className="text-muted-foreground" />
        </div>
      )}
    </Card>
  );
}
