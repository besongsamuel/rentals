-- Add car makes and models tables for normalized car data
-- This migration creates normalized tables for car makes and models to improve data consistency

-- Create car_makes table
CREATE TABLE car_makes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  country TEXT,
  founded_year INTEGER,
  logo_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create car_models table
CREATE TABLE car_models (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  make_id UUID REFERENCES car_makes(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  year_start INTEGER,
  year_end INTEGER,
  body_type TEXT, -- sedan, SUV, hatchback, etc.
  fuel_type TEXT, -- gasoline, diesel, electric, hybrid
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(make_id, name, year_start)
);

-- Add indexes for better performance
CREATE INDEX idx_car_makes_name ON car_makes(name);
CREATE INDEX idx_car_makes_active ON car_makes(is_active);
CREATE INDEX idx_car_models_make_id ON car_models(make_id);
CREATE INDEX idx_car_models_name ON car_models(name);
CREATE INDEX idx_car_models_active ON car_models(is_active);
CREATE INDEX idx_car_models_years ON car_models(year_start, year_end);

-- Add comments for documentation
COMMENT ON TABLE car_makes IS 'Car manufacturers (Toyota, Ford, BMW, etc.)';
COMMENT ON TABLE car_models IS 'Car models for each make (Camry, F-150, X5, etc.)';

COMMENT ON COLUMN car_makes.name IS 'Name of the car manufacturer';
COMMENT ON COLUMN car_makes.country IS 'Country of origin of the manufacturer';
COMMENT ON COLUMN car_makes.founded_year IS 'Year the manufacturer was founded';
COMMENT ON COLUMN car_makes.logo_url IS 'URL to the manufacturer logo image';
COMMENT ON COLUMN car_makes.is_active IS 'Whether the manufacturer is still active';

COMMENT ON COLUMN car_models.make_id IS 'Reference to the car make';
COMMENT ON COLUMN car_models.name IS 'Name of the car model';
COMMENT ON COLUMN car_models.year_start IS 'First year this model was produced';
COMMENT ON COLUMN car_models.year_end IS 'Last year this model was produced (NULL if still in production)';
COMMENT ON COLUMN car_models.body_type IS 'Type of vehicle body (sedan, SUV, hatchback, etc.)';
COMMENT ON COLUMN car_models.fuel_type IS 'Type of fuel the vehicle uses';

-- Enable RLS on both tables
ALTER TABLE car_makes ENABLE ROW LEVEL SECURITY;
ALTER TABLE car_models ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for car_makes (READ-ONLY for now)
CREATE POLICY "Anyone can view car makes" ON car_makes
  FOR SELECT TO authenticated
  USING (true);

-- Create RLS policies for car_models (READ-ONLY for now)
CREATE POLICY "Anyone can view car models" ON car_models
  FOR SELECT TO authenticated
  USING (true);

-- Insert some common car makes
INSERT INTO car_makes (name, country, founded_year) VALUES
  ('Toyota', 'Japan', 1937),
  ('Honda', 'Japan', 1948),
  ('Ford', 'United States', 1903),
  ('Chevrolet', 'United States', 1911),
  ('BMW', 'Germany', 1916),
  ('Mercedes-Benz', 'Germany', 1926),
  ('Audi', 'Germany', 1909),
  ('Volkswagen', 'Germany', 1937),
  ('Nissan', 'Japan', 1933),
  ('Hyundai', 'South Korea', 1967),
  ('Kia', 'South Korea', 1944),
  ('Mazda', 'Japan', 1920),
  ('Subaru', 'Japan', 1953),
  ('Mitsubishi', 'Japan', 1970),
  ('Lexus', 'Japan', 1989),
  ('Infiniti', 'Japan', 1989),
  ('Acura', 'Japan', 1986),
  ('Genesis', 'South Korea', 2015),
  ('Volvo', 'Sweden', 1927),
  ('Jaguar', 'United Kingdom', 1935),
  ('Land Rover', 'United Kingdom', 1948),
  ('Porsche', 'Germany', 1931),
  ('Ferrari', 'Italy', 1939),
  ('Lamborghini', 'Italy', 1963),
  ('Maserati', 'Italy', 1914),
  ('Alfa Romeo', 'Italy', 1910),
  ('Fiat', 'Italy', 1899),
  ('Peugeot', 'France', 1810),
  ('Renault', 'France', 1899),
  ('Citroën', 'France', 1919);

-- Insert some common car models for popular makes
INSERT INTO car_models (make_id, name, year_start, year_end, body_type, fuel_type) VALUES
  -- Toyota models
  ((SELECT id FROM car_makes WHERE name = 'Toyota'), 'Camry', 1982, NULL, 'sedan', 'gasoline'),
  ((SELECT id FROM car_makes WHERE name = 'Toyota'), 'Corolla', 1966, NULL, 'sedan', 'gasoline'),
  ((SELECT id FROM car_makes WHERE name = 'Toyota'), 'RAV4', 1994, NULL, 'SUV', 'gasoline'),
  ((SELECT id FROM car_makes WHERE name = 'Toyota'), 'Highlander', 2000, NULL, 'SUV', 'gasoline'),
  ((SELECT id FROM car_makes WHERE name = 'Toyota'), 'Prius', 1997, NULL, 'hatchback', 'hybrid'),
  ((SELECT id FROM car_makes WHERE name = 'Toyota'), 'Tacoma', 1995, NULL, 'pickup', 'gasoline'),
  ((SELECT id FROM car_makes WHERE name = 'Toyota'), 'Tundra', 1999, NULL, 'pickup', 'gasoline'),
  
  -- Honda models
  ((SELECT id FROM car_makes WHERE name = 'Honda'), 'Civic', 1972, NULL, 'sedan', 'gasoline'),
  ((SELECT id FROM car_makes WHERE name = 'Honda'), 'Accord', 1976, NULL, 'sedan', 'gasoline'),
  ((SELECT id FROM car_makes WHERE name = 'Honda'), 'CR-V', 1995, NULL, 'SUV', 'gasoline'),
  ((SELECT id FROM car_makes WHERE name = 'Honda'), 'Pilot', 2002, NULL, 'SUV', 'gasoline'),
  ((SELECT id FROM car_makes WHERE name = 'Honda'), 'Fit', 2001, 2020, 'hatchback', 'gasoline'),
  ((SELECT id FROM car_makes WHERE name = 'Honda'), 'Ridgeline', 2005, NULL, 'pickup', 'gasoline'),
  
  -- Ford models
  ((SELECT id FROM car_makes WHERE name = 'Ford'), 'F-150', 1948, NULL, 'pickup', 'gasoline'),
  ((SELECT id FROM car_makes WHERE name = 'Ford'), 'Mustang', 1964, NULL, 'coupe', 'gasoline'),
  ((SELECT id FROM car_makes WHERE name = 'Ford'), 'Explorer', 1990, NULL, 'SUV', 'gasoline'),
  ((SELECT id FROM car_makes WHERE name = 'Ford'), 'Escape', 2000, NULL, 'SUV', 'gasoline'),
  ((SELECT id FROM car_makes WHERE name = 'Ford'), 'Focus', 1998, 2018, 'sedan', 'gasoline'),
  ((SELECT id FROM car_makes WHERE name = 'Ford'), 'Fusion', 2005, 2020, 'sedan', 'gasoline'),
  
  -- BMW models
  ((SELECT id FROM car_makes WHERE name = 'BMW'), '3 Series', 1975, NULL, 'sedan', 'gasoline'),
  ((SELECT id FROM car_makes WHERE name = 'BMW'), '5 Series', 1972, NULL, 'sedan', 'gasoline'),
  ((SELECT id FROM car_makes WHERE name = 'BMW'), 'X3', 2003, NULL, 'SUV', 'gasoline'),
  ((SELECT id FROM car_makes WHERE name = 'BMW'), 'X5', 1999, NULL, 'SUV', 'gasoline'),
  ((SELECT id FROM car_makes WHERE name = 'BMW'), 'i3', 2013, 2022, 'hatchback', 'electric'),
  ((SELECT id FROM car_makes WHERE name = 'BMW'), 'i8', 2014, 2020, 'coupe', 'hybrid'),
  
  -- Mercedes-Benz models
  ((SELECT id FROM car_makes WHERE name = 'Mercedes-Benz'), 'C-Class', 1993, NULL, 'sedan', 'gasoline'),
  ((SELECT id FROM car_makes WHERE name = 'Mercedes-Benz'), 'E-Class', 1993, NULL, 'sedan', 'gasoline'),
  ((SELECT id FROM car_makes WHERE name = 'Mercedes-Benz'), 'S-Class', 1972, NULL, 'sedan', 'gasoline'),
  ((SELECT id FROM car_makes WHERE name = 'Mercedes-Benz'), 'GLC', 2015, NULL, 'SUV', 'gasoline'),
  ((SELECT id FROM car_makes WHERE name = 'Mercedes-Benz'), 'GLE', 1997, NULL, 'SUV', 'gasoline'),
  ((SELECT id FROM car_makes WHERE name = 'Mercedes-Benz'), 'Sprinter', 1995, NULL, 'van', 'diesel');

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_car_makes_updated_at BEFORE UPDATE ON car_makes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_car_models_updated_at BEFORE UPDATE ON car_models
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
