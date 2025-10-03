import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface WebhookPayload {
  type: "INSERT" | "UPDATE" | "DELETE";
  table: string;
  record?: any;
  old_record?: any;
  schema: string;
}

interface DriverDetails {
  id: string;
  profile_id: string;
  license_number: string | null;
}

interface ExtractedUserData {
  id: string;
  user_id: string;
  type: string;
  extracted_data: {
    license_number?: string | null;
  };
}

interface Profile {
  id: string;
  is_verified?: boolean;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Parse webhook payload
    const payload: WebhookPayload = await req.json();
    console.log("Webhook payload:", JSON.stringify(payload, null, 2));

    const { type, table, record, old_record } = payload;

    // Only process INSERT and UPDATE operations
    if (type !== "INSERT" && type !== "UPDATE") {
      console.log(`Skipping ${type} operation on ${table}`);
      return new Response(
        JSON.stringify({ message: `Skipped ${type} operation` }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let userId: string | null = null;
    let shouldVerify = false;

    if (table === "driver_details") {
      // Handle driver_details table changes
      const driverDetails = record as DriverDetails;
      userId = driverDetails.profile_id;
      shouldVerify = true;
      console.log(`Driver details ${type.toLowerCase()}d for user: ${userId}`);
    } else if (table === "extracted_user_data") {
      // Handle extracted_user_data table changes
      const extractedData = record as ExtractedUserData;

      // Only process drivers_license type
      if (extractedData.type === "drivers_license") {
        userId = extractedData.user_id;
        shouldVerify = true;
        console.log(
          `Extracted drivers license data ${type.toLowerCase()}d for user: ${userId}`
        );
      } else {
        console.log(`Skipping non-drivers_license type: ${extractedData.type}`);
        return new Response(
          JSON.stringify({ message: "Skipped non-drivers_license type" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    } else {
      console.log(`Unsupported table: ${table}`);
      return new Response(
        JSON.stringify({ message: `Unsupported table: ${table}` }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!shouldVerify || !userId) {
      console.log("No verification needed or missing user ID");
      return new Response(
        JSON.stringify({ message: "No verification needed" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get driver details
    const { data: driverDetails, error: driverError } = await supabaseClient
      .from("driver_details")
      .select("license_number")
      .eq("profile_id", userId)
      .single();

    if (driverError) {
      console.error("Error fetching driver details:", driverError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch driver details" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (!driverDetails || !driverDetails.license_number) {
      console.log(`No license number found for user ${userId}`);
      return new Response(
        JSON.stringify({ message: "No license number found" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get extracted drivers license data
    const { data: extractedData, error: extractedError } = await supabaseClient
      .from("extracted_user_data")
      .select("extracted_data")
      .eq("user_id", userId)
      .eq("type", "drivers_license")
      .single();

    if (extractedError) {
      console.error("Error fetching extracted data:", extractedError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch extracted data" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (!extractedData || !extractedData.extracted_data?.license_number) {
      console.log(`No extracted license number found for user ${userId}`);
      return new Response(
        JSON.stringify({ message: "No extracted license number found" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Compare license numbers (case insensitive)
    const driverLicenseNumber = driverDetails.license_number
      .trim()
      .toLowerCase();
    const extractedLicenseNumber = extractedData.extracted_data.license_number
      .trim()
      .toLowerCase();

    console.log(`Comparing license numbers:`);
    console.log(`Driver details: "${driverLicenseNumber}"`);
    console.log(`Extracted data: "${extractedLicenseNumber}"`);

    const licenseNumbersMatch = driverLicenseNumber === extractedLicenseNumber;

    if (licenseNumbersMatch) {
      // Update driver_details to set is_verified to true
      const { error: updateError } = await supabaseClient
        .from("driver_details")
        .update({ is_verified: true })
        .eq("profile_id", userId);

      if (updateError) {
        console.error(
          "Error updating driver verification status:",
          updateError
        );
        return new Response(
          JSON.stringify({ error: "Failed to update verification status" }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      console.log(`✅ User ${userId} verified successfully!`);
      return new Response(
        JSON.stringify({
          message: "User verified successfully",
          userId,
          verified: true,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else {
      console.log(`❌ License numbers do not match for user ${userId}`);
      return new Response(
        JSON.stringify({
          message: "License numbers do not match",
          userId,
          verified: false,
          driverLicense: driverLicenseNumber,
          extractedLicense: extractedLicenseNumber,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (error) {
    console.error("Error in verify-users function:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
