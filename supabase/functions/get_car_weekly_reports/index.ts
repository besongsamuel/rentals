import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface RequestPayload {
  car_id: string;
}

interface WeeklyReport {
  id: string;
  car_id: string;
  driver_id: string;
  week_start_date: string;
  week_end_date: string;
  start_mileage: number;
  end_mileage: number;
  driver_earnings: number;
  maintenance_expenses: number;
  gas_expense: number;
  ride_share_income: number;
  rental_income: number;
  currency: string;
  status: string;
  submitted_at: string | null;
  approved_at: string | null;
  approved_by: string | null;
  created_at: string;
  updated_at: string;
}

interface SuccessResponse {
  success: true;
  reports: WeeklyReport[];
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
    // Initialize Supabase client with service role key for admin operations
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get the authorization header
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      throw new Error("Authorization header is required");
    }

    // Extract the JWT token
    const token = authHeader.replace("Bearer ", "");

    // Verify the JWT token and get user info
    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser(token);

    if (authError || !user) {
      throw new Error("Invalid or expired token");
    }

    const userId = user.id;

    // Parse request body
    const { car_id }: RequestPayload = await req.json();

    // Validate input
    if (!car_id) {
      throw new Error("car_id is required");
    }

    // Get user profile to determine user type
    const { data: profile, error: profileError } = await supabaseClient
      .from("profiles")
      .select("user_type")
      .eq("id", userId)
      .single();

    if (profileError || !profile) {
      throw new Error("User profile not found");
    }

    const userType = profile.user_type;

    // Check authorization based on user type
    let hasAccess = false;

    if (userType === "driver") {
      // For drivers: check if they are assigned to the car
      const { data: carAssignment, error: assignmentError } =
        await supabaseClient
          .from("cars")
          .select("driver_id")
          .eq("id", car_id)
          .single();

      if (assignmentError) {
        throw new Error("Failed to check car assignment");
      }

      hasAccess = carAssignment?.driver_id === userId;
    } else if (userType === "owner") {
      // For owners: check if they are the direct owner or an additional owner
      const { data: carOwnership, error: ownershipError } = await supabaseClient
        .from("cars")
        .select(
          `
          owner_id,
          car_owners!inner(owner_id)
        `
        )
        .eq("id", car_id)
        .single();

      if (ownershipError) {
        throw new Error("Failed to check car ownership");
      }

      // Check if user is the main owner
      const isMainOwner = carOwnership?.owner_id === userId;

      // Check if user is an additional owner
      const isAdditionalOwner = carOwnership?.car_owners?.some(
        (co: any) => co.owner_id === userId
      );

      hasAccess = isMainOwner || isAdditionalOwner;
    }

    if (!hasAccess) {
      return new Response(
        JSON.stringify({ success: false, error: "Access denied" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 403,
        }
      );
    }

    // Fetch weekly reports for the car
    const { data: reports, error: reportsError } = await supabaseClient
      .from("weekly_reports")
      .select("*")
      .eq("car_id", car_id)
      .order("week_start_date", { ascending: false });

    if (reportsError) {
      throw new Error("Failed to fetch weekly reports");
    }

    const response: SuccessResponse = {
      success: true,
      reports: reports || [],
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error in get_car_weekly_reports:", error);

    const errorResponse: ErrorResponse = {
      success: false,
      error: error.message || "Internal server error",
    };

    return new Response(JSON.stringify(errorResponse), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
