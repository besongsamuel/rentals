-- Car-level expenses captured outside weekly reports (registration, insurance, major repairs, etc.)

CREATE TYPE car_expense_type AS ENUM (
  'car_registration',
  'insurance',
  'road_tax',
  'technical_inspection',
  'major_repair',
  'tires',
  'battery',
  'brakes',
  'glass_repair',
  'bodywork',
  'towing',
  'roadside_assistance',
  'cleaning_detailing',
  'equipment_accessories',
  'software_telematics',
  'financing_lease',
  'fines_violations',
  'other'
);

CREATE TABLE car_expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  car_id UUID NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
  amount NUMERIC(12, 2) NOT NULL CHECK (amount >= 0),
  currency TEXT NOT NULL DEFAULT 'XAF',
  expense_date DATE NOT NULL,
  expense_type car_expense_type NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  CONSTRAINT car_expenses_other_requires_notes CHECK (
    expense_type <> 'other'::car_expense_type
    OR (notes IS NOT NULL AND btrim(notes) <> '')
  )
);

CREATE INDEX idx_car_expenses_car_id ON car_expenses(car_id);
CREATE INDEX idx_car_expenses_car_id_expense_date ON car_expenses(car_id, expense_date);

ALTER TABLE car_expenses ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE car_expenses IS 'One-off or non-weekly car costs (insurance, registration, major repairs, etc.)';

-- Drivers: read expenses for cars they are assigned to as current driver
CREATE POLICY "Drivers can view car expenses for cars they drive"
  ON car_expenses
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
        AND p.user_type = 'driver'
        AND EXISTS (
          SELECT 1 FROM cars c
          WHERE c.id = car_expenses.car_id
            AND c.driver_id = auth.uid()
        )
    )
  );

-- Owners: main owner or co-owner via car_owners
CREATE POLICY "Owners can view car expenses for cars they own"
  ON car_expenses
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
        AND p.user_type = 'owner'
        AND (
          EXISTS (
            SELECT 1 FROM cars c
            WHERE c.id = car_expenses.car_id
              AND c.owner_id = auth.uid()
          )
          OR EXISTS (
            SELECT 1 FROM car_owners co
            WHERE co.car_id = car_expenses.car_id
              AND co.owner_id = auth.uid()
          )
        )
    )
  );

CREATE POLICY "Drivers can insert car expenses for cars they drive"
  ON car_expenses
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
        AND p.user_type = 'driver'
        AND EXISTS (
          SELECT 1 FROM cars c
          WHERE c.id = car_id
            AND c.driver_id = auth.uid()
        )
    )
  );

CREATE POLICY "Owners can insert car expenses for cars they own"
  ON car_expenses
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
        AND p.user_type = 'owner'
        AND (
          EXISTS (
            SELECT 1 FROM cars c
            WHERE c.id = car_id
              AND c.owner_id = auth.uid()
          )
          OR EXISTS (
            SELECT 1 FROM car_owners co
            WHERE co.car_id = car_id
              AND co.owner_id = auth.uid()
          )
        )
    )
  );

CREATE POLICY "Owners can update car expenses for cars they own"
  ON car_expenses
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
        AND p.user_type = 'owner'
        AND (
          EXISTS (
            SELECT 1 FROM cars c
            WHERE c.id = car_expenses.car_id
              AND c.owner_id = auth.uid()
          )
          OR EXISTS (
            SELECT 1 FROM car_owners co
            WHERE co.car_id = car_expenses.car_id
              AND co.owner_id = auth.uid()
          )
        )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
        AND p.user_type = 'owner'
        AND (
          EXISTS (
            SELECT 1 FROM cars c
            WHERE c.id = car_id
              AND c.owner_id = auth.uid()
          )
          OR EXISTS (
            SELECT 1 FROM car_owners co
            WHERE co.car_id = car_id
              AND co.owner_id = auth.uid()
          )
        )
    )
  );

CREATE POLICY "Owners can delete car expenses for cars they own"
  ON car_expenses
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
        AND p.user_type = 'owner'
        AND (
          EXISTS (
            SELECT 1 FROM cars c
            WHERE c.id = car_expenses.car_id
              AND c.owner_id = auth.uid()
          )
          OR EXISTS (
            SELECT 1 FROM car_owners co
            WHERE co.car_id = car_expenses.car_id
              AND co.owner_id = auth.uid()
          )
        )
    )
  );
