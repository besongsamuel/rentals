import { supabase } from "../lib/supabase";
import { Organization } from "../types";

export const organizationService = {
  async getAllOrganizations(): Promise<Organization[]> {
    const { data, error } = await supabase
      .from("organizations")
      .select("*")
      .order("name");

    if (error) {
      console.error("Error fetching organizations:", error);
      throw error;
    }

    return data || [];
  },

  async getOrganizationById(
    organizationId: string
  ): Promise<Organization | null> {
    const { data, error } = await supabase
      .from("organizations")
      .select("*")
      .eq("id", organizationId)
      .single();

    if (error) {
      console.error("Error fetching organization:", error);
      return null;
    }

    return data;
  },

  async getDefaultOrganization(): Promise<Organization | null> {
    // Get the default "Aftermath Car Management" organization
    const { data, error } = await supabase
      .from("organizations")
      .select("*")
      .eq("name", "Aftermath Car Management")
      .single();

    if (error) {
      console.error("Error fetching default organization:", error);
      return null;
    }

    return data;
  },
};
