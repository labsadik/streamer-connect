import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useFeedPosts } from "@/hooks/useFeedPosts";
import ContentUploader from "@/components/ContentUploader";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MoreHorizontal, Trash2 } from "lucide-react";

export default function Feed() {
  const { user } = useAuth();
  const { posts, loading, deletePost: deletePostFromHook } = useFeedPosts();
  const [expandedPosts, setExpandedPosts] = useState<Set<string>>(new Set());
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const toggleExpanded = (postId: string) => {
    setExpandedPosts(prev => {
      const newSet = new Set(prev);
      newSet.has(postId) ? newSet.delete(postId) : newSet.add(postId);
      return newSet;
    });
  };

  const handleDeleteConfirmed = async () => {
    if (!confirmDeleteId) return;

    setDeletingPostId(confirmDeleteId);
    try {
      await deletePostFromHook(confirmDeleteId);
    } catch (error) {
      console.error("Failed to delete post:", error);
      // TODO: Add toast notification
    } finally {
      setDeletingPostId(null);
      setConfirmDeleteId(null);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const truncateText = (text: string, maxLength: number = 200) => {
    return text.length <= maxLength ? text : text.substring(0, maxLength) + "...";
  };

  return (
    <div className="min-h-screen pb-8">
      <Navbar />

      <main className="max-w-screen-md mx-auto px-4 sm:px-6 pt-20">
        <h1 className="text-2xl font-bold mb-6">Feed</h1>

        <ContentUploader onPostCreated={() => {}} />

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-300 rounded-full" />
                    <div className="space-y-2">
                      <div className="w-24 h-4 bg-gray-300 rounded" />
                      <div className="w-16 h-3 bg-gray-300 rounded" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="w-full h-4 bg-gray-300 rounded" />
                    <div className="w-3/4 h-4 bg-gray-300 rounded" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-5">
            {posts.map(post => {
              const isExpanded = expandedPosts.has(post.id);
              const shouldTruncate = post.content.length > 200;
              const isOwner = user?.id === post.user_id;

              return (
                <Card key={post.id} className="overflow-hidden animate-fade-in">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <Link
                        to={`/profile/${post.user_id}`}
                        className="flex items-center space-x-3 flex-1 min-w-0"
                      >
                        <Avatar>
                          <AvatarImage
                            src={post.user?.avatar}
                            alt={post.user?.username || "User"}
                          />
                          <AvatarFallback className="bg-muted">
                            {(post.user?.username || "U").charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <div className="font-medium truncate">
                            {post.user?.username || "Unknown User"}
                          </div>
                          <div className="text-xs text-muted-foreground whitespace-nowrap">
                            {formatTimeAgo(post.created_at)}
                          </div>
                        </div>
                      </Link>

                      {isOwner && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              disabled={deletingPostId === post.id}
                            >
                              {deletingPostId === post.id ? (
                                <div className="w-4 h-4 border-t-2 border-primary rounded-full animate-spin" />
                              ) : (
                                <MoreHorizontal size={16} />
                              )}
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => setConfirmDeleteId(post.id)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div>
                      <p className="whitespace-pre-line break-words">
                        {shouldTruncate && !isExpanded
                          ? truncateText(post.content)
                          : post.content}
                      </p>
                      {shouldTruncate && (
                        <Button
                          variant="link"
                          size="sm"
                          onClick={() => toggleExpanded(post.id)}
                          className="p-0 h-auto text-primary hover:underline"
                        >
                          {isExpanded ? "Show less" : "Show more"}
                        </Button>
                      )}
                    </div>

                    {post.image_url && (
                      <div className="rounded-md overflow-hidden">
                        <img
                          src={post.image_url}
                          alt="Post attachment"
                          className="w-full h-auto object-cover max-h-[384px]"
                          loading="lazy"
                        />
                      </div>
                    )}

                    {post.video_url && (
                      <div className="rounded-md overflow-hidden aspect-video">
                        <video
                          src={post.video_url}
                          controls
                          className="w-full h-full object-cover"
                          poster={post.image_url}
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}

            {posts.length === 0 && !loading && (
              <div className="text-center py-12">
                <div className="text-muted-foreground mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="48"
                    height="48"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    className="mx-auto opacity-50"
                  >
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                </div>
                <p className="text-lg text-muted-foreground">No posts yet</p>
                <p className="text-muted-foreground mt-1">
                  Be the first to share something!
                </p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!confirmDeleteId} onOpenChange={() => setConfirmDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Post</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this post? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmDeleteId(null)}
              disabled={deletingPostId !== null}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirmed}
              disabled={deletingPostId !== null}
            >
              {deletingPostId ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}