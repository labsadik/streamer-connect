
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export function usePostCreation(onPostCreated: () => void) {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);

  const createPost = async (
    content: string,
    imageFile: File | null,
    videoFile: File | null
  ) => {
    if (!user) {
      toast.error("Please sign in to create posts");
      return;
    }

    if (!content.trim() && !imageFile && !videoFile) {
      toast.error("Please add some content");
      return;
    }

    setUploading(true);
    try {
      console.log("Starting post creation...");
      let imageUrl = "";
      let videoUrl = "";

      // Upload image if present with proper file path
      if (imageFile) {
        console.log("Uploading image:", imageFile.name);
        const fileName = `${user.id}/posts/images/${Date.now()}-${imageFile.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        const { data, error } = await supabase.storage
          .from('videos')
          .upload(fileName, imageFile, {
            cacheControl: '3600',
            upsert: false
          });
        
        if (error) {
          console.error("Image upload error:", error);
          throw new Error(`Image upload failed: ${error.message}`);
        }
        
        const { data: { publicUrl } } = supabase.storage
          .from('videos')
          .getPublicUrl(data.path);
        imageUrl = publicUrl;
        console.log("Image uploaded successfully:", imageUrl);
      }

      // Upload video if present with proper file path
      if (videoFile) {
        console.log("Uploading video:", videoFile.name);
        const fileName = `${user.id}/posts/videos/${Date.now()}-${videoFile.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        const { data, error } = await supabase.storage
          .from('videos')
          .upload(fileName, videoFile, {
            cacheControl: '3600',
            upsert: false
          });
        
        if (error) {
          console.error("Video upload error:", error);
          throw new Error(`Video upload failed: ${error.message}`);
        }
        
        const { data: { publicUrl } } = supabase.storage
          .from('videos')
          .getPublicUrl(data.path);
        videoUrl = publicUrl;
        console.log("Video uploaded successfully:", videoUrl);
      }

      // Create post
      const postData = {
        user_id: user.id,
        content: content.trim(),
        image_url: imageUrl || null,
        video_url: videoUrl || null
      };

      console.log("Creating post with data:", postData);

      const { error: postError } = await supabase
        .from('posts')
        .insert(postData);

      if (postError) {
        console.error("Post creation error:", postError);
        throw new Error(`Post creation failed: ${postError.message}`);
      }

      toast.success("Post created successfully!");
      onPostCreated();
      console.log("Post created successfully");
      return true;
    } catch (error) {
      console.error('Error creating post:', error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to create post. Please try again.");
      }
      return false;
    } finally {
      setUploading(false);
    }
  };

  return { createPost, uploading };
}
