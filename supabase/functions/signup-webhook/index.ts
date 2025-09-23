// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

// Database webhook payload types based on Supabase documentation
type DatabaseWebhookPayload = {
  type: "INSERT" | "UPDATE" | "DELETE";
  table: string;
  schema: string;
  record: {
    id: string;
    email: string;
    created_at: string;
    [key: string]: any;
  };
  old_record: any;
};

type SignupWebhookBody = DatabaseWebhookPayload;

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": Deno.env.get("CORS_ORIGIN") ?? "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function jsonResponse(status: number, body: any) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", ...corsHeaders },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return jsonResponse(405, { error: "Method Not Allowed" });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceRoleKey) {
    return jsonResponse(500, {
      error: "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY",
    });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  let body: SignupWebhookBody | null = null;
  try {
    body = (await req.json()) as SignupWebhookBody;
  } catch (_) {
    return jsonResponse(400, { error: "Invalid JSON body" });
  }

  // Validate database webhook payload
  if (
    !body ||
    body.type !== "INSERT" ||
    body.table !== "profiles" ||
    body.schema !== "public"
  ) {
    return jsonResponse(400, {
      error: "Invalid webhook payload - expected INSERT on public.profiles",
    });
  }

  if (!body.record?.id) {
    return jsonResponse(400, {
      error: "Missing profile id in webhook payload",
    });
  }

  const inviteeId = body.record.id;

  // Since this webhook is triggered by the profiles table INSERT, the profile already exists
  // No need to check if profile exists - it's the trigger for this webhook

  // Get the user's email from auth.users table using the profile ID
  const { data: authUser, error: authUserError } =
    await supabase.auth.admin.getUserById(inviteeId);

  if (authUserError || !authUser?.user?.email) {
    console.error("Error getting user email:", authUserError);
    return jsonResponse(500, {
      error: "Failed to get user email from auth system",
    });
  }

  const inviteeEmail = authUser.user.email.trim();

  // Check if there's a pending referral with matching email
  let referral: { id: string; inviter_id: string } | null = null;

  if (inviteeEmail) {
    const { data: rByEmail, error: referralError } = await supabase
      .from("referrals")
      .select("id, inviter_id, status, invitee_email")
      .eq("status", "pending")
      .ilike("invitee_email", inviteeEmail)
      .order("created_at", { ascending: false })
      .limit(1);

    if (referralError) {
      console.error("Error querying referrals:", referralError);
      return jsonResponse(500, { error: "Failed to query referrals" });
    }

    if (rByEmail && rByEmail.length > 0) {
      referral = { id: rByEmail[0].id, inviter_id: rByEmail[0].inviter_id };
    }
  }

  if (!referral) {
    return jsonResponse(200, { status: "no_referral_found" });
  }

  // Mark referral accepted and link invitee
  const { error: updErr } = await supabase
    .from("referrals")
    .update({
      status: "accepted",
      invitee_user_id: inviteeId,
      accepted_at: new Date().toISOString(),
    })
    .eq("id", referral.id)
    .eq("status", "pending");

  if (updErr) {
    return jsonResponse(500, { error: updErr.message });
  }

  // Credit inviter using idempotency key
  const edgeEventId = `signup:${inviteeId}:${referral.id}`;
  const { error: creditErr } = await supabase.rpc("credit_signup_referral", {
    p_inviter_id: referral.inviter_id,
    p_invitee_id: inviteeId,
    p_referral_id: referral.id,
    p_edge_event_id: edgeEventId,
  } as any);

  if (creditErr) {
    // If unique violation due to idempotency, treat as success
    if (creditErr.message?.toLowerCase().includes("duplicate key")) {
      return jsonResponse(200, {
        status: "credited_already",
        message: "Referral already processed",
        referral_id: referral.id,
        inviter_id: referral.inviter_id,
      });
    }
    console.error("Error crediting referral:", creditErr);
    return jsonResponse(500, { error: creditErr.message });
  }

  return jsonResponse(200, {
    status: "credited",
    amount_cents: 200, // Updated to 2 CAD as per migration
    message: "Referral completed and inviter credited",
    referral_id: referral.id,
    inviter_id: referral.inviter_id,
    invitee_id: inviteeId,
  });
});
