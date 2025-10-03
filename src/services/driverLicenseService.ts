import { supabase } from "../lib/supabase";

/**
 * Service for managing driver license images in Supabase Storage
 * Images are stored in the driver_licenses bucket under the user's profile_id
 */
export const driverLicenseService = {
  /**
   * Get all driver license images for a specific user
   * @param profileId - The user's profile ID
   * @returns Array of file paths in the bucket
   */
  async getDriverLicenseFiles(profileId: string): Promise<string[]> {
    try {
      const { data, error } = await supabase.storage
        .from("driver_licenses")
        .list(profileId, {
          limit: 100,
          offset: 0,
          sortBy: { column: "created_at", order: "desc" },
        });

      if (error) {
        console.error("Error listing driver license files:", error);
        return [];
      }

      // Filter out directories and return only file paths
      const files = data
        .filter((file) => file.name && !file.name.endsWith("/"))
        .map((file) => `${profileId}/${file.name}`);

      return files;
    } catch (err) {
      console.error("Error in getDriverLicenseFiles:", err);
      return [];
    }
  },

  /**
   * Get signed URLs for driver license images
   * @param profileId - The user's profile ID
   * @param expiresIn - Expiration time in seconds (default: 3600 = 1 hour)
   * @returns Array of signed URLs
   */
  async getDriverLicenseUrls(
    profileId: string,
    expiresIn: number = 3600
  ): Promise<string[]> {
    try {
      const files = await this.getDriverLicenseFiles(profileId);

      if (files.length === 0) {
        return [];
      }

      const urls = await Promise.all(
        files.map(async (filePath) => {
          const { data, error } = await supabase.storage
            .from("driver_licenses")
            .createSignedUrl(filePath, expiresIn);

          if (error) {
            console.error(
              `Error creating signed URL for ${filePath}:`,
              error
            );
            return null;
          }

          return data.signedUrl;
        })
      );

      return urls.filter((url): url is string => url !== null);
    } catch (err) {
      console.error("Error in getDriverLicenseUrls:", err);
      return [];
    }
  },

  /**
   * Get the first (most recent) driver license image URL
   * @param profileId - The user's profile ID
   * @param expiresIn - Expiration time in seconds (default: 3600 = 1 hour)
   * @returns Signed URL or null if no image exists
   */
  async getFirstDriverLicenseUrl(
    profileId: string,
    expiresIn: number = 3600
  ): Promise<string | null> {
    const urls = await this.getDriverLicenseUrls(profileId, expiresIn);
    return urls.length > 0 ? urls[0] : null;
  },

  /**
   * Delete a specific driver license file
   * @param filePath - The full file path in the bucket (e.g., "profile_id/filename.jpg")
   * @returns True if deletion was successful
   */
  async deleteDriverLicenseFile(filePath: string): Promise<boolean> {
    try {
      const { error } = await supabase.storage
        .from("driver_licenses")
        .remove([filePath]);

      if (error) {
        console.error("Error deleting driver license file:", error);
        return false;
      }

      return true;
    } catch (err) {
      console.error("Error in deleteDriverLicenseFile:", err);
      return false;
    }
  },

  /**
   * Delete all driver license files for a user
   * @param profileId - The user's profile ID
   * @returns True if all deletions were successful
   */
  async deleteAllDriverLicenseFiles(profileId: string): Promise<boolean> {
    try {
      const files = await this.getDriverLicenseFiles(profileId);

      if (files.length === 0) {
        return true;
      }

      const { error } = await supabase.storage
        .from("driver_licenses")
        .remove(files);

      if (error) {
        console.error("Error deleting all driver license files:", error);
        return false;
      }

      return true;
    } catch (err) {
      console.error("Error in deleteAllDriverLicenseFiles:", err);
      return false;
    }
  },

  /**
   * Upload a driver license file
   * @param profileId - The user's profile ID
   * @param file - The file to upload
   * @returns The uploaded file path or null if upload failed
   */
  async uploadDriverLicenseFile(
    profileId: string,
    file: File
  ): Promise<string | null> {
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${profileId}/${Date.now()}_${Math.random()
        .toString(36)
        .substring(7)}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from("driver_licenses")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) {
        console.error("Error uploading driver license file:", error);
        return null;
      }

      return data.path;
    } catch (err) {
      console.error("Error in uploadDriverLicenseFile:", err);
      return null;
    }
  },
};
