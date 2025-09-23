-- Rewards schema: tables, enums, functions

-- Enums
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'reward_entry_type') THEN
    CREATE TYPE reward_entry_type AS ENUM (
      'invite_sent',
      'signup_credit',
      'manual_adjustment',
      'reversal'
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'referral_status') THEN
    CREATE TYPE referral_status AS ENUM (
      'pending',
      'accepted',
      'expired',
      'cancelled'
    );
  END IF;
END
$$;

-- Accounts: one per user
CREATE TABLE IF NOT EXISTS reward_accounts (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  balance_cents BIGINT NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'CAD',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (balance_cents >= 0)
);

-- Ledger: immutable event log; positive = credit, negative = debit
CREATE TABLE IF NOT EXISTS reward_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  entry_type reward_entry_type NOT NULL,
  amount_cents BIGINT NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'CAD',
  description TEXT,
  related_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  referral_id UUID,
  edge_event_id TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Referrals: who invited whom
CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inviter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  invitee_email TEXT,
  invitee_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  referral_code TEXT NOT NULL UNIQUE,
  status referral_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  accepted_at TIMESTAMPTZ
);

-- Add FK now that referrals exists
ALTER TABLE reward_ledger
  ADD CONSTRAINT reward_ledger_referral_fk
  FOREIGN KEY (referral_id) REFERENCES referrals(id) ON DELETE SET NULL;

-- Idempotency/indexes
CREATE UNIQUE INDEX IF NOT EXISTS reward_ledger_edge_event_key
  ON reward_ledger (user_id, edge_event_id)
  WHERE edge_event_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_reward_ledger_user_created_at
  ON reward_ledger (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_referrals_inviter_created_at
  ON referrals (inviter_id, created_at DESC);

-- Prevent multiple accepted referrals for the same invitee user
CREATE UNIQUE INDEX IF NOT EXISTS unique_accepted_referral_per_invitee
  ON referrals (invitee_user_id)
  WHERE invitee_user_id IS NOT NULL AND status = 'accepted';

-- Optional: reduce duplicates of pending invites by email (case-insensitive)
CREATE UNIQUE INDEX IF NOT EXISTS unique_pending_referral_per_email
  ON referrals ((lower(invitee_email)))
  WHERE invitee_email IS NOT NULL AND status = 'pending';

-- Keep accounts.updated_at fresh
CREATE OR REPLACE FUNCTION set_timestamp_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS trg_reward_accounts_updated_at ON reward_accounts;
CREATE TRIGGER trg_reward_accounts_updated_at
BEFORE UPDATE ON reward_accounts
FOR EACH ROW EXECUTE FUNCTION set_timestamp_updated_at();

-- Ensure account exists
CREATE OR REPLACE FUNCTION ensure_reward_account(p_user_id UUID, p_currency TEXT DEFAULT 'CAD')
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO reward_accounts (user_id, currency)
  VALUES (p_user_id, COALESCE(p_currency, 'CAD'))
  ON CONFLICT (user_id) DO NOTHING;
END;
$$;

-- Credit/Debit function with idempotency via edge_event_id
-- Positive p_amount_cents credits; negative debits
CREATE OR REPLACE FUNCTION apply_reward_entry(
  p_user_id UUID,
  p_amount_cents BIGINT,
  p_entry_type reward_entry_type,
  p_currency TEXT DEFAULT 'CAD',
  p_description TEXT DEFAULT NULL,
  p_related_user_id UUID DEFAULT NULL,
  p_referral_id UUID DEFAULT NULL,
  p_edge_event_id TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_ledger_id UUID;
BEGIN
  PERFORM ensure_reward_account(p_user_id, p_currency);

  -- Idempotency: return existing id if same (user_id, edge_event_id)
  IF p_edge_event_id IS NOT NULL THEN
    SELECT id INTO v_ledger_id
    FROM reward_ledger
    WHERE user_id = p_user_id AND edge_event_id = p_edge_event_id;
    IF v_ledger_id IS NOT NULL THEN
      RETURN v_ledger_id;
    END IF;
  END IF;

  INSERT INTO reward_ledger (
    user_id, entry_type, amount_cents, currency, description,
    related_user_id, referral_id, edge_event_id, metadata
  )
  VALUES (
    p_user_id, p_entry_type, p_amount_cents, COALESCE(p_currency, 'CAD'), p_description,
    p_related_user_id, p_referral_id, p_edge_event_id, p_metadata
  )
  RETURNING id INTO v_ledger_id;

  -- Update balance (guard against negatives)
  UPDATE reward_accounts
  SET balance_cents = GREATEST(0, balance_cents + p_amount_cents),
      updated_at = NOW()
  WHERE user_id = p_user_id;

  RETURN v_ledger_id;
END;
$$;

-- Helper for standard 1 CAD signup credit
CREATE OR REPLACE FUNCTION credit_signup_referral(
  p_inviter_id UUID,
  p_invitee_id UUID,
  p_referral_id UUID,
  p_edge_event_id TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT apply_reward_entry(
    p_inviter_id,
    100,
    'signup_credit'::reward_entry_type,
    'CAD',
    'Referral signup credit: 1 CAD',
    p_invitee_id,
    p_referral_id,
    p_edge_event_id,
    jsonb_build_object('source', 'signup_webhook')
  );
$$;


