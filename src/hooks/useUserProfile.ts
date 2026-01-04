
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface UserProfile {
  id: string;
  username: string;
  avatar?: string;
  subscriber_count: number;
  video_count: number;
  verified: boolean;
  role: string;
}

export function useUserProfile() {
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

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

  return { userProfile, getUserDisplayInfo };
}
