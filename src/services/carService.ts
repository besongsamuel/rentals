import { supabase } from "../lib/supabase";
import { Car, CreateCarData } from "../types";

export const carService = {
  async getCarsByDriver(driverId: string): Promise<Car[]> {
    const { data, error } = await supabase
      .from("cars")
      .select("*")
      .eq("driver_id", driverId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching cars by driver:", error);
      throw new Error("Failed to fetch cars assigned to driver");
    }

    return data || [];
  },

  async getCarsByOwner(ownerId: string): Promise<Car[]> {
    // Get cars where the user is the main owner OR has ownership through car_owners table
    // We'll use two separate queries and combine the results

    // First, get cars where user is the main owner
    const { data: mainOwnerCars, error: mainOwnerError } = await supabase
      .from("cars")
      .select("*")
      .eq("owner_id", ownerId);

    if (mainOwnerError) {
      console.error("Error fetching main owner cars:", mainOwnerError);
      throw mainOwnerError;
    }

    // Second, get car IDs where user has ownership through car_owners table
    const { data: ownershipData, error: ownershipError } = await supabase
      .from("car_owners")
      .select("car_id")
      .eq("owner_id", ownerId);

    if (ownershipError) {
      console.error("Error fetching car ownership:", ownershipError);
      throw ownershipError;
    }

    // If user has additional ownership, get those cars
    let additionalOwnerCars: any[] = [];
    if (ownershipData && ownershipData.length > 0) {
      const carIds = ownershipData.map((item) => item.car_id);
      const { data: additionalCars, error: additionalError } = await supabase
        .from("cars")
        .select("*")
        .in("id", carIds);

      if (additionalError) {
        console.error("Error fetching additional owner cars:", additionalError);
        throw additionalError;
      }
      additionalOwnerCars = additionalCars || [];
    }

    // Combine and deduplicate cars
    const allCars = [...(mainOwnerCars || []), ...additionalOwnerCars];
    const uniqueCars = allCars.filter(
      (car, index, self) => index === self.findIndex((c) => c.id === car.id)
    );

    // Sort by created_at
    return uniqueCars.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  },

  async getCarById(carId: string): Promise<Car | null> {
    const { data, error } = await supabase
      .from("cars")
      .select("*")
      .eq("id", carId)
      .single();

    if (error) {
      console.error("Error fetching car:", error);
      return null;
    }

    return data;
  },

  async createCar(carData: CreateCarData): Promise<Car> {
    const { data, error } = await supabase
      .from("cars")
      .insert({
        ...carData,
        current_mileage: carData.initial_mileage || 0,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating car:", error);
      throw error;
    }

    return data;
  },

  async updateCar(carId: string, updates: Partial<Car>): Promise<Car> {
    const { data, error } = await supabase
      .from("cars")
      .update(updates)
      .eq("id", carId)
      .select()
      .single();

    if (error) {
      console.error("Error updating car:", error);
      throw error;
    }

    return data;
  },

  async assignCarToDriver(
    carId: string,
    driverId: string,
    assignedBy: string
  ): Promise<Car> {
    const { data, error } = await supabase
      .from("cars")
      .update({
        driver_id: driverId,
        status: "assigned",
      })
      .eq("id", carId)
      .select()
      .single();

    if (error) {
      console.error("Error assigning car:", error);

      // Provide more specific error messages
      if (error.code === "PGRST116") {
        throw new Error(
          "Car not found or you don't have permission to assign this car"
        );
      } else if (error.code === "PGRST301") {
        throw new Error("You don't have permission to assign this car");
      } else {
        throw new Error(error.message || "Failed to assign car to driver");
      }
    }

    if (!data) {
      throw new Error(
        "Car not found or you don't have permission to assign this car"
      );
    }

    // Create car assignment record
    const { error: assignmentError } = await supabase
      .from("car_assignments")
      .insert({
        car_id: carId,
        driver_id: driverId,
        assigned_by: assignedBy,
      });

    if (assignmentError) {
      console.error("Error creating car assignment record:", assignmentError);
      // Don't throw here as the car assignment was successful, just the record creation failed
    }

    return data;
  },

  async unassignCar(carId: string): Promise<Car> {
    const { data, error } = await supabase
      .from("cars")
      .update({
        driver_id: null,
        status: "available",
      })
      .eq("id", carId)
      .select()
      .single();

    if (error) {
      console.error("Error unassigning car:", error);
      throw error;
    }

    // Update car assignment record
    await supabase
      .from("car_assignments")
      .update({ unassigned_at: new Date().toISOString() })
      .eq("car_id", carId)
      .is("unassigned_at", null);

    return data;
  },

  async deleteCar(carId: string): Promise<void> {
    const { error } = await supabase.from("cars").delete().eq("id", carId);

    if (error) {
      console.error("Error deleting car:", error);
      throw error;
    }
  },

  async assignCarToOwner(
    carId: string,
    newOwnerId: string,
    assignedBy: string
  ): Promise<Car> {
    const { data, error } = await supabase
      .from("cars")
      .update({
        owner_id: newOwnerId,
      })
      .eq("id", carId)
      .select()
      .single();

    if (error) {
      console.error("Error assigning car to owner:", error);
      throw error;
    }

    return data;
  },
};
