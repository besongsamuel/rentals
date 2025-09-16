-- Populate car makes and models with comprehensive data
-- This migration adds extensive car makes and models data to the database

-- Clear existing data (in case we need to re-run)
DELETE FROM car_models;
DELETE FROM car_makes;

-- Insert comprehensive car makes data
INSERT INTO car_makes (name, country, founded_year, logo_url, is_active) VALUES
  -- Japanese Manufacturers
  ('Toyota', 'Japan', 1937, 'https://logos-world.net/wp-content/uploads/2020/05/Toyota-Logo.png', true),
  ('Honda', 'Japan', 1948, 'https://logos-world.net/wp-content/uploads/2020/05/Honda-Logo.png', true),
  ('Nissan', 'Japan', 1933, 'https://logos-world.net/wp-content/uploads/2020/05/Nissan-Logo.png', true),
  ('Mazda', 'Japan', 1920, 'https://logos-world.net/wp-content/uploads/2020/05/Mazda-Logo.png', true),
  ('Subaru', 'Japan', 1953, 'https://logos-world.net/wp-content/uploads/2020/05/Subaru-Logo.png', true),
  ('Mitsubishi', 'Japan', 1970, 'https://logos-world.net/wp-content/uploads/2020/05/Mitsubishi-Logo.png', true),
  ('Lexus', 'Japan', 1989, 'https://logos-world.net/wp-content/uploads/2020/05/Lexus-Logo.png', true),
  ('Infiniti', 'Japan', 1989, 'https://logos-world.net/wp-content/uploads/2020/05/Infiniti-Logo.png', true),
  ('Acura', 'Japan', 1986, 'https://logos-world.net/wp-content/uploads/2020/05/Acura-Logo.png', true),
  ('Suzuki', 'Japan', 1909, 'https://logos-world.net/wp-content/uploads/2020/05/Suzuki-Logo.png', true),
  ('Isuzu', 'Japan', 1916, 'https://logos-world.net/wp-content/uploads/2020/05/Isuzu-Logo.png', true),
  ('Daihatsu', 'Japan', 1907, 'https://logos-world.net/wp-content/uploads/2020/05/Daihatsu-Logo.png', true),
  
  -- German Manufacturers
  ('BMW', 'Germany', 1916, 'https://logos-world.net/wp-content/uploads/2020/05/BMW-Logo.png', true),
  ('Mercedes-Benz', 'Germany', 1926, 'https://logos-world.net/wp-content/uploads/2020/05/Mercedes-Benz-Logo.png', true),
  ('Audi', 'Germany', 1909, 'https://logos-world.net/wp-content/uploads/2020/05/Audi-Logo.png', true),
  ('Volkswagen', 'Germany', 1937, 'https://logos-world.net/wp-content/uploads/2020/05/Volkswagen-Logo.png', true),
  ('Porsche', 'Germany', 1931, 'https://logos-world.net/wp-content/uploads/2020/05/Porsche-Logo.png', true),
  ('Opel', 'Germany', 1862, 'https://logos-world.net/wp-content/uploads/2020/05/Opel-Logo.png', true),
  ('Smart', 'Germany', 1994, 'https://logos-world.net/wp-content/uploads/2020/05/Smart-Logo.png', true),
  ('Maybach', 'Germany', 1909, 'https://logos-world.net/wp-content/uploads/2020/05/Maybach-Logo.png', true),
  
  -- American Manufacturers
  ('Ford', 'United States', 1903, 'https://logos-world.net/wp-content/uploads/2020/05/Ford-Logo.png', true),
  ('Chevrolet', 'United States', 1911, 'https://logos-world.net/wp-content/uploads/2020/05/Chevrolet-Logo.png', true),
  ('Cadillac', 'United States', 1902, 'https://logos-world.net/wp-content/uploads/2020/05/Cadillac-Logo.png', true),
  ('Buick', 'United States', 1903, 'https://logos-world.net/wp-content/uploads/2020/05/Buick-Logo.png', true),
  ('GMC', 'United States', 1912, 'https://logos-world.net/wp-content/uploads/2020/05/GMC-Logo.png', true),
  ('Chrysler', 'United States', 1925, 'https://logos-world.net/wp-content/uploads/2020/05/Chrysler-Logo.png', true),
  ('Dodge', 'United States', 1900, 'https://logos-world.net/wp-content/uploads/2020/05/Dodge-Logo.png', true),
  ('Jeep', 'United States', 1941, 'https://logos-world.net/wp-content/uploads/2020/05/Jeep-Logo.png', true),
  ('Ram', 'United States', 2009, 'https://logos-world.net/wp-content/uploads/2020/05/Ram-Logo.png', true),
  ('Lincoln', 'United States', 1917, 'https://logos-world.net/wp-content/uploads/2020/05/Lincoln-Logo.png', true),
  ('Tesla', 'United States', 2003, 'https://logos-world.net/wp-content/uploads/2020/05/Tesla-Logo.png', true),
  
  -- Korean Manufacturers
  ('Hyundai', 'South Korea', 1967, 'https://logos-world.net/wp-content/uploads/2020/05/Hyundai-Logo.png', true),
  ('Kia', 'South Korea', 1944, 'https://logos-world.net/wp-content/uploads/2020/05/Kia-Logo.png', true),
  ('Genesis', 'South Korea', 2015, 'https://logos-world.net/wp-content/uploads/2020/05/Genesis-Logo.png', true),
  ('SsangYong', 'South Korea', 1954, 'https://logos-world.net/wp-content/uploads/2020/05/SsangYong-Logo.png', true),
  
  -- European Manufacturers
  ('Volvo', 'Sweden', 1927, 'https://logos-world.net/wp-content/uploads/2020/05/Volvo-Logo.png', true),
  ('Saab', 'Sweden', 1945, 'https://logos-world.net/wp-content/uploads/2020/05/Saab-Logo.png', false),
  ('Jaguar', 'United Kingdom', 1935, 'https://logos-world.net/wp-content/uploads/2020/05/Jaguar-Logo.png', true),
  ('Land Rover', 'United Kingdom', 1948, 'https://logos-world.net/wp-content/uploads/2020/05/Land-Rover-Logo.png', true),
  ('Mini', 'United Kingdom', 1959, 'https://logos-world.net/wp-content/uploads/2020/05/Mini-Logo.png', true),
  ('Bentley', 'United Kingdom', 1919, 'https://logos-world.net/wp-content/uploads/2020/05/Bentley-Logo.png', true),
  ('Rolls-Royce', 'United Kingdom', 1904, 'https://logos-world.net/wp-content/uploads/2020/05/Rolls-Royce-Logo.png', true),
  ('Aston Martin', 'United Kingdom', 1913, 'https://logos-world.net/wp-content/uploads/2020/05/Aston-Martin-Logo.png', true),
  ('McLaren', 'United Kingdom', 1963, 'https://logos-world.net/wp-content/uploads/2020/05/McLaren-Logo.png', true),
  ('Lotus', 'United Kingdom', 1952, 'https://logos-world.net/wp-content/uploads/2020/05/Lotus-Logo.png', true),
  
  -- Italian Manufacturers
  ('Ferrari', 'Italy', 1939, 'https://logos-world.net/wp-content/uploads/2020/05/Ferrari-Logo.png', true),
  ('Lamborghini', 'Italy', 1963, 'https://logos-world.net/wp-content/uploads/2020/05/Lamborghini-Logo.png', true),
  ('Maserati', 'Italy', 1914, 'https://logos-world.net/wp-content/uploads/2020/05/Maserati-Logo.png', true),
  ('Alfa Romeo', 'Italy', 1910, 'https://logos-world.net/wp-content/uploads/2020/05/Alfa-Romeo-Logo.png', true),
  ('Fiat', 'Italy', 1899, 'https://logos-world.net/wp-content/uploads/2020/05/Fiat-Logo.png', true),
  ('Lancia', 'Italy', 1906, 'https://logos-world.net/wp-content/uploads/2020/05/Lancia-Logo.png', true),
  ('Pagani', 'Italy', 1992, 'https://logos-world.net/wp-content/uploads/2020/05/Pagani-Logo.png', true),
  
  -- French Manufacturers
  ('Peugeot', 'France', 1810, 'https://logos-world.net/wp-content/uploads/2020/05/Peugeot-Logo.png', true),
  ('Renault', 'France', 1899, 'https://logos-world.net/wp-content/uploads/2020/05/Renault-Logo.png', true),
  ('Citroën', 'France', 1919, 'https://logos-world.net/wp-content/uploads/2020/05/Citroen-Logo.png', true),
  ('DS', 'France', 2009, 'https://logos-world.net/wp-content/uploads/2020/05/DS-Logo.png', true),
  ('Alpine', 'France', 1955, 'https://logos-world.net/wp-content/uploads/2020/05/Alpine-Logo.png', true),
  ('Bugatti', 'France', 1909, 'https://logos-world.net/wp-content/uploads/2020/05/Bugatti-Logo.png', true),
  
  -- Other European Manufacturers
  ('Skoda', 'Czech Republic', 1895, 'https://logos-world.net/wp-content/uploads/2020/05/Skoda-Logo.png', true),
  ('Seat', 'Spain', 1950, 'https://logos-world.net/wp-content/uploads/2020/05/Seat-Logo.png', true),
  ('Cupra', 'Spain', 2018, 'https://logos-world.net/wp-content/uploads/2020/05/Cupra-Logo.png', true),
  ('Dacia', 'Romania', 1966, 'https://logos-world.net/wp-content/uploads/2020/05/Dacia-Logo.png', true),
  ('Lada', 'Russia', 1966, 'https://logos-world.net/wp-content/uploads/2020/05/Lada-Logo.png', true),
  
  -- Chinese Manufacturers
  ('BYD', 'China', 1995, 'https://logos-world.net/wp-content/uploads/2020/05/BYD-Logo.png', true),
  ('Geely', 'China', 1986, 'https://logos-world.net/wp-content/uploads/2020/05/Geely-Logo.png', true),
  ('Great Wall', 'China', 1984, 'https://logos-world.net/wp-content/uploads/2020/05/Great-Wall-Logo.png', true),
  ('Chery', 'China', 1997, 'https://logos-world.net/wp-content/uploads/2020/05/Chery-Logo.png', true),
  ('JAC', 'China', 1964, 'https://logos-world.net/wp-content/uploads/2020/05/JAC-Logo.png', true),
  ('MG', 'China', 1924, 'https://logos-world.net/wp-content/uploads/2020/05/MG-Logo.png', true),
  
  -- Indian Manufacturers
  ('Tata', 'India', 1945, 'https://logos-world.net/wp-content/uploads/2020/05/Tata-Logo.png', true),
  ('Mahindra', 'India', 1945, 'https://logos-world.net/wp-content/uploads/2020/05/Mahindra-Logo.png', true),
  ('Maruti Suzuki', 'India', 1981, 'https://logos-world.net/wp-content/uploads/2020/05/Maruti-Suzuki-Logo.png', true);

-- Insert comprehensive car models data
-- Toyota Models
INSERT INTO car_models (make_id, name, year_start, year_end, body_type, fuel_type, is_active) VALUES
  ((SELECT id FROM car_makes WHERE name = 'Toyota'), 'Camry', 1982, NULL, 'sedan', 'gasoline', true),
  ((SELECT id FROM car_makes WHERE name = 'Toyota'), 'Corolla', 1966, NULL, 'sedan', 'gasoline', true),
  ((SELECT id FROM car_makes WHERE name = 'Toyota'), 'RAV4', 1994, NULL, 'SUV', 'gasoline', true),
  ((SELECT id FROM car_makes WHERE name = 'Toyota'), 'Highlander', 2000, NULL, 'SUV', 'gasoline', true),
  ((SELECT id FROM car_makes WHERE name = 'Toyota'), 'Prius', 1997, NULL, 'hatchback', 'hybrid', true),
  ((SELECT id FROM car_makes WHERE name = 'Toyota'), 'Tacoma', 1995, NULL, 'pickup', 'gasoline', true),
  ((SELECT id FROM car_makes WHERE name = 'Toyota'), 'Tundra', 1999, NULL, 'pickup', 'gasoline', true),
  ((SELECT id FROM car_makes WHERE name = 'Toyota'), '4Runner', 1984, NULL, 'SUV', 'gasoline', true),
  ((SELECT id FROM car_makes WHERE name = 'Toyota'), 'Sequoia', 2000, NULL, 'SUV', 'gasoline', true),
  ((SELECT id FROM car_makes WHERE name = 'Toyota'), 'Sienna', 1997, NULL, 'minivan', 'gasoline', true),
  ((SELECT id FROM car_makes WHERE name = 'Toyota'), 'Avalon', 1994, 2022, 'sedan', 'gasoline', false),
  ((SELECT id FROM car_makes WHERE name = 'Toyota'), 'Yaris', 1999, 2020, 'hatchback', 'gasoline', false),
  ((SELECT id FROM car_makes WHERE name = 'Toyota'), 'C-HR', 2016, NULL, 'SUV', 'gasoline', true),
  ((SELECT id FROM car_makes WHERE name = 'Toyota'), 'Venza', 2008, 2015, 'SUV', 'gasoline', false),
  ((SELECT id FROM car_makes WHERE name = 'Toyota'), 'Mirai', 2014, NULL, 'sedan', 'hydrogen', true);

-- Honda Models
INSERT INTO car_models (make_id, name, year_start, year_end, body_type, fuel_type, is_active) VALUES
  ((SELECT id FROM car_makes WHERE name = 'Honda'), 'Civic', 1972, NULL, 'sedan', 'gasoline', true),
  ((SELECT id FROM car_makes WHERE name = 'Honda'), 'Accord', 1976, NULL, 'sedan', 'gasoline', true),
  ((SELECT id FROM car_makes WHERE name = 'Honda'), 'CR-V', 1995, NULL, 'SUV', 'gasoline', true),
  ((SELECT id FROM car_makes WHERE name = 'Honda'), 'Pilot', 2002, NULL, 'SUV', 'gasoline', true),
  ((SELECT id FROM car_makes WHERE name = 'Honda'), 'Fit', 2001, 2020, 'hatchback', 'gasoline', false),
  ((SELECT id FROM car_makes WHERE name = 'Honda'), 'Ridgeline', 2005, NULL, 'pickup', 'gasoline', true),
  ((SELECT id FROM car_makes WHERE name = 'Honda'), 'HR-V', 2015, NULL, 'SUV', 'gasoline', true),
  ((SELECT id FROM car_makes WHERE name = 'Honda'), 'Passport', 2018, NULL, 'SUV', 'gasoline', true),
  ((SELECT id FROM car_makes WHERE name = 'Honda'), 'Odyssey', 1994, NULL, 'minivan', 'gasoline', true),
  ((SELECT id FROM car_makes WHERE name = 'Honda'), 'Insight', 1999, 2022, 'sedan', 'hybrid', false),
  ((SELECT id FROM car_makes WHERE name = 'Honda'), 'Element', 2003, 2011, 'SUV', 'gasoline', false),
  ((SELECT id FROM car_makes WHERE name = 'Honda'), 'S2000', 1999, 2009, 'convertible', 'gasoline', false);

-- BMW Models
INSERT INTO car_models (make_id, name, year_start, year_end, body_type, fuel_type, is_active) VALUES
  ((SELECT id FROM car_makes WHERE name = 'BMW'), '3 Series', 1975, NULL, 'sedan', 'gasoline', true),
  ((SELECT id FROM car_makes WHERE name = 'BMW'), '5 Series', 1972, NULL, 'sedan', 'gasoline', true),
  ((SELECT id FROM car_makes WHERE name = 'BMW'), '7 Series', 1977, NULL, 'sedan', 'gasoline', true),
  ((SELECT id FROM car_makes WHERE name = 'BMW'), 'X1', 2009, NULL, 'SUV', 'gasoline', true),
  ((SELECT id FROM car_makes WHERE name = 'BMW'), 'X3', 2003, NULL, 'SUV', 'gasoline', true),
  ((SELECT id FROM car_makes WHERE name = 'BMW'), 'X5', 1999, NULL, 'SUV', 'gasoline', true),
  ((SELECT id FROM car_makes WHERE name = 'BMW'), 'X7', 2018, NULL, 'SUV', 'gasoline', true),
  ((SELECT id FROM car_makes WHERE name = 'BMW'), 'Z4', 2002, NULL, 'convertible', 'gasoline', true),
  ((SELECT id FROM car_makes WHERE name = 'BMW'), 'i3', 2013, 2022, 'hatchback', 'electric', false),
  ((SELECT id FROM car_makes WHERE name = 'BMW'), 'i8', 2014, 2020, 'coupe', 'hybrid', false),
  ((SELECT id FROM car_makes WHERE name = 'BMW'), 'iX', 2021, NULL, 'SUV', 'electric', true),
  ((SELECT id FROM car_makes WHERE name = 'BMW'), 'i4', 2021, NULL, 'sedan', 'electric', true),
  ((SELECT id FROM car_makes WHERE name = 'BMW'), 'M3', 1986, NULL, 'sedan', 'gasoline', true),
  ((SELECT id FROM car_makes WHERE name = 'BMW'), 'M5', 1984, NULL, 'sedan', 'gasoline', true);

-- Mercedes-Benz Models
INSERT INTO car_models (make_id, name, year_start, year_end, body_type, fuel_type, is_active) VALUES
  ((SELECT id FROM car_makes WHERE name = 'Mercedes-Benz'), 'C-Class', 1993, NULL, 'sedan', 'gasoline', true),
  ((SELECT id FROM car_makes WHERE name = 'Mercedes-Benz'), 'E-Class', 1993, NULL, 'sedan', 'gasoline', true),
  ((SELECT id FROM car_makes WHERE name = 'Mercedes-Benz'), 'S-Class', 1972, NULL, 'sedan', 'gasoline', true),
  ((SELECT id FROM car_makes WHERE name = 'Mercedes-Benz'), 'A-Class', 1997, NULL, 'hatchback', 'gasoline', true),
  ((SELECT id FROM car_makes WHERE name = 'Mercedes-Benz'), 'CLA', 2013, NULL, 'sedan', 'gasoline', true),
  ((SELECT id FROM car_makes WHERE name = 'Mercedes-Benz'), 'CLS', 2004, NULL, 'sedan', 'gasoline', true),
  ((SELECT id FROM car_makes WHERE name = 'Mercedes-Benz'), 'GLA', 2013, NULL, 'SUV', 'gasoline', true),
  ((SELECT id FROM car_makes WHERE name = 'Mercedes-Benz'), 'GLC', 2015, NULL, 'SUV', 'gasoline', true),
  ((SELECT id FROM car_makes WHERE name = 'Mercedes-Benz'), 'GLE', 1997, NULL, 'SUV', 'gasoline', true),
  ((SELECT id FROM car_makes WHERE name = 'Mercedes-Benz'), 'GLS', 2006, NULL, 'SUV', 'gasoline', true),
  ((SELECT id FROM car_makes WHERE name = 'Mercedes-Benz'), 'G-Class', 1979, NULL, 'SUV', 'gasoline', true),
  ((SELECT id FROM car_makes WHERE name = 'Mercedes-Benz'), 'Sprinter', 1995, NULL, 'van', 'diesel', true),
  ((SELECT id FROM car_makes WHERE name = 'Mercedes-Benz'), 'Metris', 2015, 2021, 'van', 'gasoline', false),
  ((SELECT id FROM car_makes WHERE name = 'Mercedes-Benz'), 'EQC', 2019, NULL, 'SUV', 'electric', true),
  ((SELECT id FROM car_makes WHERE name = 'Mercedes-Benz'), 'EQS', 2021, NULL, 'sedan', 'electric', true);

-- Ford Models
INSERT INTO car_models (make_id, name, year_start, year_end, body_type, fuel_type, is_active) VALUES
  ((SELECT id FROM car_makes WHERE name = 'Ford'), 'F-150', 1948, NULL, 'pickup', 'gasoline', true),
  ((SELECT id FROM car_makes WHERE name = 'Ford'), 'Mustang', 1964, NULL, 'coupe', 'gasoline', true),
  ((SELECT id FROM car_makes WHERE name = 'Ford'), 'Explorer', 1990, NULL, 'SUV', 'gasoline', true),
  ((SELECT id FROM car_makes WHERE name = 'Ford'), 'Escape', 2000, NULL, 'SUV', 'gasoline', true),
  ((SELECT id FROM car_makes WHERE name = 'Ford'), 'Edge', 2006, 2023, 'SUV', 'gasoline', false),
  ((SELECT id FROM car_makes WHERE name = 'Ford'), 'Expedition', 1996, NULL, 'SUV', 'gasoline', true),
  ((SELECT id FROM car_makes WHERE name = 'Ford'), 'Bronco', 1965, 1996, 'SUV', 'gasoline', false),
  ((SELECT id FROM car_makes WHERE name = 'Ford'), 'Bronco', 2020, NULL, 'SUV', 'gasoline', true),
  ((SELECT id FROM car_makes WHERE name = 'Ford'), 'Ranger', 1982, 2011, 'pickup', 'gasoline', false),
  ((SELECT id FROM car_makes WHERE name = 'Ford'), 'Ranger', 2018, NULL, 'pickup', 'gasoline', true),
  ((SELECT id FROM car_makes WHERE name = 'Ford'), 'Transit', 1965, NULL, 'van', 'gasoline', true),
  ((SELECT id FROM car_makes WHERE name = 'Ford'), 'Focus', 1998, 2018, 'sedan', 'gasoline', false),
  ((SELECT id FROM car_makes WHERE name = 'Ford'), 'Fusion', 2005, 2020, 'sedan', 'gasoline', false),
  ((SELECT id FROM car_makes WHERE name = 'Ford'), 'Mustang Mach-E', 2020, NULL, 'SUV', 'electric', true);

-- Tesla Models
INSERT INTO car_models (make_id, name, year_start, year_end, body_type, fuel_type, is_active) VALUES
  ((SELECT id FROM car_makes WHERE name = 'Tesla'), 'Model S', 2012, NULL, 'sedan', 'electric', true),
  ((SELECT id FROM car_makes WHERE name = 'Tesla'), 'Model 3', 2017, NULL, 'sedan', 'electric', true),
  ((SELECT id FROM car_makes WHERE name = 'Tesla'), 'Model X', 2015, NULL, 'SUV', 'electric', true),
  ((SELECT id FROM car_makes WHERE name = 'Tesla'), 'Model Y', 2020, NULL, 'SUV', 'electric', true),
  ((SELECT id FROM car_makes WHERE name = 'Tesla'), 'Roadster', 2008, 2012, 'convertible', 'electric', false),
  ((SELECT id FROM car_makes WHERE name = 'Tesla'), 'Cybertruck', 2023, NULL, 'pickup', 'electric', true);

-- Hyundai Models
INSERT INTO car_models (make_id, name, year_start, year_end, body_type, fuel_type, is_active) VALUES
  ((SELECT id FROM car_makes WHERE name = 'Hyundai'), 'Elantra', 1990, NULL, 'sedan', 'gasoline', true),
  ((SELECT id FROM car_makes WHERE name = 'Hyundai'), 'Sonata', 1985, NULL, 'sedan', 'gasoline', true),
  ((SELECT id FROM car_makes WHERE name = 'Hyundai'), 'Tucson', 2004, NULL, 'SUV', 'gasoline', true),
  ((SELECT id FROM car_makes WHERE name = 'Hyundai'), 'Santa Fe', 2000, NULL, 'SUV', 'gasoline', true),
  ((SELECT id FROM car_makes WHERE name = 'Hyundai'), 'Palisade', 2018, NULL, 'SUV', 'gasoline', true),
  ((SELECT id FROM car_makes WHERE name = 'Hyundai'), 'Kona', 2017, NULL, 'SUV', 'gasoline', true),
  ((SELECT id FROM car_makes WHERE name = 'Hyundai'), 'Venue', 2019, NULL, 'SUV', 'gasoline', true),
  ((SELECT id FROM car_makes WHERE name = 'Hyundai'), 'Ioniq', 2016, NULL, 'hatchback', 'hybrid', true),
  ((SELECT id FROM car_makes WHERE name = 'Hyundai'), 'Ioniq 5', 2021, NULL, 'SUV', 'electric', true),
  ((SELECT id FROM car_makes WHERE name = 'Hyundai'), 'Ioniq 6', 2022, NULL, 'sedan', 'electric', true),
  ((SELECT id FROM car_makes WHERE name = 'Hyundai'), 'Genesis', 2008, 2016, 'sedan', 'gasoline', false),
  ((SELECT id FROM car_makes WHERE name = 'Hyundai'), 'Veloster', 2011, 2022, 'hatchback', 'gasoline', false);

-- Kia Models
INSERT INTO car_models (make_id, name, year_start, year_end, body_type, fuel_type, is_active) VALUES
  ((SELECT id FROM car_makes WHERE name = 'Kia'), 'Forte', 2008, NULL, 'sedan', 'gasoline', true),
  ((SELECT id FROM car_makes WHERE name = 'Kia'), 'Optima', 2000, 2020, 'sedan', 'gasoline', false),
  ((SELECT id FROM car_makes WHERE name = 'Kia'), 'K5', 2020, NULL, 'sedan', 'gasoline', true),
  ((SELECT id FROM car_makes WHERE name = 'Kia'), 'Sportage', 1993, NULL, 'SUV', 'gasoline', true),
  ((SELECT id FROM car_makes WHERE name = 'Kia'), 'Sorento', 2002, NULL, 'SUV', 'gasoline', true),
  ((SELECT id FROM car_makes WHERE name = 'Kia'), 'Telluride', 2018, NULL, 'SUV', 'gasoline', true),
  ((SELECT id FROM car_makes WHERE name = 'Kia'), 'Seltos', 2019, NULL, 'SUV', 'gasoline', true),
  ((SELECT id FROM car_makes WHERE name = 'Kia'), 'Soul', 2008, NULL, 'hatchback', 'gasoline', true),
  ((SELECT id FROM car_makes WHERE name = 'Kia'), 'Niro', 2016, NULL, 'SUV', 'hybrid', true),
  ((SELECT id FROM car_makes WHERE name = 'Kia'), 'EV6', 2021, NULL, 'SUV', 'electric', true),
  ((SELECT id FROM car_makes WHERE name = 'Kia'), 'Stinger', 2017, 2023, 'sedan', 'gasoline', false);

-- Nissan Models
INSERT INTO car_models (make_id, name, year_start, year_end, body_type, fuel_type, is_active) VALUES
  ((SELECT id FROM car_makes WHERE name = 'Nissan'), 'Altima', 1992, NULL, 'sedan', 'gasoline', true),
  ((SELECT id FROM car_makes WHERE name = 'Nissan'), 'Sentra', 1982, NULL, 'sedan', 'gasoline', true),
  ((SELECT id FROM car_makes WHERE name = 'Nissan'), 'Maxima', 1981, NULL, 'sedan', 'gasoline', true),
  ((SELECT id FROM car_makes WHERE name = 'Nissan'), 'Rogue', 2007, NULL, 'SUV', 'gasoline', true),
  ((SELECT id FROM car_makes WHERE name = 'Nissan'), 'Murano', 2002, NULL, 'SUV', 'gasoline', true),
  ((SELECT id FROM car_makes WHERE name = 'Nissan'), 'Pathfinder', 1985, NULL, 'SUV', 'gasoline', true),
  ((SELECT id FROM car_makes WHERE name = 'Nissan'), 'Armada', 2003, NULL, 'SUV', 'gasoline', true),
  ((SELECT id FROM car_makes WHERE name = 'Nissan'), 'Frontier', 1997, NULL, 'pickup', 'gasoline', true),
  ((SELECT id FROM car_makes WHERE name = 'Nissan'), 'Titan', 2003, NULL, 'pickup', 'gasoline', true),
  ((SELECT id FROM car_makes WHERE name = 'Nissan'), 'Leaf', 2010, NULL, 'hatchback', 'electric', true),
  ((SELECT id FROM car_makes WHERE name = 'Nissan'), 'Ariya', 2022, NULL, 'SUV', 'electric', true),
  ((SELECT id FROM car_makes WHERE name = 'Nissan'), '370Z', 2008, 2020, 'coupe', 'gasoline', false),
  ((SELECT id FROM car_makes WHERE name = 'Nissan'), 'GT-R', 2007, NULL, 'coupe', 'gasoline', true);

-- Audi Models
INSERT INTO car_models (make_id, name, year_start, year_end, body_type, fuel_type, is_active) VALUES
  ((SELECT id FROM car_makes WHERE name = 'Audi'), 'A3', 1996, NULL, 'sedan', 'gasoline', true),
  ((SELECT id FROM car_makes WHERE name = 'Audi'), 'A4', 1994, NULL, 'sedan', 'gasoline', true),
  ((SELECT id FROM car_makes WHERE name = 'Audi'), 'A6', 1994, NULL, 'sedan', 'gasoline', true),
  ((SELECT id FROM car_makes WHERE name = 'Audi'), 'A8', 1994, NULL, 'sedan', 'gasoline', true),
  ((SELECT id FROM car_makes WHERE name = 'Audi'), 'Q3', 2011, NULL, 'SUV', 'gasoline', true),
  ((SELECT id FROM car_makes WHERE name = 'Audi'), 'Q5', 2008, NULL, 'SUV', 'gasoline', true),
  ((SELECT id FROM car_makes WHERE name = 'Audi'), 'Q7', 2005, NULL, 'SUV', 'gasoline', true),
  ((SELECT id FROM car_makes WHERE name = 'Audi'), 'Q8', 2018, NULL, 'SUV', 'gasoline', true),
  ((SELECT id FROM car_makes WHERE name = 'Audi'), 'TT', 1998, NULL, 'coupe', 'gasoline', true),
  ((SELECT id FROM car_makes WHERE name = 'Audi'), 'R8', 2006, NULL, 'coupe', 'gasoline', true),
  ((SELECT id FROM car_makes WHERE name = 'Audi'), 'e-tron', 2018, NULL, 'SUV', 'electric', true),
  ((SELECT id FROM car_makes WHERE name = 'Audi'), 'e-tron GT', 2021, NULL, 'sedan', 'electric', true);

-- Volkswagen Models
INSERT INTO car_models (make_id, name, year_start, year_end, body_type, fuel_type, is_active) VALUES
  ((SELECT id FROM car_makes WHERE name = 'Volkswagen'), 'Jetta', 1979, NULL, 'sedan', 'gasoline', true),
  ((SELECT id FROM car_makes WHERE name = 'Volkswagen'), 'Passat', 1973, NULL, 'sedan', 'gasoline', true),
  ((SELECT id FROM car_makes WHERE name = 'Volkswagen'), 'Golf', 1974, NULL, 'hatchback', 'gasoline', true),
  ((SELECT id FROM car_makes WHERE name = 'Volkswagen'), 'Tiguan', 2007, NULL, 'SUV', 'gasoline', true),
  ((SELECT id FROM car_makes WHERE name = 'Volkswagen'), 'Atlas', 2017, NULL, 'SUV', 'gasoline', true),
  ((SELECT id FROM car_makes WHERE name = 'Volkswagen'), 'ID.4', 2020, NULL, 'SUV', 'electric', true),
  ((SELECT id FROM car_makes WHERE name = 'Volkswagen'), 'ID.Buzz', 2022, NULL, 'van', 'electric', true),
  ((SELECT id FROM car_makes WHERE name = 'Volkswagen'), 'Arteon', 2017, NULL, 'sedan', 'gasoline', true),
  ((SELECT id FROM car_makes WHERE name = 'Volkswagen'), 'Beetle', 1997, 2019, 'coupe', 'gasoline', false),
  ((SELECT id FROM car_makes WHERE name = 'Volkswagen'), 'CC', 2008, 2017, 'sedan', 'gasoline', false);

-- Chevrolet Models
INSERT INTO car_models (make_id, name, year_start, year_end, body_type, fuel_type, is_active) VALUES
  ((SELECT id FROM car_makes WHERE name = 'Chevrolet'), 'Malibu', 1964, NULL, 'sedan', 'gasoline', true),
  ((SELECT id FROM car_makes WHERE name = 'Chevrolet'), 'Cruze', 2008, 2019, 'sedan', 'gasoline', false),
  ((SELECT id FROM car_makes WHERE name = 'Chevrolet'), 'Equinox', 2004, NULL, 'SUV', 'gasoline', true),
  ((SELECT id FROM car_makes WHERE name = 'Chevrolet'), 'Traverse', 2008, NULL, 'SUV', 'gasoline', true),
  ((SELECT id FROM car_makes WHERE name = 'Chevrolet'), 'Tahoe', 1995, NULL, 'SUV', 'gasoline', true),
  ((SELECT id FROM car_makes WHERE name = 'Chevrolet'), 'Suburban', 1935, NULL, 'SUV', 'gasoline', true),
  ((SELECT id FROM car_makes WHERE name = 'Chevrolet'), 'Silverado', 1998, NULL, 'pickup', 'gasoline', true),
  ((SELECT id FROM car_makes WHERE name = 'Chevrolet'), 'Colorado', 2004, NULL, 'pickup', 'gasoline', true),
  ((SELECT id FROM car_makes WHERE name = 'Chevrolet'), 'Camaro', 1966, NULL, 'coupe', 'gasoline', true),
  ((SELECT id FROM car_makes WHERE name = 'Chevrolet'), 'Corvette', 1953, NULL, 'coupe', 'gasoline', true),
  ((SELECT id FROM car_makes WHERE name = 'Chevrolet'), 'Bolt EV', 2016, NULL, 'hatchback', 'electric', true),
  ((SELECT id FROM car_makes WHERE name = 'Chevrolet'), 'Bolt EUV', 2021, NULL, 'SUV', 'electric', true);

-- Add some luxury and sports car models
INSERT INTO car_models (make_id, name, year_start, year_end, body_type, fuel_type, is_active) VALUES
  -- Ferrari Models
  ((SELECT id FROM car_makes WHERE name = 'Ferrari'), '488 GTB', 2015, 2019, 'coupe', 'gasoline', false),
  ((SELECT id FROM car_makes WHERE name = 'Ferrari'), 'F8 Tributo', 2019, NULL, 'coupe', 'gasoline', true),
  ((SELECT id FROM car_makes WHERE name = 'Ferrari'), 'SF90 Stradale', 2019, NULL, 'coupe', 'hybrid', true),
  ((SELECT id FROM car_makes WHERE name = 'Ferrari'), 'Roma', 2019, NULL, 'coupe', 'gasoline', true),
  ((SELECT id FROM car_makes WHERE name = 'Ferrari'), 'Portofino', 2017, NULL, 'convertible', 'gasoline', true),
  
  -- Lamborghini Models
  ((SELECT id FROM car_makes WHERE name = 'Lamborghini'), 'Huracán', 2014, NULL, 'coupe', 'gasoline', true),
  ((SELECT id FROM car_makes WHERE name = 'Lamborghini'), 'Aventador', 2011, 2022, 'coupe', 'gasoline', false),
  ((SELECT id FROM car_makes WHERE name = 'Lamborghini'), 'Urus', 2017, NULL, 'SUV', 'gasoline', true),
  ((SELECT id FROM car_makes WHERE name = 'Lamborghini'), 'Revuelto', 2023, NULL, 'coupe', 'hybrid', true),
  
  -- Porsche Models
  ((SELECT id FROM car_makes WHERE name = 'Porsche'), '911', 1963, NULL, 'coupe', 'gasoline', true),
  ((SELECT id FROM car_makes WHERE name = 'Porsche'), 'Cayenne', 2002, NULL, 'SUV', 'gasoline', true),
  ((SELECT id FROM car_makes WHERE name = 'Porsche'), 'Macan', 2014, NULL, 'SUV', 'gasoline', true),
  ((SELECT id FROM car_makes WHERE name = 'Porsche'), 'Panamera', 2009, NULL, 'sedan', 'gasoline', true),
  ((SELECT id FROM car_makes WHERE name = 'Porsche'), 'Taycan', 2019, NULL, 'sedan', 'electric', true),
  ((SELECT id FROM car_makes WHERE name = 'Porsche'), 'Boxster', 1996, NULL, 'convertible', 'gasoline', true),
  ((SELECT id FROM car_makes WHERE name = 'Porsche'), 'Cayman', 2005, NULL, 'coupe', 'gasoline', true);

-- Add some additional popular models
INSERT INTO car_models (make_id, name, year_start, year_end, body_type, fuel_type, is_active) VALUES
  -- Mazda Models
  ((SELECT id FROM car_makes WHERE name = 'Mazda'), 'Mazda3', 2003, NULL, 'sedan', 'gasoline', true),
  ((SELECT id FROM car_makes WHERE name = 'Mazda'), 'Mazda6', 2002, NULL, 'sedan', 'gasoline', true),
  ((SELECT id FROM car_makes WHERE name = 'Mazda'), 'CX-3', 2015, 2021, 'SUV', 'gasoline', false),
  ((SELECT id FROM car_makes WHERE name = 'Mazda'), 'CX-5', 2012, NULL, 'SUV', 'gasoline', true),
  ((SELECT id FROM car_makes WHERE name = 'Mazda'), 'CX-9', 2006, NULL, 'SUV', 'gasoline', true),
  ((SELECT id FROM car_makes WHERE name = 'Mazda'), 'MX-5 Miata', 1989, NULL, 'convertible', 'gasoline', true),
  
  -- Subaru Models
  ((SELECT id FROM car_makes WHERE name = 'Subaru'), 'Impreza', 1992, NULL, 'sedan', 'gasoline', true),
  ((SELECT id FROM car_makes WHERE name = 'Subaru'), 'Legacy', 1989, NULL, 'sedan', 'gasoline', true),
  ((SELECT id FROM car_makes WHERE name = 'Subaru'), 'Outback', 1994, NULL, 'SUV', 'gasoline', true),
  ((SELECT id FROM car_makes WHERE name = 'Subaru'), 'Forester', 1997, NULL, 'SUV', 'gasoline', true),
  ((SELECT id FROM car_makes WHERE name = 'Subaru'), 'Ascent', 2018, NULL, 'SUV', 'gasoline', true),
  ((SELECT id FROM car_makes WHERE name = 'Subaru'), 'WRX', 2014, NULL, 'sedan', 'gasoline', true),
  ((SELECT id FROM car_makes WHERE name = 'Subaru'), 'BRZ', 2012, NULL, 'coupe', 'gasoline', true),
  
  -- Volvo Models
  ((SELECT id FROM car_makes WHERE name = 'Volvo'), 'S60', 2000, NULL, 'sedan', 'gasoline', true),
  ((SELECT id FROM car_makes WHERE name = 'Volvo'), 'S90', 2016, NULL, 'sedan', 'gasoline', true),
  ((SELECT id FROM car_makes WHERE name = 'Volvo'), 'XC40', 2017, NULL, 'SUV', 'gasoline', true),
  ((SELECT id FROM car_makes WHERE name = 'Volvo'), 'XC60', 2008, NULL, 'SUV', 'gasoline', true),
  ((SELECT id FROM car_makes WHERE name = 'Volvo'), 'XC90', 2002, NULL, 'SUV', 'gasoline', true),
  ((SELECT id FROM car_makes WHERE name = 'Volvo'), 'C40', 2021, NULL, 'SUV', 'electric', true);

-- Update the updated_at timestamp for all records
UPDATE car_makes SET updated_at = NOW();
UPDATE car_models SET updated_at = NOW();
