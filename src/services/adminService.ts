import { supabase } from "../lib/supabase";

export type UserProfile = {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  user_type: "driver" | "owner";
  is_admin: boolean;
  created_at: string;
  updated_at: string;
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
  user_profile?: {
    full_name: string | null;
    email: string;
  };
};

export type RewardAccount = {
  user_id: string;
  balance_cents: number;
  currency: string;
  user_profile?: {
    full_name: string | null;
    email: string;
  };
};

// User Management Functions
export async function fetchAllUsers(): Promise<UserProfile[]> {
  const { data, error } = await supabase
    .from("profiles")
    .select(
      "id, email, full_name, phone, user_type, is_admin, created_at, updated_at"
    )
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function searchUsers(searchTerm: string): Promise<UserProfile[]> {
  const { data, error } = await supabase
    .from("profiles")
    .select(
      "id, email, full_name, phone, user_type, is_admin, created_at, updated_at"
    )
    .or(
      `email.ilike.%${searchTerm}%, full_name.ilike.%${searchTerm}%, phone.ilike.%${searchTerm}%`
    )
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

// Rewards Management Functions
export async function fetchAllWithdrawalRequests(): Promise<
  WithdrawalRequest[]
> {
  const { data, error } = await supabase
    .from("withdrawal_requests")
    .select(
      `
      id,
      user_id,
      status,
      user_notes,
      created_at,
      updated_at,
      processed_at,
      rejection_reason,
      admin_notes,
      user_profile:profiles!user_id (
        full_name,
        email
      )
    `
    )
    .order("created_at", { ascending: false });

  if (error) throw error;

  // Transform the data to handle the array structure from Supabase
  return (data ?? []).map((item: any) => ({
    ...item,
    user_profile: Array.isArray(item.user_profile)
      ? item.user_profile[0]
      : item.user_profile,
  }));
}

export async function fetchAllRewardAccounts(): Promise<RewardAccount[]> {
  const { data, error } = await supabase
    .from("reward_accounts")
    .select(
      `
      user_id,
      balance_cents,
      currency,
      user_profile:profiles!user_id (
        full_name,
        email,
        user_type
      )
    `
    )
    .order("balance_cents", { ascending: false });

  if (error) {
    console.error("Error fetching reward accounts:", error);
    throw error;
  }

  // Transform the data to handle the array structure from Supabase
  return (data ?? []).map((item: any) => ({
    ...item,
    user_profile: Array.isArray(item.user_profile)
      ? item.user_profile[0]
      : item.user_profile,
  }));
}

export async function processWithdrawalRequest(
  withdrawalId: string,
  newStatus: "processing" | "completed" | "rejected" | "cancelled",
  rejectionReason?: string,
  adminNotes?: string
): Promise<boolean> {
  const { data, error } = await supabase.rpc("process_withdrawal_request", {
    p_withdrawal_id: withdrawalId,
    p_new_status: newStatus,
    p_rejection_reason: rejectionReason || null,
    p_admin_notes: adminNotes || null,
  });

  if (error) {
    throw new Error(`Failed to process withdrawal request: ${error.message}`);
  }

  return data === true;
}

// Admin Verification
export async function verifyAdminAccess(): Promise<boolean> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (error || !profile) return false;
  return profile.is_admin === true;
}
