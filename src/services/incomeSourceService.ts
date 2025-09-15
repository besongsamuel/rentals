import { supabase } from "../lib/supabase";
import { IncomeSource } from "../types";

export interface CreateIncomeSourceData {
  weekly_report_id: string;
  source_type: "rentals" | "ride_share";
  amount: number;
  notes?: string;
}

export interface UpdateIncomeSourceData {
  source_type?: "rentals" | "ride_share";
  amount?: number;
  notes?: string;
}

export const incomeSourceService = {
  async getIncomeSourcesByReport(reportId: string): Promise<IncomeSource[]> {
    const { data, error } = await supabase
      .from("income_sources")
      .select("*")
      .eq("weekly_report_id", reportId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching income sources:", error);
      throw error;
    }

    return data || [];
  },

  async createIncomeSource(
    incomeSourceData: CreateIncomeSourceData
  ): Promise<IncomeSource> {
    const { data, error } = await supabase
      .from("income_sources")
      .insert(incomeSourceData)
      .select()
      .single();

    if (error) {
      console.error("Error creating income source:", error);
      throw error;
    }

    return data;
  },

  async updateIncomeSource(
    incomeSourceId: string,
    updates: UpdateIncomeSourceData
  ): Promise<IncomeSource> {
    const { data, error } = await supabase
      .from("income_sources")
      .update(updates)
      .eq("id", incomeSourceId)
      .select()
      .single();

    if (error) {
      console.error("Error updating income source:", error);
      throw error;
    }

    return data;
  },

  async deleteIncomeSource(incomeSourceId: string): Promise<void> {
    const { error } = await supabase
      .from("income_sources")
      .delete()
      .eq("id", incomeSourceId);

    if (error) {
      console.error("Error deleting income source:", error);
      throw error;
    }
  },

  async getIncomeSourceById(
    incomeSourceId: string
  ): Promise<IncomeSource | null> {
    const { data, error } = await supabase
      .from("income_sources")
      .select("*")
      .eq("id", incomeSourceId)
      .single();

    if (error) {
      console.error("Error fetching income source:", error);
      return null;
    }

    return data;
  },
};
