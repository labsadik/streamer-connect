
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Image, Video } from "lucide-react";
import { toast } from "sonner";

interface MediaUploaderProps {
  imageFile: File | null;
  videoFile: File | null;
  uploading: boolean;
  onImageSelect: (file: File) => void;
  onVideoSelect: (file: File) => void;
}

export default function MediaUploader({
  imageFile,
  videoFile,
  uploading,
  onImageSelect,
  onVideoSelect
}: MediaUploaderProps) {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error("Please select a valid image file");
      return;
    }

    console.log("Image selected:", file.name, "Size:", file.size);
    onImageSelect(file);
  };

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      toast.error("Please select a valid video file");
      return;
    }

    console.log("Video selected:", file.name, "Size:", file.size);
    onVideoSelect(file);
  };

  return (
    <div className="flex space-x-2 w-full sm:w-auto">
      <Button
        variant="outline"
        size="sm"
        onClick={() => imageInputRef.current?.click()}
        disabled={uploading || !!videoFile}
        className="flex-1 sm:flex-none text-xs md:text-sm"
      >
        <Image size={14} className="mr-1 md:mr-2 md:w-4 md:h-4" />
        <span className="hidden sm:inline">Photo (Any Size)</span>
        <span className="sm:hidden">Photo</span>
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={() => videoInputRef.current?.click()}
        disabled={uploading || !!imageFile}
        className="flex-1 sm:flex-none text-xs md:text-sm"
      >
        <Video size={14} className="mr-1 md:mr-2 md:w-4 md:h-4" />
        <span className="hidden sm:inline">Video (Any Size)</span>
        <span className="sm:hidden">Video</span>
      </Button>

      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageSelect}
        className="hidden"
      />
      
      <input
        ref={videoInputRef}
        type="file"
        accept="video/*"
        onChange={handleVideoSelect}
        className="hidden"
      />
    </div>
  );
}
