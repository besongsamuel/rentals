import { supabase } from "../lib/supabase";

/**
 * Service for managing car images in Supabase Storage
 * Images are stored in the cars bucket under the car's id as folder name
 */
export const carImageStorageService = {
  /**
   * Get all car images for a specific car
   * @param carId - The car's ID
   * @returns Array of file paths in the bucket
   */
  async getCarImageFiles(carId: string): Promise<string[]> {
    try {
      const { data, error } = await supabase.storage.from("cars").list(carId, {
        limit: 100,
        offset: 0,
        sortBy: { column: "created_at", order: "desc" },
      });

      if (error) {
        console.error("Error listing car image files:", error);
        return [];
      }

      // Filter out directories and return only file paths
      const files = data
        .filter((file) => file.name && !file.name.endsWith("/"))
        .map((file) => `${carId}/${file.name}`);

      return files;
    } catch (err) {
      console.error("Error in getCarImageFiles:", err);
      return [];
    }
  },

  /**
   * Get signed URLs for car images
   * @param carId - The car's ID
   * @param expiresIn - Expiration time in seconds (default: 3600 = 1 hour)
   * @returns Array of signed URLs
   */
  async getCarImageUrls(
    carId: string,
    expiresIn: number = 3600
  ): Promise<string[]> {
    try {
      const files = await this.getCarImageFiles(carId);

      if (files.length === 0) {
        return [];
      }

      const urls = await Promise.all(
        files.map(async (filePath) => {
          const { data, error } = await supabase.storage
            .from("cars")
            .createSignedUrl(filePath, expiresIn);

          if (error) {
            console.error(`Error creating signed URL for ${filePath}:`, error);
            return null;
          }

          return data.signedUrl;
        })
      );

      return urls.filter((url): url is string => url !== null);
    } catch (err) {
      console.error("Error in getCarImageUrls:", err);
      return [];
    }
  },

  /**
   * Get the first (most recent) car image URL
   * @param carId - The car's ID
   * @param expiresIn - Expiration time in seconds (default: 3600 = 1 hour)
   * @returns Signed URL or null if no image exists
   */
  async getFirstCarImageUrl(
    carId: string,
    expiresIn: number = 3600
  ): Promise<string | null> {
    const urls = await this.getCarImageUrls(carId, expiresIn);
    return urls.length > 0 ? urls[0] : null;
  },

  /**
   * Get all car image URLs for multiple cars
   * @param carIds - Array of car IDs
   * @param expiresIn - Expiration time in seconds (default: 3600 = 1 hour)
   * @returns Object mapping car IDs to their image URLs
   */
  async getCarImageUrlsForCars(
    carIds: string[],
    expiresIn: number = 3600
  ): Promise<Record<string, string[]>> {
    try {
      const results: Record<string, string[]> = {};

      // Process all cars in parallel
      await Promise.all(
        carIds.map(async (carId) => {
          const urls = await this.getCarImageUrls(carId, expiresIn);
          results[carId] = urls;
        })
      );

      return results;
    } catch (err) {
      console.error("Error in getCarImageUrlsForCars:", err);
      return {};
    }
  },

  /**
   * Delete a specific car image file
   * @param filePath - The full file path in the bucket (e.g., "car_id/filename.jpg")
   * @returns True if deletion was successful
   */
  async deleteCarImageFile(filePath: string): Promise<boolean> {
    try {
      const { error } = await supabase.storage.from("cars").remove([filePath]);

      if (error) {
        console.error("Error deleting car image file:", error);
        return false;
      }

      return true;
    } catch (err) {
      console.error("Error in deleteCarImageFile:", err);
      return false;
    }
  },

  /**
   * Delete all car images for a car
   * @param carId - The car's ID
   * @returns True if all deletions were successful
   */
  async deleteAllCarImages(carId: string): Promise<boolean> {
    try {
      const files = await this.getCarImageFiles(carId);

      if (files.length === 0) {
        return true;
      }

      const { error } = await supabase.storage.from("cars").remove(files);

      if (error) {
        console.error("Error deleting all car images:", error);
        return false;
      }

      return true;
    } catch (err) {
      console.error("Error in deleteAllCarImages:", err);
      return false;
    }
  },

  /**
   * Upload a car image file
   * @param carId - The car's ID
   * @param file - The file to upload
   * @returns The uploaded file path or null if upload failed
   */
  async uploadCarImageFile(carId: string, file: File): Promise<string | null> {
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${carId}/${Date.now()}_${Math.random()
        .toString(36)
        .substring(7)}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from("cars")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) {
        console.error("Error uploading car image file:", error);
        return null;
      }

      return data.path;
    } catch (err) {
      console.error("Error in uploadCarImageFile:", err);
      return null;
    }
  },

  /**
   * Upload multiple car image files
   * @param carId - The car's ID
   * @param files - Array of files to upload
   * @returns Array of uploaded file paths
   */
  async uploadCarImageFiles(carId: string, files: File[]): Promise<string[]> {
    try {
      const uploadPromises = files.map((file) =>
        this.uploadCarImageFile(carId, file)
      );

      const results = await Promise.all(uploadPromises);
      return results.filter((path): path is string => path !== null);
    } catch (err) {
      console.error("Error in uploadCarImageFiles:", err);
      return [];
    }
  },
};
