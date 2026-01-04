
import { supabase } from "@/integrations/supabase/client";

/**
 * Subscribe to a channel
 */
export async function subscribeToChannel(channelId: string) {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) return { error: "Not authenticated" };
  
  const { data, error } = await supabase
    .from('subscriptions')
    .insert({
      subscriber_id: user.user.id,
      channel_id: channelId
    });
    
  return { data, error };
}

/**
 * Unsubscribe from a channel
 */
export async function unsubscribeFromChannel(channelId: string) {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) return { error: "Not authenticated" };
  
  const { data, error } = await supabase
    .from('subscriptions')
    .delete()
    .match({
      subscriber_id: user.user.id,
      channel_id: channelId
    });
    
  return { data, error };
}

/**
 * Check if user is subscribed to a channel
 */
export async function isSubscribedToChannel(channelId: string): Promise<boolean> {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) return false;
  
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .match({
      subscriber_id: user.user.id,
      channel_id: channelId
    });
    
  return data && data.length > 0;
}
