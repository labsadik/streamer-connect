import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { 
  Upload, 
  Video, 
  X, 
  Play, 
  Image as ImageIcon,
  Film,
  FileText,
  Tag,
  Camera,
  User
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function VideoUploader() {
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string>("");
  const [thumbnailOptions, setThumbnailOptions] = useState<string[]>([]);
  const [selectedThumbnail, setSelectedThumbnail] = useState<string>("");
  const [customThumbnail, setCustomThumbnail] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [category, setCategory] = useState("general");
  const [isShort, setIsShort] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);

  const categories = [
    "general", "entertainment", "education", "gaming", "music", 
    "sports", "technology", "lifestyle", "travel", "comedy"
  ];

  // Fetch user profile and ensure it exists
  useEffect(() => {
    const fetchOrCreateUserProfile = async () => {
      if (!user) return;
      
      try {
        console.log("Fetching profile for user:", user.id);
        
        // Try to fetch existing profile
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();
        
        if (error) {
          console.error('Error fetching user profile:', error);
          return;
        }
        
        if (profile) {
          console.log("Profile found:", profile);
          setUserProfile(profile);
        } else {
          console.log("No profile found, creating one...");
          // Create profile if it doesn't exist
          const newProfile = {
            id: user.id,
            username: user.user_metadata?.name || user.email?.split('@')[0] || `user_${user.id.slice(0, 8)}`,
            subscriber_count: 0,
            video_count: 0,
            verified: false,
            role: 'user'
          };
          
          const { data: createdProfile, error: createError } = await supabase
            .from('profiles')
            .insert(newProfile)
            .select()
            .single();
          
          if (createError) {
            console.error('Error creating profile:', createError);
          } else {
            console.log("Profile created:", createdProfile);
            setUserProfile(createdProfile);
          }
        }
      } catch (error) {
        console.error('Error in fetchOrCreateUserProfile:', error);
      }
    };
    
    fetchOrCreateUserProfile();
  }, [user]);

  // Helper function to get user display info
  const getUserDisplayInfo = () => {
    if (userProfile) {
      return {
        name: userProfile.username || user?.user_metadata?.name || user?.email || "User",
        avatar: userProfile.avatar || user?.user_metadata?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(userProfile.username || user?.email || "User")}&background=random`
      };
    }
    
    const fallbackName = user?.user_metadata?.name || user?.email || "User";
    return {
      name: fallbackName,
      avatar: user?.user_metadata?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(fallbackName)}&background=random`
    };
  };

  const handleVideoSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      toast.error("Please select a valid video file");
      return;
    }

    console.log("Video file selected:", file.name, "Size:", file.size);
    setVideoFile(file);
    const url = URL.createObjectURL(file);
    setVideoPreview(url);
    
    // Check if it's a short video (under 60 seconds and vertical aspect ratio)
    const video = document.createElement('video');
    video.src = url;
    video.onloadedmetadata = () => {
      const isVertical = video.videoHeight > video.videoWidth;
      const isUnder60s = video.duration <= 60;
      setIsShort(isVertical && isUnder60s);
      
      // Generate thumbnail options
      generateThumbnails(video);
    };
  }, []);

  const generateThumbnails = useCallback((video: HTMLVideoElement) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 320;
    canvas.height = 180;
    
    const thumbnails: string[] = [];
    const duration = video.duration;
    const timestamps = [0.1, 0.3, 0.5, 0.7, 0.9];

    let captured = 0;
    
    const captureFrame = (timestamp: number) => {
      video.currentTime = duration * timestamp;
      video.onseeked = () => {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 1.0);
        thumbnails.push(dataUrl);
        captured++;
        
        if (captured < timestamps.length) {
          captureFrame(timestamps[captured]);
        } else {
          setThumbnailOptions(thumbnails);
          setSelectedThumbnail(thumbnails[2]);
        }
      };
    };

    if (timestamps.length > 0) {
      captureFrame(timestamps[0]);
    }
  }, []);

  const handleCustomThumbnailSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error("Please select a valid image file");
      return;
    }

    setCustomThumbnail(file);
    const url = URL.createObjectURL(file);
    setSelectedThumbnail(url);
  };

  const uploadVideo = async () => {
    if (!user) {
      toast.error("You must be logged in to upload videos");
      return;
    }

    if (!videoFile || !title.trim()) {
      toast.error("Please provide a video file and title");
      return;
    }

    if (!selectedThumbnail) {
      toast.error("Please select a thumbnail");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      console.log("Starting video upload...");
      
      // Create a proper file path with user ID to fix the invalid key error
      setUploadProgress(10);
      const videoFileName = `${user.id}/videos/${Date.now()}-${videoFile.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      
      console.log("Uploading video file:", videoFileName);
      const { data: videoData, error: videoError } = await supabase.storage
        .from('videos')
        .upload(videoFileName, videoFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (videoError) {
        console.error("Video upload error:", videoError);
        throw new Error(`Video upload failed: ${videoError.message}`);
      }

      console.log("Video uploaded successfully:", videoData);
      setUploadProgress(40);

      // Upload thumbnail
      let thumbnailUrl = "";
      if (customThumbnail) {
        const thumbnailFileName = `${user.id}/thumbnails/${Date.now()}-${customThumbnail.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        console.log("Uploading custom thumbnail:", thumbnailFileName);
        
        const { data: thumbnailData, error: thumbnailError } = await supabase.storage
          .from('videos')
          .upload(thumbnailFileName, customThumbnail, {
            cacheControl: '3600',
            upsert: false
          });
          
        if (thumbnailError) {
          console.error("Thumbnail upload error:", thumbnailError);
          throw new Error(`Thumbnail upload failed: ${thumbnailError.message}`);
        }
        
        const { data: { publicUrl } } = supabase.storage
          .from('videos')
          .getPublicUrl(thumbnailData.path);
        thumbnailUrl = publicUrl;
      } else {
        // Convert data URL to blob and upload
        console.log("Converting and uploading generated thumbnail");
        const response = await fetch(selectedThumbnail);
        const blob = await response.blob();
        const thumbnailFileName = `${user.id}/thumbnails/${Date.now()}-thumbnail.jpg`;
        
        const { data: thumbnailData, error: thumbnailError } = await supabase.storage
          .from('videos')
          .upload(thumbnailFileName, blob, {
            cacheControl: '3600',
            upsert: false
          });
          
        if (thumbnailError) {
          console.error("Generated thumbnail upload error:", thumbnailError);
          throw new Error(`Thumbnail upload failed: ${thumbnailError.message}`);
        }
        
        const { data: { publicUrl } } = supabase.storage
          .from('videos')
          .getPublicUrl(thumbnailData.path);
        thumbnailUrl = publicUrl;
      }

      console.log("Thumbnail uploaded successfully");
      setUploadProgress(70);

      // Get video URL
      const { data: { publicUrl } } = supabase.storage
        .from('videos')
        .getPublicUrl(videoData.path);

      console.log("Generated video URL:", publicUrl);
      console.log("Generated thumbnail URL:", thumbnailUrl);

      // Save video metadata to database
      const videoMetadata = {
        title: title.trim(),
        description: description.trim() || null,
        video_url: publicUrl,
        thumbnail: thumbnailUrl,
        user_id: user.id,
        tags: tags.split(',').map(tag => tag.trim()).filter(Boolean),
        category,
        is_short: isShort,
        quality_levels: ["360p", "720p", "1080p", "1440p", "2160p"],
        default_quality: "1080p"
      };

      console.log("Saving video metadata:", videoMetadata);

      const { error: dbError } = await supabase
        .from('videos')
        .insert(videoMetadata);

      if (dbError) {
        console.error("Database error:", dbError);
        throw new Error(`Database error: ${dbError.message}`);
      }

      setUploadProgress(100);
      toast.success("Video uploaded successfully!");
      
      // Reset form
      setVideoFile(null);
      setVideoPreview("");
      setThumbnailOptions([]);
      setSelectedThumbnail("");
      setCustomThumbnail(null);
      setTitle("");
      setDescription("");
      setTags("");
      setCategory("general");
      setIsShort(false);
      
      if (fileInputRef.current) fileInputRef.current.value = "";
      if (thumbnailInputRef.current) thumbnailInputRef.current.value = "";

      console.log("Video upload completed successfully");

    } catch (error) {
      console.error("Upload error details:", error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to upload video. Please check your connection and try again.");
      }
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  if (!user) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="text-center py-12">
          <User className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold mb-2">Sign In Required</h3>
          <p className="text-gray-600">Please sign in to upload videos.</p>
        </CardContent>
      </Card>
    );
  }

  const displayInfo = getUserDisplayInfo();

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-3 mb-2">
          <Avatar className="w-10 h-10 border-2 border-gray-200">
            <AvatarImage 
              src={displayInfo.avatar} 
              alt={displayInfo.name}
              onError={(e) => {
                console.log("Avatar failed to load, using fallback");
                const target = e.target as HTMLImageElement;
                target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayInfo.name)}&background=random`;
              }}
            />
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
              {displayInfo.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold text-lg">{displayInfo.name}</h3>
            <p className="text-sm text-gray-600">Upload new content</p>
          </div>
        </div>
        <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
          <Video className="h-5 w-5 md:h-6 md:w-6" />
          Upload Video - No Size Limitations
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 md:space-y-6 p-4 md:p-6">
        {/* Video Upload Section */}
        <div className="space-y-3 md:space-y-4">
          <Label htmlFor="video-upload" className="text-sm md:text-base font-medium">
            Select Video File (Any Size Supported)
          </Label>
          <div
            className={cn(
              "border-2 border-dashed rounded-lg p-4 md:p-8 text-center transition-colors",
              videoFile ? "border-green-300 bg-green-50 dark:bg-green-950" : "border-gray-300 hover:border-gray-400"
            )}
          >
            {videoFile ? (
              <div className="space-y-3 md:space-y-4">
                <div className="flex flex-col md:flex-row items-center justify-center gap-2 text-green-600">
                  <Video className="h-5 w-5 md:h-6 md:w-6" />
                  <span className="font-medium text-sm md:text-base truncate">{videoFile.name}</span>
                  <span className="text-xs md:text-sm text-gray-500">
                    ({(videoFile.size / (1024 * 1024)).toFixed(2)} MB)
                  </span>
                  {isShort && <Badge variant="secondary" className="text-xs">Short</Badge>}
                </div>
                {videoPreview && (
                  <video
                    ref={videoRef}
                    src={videoPreview}
                    className="max-w-full max-h-48 md:max-h-64 mx-auto rounded-lg"
                    controls
                    muted
                  />
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setVideoFile(null);
                    setVideoPreview("");
                    setThumbnailOptions([]);
                    setSelectedThumbnail("");
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                >
                  <X className="h-4 w-4 mr-2" />
                  Remove Video
                </Button>
              </div>
            ) : (
              <div className="space-y-3 md:space-y-4">
                <Upload className="h-8 w-8 md:h-12 md:w-12 mx-auto text-gray-400" />
                <div>
                  <p className="text-sm md:text-lg font-medium text-gray-700 dark:text-gray-300">
                    Drop your video here or click to browse
                  </p>
                  <p className="text-xs md:text-sm text-gray-500 mt-1">
                    Supports all video formats - No file size limit
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Film className="h-4 w-4 mr-2" />
                  Choose Video
                </Button>
              </div>
            )}
          </div>
          <input
            ref={fileInputRef}
            id="video-upload"
            type="file"
            accept="video/*"
            onChange={handleVideoSelect}
            className="hidden"
          />
        </div>

        {/* Thumbnail Selection */}
        {thumbnailOptions.length > 0 && (
          <div className="space-y-3 md:space-y-4">
            <Label className="text-sm md:text-base font-medium flex items-center gap-2">
              <Camera className="h-4 w-4 md:h-5 md:w-5" />
              Choose Thumbnail (High Quality)
            </Label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 md:gap-4">
              {thumbnailOptions.map((thumbnail, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedThumbnail(thumbnail)}
                  className={cn(
                    "relative aspect-video rounded-lg overflow-hidden border-2 transition-all hover:scale-105",
                    selectedThumbnail === thumbnail
                      ? "border-primary shadow-lg"
                      : "border-gray-200 hover:border-gray-300"
                  )}
                >
                  <img
                    src={thumbnail}
                    alt={`Thumbnail option ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {selectedThumbnail === thumbnail && (
                    <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                      <div className="w-4 h-4 md:w-6 md:h-6 bg-primary rounded-full flex items-center justify-center">
                        <Play className="w-2 h-2 md:w-3 md:h-3 text-white fill-white" />
                      </div>
                    </div>
                  )}
                </button>
              ))}
              <button
                onClick={() => thumbnailInputRef.current?.click()}
                className="aspect-video rounded-lg border-2 border-dashed border-gray-300 hover:border-gray-400 flex flex-col items-center justify-center gap-1 md:gap-2 transition-colors"
              >
                <ImageIcon className="h-4 w-4 md:h-6 md:w-6 text-gray-400" />
                <span className="text-xs text-gray-500">Custom</span>
              </button>
            </div>
            <input
              ref={thumbnailInputRef}
              type="file"
              accept="image/*"
              onChange={handleCustomThumbnailSelect}
              className="hidden"
            />
          </div>
        )}

        {/* Video Details */}
        <div className="grid gap-4 md:gap-6 lg:grid-cols-2">
          <div className="space-y-3 md:space-y-4">
            <div>
              <Label htmlFor="title" className="flex items-center gap-2 text-sm md:text-base">
                <FileText className="h-4 w-4" />
                Title *
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter video title..."
                className="mt-1"
                required
              />
            </div>

            <div>
              <Label htmlFor="tags" className="flex items-center gap-2 text-sm md:text-base">
                <Tag className="h-4 w-4" />
                Tags
              </Label>
              <Input
                id="tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="gaming, tutorial, funny (comma separated)"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="category" className="text-sm md:text-base">Category</Label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full mt-1 px-3 py-2 text-sm md:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <Label htmlFor="description" className="text-sm md:text-base">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your video..."
              className="mt-1 min-h-[100px] md:min-h-[120px] text-sm md:text-base"
            />
          </div>
        </div>

        {/* Upload Progress */}
        {isUploading && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs md:text-sm">
              <span>Uploading high-quality video...</span>
              <span>{Math.round(uploadProgress)}%</span>
            </div>
            <Progress value={uploadProgress} className="w-full" />
          </div>
        )}

        {/* Upload Button */}
        <Button
          onClick={uploadVideo}
          disabled={!videoFile || !title.trim() || !selectedThumbnail || isUploading}
          className="w-full"
          size="lg"
        >
          {isUploading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 md:h-5 md:w-5 mr-2" />
              Upload Video (No Limitations)
            </>
          )}
        </Button>

        {/* Hidden canvas for thumbnail generation */}
        <canvas ref={canvasRef} className="hidden" />
      </CardContent>
    </Card>
  );
}
