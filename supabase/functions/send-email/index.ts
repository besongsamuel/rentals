import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Database Webhook payload structure
type DatabaseWebhookPayload = {
  type: "INSERT" | "UPDATE" | "DELETE";
  table: string;
  schema: string;
  record: {
    id: string;
    [key: string]: any;
  };
  old_record?: any;
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const payload: DatabaseWebhookPayload = await req.json();
    const { type: webhookType, table, record, old_record } = payload;

    console.log("Webhook received:", {
      webhookType,
      table,
      recordId: record.id,
    });

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // SendGrid API configuration
    const sendgridApiKey = Deno.env.get("SENDGRID_API_KEY");
    if (!sendgridApiKey) {
      throw new Error("SENDGRID_API_KEY is not configured");
    }

    let emailData;
    let templateId;

    // Determine email type based on table and webhook type
    if (
      table === "car_assignment_requests" &&
      webhookType === "INSERT" &&
      record.status === "pending"
    ) {
      // Handle drive request email
      templateId = Deno.env.get("SENDGRID_DRIVE_REQUEST_TEMPLATE_ID");

      // Fetch car and driver details
      const { data: requestData } = await supabase
        .from("car_assignment_requests")
        .select(
          `
          *,
          cars (
            make,
            model,
            year,
            license_plate
          ),
          driver:profiles!car_assignment_requests_driver_id_fkey (
            full_name,
            email,
            phone
          ),
          owner:profiles!car_assignment_requests_owner_id_fkey (
            full_name,
            email
          )
        `
        )
        .eq("id", record.id)
        .single();

      if (!requestData) {
        throw new Error("Request not found");
      }

      emailData = {
        to: requestData.owner.email,
        templateId: templateId,
        dynamicTemplateData: {
          owner_name: requestData.owner.full_name,
          driver_name: requestData.driver.full_name,
          driver_phone: requestData.driver.phone || "Not provided",
          driver_email: requestData.driver.email,
          car_make: requestData.cars.make,
          car_model: requestData.cars.model,
          car_year: requestData.cars.year,
          car_license_plate: requestData.cars.license_plate,
          start_date: requestData.available_start_date,
          end_date: requestData.available_end_date || "Indefinite",
          max_hours_per_week: requestData.max_hours_per_week || "Not specified",
          driver_notes: requestData.driver_notes || "No additional notes",
          experience_details: requestData.experience_details || "Not provided",
          request_id: record.id,
        },
      };
    } else if (
      table === "weekly_reports" &&
      webhookType === "UPDATE" &&
      old_record?.status !== "submitted" &&
      record.status === "submitted"
    ) {
      // Handle weekly report submitted email
      templateId = Deno.env.get("SENDGRID_WEEKLY_REPORT_TEMPLATE_ID");

      // Fetch report and car details
      const { data: reportData } = await supabase
        .from("weekly_reports")
        .select(
          `
          *,
          cars (
            make,
            model,
            year,
            license_plate,
            owner_id
          ),
          driver:profiles!weekly_reports_driver_id_fkey (
            full_name,
            email
          )
        `
        )
        .eq("id", record.id)
        .single();

      if (!reportData) {
        throw new Error("Report not found");
      }

      // Fetch owner details
      const { data: ownerData } = await supabase
        .from("profiles")
        .select("full_name, email")
        .eq("id", reportData.cars.owner_id)
        .single();

      if (!ownerData) {
        throw new Error("Owner not found");
      }

      emailData = {
        to: ownerData.email,
        templateId: templateId,
        dynamicTemplateData: {
          owner_name: ownerData.full_name,
          driver_name: reportData.driver.full_name,
          car_make: reportData.cars.make,
          car_model: reportData.cars.model,
          car_year: reportData.cars.year,
          car_license_plate: reportData.cars.license_plate,
          week_start: reportData.week_start_date,
          week_end: reportData.week_end_date,
          total_earnings: reportData.total_earnings,
          fuel_expenses: reportData.fuel_expenses || 0,
          maintenance_expenses: reportData.maintenance_expenses || 0,
          other_expenses: reportData.other_expenses || 0,
          net_earnings: reportData.net_earnings,
          total_distance: reportData.total_distance || 0,
          total_trips: reportData.total_trips || 0,
          notes: reportData.notes || "No additional notes",
          report_id: record.id,
        },
      };
    } else {
      // Not a webhook event we care about, return success without sending email
      console.log("Webhook event ignored:", {
        table,
        webhookType,
        status: record.status,
      });
      return new Response(
        JSON.stringify({
          success: true,
          message: "Webhook event ignored (not configured for email)",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // Send email via SendGrid
    const sendgridResponse = await fetch(
      "https://api.sendgrid.com/v3/mail/send",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${sendgridApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          personalizations: [
            {
              to: [{ email: emailData.to }],
              dynamic_template_data: emailData.dynamicTemplateData,
            },
          ],
          from: {
            email: Deno.env.get("SENDGRID_FROM_EMAIL") || "noreply@mokumbi.com",
            name: "mo kumbi",
          },
          template_id: emailData.templateId,
        }),
      }
    );

    if (!sendgridResponse.ok) {
      const error = await sendgridResponse.text();
      throw new Error(`SendGrid error: ${error}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Email sent successfully to ${emailData.to}`,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error sending email:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
