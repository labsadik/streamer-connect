
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import VideoDetail from "./pages/VideoDetail";
import Upload from "./pages/Upload";
import UserProfile from "./pages/UserProfile";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import ProfileSettings from "./pages/ProfileSettings";
import SavedVideos from "./pages/SavedVideos";
import Settings from "./pages/Settings";
import ShortVideos from "./pages/ShortVideos";
import LiveStreaming from "./pages/LiveStreaming";
import Feed from "./pages/Feed";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/video/:id" element={<VideoDetail />} />
            <Route path="/shorts" element={<ShortVideos />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/profile/:id" element={<UserProfile />} />
            <Route path="/profile/settings" element={<ProfileSettings />} />
            <Route path="/saved-videos" element={<SavedVideos />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/live" element={<LiveStreaming />} />
            <Route path="/feed" element={<Feed />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
