import { supabase } from "../lib/supabase";

export type TerminationReason =
  | "contract_completed"
  | "mutual_agreement"
  | "owner_terminated"
  | "driver_terminated"
  | "violation_of_terms"
  | "other";

export interface CreateDriverRatingInput {
  driver_id: string;
  rater_id: string;
  car_id: string;
  car_assignment_id: string;
  rating: number;
  comment?: string;
  categories?: Record<string, number>;
  would_recommend?: boolean;
  is_anonymous?: boolean;
  rating_type?: "contract_completion" | "ongoing_performance" | "other";
}

export const assignmentService = {
  async getActiveAssignmentByCar(carId: string) {
    const { data, error } = await supabase
      .from("car_assignments")
      .select("id, car_id, driver_id, assigned_at, unassigned_at, is_active")
      .eq("car_id", carId)
      .is("unassigned_at", null)
      .order("assigned_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async terminateContract(params: {
    car_assignment_id: string;
    termination_reason: TerminationReason;
    termination_notes?: string;
  }) {
    const { data, error } = await supabase.rpc("terminate_contract", {
      p_car_assignment_id: params.car_assignment_id,
      p_termination_reason: params.termination_reason,
      p_termination_notes: params.termination_notes ?? null,
    });
    if (error) throw error;
    return data as boolean;
  },

  async createDriverRating(input: CreateDriverRatingInput) {
    const { data, error } = await supabase
      .from("driver_ratings")
      .insert({
        driver_id: input.driver_id,
        rater_id: input.rater_id,
        car_id: input.car_id,
        car_assignment_id: input.car_assignment_id,
        rating: input.rating,
        comment: input.comment ?? null,
        categories: input.categories ? (input.categories as any) : null,
        would_recommend: input.would_recommend ?? null,
        is_anonymous: input.is_anonymous ?? false,
        rating_type: input.rating_type ?? "contract_completion",
      })
      .select("id")
      .single();
    if (error) throw error;
    return data;
  },

  async markRatingProvided(carAssignmentId: string, ratingId: string) {
    const { data, error } = await supabase.rpc("mark_rating_provided", {
      p_car_assignment_id: carAssignmentId,
      p_rating_id: ratingId,
    });
    if (error) throw error;
    return data as boolean;
  },
};
