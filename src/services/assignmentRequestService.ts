import { supabase } from "../lib/supabase";
import {
  AssignmentRequestMessage,
  AssignmentRequestMessageWithProfile,
  CarAssignmentRequest,
  CreateAssignmentRequestMessage,
  CreateCarAssignmentRequest,
  UpdateCarAssignmentRequest,
} from "../types";

export const assignmentRequestService = {
  // Check if driver can send requests (profile complete)
  async canDriverSendRequest(driverId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc("can_driver_send_request", {
        driver_profile_id: driverId,
      });

      if (error) {
        console.error("Error checking driver eligibility:", error);
        return false;
      }

      return data || false;
    } catch (error) {
      console.error("Error in canDriverSendRequest:", error);
      return false;
    }
  },

  // Get existing request for a car by current user
  async getExistingRequest(
    carId: string,
    driverId: string
  ): Promise<CarAssignmentRequest | null> {
    try {
      const { data, error } = await supabase
        .from("car_assignment_requests")
        .select("*")
        .eq("car_id", carId)
        .eq("driver_id", driverId)
        .eq("status", "pending")
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          // No rows returned
          return null;
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.error("Error getting existing request:", error);
      return null;
    }
  },

  // Create a new assignment request
  async createRequest(
    request: CreateCarAssignmentRequest,
    ownerId: string,
    driverId: string
  ): Promise<{ data: CarAssignmentRequest | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from("car_assignment_requests")
        .insert({
          ...request,
          owner_id: ownerId,
          driver_id: driverId,
        })
        .select()
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Update an existing pending request
  async updateRequest(
    requestId: string,
    updates: UpdateCarAssignmentRequest
  ): Promise<{ data: CarAssignmentRequest | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from("car_assignment_requests")
        .update(updates)
        .eq("id", requestId)
        .eq("status", "pending")
        .select()
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Withdraw a pending request (driver only)
  async withdrawRequest(
    requestId: string
  ): Promise<{ data: CarAssignmentRequest | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from("car_assignment_requests")
        .update({ status: "withdrawn" })
        .eq("id", requestId)
        .eq("status", "pending")
        .select()
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Approve a request (owner only)
  async approveRequest(
    requestId: string,
    reviewerId: string
  ): Promise<{ data: CarAssignmentRequest | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from("car_assignment_requests")
        .update({
          status: "approved",
          reviewed_at: new Date().toISOString(),
          reviewed_by: reviewerId,
        })
        .eq("id", requestId)
        .eq("status", "pending")
        .select()
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Reject a request (owner only)
  async rejectRequest(
    requestId: string,
    reviewerId: string,
    rejectionReason?: string
  ): Promise<{ data: CarAssignmentRequest | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from("car_assignment_requests")
        .update({
          status: "rejected",
          reviewed_at: new Date().toISOString(),
          reviewed_by: reviewerId,
          rejection_reason: rejectionReason || null,
        })
        .eq("id", requestId)
        .eq("status", "pending")
        .select()
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Get all requests for a driver
  async getDriverRequests(
    driverId: string
  ): Promise<{ data: CarAssignmentRequest[]; error: any }> {
    try {
      const { data, error } = await supabase
        .from("car_assignment_requests")
        .select(
          `
          *,
          cars!car_assignment_requests_car_id_fkey (
            id,
            make,
            model,
            year,
            color,
            license_plate,
            status
          ),
          profiles!car_assignment_requests_owner_id_fkey (
            id,
            full_name,
            phone,
            email
          )
        `
        )
        .eq("driver_id", driverId)
        .order("created_at", { ascending: false });

      return { data: data || [], error };
    } catch (error) {
      return { data: [], error };
    }
  },

  // Get all requests for an owner
  async getOwnerRequests(
    ownerId: string
  ): Promise<{ data: CarAssignmentRequest[]; error: any }> {
    try {
      const { data, error } = await supabase
        .from("car_assignment_requests")
        .select(
          `
          *,
          cars!car_assignment_requests_car_id_fkey (
            id,
            make,
            model,
            year,
            color,
            license_plate,
            status
          ),
          profiles!car_assignment_requests_driver_id_fkey (
            id,
            full_name,
            phone,
            email,
            driver_details (
              years_of_experience,
              preferred_transmission,
              license_number,
              license_expiry_date
            )
          )
        `
        )
        .eq("owner_id", ownerId)
        .order("created_at", { ascending: false });

      return { data: data || [], error };
    } catch (error) {
      return { data: [], error };
    }
  },

  // Get a single request by ID
  async getRequest(
    requestId: string
  ): Promise<{ data: CarAssignmentRequest | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from("car_assignment_requests")
        .select(
          `
          *,
          cars!car_assignment_requests_car_id_fkey (
            id,
            make,
            model,
            year,
            color,
            license_plate,
            status
          ),
          profiles!car_assignment_requests_driver_id_fkey (
            id,
            full_name,
            phone,
            email
          ),
          owner:profiles!car_assignment_requests_owner_id_fkey (
            id,
            full_name,
            phone,
            email
          )
        `
        )
        .eq("id", requestId)
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Messages
  async getRequestMessages(
    requestId: string
  ): Promise<{ data: AssignmentRequestMessageWithProfile[]; error: any }> {
    try {
      const { data, error } = await supabase
        .from("assignment_request_messages")
        .select(
          `
          *,
          profiles (
            id,
            full_name,
            user_type
          )
        `
        )
        .eq("request_id", requestId)
        .order("created_at", { ascending: true });

      return { data: data || [], error };
    } catch (error) {
      return { data: [], error };
    }
  },

  async addMessage(
    message: CreateAssignmentRequestMessage
  ): Promise<{ data: AssignmentRequestMessage | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from("assignment_request_messages")
        .insert(message)
        .select()
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Expire old requests (utility function, can be called by cron or manually)
  async expireOldRequests(): Promise<{ error: any }> {
    try {
      const { error } = await supabase.rpc("expire_old_assignment_requests");
      return { error };
    } catch (error) {
      return { error };
    }
  },
};
