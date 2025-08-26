import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Create client only if environment variables are available
export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

// Helper function to get supabase client safely
export const getSupabaseClient = () => {
  if (!supabase) {
    throw new Error(
      "Supabase is not configured. Please check your environment variables."
    );
  }
  return supabase;
};

// Test connection function
export const testSupabaseConnection = async () => {
  try {
    if (!supabase) {
      return { success: false, error: "Supabase not configured" };
    }
    const { error } = await supabase
      .from("test_items")
      .select("count", { count: "exact" });
    return { success: !error, error };
  } catch (err) {
    console.error("Connection test failed:", err);
    return { success: false, error: err };
  }
};
