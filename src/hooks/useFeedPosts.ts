import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface FeedPost {
  id: string;
  content: string;
  image_url?: string;
  video_url?: string;
  created_at: string;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  user_id: string;
  user?: {
    id: string;
    username: string;
    avatar: string;
  };
  isLiked?: boolean;
}

export function useFeedPosts() {
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
    try {
      console.log("Fetching posts...");
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (postsError) {
        console.error('Posts fetch error:', postsError);
        throw postsError;
      }

      if (!postsData || postsData.length === 0) {
        setPosts([]);
        return;
      }

      const userIds = [...new Set(postsData.map(post => post.user_id))];
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, username, avatar')
        .in('id', userIds);

      const profilesMap = new Map();
      profilesData?.forEach(profile => {
        profilesMap.set(profile.id, profile);
      });

      const { data: { user } } = await supabase.auth.getUser();
      let userLikes: string[] = [];
      
      if (user) {
        const { data: likesData } = await supabase
          .from('post_likes')
          .select('post_id')
          .eq('user_id', user.id)
          .in('post_id', postsData.map(p => p.id));
        
        userLikes = likesData?.map(like => like.post_id) || [];
      }

      const formattedPosts: FeedPost[] = postsData.map(post => {
        const profile = profilesMap.get(post.user_id);
        const fallbackUsername = `user_${post.user_id.slice(0, 8)}`;
        const username = profile?.username || fallbackUsername;
        // ✅ FIX: remove trailing backtick and use valid background
        const avatar = profile?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=random`;

        return {
          ...post,
          user: {
            id: post.user_id,
            username: username,
            avatar: avatar
          },
          isLiked: userLikes.includes(post.id)
        };
      });

      setPosts(formattedPosts);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ NEW: deletePost function
  const deletePost = async (postId: string) => {
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', postId);

    if (error) {
      console.error('Error deleting post:', error);
      throw error;
    }

    // Optional: Optimistically update local state
    // setPosts(prev => prev.filter(p => p.id !== postId));
    // But since we have real-time subscription, we can just rely on refetch
  };

  useEffect(() => {
    fetchPosts();

    const postsChannel = supabase
      .channel('posts-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'posts'
      }, () => {
        fetchPosts();
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'post_likes'
      }, () => {
        fetchPosts();
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'post_comments'
      }, () => {
        fetchPosts();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(postsChannel);
    };
  }, []);

  return { posts, loading, refetch: fetchPosts, deletePost };
}