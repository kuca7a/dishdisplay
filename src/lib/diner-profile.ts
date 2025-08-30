import { getServerSupabaseClient } from "@/lib/supabase-server";

export interface DinerProfile {
  id: string;
  email: string;
  display_name: string;
  profile_photo_url?: string;
  join_date: string;
  total_visits: number;
  total_points: number;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export class DinerProfileService {
  // Get diner profile by email
  async getDinerByEmail(email: string): Promise<DinerProfile | null> {
    try {
      const supabase = getServerSupabaseClient();
      
      const { data, error } = await supabase
        .from("diner_profiles")
        .select("*")
        .eq("email", email)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
      return data as unknown as DinerProfile | null;
    } catch (error) {
      console.error("Error fetching diner profile:", error);
      return null;
    }
  }

  // Create or get diner profile (upsert functionality)
  async ensureDinerProfile(email: string, displayName?: string): Promise<DinerProfile | null> {
    try {
      // First try to get existing profile
      const existingProfile = await this.getDinerByEmail(email);
      if (existingProfile) {
        return existingProfile;
      }

      // Create new profile if it doesn't exist
      const supabase = getServerSupabaseClient();
      
      const { data, error } = await supabase
        .from("diner_profiles")
        .insert([{
          email,
          display_name: displayName || email.split('@')[0], // Use email prefix as default display name
        }])
        .select()
        .single();

      if (error) throw error;
      return data as unknown as DinerProfile;
    } catch (error) {
      console.error("Error ensuring diner profile:", error);
      return null;
    }
  }

  // Update diner profile
  async updateDinerProfile(
    email: string, 
    updates: { display_name?: string; profile_photo_url?: string; is_public?: boolean }
  ): Promise<DinerProfile | null> {
    try {
      const supabase = getServerSupabaseClient();
      
      const { data, error } = await supabase
        .from("diner_profiles")
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq("email", email)
        .select()
        .single();

      if (error) throw error;
      return data as unknown as DinerProfile;
    } catch (error) {
      console.error("Error updating diner profile:", error);
      return null;
    }
  }
}

export const dinerProfileService = new DinerProfileService();
