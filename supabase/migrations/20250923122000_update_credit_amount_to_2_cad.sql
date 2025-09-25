-- Update referral signup credit from 1 CAD to 2 CAD (in cents)

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
    200,
    'signup_credit'::reward_entry_type,
    'CAD',
    'Referral signup credit: 2 CAD',
    p_invitee_id,
    p_referral_id,
    p_edge_event_id,
    jsonb_build_object('source', 'signup_webhook')
  );
$$;




