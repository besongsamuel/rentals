import { supabase } from "../lib/supabase";

export type RewardAccount = {
  user_id: string;
  balance_cents: number;
  currency: string;
};

export type Referral = {
  id: string;
  invitee_email: string | null;
  invitee_user_id: string | null;
  referral_code: string;
  status: "pending" | "accepted" | "expired" | "cancelled";
  created_at: string;
  accepted_at: string | null;
};

export type WithdrawalRequest = {
  id: string;
  user_id: string;
  status: "pending" | "processing" | "completed" | "rejected" | "cancelled";
  user_notes: string | null;
  created_at: string;
  updated_at: string;
  processed_at: string | null;
  rejection_reason: string | null;
  admin_notes: string | null;
};

export async function fetchRewardAccount(): Promise<RewardAccount | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.id) return null;

  // First, try to get existing account
  let { data, error } = await supabase
    .from("reward_accounts")
    .select("user_id, balance_cents, currency")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) throw error;

  // If no account exists, create one automatically
  if (!data) {
    const { error: createError } = await supabase.rpc(
      "create_user_reward_account_if_not_exists"
    );
    if (createError) {
      console.error("Error creating reward account:", createError);
      // Return default account even if creation fails
      return { user_id: user.id, balance_cents: 0, currency: "CAD" };
    }

    // Try to fetch the newly created account
    const { data: newData, error: fetchError } = await supabase
      .from("reward_accounts")
      .select("user_id, balance_cents, currency")
      .eq("user_id", user.id)
      .single();

    if (fetchError) {
      console.error("Error fetching newly created reward account:", fetchError);
      // Return default account even if fetch fails
      return { user_id: user.id, balance_cents: 0, currency: "CAD" };
    }

    data = newData;
  }

  return data;
}

export async function fetchReferrals(): Promise<Referral[]> {
  const { data, error } = await supabase
    .from("referrals")
    .select(
      "id, invitee_email, invitee_user_id, referral_code, status, created_at, accepted_at"
    )
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function inviteUser(
  inviterId: string,
  inviteeEmail: string | null
) {
  const { data, error } = await supabase.functions.invoke("create-referral", {
    body: JSON.stringify({
      inviter_id: inviterId,
      invitee_email: inviteeEmail,
    }),
  });

  if (error) {
    throw new Error(`Invite failed: ${error.message}`);
  }

  return data;
}

export async function fetchWithdrawalRequests(): Promise<WithdrawalRequest[]> {
  const { data, error } = await supabase
    .from("withdrawal_requests")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function fetchPendingWithdrawalRequest(): Promise<WithdrawalRequest | null> {
  const { data, error } = await supabase
    .from("withdrawal_requests")
    .select("*")
    .in("status", ["pending", "processing"])
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function createWithdrawalRequest(
  userNotes: string
): Promise<{ withdrawal_id: string; status: string }> {
  const { data, error } = await supabase.rpc("create_withdrawal_request", {
    p_user_notes: userNotes || null,
  });

  if (error) {
    throw new Error(`Withdrawal request failed: ${error.message}`);
  }

  if (!data || data.length === 0) {
    throw new Error("Failed to create withdrawal request");
  }

  return {
    withdrawal_id: data[0].withdrawal_id,
    status: data[0].status,
  };
}
