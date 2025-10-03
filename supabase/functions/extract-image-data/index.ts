import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Define response schemas
interface CarData {
  make: string | null;
  model: string | null;
  license_plate: string | null;
}

interface DriversLicenseData {
  license_number: string | null;
  license_class: string | null;
  issue_date: string | null;
  expiry_date: string | null;
  issuing_authority: string | null;
  first_name: string | null;
  last_name: string | null;
}

interface RequestPayload {
  image: string; // Base64 encoded image or image URL
  image_type: "car" | "drivers_license";
}

interface SuccessResponse {
  success: true;
  image_type: "car" | "drivers_license";
  data: CarData | DriversLicenseData;
}

interface ErrorResponse {
  success: false;
  error: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { image, image_type }: RequestPayload = await req.json();

    // Validate input
    if (!image) {
      throw new Error("Image is required");
    }

    if (!image_type || !["car", "drivers_license"].includes(image_type)) {
      throw new Error("image_type must be either 'car' or 'drivers_license'");
    }

    // Get OpenAI API key from environment
    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiApiKey) {
      throw new Error("OPENAI_API_KEY is not configured");
    }

    // Determine if image is base64 or URL
    const isBase64 =
      image.startsWith("data:image") || !image.startsWith("http");
    const imageContent = isBase64 ? image : image;

    // Prepare the prompt based on image type
    let systemPrompt: string;
    let extractionInstructions: string;

    if (image_type === "car") {
      systemPrompt =
        "You are an expert at extracting car information from images.";
      extractionInstructions = `Extract the following information from the car image:
- make: The car manufacturer/brand (e.g., Toyota, Honda, Ford)
- model: The car model name (e.g., Camry, Civic, F-150)
- license_plate: The license plate number visible on the car

Return the data in the following JSON format:
{
  "make": "string or null",
  "model": "string or null", 
  "license_plate": "string or null"
}

If any information cannot be determined from the image, return null for that field.`;
    } else {
      systemPrompt =
        "You are an expert at extracting information from driver's license images.";
      extractionInstructions = `Extract the following information from the driver's license image:
- first_name: The holder's first name
- last_name: The holder's last name
- license_number: The driver's license number
- license_class: The license class/category (e.g., Class A, Class B, Class C, Class D)
- issue_date: The date the license was issued (format: YYYY-MM-DD)
- expiry_date: The expiration date of the license (format: YYYY-MM-DD)
- issuing_authority: The state, province, or authority that issued the license

Return the data in the following JSON format:
{
  "first_name": "string or null",
  "last_name": "string or null",
  "license_number": "string or null",
  "license_class": "string or null",
  "issue_date": "string or null",
  "expiry_date": "string or null",
  "issuing_authority": "string or null"
}

If any information cannot be determined from the image, return null for that field. 
For dates, always use YYYY-MM-DD format.`;
    }

    // Call OpenAI Vision API
    const openaiResponse = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${openaiApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: systemPrompt,
            },
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: extractionInstructions,
                },
                {
                  type: "image_url",
                  image_url: {
                    url: isBase64 ? imageContent : imageContent,
                    detail: "high",
                  },
                },
              ],
            },
          ],
          response_format: { type: "json_object" },
          max_tokens: 500,
          temperature: 0.1, // Low temperature for more consistent extraction
        }),
      }
    );

    if (!openaiResponse.ok) {
      const error = await openaiResponse.text();
      console.error("OpenAI API error:", error);
      throw new Error(`OpenAI API error: ${error}`);
    }

    const openaiData = await openaiResponse.json();
    const extractedData = JSON.parse(openaiData.choices[0].message.content);

    // Ensure all expected fields exist with null if missing
    let finalData: CarData | DriversLicenseData;

    if (image_type === "car") {
      finalData = {
        make: extractedData.make ?? null,
        model: extractedData.model ?? null,
        license_plate: extractedData.license_plate ?? null,
      } as CarData;
    } else {
      finalData = {
        license_number: extractedData.license_number ?? null,
        license_class: extractedData.license_class ?? null,
        issue_date: extractedData.issue_date ?? null,
        expiry_date: extractedData.expiry_date ?? null,
        issuing_authority: extractedData.issuing_authority ?? null,
        first_name: extractedData.first_name ?? null,
        last_name: extractedData.last_name ?? null,
      } as DriversLicenseData;
    }

    const response: SuccessResponse = {
      success: true,
      image_type,
      data: finalData,
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error extracting image data:", error);

    const errorResponse: ErrorResponse = {
      success: false,
      error: error.message || "Failed to extract image data",
    };

    return new Response(JSON.stringify(errorResponse), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
