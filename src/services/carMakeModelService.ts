import { supabase } from "../lib/supabase";
import { CarMake, CarModel, CarModelWithMake } from "../types";

export const carMakeModelService = {
  // Get all active car makes
  async getCarMakes(): Promise<CarMake[]> {
    const { data, error } = await supabase
      .from("car_makes")
      .select("*")
      .eq("is_active", true)
      .order("name");

    if (error) {
      console.error("Error fetching car makes:", error);
      throw error;
    }

    return data || [];
  },

  // Get car make by ID
  async getCarMakeById(makeId: string): Promise<CarMake | null> {
    const { data, error } = await supabase
      .from("car_makes")
      .select("*")
      .eq("id", makeId)
      .eq("is_active", true)
      .single();

    if (error) {
      console.error("Error fetching car make:", error);
      return null;
    }

    return data;
  },

  // Get car make by name
  async getCarMakeByName(name: string): Promise<CarMake | null> {
    const { data, error } = await supabase
      .from("car_makes")
      .select("*")
      .eq("name", name)
      .eq("is_active", true)
      .single();

    if (error) {
      console.error("Error fetching car make by name:", error);
      return null;
    }

    return data;
  },

  // Get all active car models
  async getCarModels(): Promise<CarModel[]> {
    const { data, error } = await supabase
      .from("car_models")
      .select("*")
      .eq("is_active", true)
      .order("name");

    if (error) {
      console.error("Error fetching car models:", error);
      throw error;
    }

    return data || [];
  },

  // Get car models by make ID
  async getCarModelsByMakeId(makeId: string): Promise<CarModel[]> {
    const { data, error } = await supabase
      .from("car_models")
      .select("*")
      .eq("make_id", makeId)
      .eq("is_active", true)
      .order("name");

    if (error) {
      console.error("Error fetching car models by make:", error);
      throw error;
    }

    return data || [];
  },

  // Get car models by make name
  async getCarModelsByMakeName(makeName: string): Promise<CarModel[]> {
    const { data, error } = await supabase
      .from("car_models")
      .select("*")
      .eq("car_makes.name", makeName)
      .eq("is_active", true)
      .order("name");

    if (error) {
      console.error("Error fetching car models by make name:", error);
      throw error;
    }

    return data || [];
  },

  // Get car models with make data
  async getCarModelsWithMake(): Promise<CarModelWithMake[]> {
    const { data, error } = await supabase
      .from("car_models")
      .select(
        `
        *,
        car_makes (*)
      `
      )
      .eq("is_active", true)
      .order("car_makes.name, name");

    if (error) {
      console.error("Error fetching car models with make:", error);
      throw error;
    }

    return data || [];
  },

  // Get car models by body type
  async getCarModelsByBodyType(bodyType: string): Promise<CarModelWithMake[]> {
    const { data, error } = await supabase
      .from("car_models")
      .select(
        `
        *,
        car_makes (*)
      `
      )
      .eq("body_type", bodyType)
      .eq("is_active", true)
      .order("car_makes.name, name");

    if (error) {
      console.error("Error fetching car models by body type:", error);
      throw error;
    }

    return data || [];
  },

  // Get car models by fuel type
  async getCarModelsByFuelType(fuelType: string): Promise<CarModelWithMake[]> {
    const { data, error } = await supabase
      .from("car_models")
      .select(
        `
        *,
        car_makes (*)
      `
      )
      .eq("fuel_type", fuelType)
      .eq("is_active", true)
      .order("car_makes.name, name");

    if (error) {
      console.error("Error fetching car models by fuel type:", error);
      throw error;
    }

    return data || [];
  },

  // Get car models by country
  async getCarModelsByCountry(country: string): Promise<CarModelWithMake[]> {
    const { data, error } = await supabase
      .from("car_models")
      .select(
        `
        *,
        car_makes (*)
      `
      )
      .eq("car_makes.country", country)
      .eq("is_active", true)
      .order("car_makes.name, name");

    if (error) {
      console.error("Error fetching car models by country:", error);
      throw error;
    }

    return data || [];
  },

  // Get car model by ID
  async getCarModelById(modelId: string): Promise<CarModel | null> {
    const { data, error } = await supabase
      .from("car_models")
      .select("*")
      .eq("id", modelId)
      .eq("is_active", true)
      .single();

    if (error) {
      console.error("Error fetching car model:", error);
      return null;
    }

    return data;
  },

  // Search car models by name
  async searchCarModels(query: string): Promise<CarModelWithMake[]> {
    const { data, error } = await supabase
      .from("car_models")
      .select(
        `
        *,
        car_makes (*)
      `
      )
      .ilike("name", `%${query}%`)
      .eq("is_active", true)
      .order("car_makes.name, name")
      .limit(20);

    if (error) {
      console.error("Error searching car models:", error);
      throw error;
    }

    return data || [];
  },

  // Get all unique body types
  async getBodyTypes(): Promise<string[]> {
    const { data, error } = await supabase
      .from("car_models")
      .select("body_type")
      .not("body_type", "is", null)
      .eq("is_active", true);

    if (error) {
      console.error("Error fetching body types:", error);
      throw error;
    }

    const uniqueBodyTypes = Array.from(
      new Set(data?.map((item) => item.body_type).filter(Boolean))
    );
    return uniqueBodyTypes.sort();
  },

  // Get all unique fuel types
  async getFuelTypes(): Promise<string[]> {
    const { data, error } = await supabase
      .from("car_models")
      .select("fuel_type")
      .not("fuel_type", "is", null)
      .eq("is_active", true);

    if (error) {
      console.error("Error fetching fuel types:", error);
      throw error;
    }

    const uniqueFuelTypes = Array.from(
      new Set(data?.map((item) => item.fuel_type).filter(Boolean))
    );
    return uniqueFuelTypes.sort();
  },

  // Get all unique countries
  async getCountries(): Promise<string[]> {
    const { data, error } = await supabase
      .from("car_makes")
      .select("country")
      .not("country", "is", null)
      .eq("is_active", true);

    if (error) {
      console.error("Error fetching countries:", error);
      throw error;
    }

    const uniqueCountries = Array.from(
      new Set(data?.map((item) => item.country).filter(Boolean))
    );
    return uniqueCountries.sort();
  },

  // Get car make and model data by matching names (for car display)
  async getCarMakeModelByName(
    makeName: string,
    modelName: string
  ): Promise<{
    make: CarMake | null;
    model: CarModel | null;
  }> {
    try {
      // First, try to find the make by name
      const { data: makeData, error: makeError } = await supabase
        .from("car_makes")
        .select("*")
        .ilike("name", makeName)
        .eq("is_active", true)
        .single();

      if (makeError || !makeData) {
        console.warn(`Car make not found: ${makeName}`);
        return { make: null, model: null };
      }

      // Then, try to find the model by name and make_id
      const { data: modelData, error: modelError } = await supabase
        .from("car_models")
        .select("*")
        .eq("make_id", makeData.id)
        .ilike("name", modelName)
        .eq("is_active", true)
        .single();

      if (modelError || !modelData) {
        console.warn(`Car model not found: ${modelName} for make ${makeName}`);
        return { make: makeData, model: null };
      }

      return { make: makeData, model: modelData };
    } catch (error) {
      console.error("Error fetching car make/model by name:", error);
      return { make: null, model: null };
    }
  },
};
