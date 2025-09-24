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

export type UserStatistics = {
  total_users: number;
  total_drivers: number;
  total_owners: number;
  total_admins: number;
  users_by_country: Array<{
    country: string;
    count: number;
  }>;
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

// User Statistics
export async function fetchUserStatistics(): Promise<UserStatistics> {
  // Get total counts
  const { data: totalUsers, error: totalError } = await supabase
    .from("profiles")
    .select("id", { count: "exact" });

  if (totalError) throw totalError;

  const { data: drivers, error: driversError } = await supabase
    .from("profiles")
    .select("id", { count: "exact" })
    .eq("user_type", "driver");

  if (driversError) throw driversError;

  const { data: owners, error: ownersError } = await supabase
    .from("profiles")
    .select("id", { count: "exact" })
    .eq("user_type", "owner");

  if (ownersError) throw ownersError;

  const { data: admins, error: adminsError } = await supabase
    .from("profiles")
    .select("id", { count: "exact" })
    .eq("is_admin", true);

  if (adminsError) throw adminsError;

  // Get users by country
  const { data: countryData, error: countryError } = await supabase
    .from("profiles")
    .select("country")
    .not("country", "is", null);

  if (countryError) throw countryError;

  // Count users by country
  const countryCounts = countryData.reduce((acc, user) => {
    const country = user.country || "Unknown";
    acc[country] = (acc[country] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const usersByCountry = Object.entries(countryCounts)
    .map(([country, count]) => ({ country, count }))
    .sort((a, b) => b.count - a.count);

  return {
    total_users: totalUsers?.length || 0,
    total_drivers: drivers?.length || 0,
    total_owners: owners?.length || 0,
    total_admins: admins?.length || 0,
    users_by_country: usersByCountry,
  };
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
