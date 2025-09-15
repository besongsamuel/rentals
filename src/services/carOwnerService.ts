import { supabase } from "../lib/supabase";
import { CarOwnerWithProfile, CreateCarOwnerData } from "../types";

export const carOwnerService = {
  async getCarOwnersByCar(carId: string): Promise<CarOwnerWithProfile[]> {
    const { data, error } = await supabase
      .from("car_owners")
      .select(
        `
        *,
        profiles:owner_id (
          id,
          full_name,
          email,
          user_type
        )
      `
      )
      .eq("car_id", carId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching car owners:", error);
      throw error;
    }

    return data || [];
  },

  async addCarOwner(
    carOwnerData: CreateCarOwnerData
  ): Promise<CarOwnerWithProfile> {
    const { data, error } = await supabase
      .from("car_owners")
      .insert({
        car_id: carOwnerData.car_id,
        owner_id: carOwnerData.owner_id,
        ownership_percentage: carOwnerData.ownership_percentage || 0,
        is_primary_owner: carOwnerData.is_primary_owner || false,
      })
      .select(
        `
        *,
        profiles:owner_id (
          id,
          full_name,
          email,
          user_type
        )
      `
      )
      .single();

    if (error) {
      console.error("Error adding car owner:", error);
      throw error;
    }

    return data;
  },

  async updateCarOwner(
    carOwnerId: string,
    updates: Partial<CreateCarOwnerData>
  ): Promise<CarOwnerWithProfile> {
    const { data, error } = await supabase
      .from("car_owners")
      .update(updates)
      .eq("id", carOwnerId)
      .select(
        `
        *,
        profiles:owner_id (
          id,
          full_name,
          email,
          user_type
        )
      `
      )
      .single();

    if (error) {
      console.error("Error updating car owner:", error);
      throw error;
    }

    return data;
  },

  async removeCarOwner(carOwnerId: string): Promise<void> {
    const { error } = await supabase
      .from("car_owners")
      .delete()
      .eq("id", carOwnerId);

    if (error) {
      console.error("Error removing car owner:", error);
      throw error;
    }
  },

  async getCarOwnerById(
    carOwnerId: string
  ): Promise<CarOwnerWithProfile | null> {
    const { data, error } = await supabase
      .from("car_owners")
      .select(
        `
        *,
        profiles:owner_id (
          id,
          full_name,
          email,
          user_type
        )
      `
      )
      .eq("id", carOwnerId)
      .single();

    if (error) {
      console.error("Error fetching car owner:", error);
      return null;
    }

    return data;
  },

  async checkOwnership(userId: string, carId: string): Promise<boolean> {
    try {
      // Check if user is the main owner
      const { data: carData } = await supabase
        .from("cars")
        .select("owner_id")
        .eq("id", carId)
        .single();

      if (carData?.owner_id === userId) {
        return true;
      }

      // Check if user is an additional owner
      const { data: ownerData } = await supabase
        .from("car_owners")
        .select("id")
        .eq("car_id", carId)
        .eq("owner_id", userId)
        .single();

      return !!ownerData;
    } catch (error) {
      console.error("Error checking ownership:", error);
      return false;
    }
  },
};
