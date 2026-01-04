-- Create missing storage buckets and fix RLS policies

-- First, ensure the avatars bucket exists
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Create comprehensive storage policies for avatars bucket
CREATE POLICY "Avatar images are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own avatar" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own avatar" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create comprehensive storage policies for videos bucket
CREATE POLICY "Videos are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'videos');

CREATE POLICY "Users can upload their own videos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'videos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own videos" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'videos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own videos" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'videos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create profiles trigger for automatic profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, username, avatar, banner, about)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NULL),
    NULL,
    NULL
  );
  RETURN NEW;
END;
$$;

-- Create trigger for new user profiles
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Add missing database triggers for automatic count updates
CREATE TRIGGER update_post_likes_count_trigger
  AFTER INSERT OR DELETE ON public.post_likes
  FOR EACH ROW EXECUTE FUNCTION public.update_post_likes_count();

CREATE TRIGGER update_post_comments_count_trigger
  AFTER INSERT OR DELETE ON public.post_comments
  FOR EACH ROW EXECUTE FUNCTION public.update_post_comments_count();

CREATE TRIGGER update_subscriber_count_trigger
  AFTER INSERT OR DELETE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_subscriber_count();

CREATE TRIGGER update_video_count_trigger
  AFTER INSERT OR DELETE ON public.videos
  FOR EACH ROW EXECUTE FUNCTION public.update_video_count();

-- Enable realtime for all tables
ALTER TABLE public.posts REPLICA IDENTITY FULL;
ALTER TABLE public.post_likes REPLICA IDENTITY FULL;
ALTER TABLE public.post_comments REPLICA IDENTITY FULL;
ALTER TABLE public.videos REPLICA IDENTITY FULL;
ALTER TABLE public.video_likes REPLICA IDENTITY FULL;
ALTER TABLE public.comments REPLICA IDENTITY FULL;
ALTER TABLE public.profiles REPLICA IDENTITY FULL;
ALTER TABLE public.subscriptions REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.posts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.post_likes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.post_comments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.videos;
ALTER PUBLICATION supabase_realtime ADD TABLE public.video_likes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.comments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.subscriptions;