import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';
import { Clock, User, Edit, Trash, Plus, Eye } from 'lucide-react';

interface Activity {
  id: string;
  userId: string;
  username: string;
  action: string;
  timestamp: string;
  target?: string;
}

interface ActivityTimelineProps {
  activities: Activity[];
  maxItems?: number;
}

const getActionIcon = (action: string) => {
  switch (action) {
    case 'login':
      return <User className="h-4 w-4" />;
    case 'edit':
      return <Edit className="h-4 w-4" />;
    case 'delete':
      return <Trash className="h-4 w-4" />;
    case 'create':
      return <Plus className="h-4 w-4" />;
    case 'view':
      return <Eye className="h-4 w-4" />;
    default:
      return <Clock className="h-4 w-4" />;
  }
};

const getActionColor = (action: string) => {
  switch (action) {
    case 'login':
      return 'bg-blue-500';
    case 'edit':
      return 'bg-yellow-500';
    case 'delete':
      return 'bg-red-500';
    case 'create':
      return 'bg-green-500';
    case 'view':
      return 'bg-gray-500';
    default:
      return 'bg-gray-400';
  }
};

export const ActivityTimeline = ({ activities, maxItems = 10 }: ActivityTimelineProps) => {
  const recentActivities = activities.slice(-maxItems).reverse();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Recent Activity
        </CardTitle>
        <CardDescription>Latest actions and changes</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {recentActivities.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="h-12 w-12 mx-auto mb-2 opacity-20" />
                <p>No recent activity</p>
              </div>
            ) : (
              recentActivities.map((activity, index) => (
                <div key={activity.id || index} className="flex gap-3">
                  {/* Timeline line */}
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full ${getActionColor(activity.action)} flex items-center justify-center text-white shrink-0`}>
                      {getActionIcon(activity.action)}
                    </div>
                    {index < recentActivities.length - 1 && (
                      <div className="w-0.5 h-full bg-border mt-1" />
                    )}
                  </div>

                  {/* Activity content */}
                  <div className="flex-1 pb-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-medium">
                          <span className="font-semibold">{activity.username}</span>
                          {' '}
                          <span className="text-muted-foreground">{activity.action}</span>
                          {activity.target && (
                            <span className="text-muted-foreground"> {activity.target}</span>
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

