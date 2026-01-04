-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.comment_likes (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  comment_id uuid NOT NULL,
  user_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT comment_likes_pkey PRIMARY KEY (id),
  CONSTRAINT comment_likes_comment_id_fkey FOREIGN KEY (comment_id) REFERENCES public.comments(id),
  CONSTRAINT comment_likes_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.comments (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  video_id uuid NOT NULL,
  user_id uuid NOT NULL,
  content text NOT NULL CHECK (char_length(content) > 0 AND char_length(content) <= 1000),
  parent_id uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT comments_pkey PRIMARY KEY (id),
  CONSTRAINT comments_video_id_fkey FOREIGN KEY (video_id) REFERENCES public.videos(id),
  CONSTRAINT comments_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT comments_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.comments(id)
);
CREATE TABLE public.likes (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  post_id uuid NOT NULL,
  user_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT likes_pkey PRIMARY KEY (id),
  CONSTRAINT likes_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.posts(id),
  CONSTRAINT likes_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.notification_settings (
  id uuid NOT NULL,
  email_notifications boolean NOT NULL DEFAULT true,
  push_notifications boolean NOT NULL DEFAULT true,
  marketing_emails boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT notification_settings_pkey PRIMARY KEY (id),
  CONSTRAINT notification_settings_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);
CREATE TABLE public.posts (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  content text,
  image_url text,
  video_url text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT posts_pkey PRIMARY KEY (id),
  CONSTRAINT posts_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.privacy_settings (
  id uuid NOT NULL,
  profile_visibility text NOT NULL DEFAULT 'public'::text CHECK (profile_visibility = ANY (ARRAY['public'::text, 'private'::text, 'friends'::text])),
  show_subscriptions boolean NOT NULL DEFAULT true,
  show_saved_videos boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT privacy_settings_pkey PRIMARY KEY (id),
  CONSTRAINT privacy_settings_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);
CREATE TABLE public.profiles (
  id uuid NOT NULL,
  username text UNIQUE,
  full_name text,
  avatar text,
  subscriber_count integer DEFAULT 0,
  video_count integer DEFAULT 0,
  verified boolean DEFAULT false,
  role text DEFAULT 'user'::text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  about text,
  banner text,
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);
CREATE TABLE public.saved_videos (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  video_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT saved_videos_pkey PRIMARY KEY (id),
  CONSTRAINT saved_videos_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id),
  CONSTRAINT saved_videos_video_id_fkey FOREIGN KEY (video_id) REFERENCES public.videos(id)
);
CREATE TABLE public.subscriptions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  subscriber_id uuid NOT NULL,
  channel_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT subscriptions_pkey PRIMARY KEY (id),
  CONSTRAINT subscriptions_subscriber_id_fkey FOREIGN KEY (subscriber_id) REFERENCES public.profiles(id),
  CONSTRAINT subscriptions_channel_id_fkey FOREIGN KEY (channel_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.video_likes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  video_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT video_likes_pkey PRIMARY KEY (id),
  CONSTRAINT video_likes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id),
  CONSTRAINT video_likes_video_id_fkey FOREIGN KEY (video_id) REFERENCES public.videos(id)
);
CREATE TABLE public.videos (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  description text,
  video_url text NOT NULL,
  thumbnail text NOT NULL,
  duration integer DEFAULT 0,
  views bigint DEFAULT 0,
  is_live boolean DEFAULT false,
  is_short boolean DEFAULT false,
  enhanced_quality text,
  tags ARRAY DEFAULT '{}'::text[],
  category text DEFAULT 'general'::text,
  quality_levels ARRAY DEFAULT ARRAY['360p'::text, '720p'::text, '1080p'::text],
  default_quality text DEFAULT '1080p'::text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT videos_pkey PRIMARY KEY (id),
  CONSTRAINT videos_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);

-- Bucket
1. profiles - avatars , banners
2.videos -(uuid) videos, thumbnails, posts