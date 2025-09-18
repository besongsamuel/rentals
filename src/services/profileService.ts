import { supabase } from "../lib/supabase";
import { CreateProfileData, Profile } from "../types";

export const profileService = {
  async getProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error fetching profile:", error);
      return null;
    }

    return data;
  },

  async getAllOwners(): Promise<Profile[]> {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_type", "owner")
      .order("full_name");

    if (error) {
      console.error("Error fetching owners:", error);
      throw error;
    }

    return data || [];
  },

  async getAllDrivers(): Promise<Profile[]> {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_type", "driver")
      .order("full_name");

    if (error) {
      console.error("Error fetching drivers:", error);
      throw error;
    }

    return data || [];
  },

  async getAllProfiles(): Promise<Profile[]> {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("full_name");

    if (error) {
      console.error("Error fetching profiles:", error);
      throw error;
    }

    return data || [];
  },

  async getUserCounts(): Promise<{ drivers: number; owners: number }> {
    // Fetch driver count
    const { count: driverCount, error: driverError } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("user_type", "driver");

    if (driverError) {
      console.error("Error fetching driver count:", driverError);
      throw driverError;
    }

    // Fetch owner count
    const { count: ownerCount, error: ownerError } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("user_type", "owner");

    if (ownerError) {
      console.error("Error fetching owner count:", ownerError);
      throw ownerError;
    }

    return {
      drivers: driverCount || 0,
      owners: ownerCount || 0,
    };
  },

  async createProfile(
    profileData: CreateProfileData & { id: string; email: string }
  ): Promise<Profile | null> {
    const { data, error } = await supabase
      .from("profiles")
      .insert(profileData)
      .select()
      .single();

    if (error) {
      console.error("Error creating profile:", error);
      throw error;
    }

    return data;
  },

  async updateProfile(
    userId: string,
    updates: Partial<Profile>
  ): Promise<Profile | null> {
    const { data, error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", userId)
      .select()
      .single();

    if (error) {
      console.error("Error updating profile:", error);
      throw error;
    }

    return data;
  },
};
