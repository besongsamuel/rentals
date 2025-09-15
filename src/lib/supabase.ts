import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.REACT_APP_SUPABASE_URL ??
  "https://mqivlclsihkvhsdrtemg.supabase.co";
const supabaseKey =
  process.env.REACT_APP_SUPABASE_ANON_KEY ??
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xaXZsY2xzaWhrdmhzZHJ0ZW1nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc3ODMzMzYsImV4cCI6MjA3MzM1OTMzNn0.DssVDkuY21W_l2XocuEUGNmgHB_PsRRwXOz6UsKAfVE";

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase environment variables");
}

export const supabase = createClient(supabaseUrl, supabaseKey);
