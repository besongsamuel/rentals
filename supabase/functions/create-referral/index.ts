// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

type CreateReferralBody = {
  inviter_id?: string; // optional, will default to auth user if passed via Authorization header
  invitee_email?: string;
};

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

function generateReferralCode(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return code;
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

  let body: CreateReferralBody | null = null;
  try {
    body = (await req.json()) as CreateReferralBody;
  } catch (_) {
    return jsonResponse(400, { error: "Invalid JSON body" });
  }

  const inviterId = body?.inviter_id ?? null;
  const inviteeEmail = body?.invitee_email?.trim() || null;
  if (!inviterId) {
    return jsonResponse(400, { error: "inviter_id is required" });
  }

  // Validate inviter exists
  const { data: inviterProfile, error: inviterErr } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", inviterId)
    .single();
  if (inviterErr || !inviterProfile) {
    return jsonResponse(400, { error: "Invalid inviter_id" });
  }

  // Try reusing an existing pending referral for the same email
  if (inviteeEmail) {
    const { data: existing } = await supabase
      .from("referrals")
      .select("id, referral_code, status")
      .eq("inviter_id", inviterId)
      .eq("status", "pending")
      .ilike("invitee_email", inviteeEmail);

    if (existing && existing.length > 0) {
      const first = existing[0];
      return jsonResponse(200, {
        referral_id: first.id,
        referral_code: first.referral_code,
        status: first.status,
      });
    }
  }

  // Insert new referral with unique short code
  let code = generateReferralCode();
  for (let i = 0; i < 5; i++) {
    const { data: conflict } = await supabase
      .from("referrals")
      .select("id")
      .eq("referral_code", code)
      .maybeSingle();
    if (!conflict) break;
    code = generateReferralCode();
  }

  const { data: referral, error: insertErr } = await supabase
    .from("referrals")
    .insert({
      inviter_id: inviterId,
      invitee_email: inviteeEmail,
      referral_code: code,
      status: "pending",
    })
    .select("id, referral_code, status")
    .single();

  if (insertErr) {
    return jsonResponse(500, { error: insertErr.message });
  }

  // Optional: record a zero-amount ledger entry for observability
  await supabase.rpc("apply_reward_entry", {
    p_user_id: inviterId,
    p_amount_cents: 0,
    p_entry_type: "invite_sent",
    p_currency: "CAD",
    p_description: "Invite sent",
    p_related_user_id: null,
    p_referral_id: referral.id,
    p_edge_event_id: `invite:${inviterId}:${referral.id}`,
    p_metadata: { source: "create-referral" },
  } as any);

  return jsonResponse(201, {
    referral_id: referral.id,
    referral_code: referral.referral_code,
    status: referral.status,
  });
});
