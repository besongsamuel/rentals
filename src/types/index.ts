// Organization interface matching database schema
export interface Organization {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

// Profile interface matching database schema
export interface Profile {
  id: string; // Now directly references auth.users(id)
  email: string;
  full_name: string | null;
  user_type: "driver" | "owner";
  phone: string | null;
  organization_id: string;
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
  created_at: string;
  updated_at: string;
}

// CarOwner interface for many-to-many relationship
export interface CarOwner {
  id: string;
  car_id: string;
  owner_id: string;
  ownership_percentage: number;
  is_primary_owner: boolean;
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
  organization_id?: string;
}

// Type for creating car ownership
export interface CreateCarOwnerData {
  car_id: string;
  owner_id: string;
  ownership_percentage?: number;
  is_primary_owner?: boolean;
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
}

export interface CreateWeeklyReportData {
  car_id: string;
  week_start_date: string;
  week_end_date: string;
  start_mileage: number;
  end_mileage: number;
  driver_earnings?: number;
  maintenance_expenses?: number;
  ride_share_income?: number;
  rental_income?: number;
  currency?: string;
}
