-- Vimbiso Network — core real-data schema
-- Users, approvals, traders, delivery, bids, offers, orders, jobs, reviews

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ---------- users ----------
CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone         TEXT NOT NULL UNIQUE,
  name          TEXT NOT NULL DEFAULT '',
  city          TEXT NOT NULL DEFAULT 'Harare',
  roles         TEXT[] NOT NULL DEFAULT ARRAY['buyer']::TEXT[],
  trust_score   INT NOT NULL DEFAULT 50 CHECK (trust_score >= 0 AND trust_score <= 100),
  rating        NUMERIC(3,2) NOT NULL DEFAULT 0,
  completed_trades INT NOT NULL DEFAULT 0,
  status        TEXT NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending', 'approved', 'rejected', 'suspended')),
  vimbiso_id    TEXT UNIQUE,
  avatar_url    TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS users_status_idx ON users (status);
CREATE INDEX IF NOT EXISTS users_phone_idx ON users (phone);

-- ---------- otp codes (short-lived) ----------
CREATE TABLE IF NOT EXISTS otp_codes (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone      TEXT NOT NULL,
  code       TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used       BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS otp_phone_idx ON otp_codes (phone, used);

-- ---------- trader profiles ----------
CREATE TABLE IF NOT EXISTS trader_profiles (
  user_id      UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL DEFAULT '',
  lat          DOUBLE PRECISION,
  lng          DOUBLE PRECISION,
  area         TEXT,
  is_online    BOOLEAN NOT NULL DEFAULT false,
  last_seen    TIMESTAMPTZ,
  stock_notes  TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------- delivery profiles (need your approval) ----------
CREATE TABLE IF NOT EXISTS delivery_profiles (
  user_id          UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  vehicle          TEXT,
  vehicle_color    TEXT,
  make             TEXT,
  plate            TEXT,
  insurance        TEXT,
  policy_number    TEXT,
  licence_number   TEXT,
  is_available     BOOLEAN NOT NULL DEFAULT false,
  approval_status  TEXT NOT NULL DEFAULT 'pending'
                     CHECK (approval_status IN ('pending', 'approved', 'rejected')),
  lat              DOUBLE PRECISION,
  lng              DOUBLE PRECISION,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------- approvals queue (you control this) ----------
CREATE TABLE IF NOT EXISTS approvals (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type         TEXT NOT NULL CHECK (type IN ('user_identity', 'delivery_registration', 'dispute')),
  target_id    UUID NOT NULL,
  user_id      UUID REFERENCES users(id),
  status       TEXT NOT NULL DEFAULT 'pending'
                 CHECK (status IN ('pending', 'approved', 'rejected')),
  notes        TEXT,
  decided_by   UUID REFERENCES users(id),
  decided_at   TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS approvals_pending_idx ON approvals (status) WHERE status = 'pending';

-- ---------- bids ----------
CREATE TABLE IF NOT EXISTS bids (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id     UUID NOT NULL REFERENCES users(id),
  items        JSONB NOT NULL DEFAULT '[]'::JSONB,
  city         TEXT,
  lat          DOUBLE PRECISION,
  lng          DOUBLE PRECISION,
  status       TEXT NOT NULL DEFAULT 'open'
                 CHECK (status IN ('open', 'matched', 'cancelled', 'expired')),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------- offers ----------
CREATE TABLE IF NOT EXISTS offers (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trader_id    UUID NOT NULL REFERENCES users(id),
  bid_id       UUID REFERENCES bids(id),
  price        NUMERIC(12,2) NOT NULL,
  qty          TEXT,
  quality      TEXT,
  fulfillment  TEXT CHECK (fulfillment IN ('delivery', 'collection')),
  status       TEXT NOT NULL DEFAULT 'active'
                 CHECK (status IN ('active', 'accepted', 'withdrawn', 'expired')),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------- orders ----------
CREATE TABLE IF NOT EXISTS orders (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id        UUID NOT NULL REFERENCES users(id),
  trader_id       UUID NOT NULL REFERENCES users(id),
  offer_id        UUID REFERENCES offers(id),
  items           JSONB NOT NULL DEFAULT '[]'::JSONB,
  subtotal        NUMERIC(12,2) NOT NULL DEFAULT 0,
  delivery_fee    NUMERIC(12,2) NOT NULL DEFAULT 0,
  total           NUMERIC(12,2) NOT NULL DEFAULT 0,
  payment_method  TEXT NOT NULL DEFAULT 'cash'
                    CHECK (payment_method IN ('cash', 'ecocash', 'onemoney')),
  payment_status  TEXT NOT NULL DEFAULT 'pending'
                    CHECK (payment_status IN ('pending', 'confirmed', 'failed')),
  order_status    TEXT NOT NULL DEFAULT 'placed'
                    CHECK (order_status IN (
                      'placed', 'accepted', 'paid', 'preparing',
                      'ready', 'out_for_delivery', 'completed', 'cancelled'
                    )),
  city            TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS orders_buyer_idx ON orders (buyer_id);
CREATE INDEX IF NOT EXISTS orders_trader_idx ON orders (trader_id);
CREATE INDEX IF NOT EXISTS orders_status_idx ON orders (order_status);

-- ---------- delivery jobs ----------
CREATE TABLE IF NOT EXISTS delivery_jobs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id      UUID NOT NULL REFERENCES orders(id),
  rider_id      UUID REFERENCES users(id),
  pickup        TEXT,
  dropoff       TEXT,
  dist_km       NUMERIC(8,2),
  pay           NUMERIC(12,2) NOT NULL DEFAULT 0,
  status        TEXT NOT NULL DEFAULT 'open'
                  CHECK (status IN ('open', 'accepted', 'picked_up', 'delivered', 'cancelled')),
  proof_urls    TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------- reviews ----------
CREATE TABLE IF NOT EXISTS reviews (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id   UUID NOT NULL REFERENCES orders(id),
  from_user  UUID NOT NULL REFERENCES users(id),
  to_user    UUID NOT NULL REFERENCES users(id),
  stars      INT NOT NULL CHECK (stars >= 1 AND stars <= 5),
  note       TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (order_id, from_user)
);

-- ---------- activity log (admin feed) ----------
CREATE TABLE IF NOT EXISTS activity_log (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kind       TEXT NOT NULL,
  message    TEXT NOT NULL,
  meta       JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------- helper: auto vimbiso_id ----------
CREATE OR REPLACE FUNCTION set_vimbiso_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.vimbiso_id IS NULL THEN
    NEW.vimbiso_id := 'VMB-' || lpad((floor(random()*900000)+100000)::text, 6, '0');
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_users_vimbiso ON users;
CREATE TRIGGER trg_users_vimbiso
  BEFORE INSERT OR UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_vimbiso_id();

-- Dev policies: allow anon key to read/write while building.
-- Tighten these before production (use authenticated role + RLS per user).
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE otp_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE trader_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "dev_all_users" ON users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "dev_all_otp" ON otp_codes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "dev_all_approvals" ON approvals FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "dev_all_trader" ON trader_profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "dev_all_delivery" ON delivery_profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "dev_all_bids" ON bids FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "dev_all_offers" ON offers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "dev_all_orders" ON orders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "dev_all_jobs" ON delivery_jobs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "dev_all_reviews" ON reviews FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "dev_all_activity" ON activity_log FOR ALL USING (true) WITH CHECK (true);
