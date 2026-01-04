import { useState, useRef } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useUserProfile } from "@/hooks/useUserProfile";
import { usePostCreation } from "@/hooks/usePostCreation";
import MediaUploader from "@/components/MediaUploader";
import MediaPreview from "@/components/MediaPreview";
import PostForm from "@/components/PostForm";

interface ContentUploaderProps {
  onPostCreated: () => void;
  onDeletePost?: (postId: string) => Promise<void>; // Optional: for future extensibility
}

export default function ContentUploader({ onPostCreated }: ContentUploaderProps) {
  const { user } = useAuth();
  const { getUserDisplayInfo } = useUserProfile();
  const { createPost, uploading } = usePostCreation(onPostCreated);
  
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [videoPreview, setVideoPreview] = useState<string>("");
  
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (file: File) => {
    setImageFile(file);
    setVideoFile(null);
    setVideoPreview("");
    const url = URL.createObjectURL(file);
    setImagePreview(url);
  };

  const handleVideoSelect = (file: File) => {
    setVideoFile(file);
    setImageFile(null);
    setImagePreview("");
    const url = URL.createObjectURL(file);
    setVideoPreview(url);
  };

  const removeMedia = () => {
    setImageFile(null);
    setVideoFile(null);
    setImagePreview("");
    setVideoPreview("");
    if (imageInputRef.current) imageInputRef.current.value = "";
    if (videoInputRef.current) videoInputRef.current.value = "";
  };

  const handleSubmit = async () => {
    if (!content.trim() && !imageFile && !videoFile) return; // Prevent empty posts
    const success = await createPost(content, imageFile, videoFile);
    if (success) {
      setContent("");
      removeMedia();
    }
  };

  if (!user) return null;

  const displayInfo = getUserDisplayInfo();

  return (
    <Card className="mb-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
      <CardHeader className="pb-3 px-4 md:px-6">
        <div className="flex items-center space-x-3">
          <Avatar className="w-10 h-10 md:w-12 md:h-12 border-2 border-gray-200">
            <AvatarImage
              src={displayInfo.avatar}
              alt={displayInfo.name}
              onError={(e) => {
                console.log("Avatar failed to load, using fallback");
                const target = e.target as HTMLImageElement;
                // ✅ FIXED: Removed stray backtick!
                target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayInfo.name)}&background=random`;
              }}
            />
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold text-sm">
              {displayInfo.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="font-semibold text-gray-800">{displayInfo.name}</div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4 px-4 md:px-6 pb-5">
        <PostForm
          content={content}
          uploading={uploading}
          hasMedia={!!imageFile || !!videoFile}
          onContentChange={setContent}
          onSubmit={handleSubmit}
        />
        
        {(imagePreview || videoPreview) && (
          <MediaPreview
            imagePreview={imagePreview}
            videoPreview={videoPreview}
            onRemove={removeMedia}
          />
        )}
        
        <div className="flex flex-wrap items-center gap-3 pt-1">
          <MediaUploader
            imageFile={imageFile}
            videoFile={videoFile}
            uploading={uploading}
            onImageSelect={handleImageSelect}
            onVideoSelect={handleVideoSelect}
          />
          
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={uploading || (!content.trim() && !imageFile && !videoFile)}
            className="ml-auto px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            {uploading ? "Posting..." : "Post"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}