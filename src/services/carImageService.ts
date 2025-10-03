import { supabase } from "../lib/supabase";
import { CarImage } from "../types";

export const carImageService = {
  /**
   * Get all images for a specific car
   */
  async getCarImages(carId: string): Promise<CarImage[]> {
    const { data, error } = await supabase
      .from("car_images")
      .select("*")
      .eq("car_id", carId)
      .order("is_primary", { ascending: false })
      .order("created_at", { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch car images: ${error.message}`);
    }

    return data || [];
  },

  /**
   * Add a new car image
   */
  async addCarImage(
    carId: string,
    imageUrl: string,
    isPrimary: boolean = false
  ): Promise<CarImage> {
    const { data, error } = await supabase
      .from("car_images")
      .insert({
        car_id: carId,
        image_url: imageUrl,
        is_primary: isPrimary,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to add car image: ${error.message}`);
    }

    return data;
  },

  /**
   * Add multiple car images at once
   */
  async addCarImages(
    carId: string,
    imageUrls: string[],
    primaryIndex: number = 0
  ): Promise<CarImage[]> {
    const imagesToInsert = imageUrls.map((url, index) => ({
      car_id: carId,
      image_url: url,
      is_primary: index === primaryIndex,
    }));

    const { data, error } = await supabase
      .from("car_images")
      .insert(imagesToInsert)
      .select();

    if (error) {
      throw new Error(`Failed to add car images: ${error.message}`);
    }

    return data || [];
  },

  /**
   * Delete a car image
   */
  async deleteCarImage(imageId: string): Promise<void> {
    const { error } = await supabase
      .from("car_images")
      .delete()
      .eq("id", imageId);

    if (error) {
      throw new Error(`Failed to delete car image: ${error.message}`);
    }
  },

  /**
   * Set a specific image as the primary image for a car
   */
  async setPrimaryImage(imageId: string, carId: string): Promise<void> {
    // First, unset all primary flags for this car
    const { error: unsetError } = await supabase
      .from("car_images")
      .update({ is_primary: false })
      .eq("car_id", carId);

    if (unsetError) {
      throw new Error(`Failed to unset primary images: ${unsetError.message}`);
    }

    // Then, set the specified image as primary
    const { error: setPrimaryError } = await supabase
      .from("car_images")
      .update({ is_primary: true })
      .eq("id", imageId);

    if (setPrimaryError) {
      throw new Error(`Failed to set primary image: ${setPrimaryError.message}`);
    }
  },

  /**
   * Delete all images for a specific car
   */
  async deleteAllCarImages(carId: string): Promise<void> {
    const { error } = await supabase
      .from("car_images")
      .delete()
      .eq("car_id", carId);

    if (error) {
      throw new Error(`Failed to delete car images: ${error.message}`);
    }
  },
};

