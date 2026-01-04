
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ThumbsUp, Reply, MoreVertical } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { formatTimeAgo } from '@/lib/utils';

interface Comment {
  id: string;
  content: string;
  user_id: string;
  video_id: string;
  parent_id?: string;
  created_at: string;
  user?: {
    id: string;
    username: string;
    avatar: string;
  };
  replies?: Comment[];
}

interface VideoCommentsProps {
  videoId: string;
}

export function VideoComments({ videoId }: VideoCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchComments();
    
    // Real-time subscription for comments
    const channel = supabase
      .channel('comments-channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'comments',
          filter: `video_id=eq.${videoId}`
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            fetchComments(); // Refetch to get user data
          } else if (payload.eventType === 'DELETE') {
            setComments(prev => prev.filter(comment => comment.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [videoId]);

  const fetchComments = async () => {
    try {
      const { data: commentsData } = await supabase
        .from('comments')
        .select('*')
        .eq('video_id', videoId)
        .order('created_at', { ascending: false });

      if (commentsData) {
        // Fetch user profiles for comments
        const userIds = [...new Set(commentsData.map(comment => comment.user_id))];
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, username, avatar')
          .in('id', userIds);

        const profileMap = new Map(profiles?.map(profile => [profile.id, profile]) || []);

        // Group comments by parent
        const topLevelComments = commentsData
          .filter(comment => !comment.parent_id)
          .map(comment => ({
            ...comment,
            user: profileMap.get(comment.user_id),
            replies: commentsData
              .filter(reply => reply.parent_id === comment.id)
              .map(reply => ({
                ...reply,
                user: profileMap.get(reply.user_id)
              }))
          }));

        setComments(topLevelComments);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const handleSubmitComment = async () => {
    if (!user || !newComment.trim()) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('comments')
        .insert({
          video_id: videoId,
          user_id: user.id,
          content: newComment.trim()
        });

      if (error) throw error;

      setNewComment('');
      toast.success('Comment added!');
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitReply = async (parentId: string) => {
    if (!user || !replyContent.trim()) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('comments')
        .insert({
          video_id: videoId,
          user_id: user.id,
          content: replyContent.trim(),
          parent_id: parentId
        });

      if (error) throw error;

      setReplyContent('');
      setReplyingTo(null);
      toast.success('Reply added!');
    } catch (error) {
      console.error('Error adding reply:', error);
      toast.error('Failed to add reply');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">{comments.length} Comments</h3>
      
      {/* Add comment form */}
      {user ? (
        <div className="flex gap-3">
          <Avatar className="w-10 h-10 flex-shrink-0">
            <AvatarImage src={user.user_metadata?.avatar_url} />
            <AvatarFallback>{user.email?.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-3">
            <Textarea
              placeholder="Add a public comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="min-h-[60px] resize-none border-b border-gray-300 border-x-0 border-t-0 rounded-none focus:border-blue-500 bg-transparent"
            />
            <div className="flex justify-end gap-2">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setNewComment('')}
              >
                Cancel
              </Button>
              <Button 
                size="sm"
                onClick={handleSubmitComment}
                disabled={!newComment.trim() || isLoading}
              >
                Comment
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-4 text-muted-foreground">
          Please sign in to add comments
        </div>
      )}

      {/* Comments list */}
      <div className="space-y-6">
        {comments.map((comment) => (
          <div key={comment.id} className="space-y-3">
            {/* Main comment */}
            <div className="flex gap-3">
              <Avatar className="w-10 h-10 flex-shrink-0">
                <AvatarImage src={comment.user?.avatar} />
                <AvatarFallback>{comment.user?.username?.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{comment.user?.username || 'Anonymous'}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatTimeAgo(new Date(comment.created_at))}
                  </span>
                </div>
                <p className="text-sm leading-relaxed">{comment.content}</p>
                <div className="flex items-center gap-4">
                  <Button variant="ghost" size="sm" className="h-8 px-2">
                    <ThumbsUp size={14} className="mr-1" />
                    <span className="text-xs">0</span>
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 px-2 text-xs"
                    onClick={() => setReplyingTo(comment.id)}
                  >
                    <Reply size={14} className="mr-1" />
                    Reply
                  </Button>
                </div>

                {/* Reply form */}
                {replyingTo === comment.id && user && (
                  <div className="flex gap-3 mt-3">
                    <Avatar className="w-8 h-8 flex-shrink-0">
                      <AvatarImage src={user.user_metadata?.avatar_url} />
                      <AvatarFallback>{user.email?.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-2">
                      <Textarea
                        placeholder="Add a reply..."
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        className="min-h-[50px] resize-none text-sm"
                      />
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            setReplyingTo(null);
                            setReplyContent('');
                          }}
                        >
                          Cancel
                        </Button>
                        <Button 
                          size="sm"
                          onClick={() => handleSubmitReply(comment.id)}
                          disabled={!replyContent.trim() || isLoading}
                        >
                          Reply
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Replies */}
                {comment.replies && comment.replies.length > 0 && (
                  <div className="ml-8 space-y-3 mt-4">
                    {comment.replies.map((reply) => (
                      <div key={reply.id} className="flex gap-3">
                        <Avatar className="w-8 h-8 flex-shrink-0">
                          <AvatarImage src={reply.user?.avatar} />
                          <AvatarFallback>{reply.user?.username?.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">{reply.user?.username || 'Anonymous'}</span>
                            <span className="text-xs text-muted-foreground">
                              {formatTimeAgo(new Date(reply.created_at))}
                            </span>
                          </div>
                          <p className="text-sm leading-relaxed">{reply.content}</p>
                          <div className="flex items-center gap-4">
                            <Button variant="ghost" size="sm" className="h-8 px-2">
                              <ThumbsUp size={12} className="mr-1" />
                              <span className="text-xs">0</span>
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default VideoComments;
