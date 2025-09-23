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

export async function fetchRewardAccount(): Promise<RewardAccount | null> {
  const { data, error } = await supabase
    .from("reward_accounts")
    .select("user_id, balance_cents, currency")
    .eq("user_id", (await supabase.auth.getUser()).data.user?.id ?? "")
    .maybeSingle();
  if (error) throw error;
  return data || null;
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
