
import { supabase } from "@/integrations/supabase/client";

/**
 * Create or ensure user profile exists
 */
export async function ensureUserProfile(userId: string, userData?: { username?: string; email?: string }) {
  console.log("Ensuring profile exists for user:", userId);
  
  // First check if profile exists
  const { data: existingProfile, error: fetchError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
    
  if (fetchError) {
    console.error('Error checking for existing profile:', fetchError);
    return { error: fetchError };
  }
  
  // If profile exists, return it
  if (existingProfile) {
    console.log("Profile already exists:", existingProfile);
    return { data: existingProfile, error: null };
  }
  
  // Create new profile
  const fallbackUsername = userData?.username || userData?.email?.split('@')[0] || `user_${userId.slice(0, 8)}`;
  const profileData = {
    id: userId,
    username: fallbackUsername,
    subscriber_count: 0,
    video_count: 0,
    verified: false,
    role: 'user'
  };
  
  console.log("Creating new profile:", profileData);
  
  const { data: newProfile, error: createError } = await supabase
    .from('profiles')
    .insert(profileData)
    .select()
    .single();
    
  if (createError) {
    console.error('Error creating profile:', createError);
    return { error: createError };
  }
  
  console.log("Profile created successfully:", newProfile);
  return { data: newProfile, error: null };
}

/**
 * Update user profile
 */
export async function updateUserProfile(profileData: {
  username?: string;
  about?: string;
  avatar?: string;
  banner?: string;
}) {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) return { error: "Not authenticated" };
  
  // Ensure profile exists first
  await ensureUserProfile(user.user.id, { email: user.user.email });
  
  const { data, error } = await supabase
    .from('profiles')
    .update(profileData)
    .eq('id', user.user.id)
    .select();
    
  return { data, error };
}
