import { supabase } from "../lib/supabase";
import {
  CarExpense,
  CreateCarExpenseInput,
  UpdateCarExpenseInput,
} from "../types";

function toDateString(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export const carExpenseService = {
  async getCarExpensesForCar(
    carId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<CarExpense[]> {
    let query = supabase
      .from("car_expenses")
      .select("*")
      .eq("car_id", carId)
      .order("expense_date", { ascending: true });

    if (startDate) {
      query = query.gte("expense_date", toDateString(startDate));
    }
    if (endDate) {
      query = query.lte("expense_date", toDateString(endDate));
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching car expenses:", error);
      throw error;
    }

    return (data || []) as CarExpense[];
  },

  async insertCarExpense(
    input: CreateCarExpenseInput
  ): Promise<CarExpense> {
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session?.user?.id) {
      throw new Error("Not authenticated");
    }

    const payload = {
      car_id: input.car_id,
      amount: input.amount,
      currency: input.currency ?? "XAF",
      expense_date: input.expense_date,
      expense_type: input.expense_type,
      notes:
        input.expense_type === "other"
          ? input.notes?.trim() || null
          : input.notes?.trim() || null,
      created_by: session.user.id,
    };

    const { data: inserted, error: insertError } = await supabase
      .from("car_expenses")
      .insert(payload)
      .select("id")
      .single();

    if (insertError) {
      console.error("Error inserting car expense:", insertError);
      throw insertError;
    }

    const { data: row, error: selectError } = await supabase
      .from("car_expenses")
      .select("*")
      .eq("id", inserted.id)
      .maybeSingle();

    if (selectError) {
      console.error("Error loading car expense after insert:", selectError);
      throw selectError;
    }

    if (!row) {
      throw new Error("Car expense not found after insert");
    }

    return row as CarExpense;
  },

  async updateCarExpense(
    id: string,
    input: UpdateCarExpenseInput
  ): Promise<CarExpense> {
    const cleanPayload: Record<string, unknown> = {};
    if (input.amount !== undefined) cleanPayload.amount = input.amount;
    if (input.currency !== undefined) cleanPayload.currency = input.currency;
    if (input.expense_date !== undefined) {
      cleanPayload.expense_date = input.expense_date;
    }
    if (input.expense_type !== undefined) {
      cleanPayload.expense_type = input.expense_type;
    }
    if (input.notes !== undefined) {
      cleanPayload.notes = (input.notes ?? "").trim() || null;
    }

    const { error: updateError } = await supabase
      .from("car_expenses")
      .update(cleanPayload)
      .eq("id", id);

    if (updateError) {
      console.error("Error updating car expense:", updateError);
      throw updateError;
    }

    const { data: row, error: selectError } = await supabase
      .from("car_expenses")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (selectError) {
      console.error("Error loading car expense after update:", selectError);
      throw selectError;
    }

    if (!row) {
      throw new Error("Car expense not found after update");
    }

    return row as CarExpense;
  },

  async submitCarExpense(id: string): Promise<CarExpense> {
    const { error: updateError } = await supabase
      .from("car_expenses")
      .update({
        status: "submitted",
        submitted_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (updateError) {
      console.error("Error submitting car expense:", updateError);
      throw updateError;
    }

    const { data: row, error: selectError } = await supabase
      .from("car_expenses")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (selectError) {
      console.error("Error loading car expense after submit:", selectError);
      throw selectError;
    }

    if (!row) {
      throw new Error("Car expense not found after submit");
    }

    return row as CarExpense;
  },

  async approveCarExpense(id: string): Promise<CarExpense> {
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session?.user?.id) {
      throw new Error("Not authenticated");
    }

    const { error: updateError } = await supabase
      .from("car_expenses")
      .update({
        status: "approved",
        approved_at: new Date().toISOString(),
        approved_by: session.user.id,
      })
      .eq("id", id);

    if (updateError) {
      console.error("Error approving car expense:", updateError);
      throw updateError;
    }

    const { data: row, error: selectError } = await supabase
      .from("car_expenses")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (selectError) {
      console.error("Error loading car expense after approve:", selectError);
      throw selectError;
    }

    if (!row) {
      throw new Error("Car expense not found after approve");
    }

    return row as CarExpense;
  },

  async deleteCarExpense(id: string): Promise<void> {
    const { error } = await supabase.from("car_expenses").delete().eq("id", id);

    if (error) {
      console.error("Error deleting car expense:", error);
      throw error;
    }
  },
};
