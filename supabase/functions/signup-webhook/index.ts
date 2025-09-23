// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

type SignupWebhookBody = {
  user_id: string; // newly created auth.users.id
  email?: string; // optional
  referral_code?: string; // if present, use it directly
};

function jsonResponse(status: number, body: any) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

serve(async (req) => {
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

  if (!body?.user_id) {
    return jsonResponse(400, { error: "user_id is required" });
  }

  const inviteeId = body.user_id;
  const inviteeEmail = body.email?.trim() || null;
  const referralCode = body.referral_code?.trim() || null;

  // Make sure a profile exists for the new user (many apps create it via trigger)
  // If not, we cannot set accepted referral yet; return 202 to retry later.
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", inviteeId)
    .maybeSingle();
  if (!profile) {
    return jsonResponse(202, {
      status: "pending",
      reason: "profile_not_ready",
    });
  }

  // Resolve referral: prefer code, otherwise try pending by matching email
  let referral: { id: string; inviter_id: string } | null = null;

  if (referralCode) {
    const { data: rByCode } = await supabase
      .from("referrals")
      .select("id, inviter_id, status")
      .eq("referral_code", referralCode)
      .maybeSingle();
    if (rByCode && rByCode.status === "pending") {
      referral = { id: rByCode.id, inviter_id: rByCode.inviter_id };
    }
  }

  if (!referral && inviteeEmail) {
    const { data: rByEmail } = await supabase
      .from("referrals")
      .select("id, inviter_id, status")
      .eq("status", "pending")
      .ilike("invitee_email", inviteeEmail)
      .order("created_at", { ascending: false })
      .limit(1);
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

  // Credit inviter 100 cents using idempotency key
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
      return jsonResponse(200, { status: "credited_already" });
    }
    return jsonResponse(500, { error: creditErr.message });
  }

  return jsonResponse(200, { status: "credited", amount_cents: 100 });
});
