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
  country: string | null;
  referred_by: string | null;
  is_admin?: boolean; // default false
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
  is_available: boolean; // When true, car is publicly visible to all authenticated users
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
  taxi_income: number;
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
  country?: string;
  referred_by?: string;
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
  is_available?: boolean; // When true, car is publicly visible to all authenticated users (default: true)
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
  taxi_income?: number;
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

// Driver Details interface matching database schema
export interface DriverDetails {
  id: string;
  profile_id: string;
  date_of_birth: string | null;
  gender: "male" | "female" | "other" | "prefer_not_to_say" | null;
  nationality: string | null;
  languages: string[] | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  emergency_contact_relationship: string | null;
  address: string | null;
  city: string | null;
  state_province: string | null;
  postal_code: string | null;
  country: string;
  license_number: string | null;
  license_issue_date: string | null;
  license_expiry_date: string | null;
  license_class: string | null;
  license_issuing_authority: string | null;
  years_of_experience: number;
  preferred_transmission: "manual" | "automatic" | "both" | null;
  availability_status: "available" | "busy" | "unavailable" | "on_break";
  preferred_working_hours: any | null; // JSONB
  communication_preference: "phone" | "email" | "sms" | "whatsapp";
  // ID Card Information
  id_card_type:
    | "passport"
    | "national_id"
    | "residency_card"
    | "drivers_license"
    | "military_id"
    | "student_id"
    | "other"
    | null;
  id_card_number: string | null;
  id_card_expiry_date: string | null;
  created_at: string;
  updated_at: string;
  last_active_at: string;
}

// Driver Details with profile data (for joins)
export interface DriverDetailsWithProfile extends DriverDetails {
  profiles: Profile | null;
}

// Driver Rating interface matching database schema
export interface DriverRating {
  id: string;
  driver_id: string;
  rater_id: string;
  car_id: string | null;
  rating: number;
  comment: string | null;
  categories: any | null; // JSONB
  created_at: string;
  updated_at: string;
}

// Driver Rating with profile data (for joins)
export interface DriverRatingWithProfiles extends DriverRating {
  driver_profile: Profile | null;
  rater_profile: Profile | null;
  car: Car | null;
}

// Type for creating driver details
export interface CreateDriverDetailsData {
  profile_id: string;
  date_of_birth?: string;
  gender?: "male" | "female" | "other" | "prefer_not_to_say";
  nationality?: string;
  languages?: string[];
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relationship?: string;
  address?: string;
  city?: string;
  state_province?: string;
  postal_code?: string;
  country?: string;
  license_number?: string;
  license_issue_date?: string;
  license_expiry_date?: string;
  license_class?: string;
  license_issuing_authority?: string;
  years_of_experience?: number;
  preferred_transmission?: "manual" | "automatic" | "both";
  availability_status?: "available" | "busy" | "unavailable" | "on_break";
  preferred_working_hours?: any;
  communication_preference?: "phone" | "email" | "sms" | "whatsapp";
  // ID Card Information
  id_card_type?:
    | "passport"
    | "national_id"
    | "residency_card"
    | "drivers_license"
    | "military_id"
    | "student_id"
    | "other";
  id_card_number?: string;
  id_card_expiry_date?: string;
}

// Type for creating driver rating
export interface CreateDriverRatingData {
  driver_id: string;
  car_id?: string;
  rating: number;
  comment?: string;
  categories?: any;
}

// Analytics Types
export interface AnalyticsData {
  totalEarnings: number;
  totalRevenue: number;
  totalMileage: number;
  totalReports: number;
  assignedCars: number;
  totalCars: number;
}

export interface PerformanceMetrics {
  averageWeeklyEarnings: number;
  averageWeeklyMileage: number;
  earningsPerMile: number;
  carUtilization: number; // Percentage of cars being utilized
  last30DaysEarnings: number;
  last30DaysMileage: number;
  reportSubmissionRate: number; // Percentage of reports submitted on time
  activeDrivers: number; // Number of active drivers (for owners)
}

export interface ChartData {
  week: string;
  earnings: number;
  mileage: number;
  expenses: number;
  netEarnings: number;
}

// Car Assignment Request Types
export interface CarAssignmentRequest {
  id: string;
  car_id: string;
  driver_id: string;
  owner_id: string;
  status: "pending" | "approved" | "rejected" | "withdrawn" | "expired";
  available_start_date: string;
  available_end_date: string | null;
  preferred_working_hours: any; // JSONB
  max_hours_per_week: number | null;
  driver_notes: string | null;
  experience_details: string | null;
  reviewed_at: string | null;
  reviewed_by: string | null;
  rejection_reason: string | null;
  owner_notes: string | null;
  expires_at: string;
  created_at: string;
  updated_at: string;
}

export interface CreateCarAssignmentRequest {
  car_id: string;
  available_start_date: string;
  available_end_date?: string | null;
  preferred_working_hours?: any;
  max_hours_per_week?: number | null;
  driver_notes?: string;
  experience_details?: string;
}

export interface UpdateCarAssignmentRequest {
  available_start_date?: string;
  available_end_date?: string | null;
  preferred_working_hours?: any;
  max_hours_per_week?: number | null;
  driver_notes?: string;
  experience_details?: string;
}

export interface AssignmentRequestMessage {
  id: string;
  request_id: string;
  user_id: string;
  parent_message_id: string | null;
  content: string;
  is_internal: boolean;
  created_at: string;
  updated_at: string;
}

export interface AssignmentRequestMessageWithProfile
  extends AssignmentRequestMessage {
  profiles: Profile | null;
}

export interface CreateAssignmentRequestMessage {
  request_id: string;
  user_id: string;
  content: string;
  parent_message_id?: string;
  is_internal?: boolean;
}
