import { supabase } from "../lib/supabase";
import {
  CreateDriverDetailsData,
  CreateDriverRatingData,
  DriverDetails,
  DriverDetailsWithProfile,
  DriverRating,
  DriverRatingWithProfiles,
} from "../types";

export const driverDetailsService = {
  // Driver Details CRUD operations
  async getDriverDetails(profileId: string): Promise<DriverDetails | null> {
    const { data, error } = await supabase
      .from("driver_details")
      .select("*")
      .eq("profile_id", profileId)
      .single();

    if (error) {
      console.error("Error fetching driver details:", error);
      return null;
    }

    return data;
  },

  async getDriverDetailsWithProfile(
    profileId: string
  ): Promise<DriverDetailsWithProfile | null> {
    const { data, error } = await supabase
      .from("driver_details")
      .select(
        `
        *,
        profiles (*)
      `
      )
      .eq("profile_id", profileId)
      .single();

    if (error) {
      console.error("Error fetching driver details with profile:", error);
      return null;
    }

    return data;
  },

  async getAllDriverDetails(): Promise<DriverDetails[]> {
    const { data, error } = await supabase
      .from("driver_details")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching all driver details:", error);
      throw error;
    }

    return data || [];
  },

  async getAvailableDrivers(): Promise<DriverDetailsWithProfile[]> {
    const { data, error } = await supabase
      .from("driver_details")
      .select(
        `
        *,
        profiles (*)
      `
      )
      .eq("availability_status", "available")
      .order("years_of_experience", { ascending: false });

    if (error) {
      console.error("Error fetching available drivers:", error);
      throw error;
    }

    return data || [];
  },

  async getDriversByLocation(
    city: string,
    stateProvince?: string
  ): Promise<DriverDetailsWithProfile[]> {
    let query = supabase
      .from("driver_details")
      .select(
        `
        *,
        profiles (*)
      `
      )
      .eq("city", city)
      .eq("availability_status", "available");

    if (stateProvince) {
      query = query.eq("state_province", stateProvince);
    }

    const { data, error } = await query.order("years_of_experience", {
      ascending: false,
    });

    if (error) {
      console.error("Error fetching drivers by location:", error);
      throw error;
    }

    return data || [];
  },

  async createDriverDetails(
    driverDetailsData: CreateDriverDetailsData
  ): Promise<DriverDetails | null> {
    const { data, error } = await supabase
      .from("driver_details")
      .insert(driverDetailsData)
      .select()
      .single();

    if (error) {
      console.error("Error creating driver details:", error);
      throw error;
    }

    return data;
  },

  async updateDriverDetails(
    profileId: string,
    updates: Partial<DriverDetails>
  ): Promise<DriverDetails | null> {
    const { data, error } = await supabase
      .from("driver_details")
      .update(updates)
      .eq("profile_id", profileId)
      .select()
      .single();

    if (error) {
      console.error("Error updating driver details:", error);
      throw error;
    }

    return data;
  },

  async updateAvailabilityStatus(
    profileId: string,
    status: "available" | "busy" | "unavailable" | "on_break"
  ): Promise<DriverDetails | null> {
    const { data, error } = await supabase
      .from("driver_details")
      .update({
        availability_status: status,
        last_active_at: new Date().toISOString(),
      })
      .eq("profile_id", profileId)
      .select()
      .single();

    if (error) {
      console.error("Error updating availability status:", error);
      throw error;
    }

    return data;
  },

  // Driver Ratings CRUD operations
  async getDriverRatings(
    driverId: string
  ): Promise<DriverRatingWithProfiles[]> {
    const { data, error } = await supabase
      .from("driver_ratings")
      .select(
        `
        *,
        driver_profile:profiles!driver_ratings_driver_id_fkey (*),
        rater_profile:profiles!driver_ratings_rater_id_fkey (*),
        car:cars (*)
      `
      )
      .eq("driver_id", driverId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching driver ratings:", error);
      throw error;
    }

    return data || [];
  },

  async getAverageDriverRating(driverId: string): Promise<number> {
    const { data, error } = await supabase
      .from("driver_ratings")
      .select("rating")
      .eq("driver_id", driverId);

    if (error) {
      console.error("Error fetching driver ratings for average:", error);
      return 0;
    }

    if (!data || data.length === 0) {
      return 0;
    }

    const sum = data.reduce((acc, rating) => acc + rating.rating, 0);
    return Math.round((sum / data.length) * 100) / 100; // Round to 2 decimal places
  },

  async createDriverRating(
    ratingData: CreateDriverRatingData
  ): Promise<DriverRating | null> {
    const { data, error } = await supabase
      .from("driver_ratings")
      .insert({
        ...ratingData,
        rater_id: (await supabase.auth.getUser()).data.user?.id,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating driver rating:", error);
      throw error;
    }

    return data;
  },

  async updateDriverRating(
    ratingId: string,
    updates: Partial<DriverRating>
  ): Promise<DriverRating | null> {
    const { data, error } = await supabase
      .from("driver_ratings")
      .update(updates)
      .eq("id", ratingId)
      .select()
      .single();

    if (error) {
      console.error("Error updating driver rating:", error);
      throw error;
    }

    return data;
  },

  async deleteDriverRating(ratingId: string): Promise<void> {
    const { error } = await supabase
      .from("driver_ratings")
      .delete()
      .eq("id", ratingId);

    if (error) {
      console.error("Error deleting driver rating:", error);
      throw error;
    }
  },

  // Utility functions for driver selection
  async findBestDriversForCar(
    carId: string
  ): Promise<DriverDetailsWithProfile[]> {
    // First get the car details
    const { data: car, error: carError } = await supabase
      .from("cars")
      .select("*")
      .eq("id", carId)
      .single();

    if (carError || !car) {
      throw new Error("Car not found");
    }

    // Build query for matching drivers
    let query = supabase
      .from("driver_details")
      .select(
        `
        *,
        profiles (*)
      `
      )
      .eq("availability_status", "available");

    // Filter by transmission preference if specified
    if (car.transmission_type) {
      query = query.or(
        `preferred_transmission.eq.${car.transmission_type},preferred_transmission.eq.both`
      );
    }

    const { data, error } = await query
      .order("years_of_experience", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error finding best drivers for car:", error);
      throw error;
    }

    return data || [];
  },

  async getDriversWithValidLicenses(): Promise<DriverDetailsWithProfile[]> {
    const { data, error } = await supabase
      .from("driver_details")
      .select(
        `
        *,
        profiles (*)
      `
      )
      .gt("license_expiry_date", new Date().toISOString())
      .eq("availability_status", "available")
      .order("license_expiry_date", { ascending: true });

    if (error) {
      console.error("Error fetching drivers with valid licenses:", error);
      throw error;
    }

    return data || [];
  },
};
