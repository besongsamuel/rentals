import { supabase } from "../lib/supabase";

/**
 * Data extracted from car images
 */
export interface CarData {
  make: string | null;
  model: string | null;
  license_plate: string | null;
}

/**
 * Data extracted from driver's license images
 */
export interface DriversLicenseData {
  first_name: string | null;
  last_name: string | null;
  license_number: string | null;
  license_class: string | null;
  issue_date: string | null;
  expiry_date: string | null;
  issuing_authority: string | null;
}

export type ImageType = "car" | "drivers_license";

interface ExtractImageDataResponse {
  success: boolean;
  image_type: ImageType;
  data: CarData | DriversLicenseData;
  error?: string;
}

/**
 * Converts a File or Blob to base64 string
 */
const fileToBase64 = (file: File | Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Extract data from a car image using OpenAI Vision API
 * @param image - File, Blob, base64 string, or image URL
 * @returns Extracted car data (make, model, license_plate)
 */
export const extractCarData = async (
  image: File | Blob | string
): Promise<CarData> => {
  let imageData: string;

  if (typeof image === "string") {
    imageData = image;
  } else {
    imageData = await fileToBase64(image);
  }

  const { data, error } =
    await supabase.functions.invoke<ExtractImageDataResponse>(
      "extract-image-data",
      {
        body: {
          image: imageData,
          image_type: "car",
        },
      }
    );

  if (error) {
    throw new Error(`Failed to extract car data: ${error.message}`);
  }

  if (!data?.success) {
    throw new Error(data?.error || "Failed to extract car data");
  }

  return data.data as CarData;
};

/**
 * Extract data from a driver's license image using OpenAI Vision API
 * @param image - File, Blob, base64 string, or image URL
 * @returns Extracted license data (license_number, license_class, issue_date, expiry_date, issuing_authority)
 */
export const extractDriversLicenseData = async (
  image: File | Blob | string
): Promise<DriversLicenseData> => {
  let imageData: string;

  if (typeof image === "string") {
    imageData = image;
  } else {
    imageData = await fileToBase64(image);
  }

  const { data, error } =
    await supabase.functions.invoke<ExtractImageDataResponse>(
      "extract-image-data",
      {
        body: {
          image: imageData,
          image_type: "drivers_license",
        },
      }
    );

  if (error) {
    throw new Error(`Failed to extract license data: ${error.message}`);
  }

  if (!data?.success) {
    throw new Error(data?.error || "Failed to extract license data");
  }

  return data.data as DriversLicenseData;
};

/**
 * Generic function to extract data from any supported image type
 * @param image - File, Blob, base64 string, or image URL
 * @param imageType - Type of image ("car" or "drivers_license")
 * @returns Extracted data based on image type
 */
export const extractImageData = async (
  image: File | Blob | string,
  imageType: ImageType
): Promise<CarData | DriversLicenseData> => {
  if (imageType === "car") {
    return extractCarData(image);
  } else {
    return extractDriversLicenseData(image);
  }
};
