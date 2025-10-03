import { supabase } from "../lib/supabase";

export interface ExtractedUserData {
  id: string;
  user_id: string;
  type: "drivers_license" | "car_image";
  extracted_data: any;
  created_at: string;
  updated_at: string;
}

export interface CreateExtractedUserData {
  type: "drivers_license" | "car_image";
  extracted_data: any;
}

export class ExtractedUserDataService {
  /**
   * Get extracted data for a user by type
   */
  async getExtractedDataByType(
    userId: string,
    type: "drivers_license" | "car_image"
  ): Promise<ExtractedUserData | null> {
    const { data, error } = await supabase
      .from("extracted_user_data")
      .select("*")
      .eq("user_id", userId)
      .eq("type", type)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // No rows returned
        return null;
      }
      throw error;
    }

    return data;
  }

  /**
   * Get all extracted data for a user
   */
  async getAllExtractedData(userId: string): Promise<ExtractedUserData[]> {
    const { data, error } = await supabase
      .from("extracted_user_data")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    return data || [];
  }

  /**
   * Save or update extracted data for a user
   * Uses upsert to handle both insert and update cases
   */
  async saveExtractedData(
    userId: string,
    extractedData: CreateExtractedUserData
  ): Promise<ExtractedUserData> {
    const { data, error } = await supabase
      .from("extracted_user_data")
      .upsert(
        {
          user_id: userId,
          type: extractedData.type,
          extracted_data: extractedData.extracted_data,
        },
        {
          onConflict: "user_id,type",
        }
      )
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  }

  /**
   * Delete extracted data for a user by type
   */
  async deleteExtractedDataByType(
    userId: string,
    type: "drivers_license" | "car_image"
  ): Promise<void> {
    const { error } = await supabase
      .from("extracted_user_data")
      .delete()
      .eq("user_id", userId)
      .eq("type", type);

    if (error) {
      throw error;
    }
  }

  /**
   * Delete all extracted data for a user
   */
  async deleteAllExtractedData(userId: string): Promise<void> {
    const { error } = await supabase
      .from("extracted_user_data")
      .delete()
      .eq("user_id", userId);

    if (error) {
      throw error;
    }
  }
}

export const extractedUserDataService = new ExtractedUserDataService();
