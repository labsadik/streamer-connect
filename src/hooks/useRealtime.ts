
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

export function useRealtime() {
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  useEffect(() => {
    const realtimeChannel = supabase.channel('video-updates');
    setChannel(realtimeChannel);

    realtimeChannel.subscribe();

    return () => {
      realtimeChannel.unsubscribe();
      supabase.removeChannel(realtimeChannel);
    };
  }, []);

  return channel;
}

export function useVideoLikes(videoId: string) {
  const [likesCount, setLikesCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!videoId) return;

    const fetchLikes = async () => {
      try {
        setIsLoading(true);
        
        // Get total likes count
        const { data: likesData, error: likesError } = await supabase
          .from('video_likes')
          .select('*')
          .eq('video_id', videoId);
        
        if (likesError) throw likesError;
        
        setLikesCount(likesData?.length || 0);
        
        // Check if current user liked
        const { data: { user } } = await supabase.auth.getUser();
        if (user && likesData) {
          const userLike = likesData.find(like => like.user_id === user.id);
          setIsLiked(!!userLike);
        } else {
          setIsLiked(false);
        }
      } catch (error) {
        console.error('Error fetching video likes:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLikes();

    // Real-time subscription
    const channel = supabase
      .channel(`video-likes-${videoId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'video_likes',
          filter: `video_id=eq.${videoId}`
        },
        async (payload) => {
          console.log('Video likes changed:', payload);
          
          if (payload.eventType === 'INSERT') {
            setLikesCount(prev => prev + 1);
            
            // Check if it's current user's like
            const { data: { user } } = await supabase.auth.getUser();
            if (user && payload.new.user_id === user.id) {
              setIsLiked(true);
            }
          } else if (payload.eventType === 'DELETE') {
            setLikesCount(prev => Math.max(0, prev - 1));
            
            // Check if it's current user's unlike
            const { data: { user } } = await supabase.auth.getUser();
            if (user && payload.old?.user_id === user.id) {
              setIsLiked(false);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [videoId]);

  return { likesCount, isLiked, setIsLiked, isLoading };
}

export function useSubscription(channelId: string) {
  const [subscriberCount, setSubscriberCount] = useState(0);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!channelId) return;

    const fetchSubscription = async () => {
      try {
        setIsLoading(true);
        
        // Get total subscriber count
        const { data: subsData, error: subsError } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('channel_id', channelId);
        
        if (subsError) throw subsError;
        
        setSubscriberCount(subsData?.length || 0);
        
        // Check if current user is subscribed
        const { data: { user } } = await supabase.auth.getUser();
        if (user && subsData) {
          const userSub = subsData.find(sub => sub.subscriber_id === user.id);
          setIsSubscribed(!!userSub);
        } else {
          setIsSubscribed(false);
        }
      } catch (error) {
        console.error('Error fetching subscriptions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubscription();

    // Real-time subscription
    const channel = supabase
      .channel(`subscriptions-${channelId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'subscriptions',
          filter: `channel_id=eq.${channelId}`
        },
        async (payload) => {
          console.log('Subscriptions changed:', payload);
          
          if (payload.eventType === 'INSERT') {
            setSubscriberCount(prev => prev + 1);
            
            // Check if it's current user's subscription
            const { data: { user } } = await supabase.auth.getUser();
            if (user && payload.new.subscriber_id === user.id) {
              setIsSubscribed(true);
            }
          } else if (payload.eventType === 'DELETE') {
            setSubscriberCount(prev => Math.max(0, prev - 1));
            
            // Check if it's current user's unsubscription
            const { data: { user } } = await supabase.auth.getUser();
            if (user && payload.old?.subscriber_id === user.id) {
              setIsSubscribed(false);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [channelId]);

  return { subscriberCount, isSubscribed, setIsSubscribed, isLoading };
}

// Hook for real-time video stats
export function useVideoStats(videoId: string) {
  const [stats, setStats] = useState({
    views: 0,
    likes: 0,
    comments: 0,
    shares: 0
  });

  useEffect(() => {
    if (!videoId) return;

    const fetchStats = async () => {
      try {
        // Fetch video stats
        const { data: videoData } = await supabase
          .from('videos')
          .select('views, likes, dislikes')
          .eq('id', videoId)
          .single();

        // Count likes
        const { data: likesData } = await supabase
          .from('video_likes')
          .select('id')
          .eq('video_id', videoId);

        // Count comments
        const { data: commentsData } = await supabase
          .from('comments')
          .select('id')
          .eq('video_id', videoId);

        setStats({
          views: videoData?.views || 0,
          likes: likesData?.length || 0,
          comments: commentsData?.length || 0,
          shares: 0 // We'll add shares tracking later
        });
      } catch (error) {
        console.error('Error fetching video stats:', error);
      }
    };

    fetchStats();

    // Set up real-time subscriptions for all relevant tables
    const channels = [
      supabase
        .channel(`video-stats-${videoId}`)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'video_likes',
          filter: `video_id=eq.${videoId}`
        }, fetchStats)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'comments',
          filter: `video_id=eq.${videoId}`
        }, fetchStats)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'videos',
          filter: `id=eq.${videoId}`
        }, fetchStats)
        .subscribe()
    ];

    return () => {
      channels.forEach(channel => supabase.removeChannel(channel));
    };
  }, [videoId]);

  return stats;
}
