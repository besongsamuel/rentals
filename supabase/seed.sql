-- Database Seed File
-- This seed file creates sample data for testing and development
-- It finds a user with email 'besongsamueloru+owner@gmail.com' and adds cars with weekly reports

-- First, let's find the user with the specified email
DO $$
DECLARE
    owner_user_id UUID;
    car_count INTEGER := 0;
    max_cars INTEGER := 15;
    car_record RECORD;
    report_week_start DATE;
    report_week_end DATE;
    report_mileage INTEGER;
    week_offset INTEGER;
BEGIN
    -- Find the user with the specified email
    SELECT id INTO owner_user_id
    FROM profiles
    WHERE email = 'besongsamueloru+owner@gmail.com';
    
    -- Check if user exists
    IF owner_user_id IS NULL THEN
        RAISE NOTICE 'User with email besongsamueloru+owner@gmail.com not found. Creating sample user...';
        
        -- Create a sample user (this would normally be done through auth)
        -- For seeding purposes, we'll assume the user exists or create a placeholder
        INSERT INTO profiles (id, email, full_name, user_type, phone)
        VALUES (
            gen_random_uuid(),
            'besongsamueloru+owner@gmail.com',
            'Samuel Besong Oru',
            'owner',
            '+237-123-456-789'
        )
        RETURNING id INTO owner_user_id;
        
        RAISE NOTICE 'Created sample user with ID: %', owner_user_id;
    ELSE
        RAISE NOTICE 'Found user with ID: %', owner_user_id;
    END IF;
    
    -- Add sample cars (up to max_cars)
    INSERT INTO cars (
        vin, make, model, year, color, license_plate,
        initial_mileage, current_mileage, owner_id,
        status, fuel_type, transmission_type
    ) VALUES
    -- Car 1: Toyota Camry
    ('1HGBH41JXMN109186', 'Toyota', 'Camry', 2020, 'Silver', 'CM-1234-AB', 25000, 45000, owner_user_id, 'available', 'gasoline', 'automatic'),
    -- Car 2: Honda Accord
    ('2HGBH41JXMN109187', 'Honda', 'Accord', 2019, 'Black', 'CM-1235-CD', 30000, 52000, owner_user_id, 'assigned', 'gasoline', 'automatic'),
    -- Car 3: Ford Focus
    ('3HGBH41JXMN109188', 'Ford', 'Focus', 2021, 'White', 'CM-1236-EF', 15000, 28000, owner_user_id, 'available', 'gasoline', 'manual'),
    -- Car 4: BMW 3 Series
    ('4HGBH41JXMN109189', 'BMW', '3 Series', 2020, 'Blue', 'CM-1237-GH', 20000, 38000, owner_user_id, 'available', 'gasoline', 'automatic'),
    -- Car 5: Mercedes C-Class
    ('5HGBH41JXMN109190', 'Mercedes-Benz', 'C-Class', 2019, 'Black', 'CM-1238-IJ', 35000, 58000, owner_user_id, 'assigned', 'gasoline', 'automatic'),
    -- Car 6: Toyota Corolla
    ('6HGBH41JXMN109191', 'Toyota', 'Corolla', 2021, 'Red', 'CM-1239-KL', 12000, 22000, owner_user_id, 'available', 'gasoline', 'automatic'),
    -- Car 7: Nissan Altima
    ('7HGBH41JXMN109192', 'Nissan', 'Altima', 2020, 'Gray', 'CM-1240-MN', 28000, 46000, owner_user_id, 'maintenance', 'gasoline', 'automatic'),
    -- Car 8: Hyundai Elantra
    ('8HGBH41JXMN109193', 'Hyundai', 'Elantra', 2019, 'Silver', 'CM-1241-OP', 32000, 54000, owner_user_id, 'available', 'gasoline', 'automatic'),
    -- Car 9: Chevrolet Malibu
    ('9HGBH41JXMN109194', 'Chevrolet', 'Malibu', 2021, 'White', 'CM-1242-QR', 18000, 32000, owner_user_id, 'available', 'gasoline', 'automatic'),
    -- Car 10: Volkswagen Jetta
    ('0HGBH41JXMN109195', 'Volkswagen', 'Jetta', 2020, 'Black', 'CM-1243-ST', 25000, 42000, owner_user_id, 'assigned', 'gasoline', 'manual'),
    -- Car 11: Audi A4
    ('1HGBH41JXMN109196', 'Audi', 'A4', 2019, 'Blue', 'CM-1244-UV', 30000, 50000, owner_user_id, 'available', 'gasoline', 'automatic'),
    -- Car 12: Lexus ES
    ('2HGBH41JXMN109197', 'Lexus', 'ES', 2021, 'Silver', 'CM-1245-WX', 15000, 28000, owner_user_id, 'available', 'gasoline', 'automatic'),
    -- Car 13: Infiniti Q50
    ('3HGBH41JXMN109198', 'Infiniti', 'Q50', 2020, 'Black', 'CM-1246-YZ', 22000, 38000, owner_user_id, 'available', 'gasoline', 'automatic'),
    -- Car 14: Acura TLX
    ('4HGBH41JXMN109199', 'Acura', 'TLX', 2019, 'White', 'CM-1247-AB', 35000, 56000, owner_user_id, 'assigned', 'gasoline', 'automatic'),
    -- Car 15: Genesis G70
    ('5HGBH41JXMN109200', 'Genesis', 'G70', 2021, 'Gray', 'CM-1248-CD', 10000, 20000, owner_user_id, 'available', 'gasoline', 'automatic')
    ON CONFLICT (vin) DO NOTHING;
    
    GET DIAGNOSTICS car_count = ROW_COUNT;
    RAISE NOTICE 'Added % cars for user %', car_count, owner_user_id;
    
    -- Add sample weekly reports for each car
    -- We'll create reports for the last 8 weeks for each car
    FOR car_record IN 
        SELECT id, current_mileage, vin, make, model
        FROM cars 
        WHERE owner_id = owner_user_id 
        ORDER BY created_at
        LIMIT max_cars
    LOOP
        RAISE NOTICE 'Creating weekly reports for car: % % (%)', car_record.make, car_record.model, car_record.vin;
        
        -- Reset report mileage for reports
        report_mileage := car_record.current_mileage - (8 * 500); -- Go back 8 weeks, 500km per week
        
        -- Create 8 weeks of reports (going back in time)
        FOR week_offset IN 0..7 LOOP
            report_week_start := CURRENT_DATE - (week_offset * 7) - 6; -- Start of week (Monday)
            report_week_end := report_week_start + 6; -- End of week (Sunday)
            
            -- Skip if report already exists
            IF NOT EXISTS (
                SELECT 1 FROM weekly_reports 
                WHERE car_id = car_record.id 
                AND week_start_date = report_week_start
            ) THEN
                INSERT INTO weekly_reports (
                    car_id, driver_id, week_start_date, week_end_date,
                    start_mileage, end_mileage, driver_earnings, maintenance_expenses,
                    gas_expense, ride_share_income, rental_income, currency, status
                ) VALUES (
                    car_record.id,
                    owner_user_id, -- Using owner as driver for simplicity
                    report_week_start,
                    report_week_end,
                    report_mileage,
                    report_mileage + 450 + (RANDOM() * 100), -- Random mileage between 450-550km
                    ROUND((250 + (RANDOM() * 150))::DECIMAL, 2), -- Driver earnings: 250-400 XAF
                    ROUND((50 + (RANDOM() * 100))::DECIMAL, 2), -- Maintenance: 50-150 XAF
                    ROUND((80 + (RANDOM() * 120))::DECIMAL, 2), -- Gas expense: 80-200 XAF
                    ROUND((300 + (RANDOM() * 200))::DECIMAL, 2), -- Ride share income: 300-500 XAF
                    ROUND((400 + (RANDOM() * 300))::DECIMAL, 2), -- Rental income: 400-700 XAF
                    'XAF',
                    CASE 
                        WHEN week_offset <= 2 THEN 'approved' -- Recent reports approved
                        WHEN week_offset <= 4 THEN 'submitted' -- Medium age reports submitted
                        ELSE 'draft' -- Older reports still draft
                    END
                );
                
                -- Update report mileage for next iteration
                report_mileage := report_mileage + 450 + (RANDOM() * 100);
            END IF;
        END LOOP;
        
        RAISE NOTICE 'Created weekly reports for car: % %', car_record.make, car_record.model;
    END LOOP;
    
    RAISE NOTICE 'Seed data creation completed successfully!';
    RAISE NOTICE 'Created % cars and weekly reports for user: %', car_count, owner_user_id;
    
END $$;
