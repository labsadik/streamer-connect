
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface MediaPreviewProps {
  imagePreview: string;
  videoPreview: string;
  onRemove: () => void;
}

export default function MediaPreview({
  imagePreview,
  videoPreview,
  onRemove
}: MediaPreviewProps) {
  if (!imagePreview && !videoPreview) return null;

  return (
    <>
      {imagePreview && (
        <div className="relative">
          <img src={imagePreview} alt="Preview" className="w-full max-h-64 md:max-h-96 object-cover rounded-lg" />
          <Button
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 w-6 h-6 md:w-8 md:h-8"
            onClick={onRemove}
          >
            <X size={12} className="md:w-4 md:h-4" />
          </Button>
        </div>
      )}
      
      {videoPreview && (
        <div className="relative">
          <video src={videoPreview} controls className="w-full max-h-64 md:max-h-96 rounded-lg" />
          <Button
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 w-6 h-6 md:w-8 md:h-8"
            onClick={onRemove}
          >
            <X size={12} className="md:w-4 md:h-4" />
          </Button>
        </div>
      )}
    </>
  );
}
