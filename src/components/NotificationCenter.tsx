
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Bell, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { formatDistanceToNow } from "date-fns";

interface Notification {
  id: string;
  type: 'subscriber' | 'comment' | 'like' | 'video';
  content: string;
  createdAt: string;
  read: boolean;
  link: string;
  userId?: string;
  username?: string;
  avatar?: string;
}

interface NotificationCenterProps {
  onClose: () => void;
}

export default function NotificationCenter({ onClose }: NotificationCenterProps) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const loadNotifications = async () => {
      setLoading(true);
      
      // Fetch recent subscriptions
      try {
        const { data: subscriptions } = await supabase
          .from('subscriptions')
          .select(`
            id,
            created_at,
            subscriber_id
          `)
          .eq('channel_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10);
          
        if (subscriptions && subscriptions.length > 0) {
          // Get profiles for subscriber IDs
          const subscriberIds = subscriptions.map(sub => sub.subscriber_id);
          const { data: profiles } = await supabase
            .from('profiles')
            .select('id, username, avatar')
            .in('id', subscriberIds);
            
          const profileMap = new Map();
          if (profiles) {
            profiles.forEach(profile => {
              profileMap.set(profile.id, profile);
            });
          }
          
          const notificationItems: Notification[] = subscriptions.map(sub => {
            const profile = profileMap.get(sub.subscriber_id);
            return {
              id: sub.id,
              type: 'subscriber',
              content: `${profile?.username || 'Someone'} subscribed to your channel`,
              createdAt: sub.created_at,
              read: false,
              link: `/profile/${sub.subscriber_id}`,
              userId: sub.subscriber_id,
              username: profile?.username,
              avatar: profile?.avatar
            };
          });
          
          setNotifications(notificationItems);
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadNotifications();
    
    // Set up real-time listeners for new subscriptions
    const channel = supabase
      .channel('public:subscriptions')
      .on('postgres_changes', {
        event: 'INSERT', 
        schema: 'public',
        table: 'subscriptions',
        filter: `channel_id=eq.${user.id}`
      }, async (payload) => {
        console.log('New subscription notification:', payload);
        
        // Get profile for the new subscriber
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, username, avatar')
          .eq('id', payload.new.subscriber_id)
          .single();
          
        const newNotification: Notification = {
          id: payload.new.id,
          type: 'subscriber',
          content: `${profile?.username || 'Someone'} subscribed to your channel`,
          createdAt: payload.new.created_at,
          read: false,
          link: `/profile/${payload.new.subscriber_id}`,
          userId: payload.new.subscriber_id,
          username: profile?.username,
          avatar: profile?.avatar
        };
        
        setNotifications(prev => [newNotification, ...prev]);
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const markAllAsRead = async () => {
    // In a real implementation, you would update a notifications table
    setNotifications(prev => prev.map(notification => ({ ...notification, read: true })));
  };

  return (
    <Card className="absolute right-2 top-16 w-80 md:w-96 shadow-lg z-50">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-md flex items-center">
          <Bell className="mr-2 h-4 w-4" />
          Notifications
        </CardTitle>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="max-h-[400px] overflow-y-auto">
        {loading ? (
          <div className="flex justify-center py-4">
            <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          </div>
        ) : notifications.length > 0 ? (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <Link 
                key={notification.id} 
                to={notification.link}
                className="block"
                onClick={() => {
                  // In a real implementation, you would mark this notification as read
                  onClose();
                }}
              >
                <div className={`p-3 rounded-md text-sm flex items-start gap-2 hover:bg-accent transition-colors ${notification.read ? 'opacity-60' : ''}`}>
                  {notification.avatar ? (
                    <img 
                      src={notification.avatar} 
                      alt={notification.username || 'User'} 
                      className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <Bell className="h-4 w-4 text-primary" />
                    </div>
                  )}
                  <div className="flex-1">
                    <p>{notification.content}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-6">
            No notifications yet
          </div>
        )}
      </CardContent>
      {notifications.length > 0 && (
        <CardFooter className="border-t pt-3 flex justify-between">
          <Button variant="ghost" size="sm" onClick={markAllAsRead}>
            Mark all as read
          </Button>
          <Button variant="link" size="sm" asChild>
            <Link to="/settings">Notification settings</Link>
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
