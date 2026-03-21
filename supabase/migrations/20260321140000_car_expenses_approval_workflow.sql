-- Car expenses: draft → submitted → approved (aligned with weekly_reports workflow)

ALTER TABLE car_expenses
  ADD COLUMN IF NOT EXISTS status TEXT,
  ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES profiles(id) ON DELETE SET NULL;

UPDATE car_expenses
SET status = 'approved'
WHERE status IS NULL;

ALTER TABLE car_expenses
  ALTER COLUMN status SET NOT NULL,
  ALTER COLUMN status SET DEFAULT 'draft';

ALTER TABLE car_expenses
  ADD CONSTRAINT car_expenses_status_check CHECK (
    status IN ('draft', 'submitted', 'approved')
  );

CREATE INDEX IF NOT EXISTS idx_car_expenses_status ON car_expenses(status);
CREATE INDEX IF NOT EXISTS idx_car_expenses_car_id_status ON car_expenses(car_id, status);

COMMENT ON COLUMN car_expenses.status IS 'draft: editable by creator; submitted: owner may edit/approve; approved: locked';

-- INSERT: only draft (explicit or default)
DROP POLICY IF EXISTS "Drivers can insert car expenses for cars they drive" ON car_expenses;
CREATE POLICY "Drivers can insert car expenses for cars they drive"
  ON car_expenses
  FOR INSERT
  WITH CHECK (
    (status IS NULL OR status = 'draft')
    AND EXISTS (
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

DROP POLICY IF EXISTS "Owners can insert car expenses for cars they own" ON car_expenses;
CREATE POLICY "Owners can insert car expenses for cars they own"
  ON car_expenses
  FOR INSERT
  WITH CHECK (
    (status IS NULL OR status = 'draft')
    AND EXISTS (
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

-- Replace broad owner UPDATE with workflow policies
DROP POLICY IF EXISTS "Owners can update car expenses for cars they own" ON car_expenses;

-- Draft: only the creator may update; may move to submitted
CREATE POLICY "Users can update own draft car expenses"
  ON car_expenses
  FOR UPDATE
  USING (
    status = 'draft'
    AND created_by = auth.uid()
    AND (
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
      OR EXISTS (
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
  )
  WITH CHECK (
    created_by = auth.uid()
    AND status IN ('draft', 'submitted')
    AND (
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
      OR EXISTS (
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
    )
  );

-- Submitted: owners/co-owners may edit fields or approve
CREATE POLICY "Owners can update submitted car expenses for cars they own"
  ON car_expenses
  FOR UPDATE
  USING (
    status = 'submitted'
    AND EXISTS (
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
    status IN ('submitted', 'approved')
    AND EXISTS (
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

-- DELETE: draft only; creator or car owner/co-owner
DROP POLICY IF EXISTS "Owners can delete car expenses for cars they own" ON car_expenses;

CREATE POLICY "Users can delete draft car expenses they created"
  ON car_expenses
  FOR DELETE
  USING (
    status = 'draft'
    AND created_by = auth.uid()
  );

CREATE POLICY "Owners can delete draft car expenses for cars they own"
  ON car_expenses
  FOR DELETE
  USING (
    status = 'draft'
    AND EXISTS (
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

CREATE OR REPLACE FUNCTION car_expenses_enforce_immutable()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.created_by IS DISTINCT FROM OLD.created_by THEN
    RAISE EXCEPTION 'car_expenses.created_by cannot change';
  END IF;
  IF NEW.car_id IS DISTINCT FROM OLD.car_id THEN
    RAISE EXCEPTION 'car_expenses.car_id cannot change';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS car_expenses_immutable_fields ON car_expenses;
CREATE TRIGGER car_expenses_immutable_fields
  BEFORE UPDATE ON car_expenses
  FOR EACH ROW
  EXECUTE FUNCTION car_expenses_enforce_immutable();
