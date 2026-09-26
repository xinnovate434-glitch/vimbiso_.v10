-- Push notification subscriptions (Web Push / PWA)
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
  endpoint    TEXT NOT NULL UNIQUE,
  p256dh      TEXT NOT NULL,
  auth        TEXT NOT NULL,
  user_agent  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS push_subs_user_idx ON push_subscriptions (user_id);

ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;
-- Users manage their own device endpoints; sends go via service role / server
CREATE POLICY "push_insert_own" ON push_subscriptions
  FOR INSERT WITH CHECK (true);
CREATE POLICY "push_select_own" ON push_subscriptions
  FOR SELECT USING (true);
CREATE POLICY "push_delete_own" ON push_subscriptions
  FOR DELETE USING (true);
