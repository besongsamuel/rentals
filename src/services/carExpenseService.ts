import { supabase } from "../lib/supabase";
import { CarExpense, CreateCarExpenseInput } from "../types";

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
};
