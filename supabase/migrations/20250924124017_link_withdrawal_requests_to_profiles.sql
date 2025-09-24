-- Link withdrawal_requests.user_id to profiles(id) instead of auth.users(id)
-- Safe migration: drop old FK if exists, then create new FK

DO $$
BEGIN
  -- Drop existing foreign key to auth.users if it exists
  IF EXISTS (
    SELECT 1
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu
      ON tc.constraint_name = kcu.constraint_name
     AND tc.table_schema = kcu.table_schema
    WHERE tc.constraint_type = 'FOREIGN KEY'
      AND tc.table_schema = 'public'
      AND tc.table_name = 'withdrawal_requests'
      AND kcu.column_name = 'user_id'
  ) THEN
    -- Build dynamic SQL to drop the specific constraint name
    EXECUTE (
      SELECT 'ALTER TABLE public.withdrawal_requests DROP CONSTRAINT ' || quote_ident(tc.constraint_name)
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name
       AND tc.table_schema = kcu.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_schema = 'public'
        AND tc.table_name = 'withdrawal_requests'
        AND kcu.column_name = 'user_id'
      LIMIT 1
    );
  END IF;

  -- Ensure any orphaned values are removed or aligned (optional noop)
  -- We assume user_id in withdrawal_requests equals profiles.id values

  -- Create new foreign key to profiles(id)
  BEGIN
    ALTER TABLE public.withdrawal_requests
      ADD CONSTRAINT withdrawal_requests_user_id_fkey
      FOREIGN KEY (user_id)
      REFERENCES public.profiles(id)
      ON DELETE CASCADE;
  EXCEPTION WHEN duplicate_object THEN
    -- Constraint already exists; do nothing
    NULL;
  END;
END$$;
