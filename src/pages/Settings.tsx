
import { useState } from "react";
import Navbar from "@/components/Navbar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Bell, 
  Eye, 
  Settings as SettingsIcon, 
  Tv, 
  Volume, 
  Shield, 
  Globe, 
  Layers, 
  Palette, 
  Mic,
  User,
  Lock
} from "lucide-react";

export default function Settings() {
  const { user } = useAuth();
  const [autoplay, setAutoplay] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [qualityPreference, setQualityPreference] = useState("auto");
  const [allowNotifications, setAllowNotifications] = useState(true);
  const [volume, setVolume] = useState([80]);
  const [playbackSpeed, setPlaybackSpeed] = useState("1.0");
  const [subtitlesEnabled, setSubtitlesEnabled] = useState(false);
  const [language, setLanguage] = useState("en");
  const [voiceControl, setVoiceControl] = useState(false);
  const [gestureControl, setGestureControl] = useState(false);
  const [aiRecommendations, setAiRecommendations] = useState(true);

  const handleSaveSettings = () => {
    toast.success("Settings saved successfully");
  };

  return (
    <div className="min-h-screen bg-background pb-16">
      <Navbar />
      
      <main className="max-w-screen-xl mx-auto px-4 md:px-6 pt-20">
        <div className="flex flex-col space-y-6">
          <div className="flex items-center gap-3">
            <SettingsIcon className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold">Settings</h1>
          </div>
          
          <Tabs defaultValue="playback" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:w-fit">
              <TabsTrigger value="playback" className="flex items-center gap-2">
                <Tv className="w-4 h-4" />
                <span className="hidden sm:inline">Playback</span>
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center gap-2">
                <Bell className="w-4 h-4" />
                <span className="hidden sm:inline">Notifications</span>
              </TabsTrigger>
              <TabsTrigger value="appearance" className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                <span className="hidden sm:inline">Appearance</span>
              </TabsTrigger>
              <TabsTrigger value="privacy" className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                <span className="hidden sm:inline">Privacy</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="playback" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Tv className="w-5 h-5" />
                    Playback Settings
                  </CardTitle>
                  <CardDescription>
                    Customize how videos play on your device
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="autoplay">Autoplay videos</Label>
                        <p className="text-sm text-muted-foreground">
                          Videos will play automatically when scrolling
                        </p>
                      </div>
                      <Switch 
                        id="autoplay" 
                        checked={autoplay} 
                        onCheckedChange={setAutoplay} 
                      />
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-3">
                      <Label htmlFor="quality">Default video quality</Label>
                      <Select value={qualityPreference} onValueChange={setQualityPreference}>
                        <SelectTrigger id="quality">
                          <SelectValue placeholder="Select quality" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="auto">Auto (Recommended)</SelectItem>
                          <SelectItem value="2160p">2160p (4K)</SelectItem>
                          <SelectItem value="1440p">1440p (2K)</SelectItem>
                          <SelectItem value="1080p">1080p (HD)</SelectItem>
                          <SelectItem value="720p">720p</SelectItem>
                          <SelectItem value="480p">480p</SelectItem>
                          <SelectItem value="360p">360p</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-sm text-muted-foreground">
                        Higher quality uses more data and requires faster internet
                      </p>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="volume">Default volume</Label>
                        <span className="text-sm font-medium">{volume[0]}%</span>
                      </div>
                      <Slider
                        id="volume"
                        value={volume}
                        max={100}
                        step={1}
                        onValueChange={setVolume}
                        className="w-full"
                      />
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-3">
                      <Label htmlFor="speed">Default playback speed</Label>
                      <Select value={playbackSpeed} onValueChange={setPlaybackSpeed}>
                        <SelectTrigger id="speed">
                          <SelectValue placeholder="Select speed" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0.25">0.25x</SelectItem>
                          <SelectItem value="0.5">0.5x</SelectItem>
                          <SelectItem value="0.75">0.75x</SelectItem>
                          <SelectItem value="1.0">Normal (1x)</SelectItem>
                          <SelectItem value="1.25">1.25x</SelectItem>
                          <SelectItem value="1.5">1.5x</SelectItem>
                          <SelectItem value="1.75">1.75x</SelectItem>
                          <SelectItem value="2.0">2x</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="subtitles">Auto-generate subtitles</Label>
                        <p className="text-sm text-muted-foreground">
                          Show AI-generated subtitles when available
                        </p>
                      </div>
                      <Switch 
                        id="subtitles" 
                        checked={subtitlesEnabled} 
                        onCheckedChange={setSubtitlesEnabled} 
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="notifications" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="w-5 h-5" />
                    Notification Settings
                  </CardTitle>
                  <CardDescription>
                    Manage when and how you receive notifications
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="notifications">Enable notifications</Label>
                        <p className="text-sm text-muted-foreground">
                          Receive notifications about your channel and subscriptions
                        </p>
                      </div>
                      <Switch 
                        id="notifications" 
                        checked={allowNotifications} 
                        onCheckedChange={setAllowNotifications} 
                      />
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-4">
                      <Label>Email notifications</Label>
                      <div className="grid gap-4 pl-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="email-subs" className="text-sm font-normal">New subscribers</Label>
                            <p className="text-xs text-muted-foreground">Get notified when someone subscribes</p>
                          </div>
                          <Switch id="email-subs" defaultChecked />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="email-comments" className="text-sm font-normal">Comments and replies</Label>
                            <p className="text-xs text-muted-foreground">Get notified about new comments</p>
                          </div>
                          <Switch id="email-comments" defaultChecked />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="email-uploads" className="text-sm font-normal">New uploads from subscriptions</Label>
                            <p className="text-xs text-muted-foreground">Get notified when channels you follow upload</p>
                          </div>
                          <Switch id="email-uploads" defaultChecked />
                        </div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-3">
                      <Label htmlFor="email">Email address</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        value={user?.email || ""} 
                        disabled 
                        className="bg-muted"
                      />
                      <p className="text-xs text-muted-foreground">
                        Contact support to change your email address
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="appearance" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="w-5 h-5" />
                    Appearance Settings
                  </CardTitle>
                  <CardDescription>
                    Customize how the platform looks for you
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="dark-mode">Dark theme</Label>
                        <p className="text-sm text-muted-foreground">
                          Use dark theme across the platform
                        </p>
                      </div>
                      <Switch 
                        id="dark-mode" 
                        checked={darkMode} 
                        onCheckedChange={setDarkMode} 
                      />
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-3">
                      <Label htmlFor="language">Language</Label>
                      <Select value={language} onValueChange={setLanguage}>
                        <SelectTrigger id="language">
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="es">Español</SelectItem>
                          <SelectItem value="fr">Français</SelectItem>
                          <SelectItem value="de">Deutsch</SelectItem>
                          <SelectItem value="it">Italiano</SelectItem>
                          <SelectItem value="pt">Português</SelectItem>
                          <SelectItem value="ja">日本語</SelectItem>
                          <SelectItem value="zh">中文</SelectItem>
                          <SelectItem value="ar">العربية</SelectItem>
                          <SelectItem value="hi">हिन्दी</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-3">
                      <Label>Accent color</Label>
                      <div className="flex gap-3">
                        {[
                          { name: "Red", color: "bg-red-500" },
                          { name: "Blue", color: "bg-blue-500" },
                          { name: "Green", color: "bg-green-500" },
                          { name: "Purple", color: "bg-purple-500" },
                          { name: "Orange", color: "bg-orange-500" },
                        ].map((color) => (
                          <Button
                            key={color.name}
                            variant="outline"
                            size="icon"
                            className={`w-10 h-10 rounded-full ${color.color} border-2 border-muted hover:border-primary`}
                          >
                            <span className="sr-only">{color.name}</span>
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="privacy" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Privacy & Safety
                  </CardTitle>
                  <CardDescription>
                    Control your privacy and data settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="ai-recommendations" className="flex items-center gap-2">
                          <Layers className="h-4 w-4" />
                          AI-powered recommendations
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Use AI to personalize your content recommendations
                        </p>
                      </div>
                      <Switch 
                        id="ai-recommendations" 
                        checked={aiRecommendations} 
                        onCheckedChange={setAiRecommendations} 
                      />
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-4">
                      <Label>Data collection</Label>
                      <div className="grid gap-4 pl-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="watch-history" className="text-sm font-normal">Save watch history</Label>
                            <p className="text-xs text-muted-foreground">Keep track of videos you've watched</p>
                          </div>
                          <Switch id="watch-history" defaultChecked />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="search-history" className="text-sm font-normal">Save search history</Label>
                            <p className="text-xs text-muted-foreground">Remember your searches for better recommendations</p>
                          </div>
                          <Switch id="search-history" defaultChecked />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="location-data" className="text-sm font-normal">Location data</Label>
                            <p className="text-xs text-muted-foreground">Use location for local content and features</p>
                          </div>
                          <Switch id="location-data" />
                        </div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-3">
                      <Label>Data management</Label>
                      <div className="flex flex-wrap gap-2">
                        <Button variant="outline" size="sm">
                          Download your data
                        </Button>
                        <Button variant="outline" size="sm">
                          Clear watch history
                        </Button>
                        <Button variant="outline" size="sm">
                          Clear search history
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
          
          <div className="flex justify-end gap-4 pt-6 border-t">
            <Button variant="outline">Reset to defaults</Button>
            <Button onClick={handleSaveSettings}>Save all settings</Button>
          </div>
        </div>
      </main>
    </div>
  );
}
