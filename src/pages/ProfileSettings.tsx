import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Camera, Upload, User, Bell, Shield } from "lucide-react";

export default function ProfileSettings() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  
  const [username, setUsername] = useState("");
  const [about, setAbout] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [bannerPreview, setBannerPreview] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [originalAvatar, setOriginalAvatar] = useState("");
  const [originalBanner, setOriginalBanner] = useState("");
  
  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);
  
  // Privacy settings
  const [showSubscriptions, setShowSubscriptions] = useState(true);
  const [showSavedVideos, setShowSavedVideos] = useState(false);
  
  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/auth");
      return;
    }
    
    const fetchProfile = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (error) {
          console.error("Error fetching profile:", error);
          toast.error("Failed to load profile");
          return;
        }
        
        if (data) {
          setUsername(data.username || "");
          setAbout(data.about || "");
          setAvatarPreview(data.avatar || "");
          setBannerPreview(data.banner || "");
          setOriginalAvatar(data.avatar || "");
          setOriginalBanner(data.banner || "");
        }
      } catch (error) {
        console.error("Error in fetchProfile:", error);
        toast.error("Failed to load profile");
      }
    };
    
    fetchProfile();
  }, [user, isLoading, navigate]);
  
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Avatar file size must be less than 5MB");
      return;
    }
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error("Please select an image file");
      return;
    }
    
    setAvatarFile(file);
    
    // Clean up previous object URL if exists
    if (avatarPreview && avatarPreview.startsWith('blob:')) {
      URL.revokeObjectURL(avatarPreview);
    }
    
    setAvatarPreview(URL.createObjectURL(file));
  };
  
  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file size (max 6MB)
    if (file.size > 6 * 1024 * 1024) {
      toast.error("Banner file size must be less than 6MB");
      return;
    }
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error("Please select an image file");
      return;
    }
    
    setBannerFile(file);
    
    // Clean up previous object URL if exists
    if (bannerPreview && bannerPreview.startsWith('blob:')) {
      URL.revokeObjectURL(bannerPreview);
    }
    
    setBannerPreview(URL.createObjectURL(file));
  };
  
  const uploadFile = async (file: File, type: 'avatar' | 'banner'): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop()?.toLowerCase();
      if (!fileExt) {
        toast.error("Invalid file extension");
        return null;
      }
      
      const fileName = `${user?.id}_${type}_${Date.now()}.${fileExt}`;
      const filePath = `${type}s/${fileName}`;
      
      console.log(`Uploading ${type}:`, { fileName, filePath });
      
      // First, try to upload
      const { data, error } = await supabase.storage
        .from('profiles')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });
      
      if (error) {
        console.error(`Error uploading ${type}:`, error);
        
        // If bucket doesn't exist
        if (error.message.includes('bucket not found')) {
          toast.error(`Storage bucket not found. Please create 'profiles' bucket in Supabase Dashboard.`);
          return null;
        }
        
        // Try with a different name
        const uniqueFileName = `${user?.id}_${type}_${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
        const uniqueFilePath = `${type}s/${uniqueFileName}`;
        
        const { data: retryData, error: retryError } = await supabase.storage
          .from('profiles')
          .upload(uniqueFilePath, file, {
            cacheControl: '3600',
            upsert: true
          });
        
        if (retryError) {
          console.error(`Retry failed for ${type}:`, retryError);
          toast.error(`Failed to upload ${type}: ${retryError.message}`);
          return null;
        }
        
        const { data: publicUrl } = supabase.storage
          .from('profiles')
          .getPublicUrl(uniqueFilePath);
        
        return publicUrl.publicUrl;
      }
      
      // Get public URL
      const { data: publicUrl } = supabase.storage
        .from('profiles')
        .getPublicUrl(filePath);
      
      console.log(`Upload successful: ${publicUrl.publicUrl}`);
      return publicUrl.publicUrl;
    } catch (error) {
      console.error(`Error in uploadFile for ${type}:`, error);
      toast.error(`Failed to upload ${type}. Please try again.`);
      return null;
    }
  };
  
  const handleSave = async () => {
    if (!user) {
      toast.error("You must be logged in to update your profile");
      return;
    }
    
    setIsSaving(true);
    
    try {
      let avatarUrl = originalAvatar;
      let bannerUrl = originalBanner;
      
      // Upload avatar if changed
      if (avatarFile) {
        toast.loading("Uploading avatar...", { id: "avatar-upload" });
        const uploadedUrl = await uploadFile(avatarFile, 'avatar');
        toast.dismiss("avatar-upload");
        
        if (uploadedUrl) {
          avatarUrl = uploadedUrl;
          toast.success("Avatar uploaded successfully!");
        } else {
          setIsSaving(false);
          return;
        }
      }
      
      // Upload banner if changed
      if (bannerFile) {
        toast.loading("Uploading banner...", { id: "banner-upload" });
        const uploadedUrl = await uploadFile(bannerFile, 'banner');
        toast.dismiss("banner-upload");
        
        if (uploadedUrl) {
          bannerUrl = uploadedUrl;
          toast.success("Banner uploaded successfully!");
        } else {
          setIsSaving(false);
          return;
        }
      }
      
      // Try to update profile using the RPC function first
      let updateSuccess = false;
      let updateError: any = null;
      
      try {
        const { data, error } = await supabase.rpc('update_profile_data', {
          p_username: username,
          p_about: about,
          p_avatar: avatarUrl,
          p_banner: bannerUrl
        });
        
        if (error) {
          updateError = error;
          console.error("RPC error:", error);
        } else {
          updateSuccess = true;
        }
      } catch (rpcError) {
        updateError = rpcError;
        console.error("RPC exception:", rpcError);
      }
      
      // If RPC failed, try direct update
      if (!updateSuccess) {
        console.log("RPC failed, trying direct update...");
        
        try {
          const { data: updateData, error: directUpdateError } = await supabase
            .from('profiles')
            .update({
              username: username.trim() || null,
              about: about.trim() || null,
              avatar: avatarUrl || null,
              banner: bannerUrl || null
            })
            .eq('id', user.id)
            .select()
            .single();
          
          if (directUpdateError) {
            toast.error("Failed to update profile: " + directUpdateError.message);
            console.error("Direct update error:", directUpdateError);
            setIsSaving(false);
            return;
          } else {
            updateSuccess = true;
            console.log("Direct update successful:", updateData);
          }
        } catch (directError) {
          toast.error("Failed to update profile. Please try again.");
          console.error("Direct update exception:", directError);
          setIsSaving(false);
          return;
        }
      }
      
      if (updateSuccess) {
        toast.success("Profile updated successfully!");
        
        // Clean up object URLs
        if (avatarPreview && avatarPreview.startsWith('blob:')) {
          URL.revokeObjectURL(avatarPreview);
        }
        if (bannerPreview && bannerPreview.startsWith('blob:')) {
          URL.revokeObjectURL(bannerPreview);
        }
        
        // Navigate after a short delay
        setTimeout(() => {
          navigate(`/profile/${user.id}`);
        }, 1000);
      }
    } catch (error) {
      console.error("Error in handleSave:", error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };
  
  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      if (avatarPreview && avatarPreview.startsWith('blob:')) {
        URL.revokeObjectURL(avatarPreview);
      }
      if (bannerPreview && bannerPreview.startsWith('blob:')) {
        URL.revokeObjectURL(bannerPreview);
      }
    };
  }, [avatarPreview, bannerPreview]);
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center min-h-[70vh]">
          <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-20 max-w-4xl">
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-8">
            <User className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold">Channel Settings</h1>
          </div>
          
          {/* Profile Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="w-5 h-5" />
                Channel Customization
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Banner Upload */}
              <div className="space-y-4">
                <Label htmlFor="banner-upload">Channel Art</Label>
                <div className="relative w-full h-40 rounded-lg overflow-hidden bg-muted border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50 transition-colors">
                  {bannerPreview ? (
                    <img 
                      src={bannerPreview} 
                      alt="Banner preview" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center">
                      <div className="text-center">
                        <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">Upload channel art</p>
                      </div>
                    </div>
                  )}
                  
                  <Label htmlFor="banner-upload" className="absolute inset-0 cursor-pointer">
                    <Input 
                      id="banner-upload" 
                      type="file" 
                      accept="image/*"
                      className="hidden"
                      onChange={handleBannerChange}
                      disabled={isSaving}
                    />
                  </Label>
                  
                  <div className="absolute bottom-3 right-3">
                    <Label htmlFor="banner-upload" className="cursor-pointer">
                      <Button 
                        size="sm" 
                        variant="secondary" 
                        className="bg-black/70 text-white hover:bg-black/80"
                        disabled={isSaving}
                        type="button"
                      >
                        <Camera className="w-4 h-4 mr-2" />
                        Change
                      </Button>
                    </Label>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Recommended size: 2560 x 1440 pixels. Max file size: 6MB.
                </p>
              </div>
              
              {/* Avatar Upload */}
              <div className="flex items-start gap-6">
                <div className="relative">
                  <Avatar className="w-28 h-28">
                    <AvatarImage src={avatarPreview} />
                    <AvatarFallback className="text-2xl">
                      {username?.charAt(0) || user?.email?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  
                  <Label htmlFor="avatar-upload" className="absolute -bottom-2 -right-2 cursor-pointer">
                    <div className="bg-primary text-primary-foreground rounded-full p-2 hover:bg-primary/90 transition-colors shadow-lg">
                      <Camera className="w-4 h-4" />
                    </div>
                    <Input 
                      id="avatar-upload" 
                      type="file" 
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarChange}
                      disabled={isSaving}
                    />
                  </Label>
                </div>
                
                <div className="flex-1 space-y-4">
                  <div>
                    <Label htmlFor="username">Channel Name</Label>
                    <Input 
                      id="username" 
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Your channel name"
                      className="mt-2"
                      disabled={isSaving}
                      maxLength={50}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="about">Channel Description</Label>
                    <Textarea 
                      id="about" 
                      value={about}
                      onChange={(e) => setAbout(e.target.value)}
                      placeholder="Tell viewers about your channel"
                      rows={4}
                      className="mt-2 resize-none"
                      disabled={isSaving}
                      maxLength={1000}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {about.length}/1000 characters
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notifications
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="email-notifications">Email notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive updates about your channel via email</p>
                  </div>
                  <Switch 
                    id="email-notifications"
                    checked={emailNotifications} 
                    onCheckedChange={setEmailNotifications}
                    disabled={isSaving}
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="push-notifications">Push notifications</Label>
                    <p className="text-sm text-muted-foreground">Get notified about new subscribers and comments</p>
                  </div>
                  <Switch 
                    id="push-notifications"
                    checked={pushNotifications} 
                    onCheckedChange={setPushNotifications}
                    disabled={isSaving}
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="marketing-emails">Marketing emails</Label>
                    <p className="text-sm text-muted-foreground">Receive tips and updates about growing your channel</p>
                  </div>
                  <Switch 
                    id="marketing-emails"
                    checked={marketingEmails} 
                    onCheckedChange={setMarketingEmails}
                    disabled={isSaving}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Privacy Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Privacy & Safety
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="show-subscriptions">Show subscription list</Label>
                    <p className="text-sm text-muted-foreground">Let others see which channels you're subscribed to</p>
                  </div>
                  <Switch 
                    id="show-subscriptions"
                    checked={showSubscriptions} 
                    onCheckedChange={setShowSubscriptions}
                    disabled={isSaving}
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="show-saved-videos">Show saved videos</Label>
                    <p className="text-sm text-muted-foreground">Allow others to see your saved videos</p>
                  </div>
                  <Switch 
                    id="show-saved-videos"
                    checked={showSavedVideos} 
                    onCheckedChange={setShowSavedVideos}
                    disabled={isSaving}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Save Button */}
          <div className="flex justify-end gap-4 pt-6 border-t">
            <Button 
              variant="outline" 
              onClick={() => navigate(`/profile/${user?.id}`)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={isSaving || !user}
              className="min-w-24"
            >
              {isSaving ? (
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}