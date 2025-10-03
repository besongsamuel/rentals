import { supabase } from "../lib/supabase";

export interface CarData {
  make: string | null;
  model: string | null;
  license_plate: string | null;
}

export interface CarExtractionResponse {
  success: boolean;
  image_type: "car";
  data: CarData;
}

/**
 * Extract car data from an image using the extract-image-data edge function
 */
export async function extractCarData(imageUrl: string): Promise<CarData> {
  try {
    // Call the edge function
    const { data, error } = await supabase.functions.invoke(
      "extract-image-data",
      {
        body: {
          image: imageUrl,
          image_type: "car",
        },
      }
    );

    if (error) {
      throw new Error(`Edge function error: ${error.message}`);
    }

    if (!data.success) {
      throw new Error(data.error || "Failed to extract car data");
    }

    return data.data as CarData;
  } catch (error) {
    console.error("Error extracting car data:", error);
    throw error;
  }
}
