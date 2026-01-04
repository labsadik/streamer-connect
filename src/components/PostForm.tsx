
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";

interface PostFormProps {
  content: string;
  uploading: boolean;
  hasMedia: boolean;
  onContentChange: (content: string) => void;
  onSubmit: () => void;
}

export default function PostForm({
  content,
  uploading,
  hasMedia,
  onContentChange,
  onSubmit
}: PostFormProps) {
  return (
    <>
      <Textarea
        placeholder="What's on your mind? Share unlimited content..."
        className="resize-none min-h-[60px] md:min-h-[80px] text-sm md:text-base"
        value={content}
        onChange={(e) => onContentChange(e.target.value)}
      />
      
      <Button 
        onClick={onSubmit} 
        disabled={uploading || (!content.trim() && !hasMedia)}
        size="sm"
        className="w-full sm:w-auto text-xs md:text-sm"
      >
        {uploading ? (
          <div className="w-3 h-3 md:w-4 md:h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-1 md:mr-2" />
        ) : (
          <Send size={14} className="mr-1 md:mr-2 md:w-4 md:h-4" />
        )}
        {uploading ? "Posting..." : "Post"}
      </Button>
    </>
  );
}
