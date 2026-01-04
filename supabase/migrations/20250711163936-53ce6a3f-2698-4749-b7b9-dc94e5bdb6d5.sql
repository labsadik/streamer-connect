-- Add missing triggers and realtime functionality

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

-- Add missing triggers (check if they exist first)
DROP TRIGGER IF EXISTS update_post_likes_count_trigger ON public.post_likes;
CREATE TRIGGER update_post_likes_count_trigger
  AFTER INSERT OR DELETE ON public.post_likes
  FOR EACH ROW EXECUTE FUNCTION public.update_post_likes_count();

DROP TRIGGER IF EXISTS update_post_comments_count_trigger ON public.post_comments;
CREATE TRIGGER update_post_comments_count_trigger
  AFTER INSERT OR DELETE ON public.post_comments
  FOR EACH ROW EXECUTE FUNCTION public.update_post_comments_count();

DROP TRIGGER IF EXISTS update_subscriber_count_trigger ON public.subscriptions;
CREATE TRIGGER update_subscriber_count_trigger
  AFTER INSERT OR DELETE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_subscriber_count();

DROP TRIGGER IF EXISTS update_video_count_trigger ON public.videos;
CREATE TRIGGER update_video_count_trigger
  AFTER INSERT OR DELETE ON public.videos
  FOR EACH ROW EXECUTE FUNCTION public.update_video_count();