// Organization interface - REMOVED from database schema
// The organizations table has been dropped to simplify the application structure

// Car Make interface matching database schema
export interface CarMake {
  id: string;
  name: string;
  country: string | null;
  founded_year: number | null;
  logo_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Car Model interface matching database schema
export interface CarModel {
  id: string;
  make_id: string;
  name: string;
  year_start: number | null;
  year_end: number | null;
  body_type: string | null;
  fuel_type: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Car Model with Make data (for joins)
export interface CarModelWithMake extends CarModel {
  car_makes: CarMake | null;
}

// Profile interface matching database schema
export interface Profile {
  id: string; // Now directly references auth.users(id)
  email: string;
  full_name: string | null;
  user_type: "driver" | "owner";
  phone: string | null;
  created_at: string;
  updated_at: string;
}

// Car interface matching database schema
export interface Car {
  id: string;
  vin: string;
  make: string;
  model: string;
  year: number;
  color: string | null;
  license_plate: string | null;
  initial_mileage: number;
  current_mileage: number;
  owner_id: string | null; // Main owner of the car
  driver_id: string | null;
  status: "available" | "assigned" | "maintenance" | "retired";
  fuel_type: "gasoline" | "diesel" | "hybrid" | "electric" | null;
  transmission_type: "manual" | "automatic" | null;
  created_at: string;
  updated_at: string;
}

// CarOwner interface for many-to-many relationship
export interface CarOwner {
  id: string;
  car_id: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

// CarOwner with profile data (used when joining with profiles table)
export interface CarOwnerWithProfile extends CarOwner {
  profiles: Profile | null;
}

// Weekly Report interface matching database schema
export interface WeeklyReport {
  id: string;
  car_id: string;
  driver_id: string;
  week_start_date: string;
  week_end_date: string;
  start_mileage: number;
  end_mileage: number;
  driver_earnings: number;
  maintenance_expenses: number;
  gas_expense: number;
  ride_share_income: number;
  rental_income: number;
  currency: string;
  status: "draft" | "submitted" | "approved" | "rejected";
  submitted_at: string | null;
  approved_at: string | null;
  approved_by: string | null;
  created_at: string;
  updated_at: string;
}

// Car Assignment interface matching database schema
export interface CarAssignment {
  id: string;
  car_id: string;
  driver_id: string;
  assigned_at: string;
  unassigned_at: string | null;
  assigned_by: string;
  notes: string | null;
  created_at: string;
}

export type UserType = "driver" | "owner";

export interface CreateProfileData {
  full_name: string;
  user_type: UserType;
  phone?: string;
}

// Type for creating car ownership
export interface CreateCarOwnerData {
  car_id: string;
  owner_id: string;
}

export interface CreateCarData {
  vin: string;
  make: string;
  model: string;
  year: number;
  color?: string;
  license_plate?: string;
  initial_mileage?: number;
  owner_id: string; // Required - main owner of the car
  fuel_type?: "gasoline" | "diesel" | "hybrid" | "electric";
  transmission_type?: "manual" | "automatic";
}

export interface CreateWeeklyReportData {
  car_id: string;
  week_start_date: string;
  week_end_date: string;
  start_mileage: number;
  end_mileage: number;
  driver_earnings?: number;
  maintenance_expenses?: number;
  gas_expense?: number;
  ride_share_income?: number;
  rental_income?: number;
  currency?: string;
}

// Message interface for weekly report comments
export interface Message {
  id: string;
  weekly_report_id: string;
  user_id: string;
  parent_message_id: string | null; // For replies
  content: string;
  created_at: string;
  updated_at: string;
}

// Message with user profile data (for joins)
export interface MessageWithProfile extends Message {
  profiles: Profile | null;
}

// Message with nested replies
export interface MessageWithReplies extends MessageWithProfile {
  replies: MessageWithReplies[];
}

// Type for creating a new message
export interface CreateMessageData {
  weekly_report_id: string;
  content: string;
  parent_message_id?: string; // Optional for replies
}
