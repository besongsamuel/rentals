## Rewards Edge Functions

This folder contains two Supabase Edge Functions implementing the referral rewards flow.

- `create-referral`: Creates or reuses a pending referral and returns a unique `referral_code`.
- `signup-webhook`: Resolves a referral on user signup and credits the inviter 1 CAD.

Reference: Supabase Edge Functions docs: [link](https://supabase.com/docs/guides/functions)

### Environment variables

Set the following secrets for local serve and deployed functions:

- `SUPABASE_URL`: Your project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Service role key (kept secret; used server-side only)

For local development you can export them in your shell or use `--env-file`.

### Local development

```bash
# From repo root
supabase functions serve --env-file supabase/.env

# The local URL is usually:
# http://localhost:54321/functions/v1/<function-name>
```

### Deploy to production

```bash
# Deploy individual functions
supabase functions deploy create-referral
supabase functions deploy signup-webhook

# Optionally set secrets via CLI if not already set in Dashboard
supabase secrets set SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=...
```

### API: create-referral

- Method: `POST`
- Path: `/functions/v1/create-referral`
- Auth: Uses `SUPABASE_SERVICE_ROLE_KEY` internally; endpoint itself can be public or protected by your gateway rules.
- Body:

```json
{
  "inviter_id": "<uuid>",
  "invitee_email": "test@example.com"
}
```

- Response (201):

```json
{
  "referral_id": "<uuid>",
  "referral_code": "ABCDEFG2",
  "status": "pending"
}
```

- Sample curl (local):

```bash
curl -sS -X POST \
  http://localhost:54321/functions/v1/create-referral \
  -H "Content-Type: application/json" \
  -d '{"inviter_id":"00000000-0000-0000-0000-000000000000","invitee_email":"test@example.com"}'
```

Notes:

- If a pending referral already exists for the same inviter and email, it will be reused.
- The function also records a zero-amount `invite_sent` ledger entry for observability.

### API: signup-webhook

- Method: `POST`
- Path: `/functions/v1/signup-webhook`
- Auth: Use from Auth signup hook or backend. Uses service role to bypass RLS.
- Body (prefer providing `referral_code`; falls back to matching `invitee_email`):

```json
{
  "user_id": "<new_auth_user_uuid>",
  "email": "test@example.com",
  "referral_code": "ABCDEFG2"
}
```

- Responses:

  - `200 { "status": "credited", "amount_cents": 100 }` on success
  - `200 { "status": "no_referral_found" }` if no match
  - `202 { "status": "pending", "reason": "profile_not_ready" }` if `profiles` row not created yet

- Sample curl (local):

```bash
curl -sS -X POST \
  http://localhost:54321/functions/v1/signup-webhook \
  -H "Content-Type: application/json" \
  -d '{"user_id":"11111111-1111-1111-1111-111111111111","email":"test@example.com","referral_code":"ABCDEFG2"}'
```

Notes:

- The function marks the referral as `accepted`, links `invitee_user_id`, then calls `credit_signup_referral` which credits the inviter 100 cents (1 CAD) with idempotency.
- If invoked multiple times for the same signup/referral, the idempotency key prevents duplicate credits.


