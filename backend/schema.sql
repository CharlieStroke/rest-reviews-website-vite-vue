-- =========================================
-- EXTENSIONS
-- =========================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =========================================
-- ENUMS
-- =========================================
CREATE TYPE user_role AS ENUM ('student','manager','admin');

CREATE TYPE sentiment_label AS ENUM ('positive','negative');

CREATE TYPE training_status AS ENUM ('running','success','failed');

-- =========================================
-- USERS
-- =========================================
CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar(120) NOT NULL,
  email varchar(150) UNIQUE NOT NULL,
  password_hash text NOT NULL,
  role user_role NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_users_role ON users(role);

-- =========================================
-- USER SESSIONS
-- =========================================
CREATE TABLE user_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  refresh_token text NOT NULL,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);

-- =========================================
-- ESTABLISHMENTS
-- =========================================
CREATE TABLE establishments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar(150) NOT NULL,
  description text,
  category varchar(80),
  manager_id uuid REFERENCES users(id) ON DELETE SET NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_establishments_manager ON establishments(manager_id);
CREATE INDEX idx_establishments_active ON establishments(is_active);

-- =========================================
-- REVIEWS
-- =========================================
CREATE TABLE reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  establishment_id uuid NOT NULL REFERENCES establishments(id) ON DELETE CASCADE,
  food_score smallint NOT NULL CHECK (food_score BETWEEN 1 AND 5),
  service_score smallint NOT NULL CHECK (service_score BETWEEN 1 AND 5),
  price_score smallint NOT NULL CHECK (price_score BETWEEN 1 AND 5),
  comment text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT unique_user_establishment UNIQUE(user_id, establishment_id)
);

CREATE INDEX idx_reviews_establishment ON reviews(establishment_id);
CREATE INDEX idx_reviews_user ON reviews(user_id);
CREATE INDEX idx_reviews_created_at ON reviews(created_at);
CREATE INDEX idx_reviews_establishment_created 
  ON reviews(establishment_id, created_at DESC);

-- =========================================
-- MODEL VERSIONS
-- =========================================
CREATE TABLE model_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  version varchar(20) UNIQUE NOT NULL,
  accuracy numeric(5,4),
  precision numeric(5,4),
  recall numeric(5,4),
  f1 numeric(5,4),
  dataset_size int NOT NULL,
  trained_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- =========================================
-- SENTIMENT RESULTS
-- =========================================
CREATE TABLE sentiment_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id uuid NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  model_version_id uuid NOT NULL REFERENCES model_versions(id) ON DELETE CASCADE,
  predicted_label sentiment_label NOT NULL,
  probability numeric(5,4) NOT NULL CHECK (probability BETWEEN 0 AND 1),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_sentiment_review ON sentiment_results(review_id);
CREATE INDEX idx_sentiment_model_version ON sentiment_results(model_version_id);

-- =========================================
-- METRICS SNAPSHOTS
-- =========================================
CREATE TABLE metrics_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  establishment_id uuid NOT NULL REFERENCES establishments(id) ON DELETE CASCADE,
  ige numeric(5,2) CHECK (ige BETWEEN 0 AND 100),
  avg_food numeric(4,2),
  avg_service numeric(4,2),
  avg_price numeric(4,2),
  negative_ratio numeric(5,4) CHECK (negative_ratio BETWEEN 0 AND 1),
  total_reviews int NOT NULL DEFAULT 0,
  snapshot_date date NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT unique_snapshot_per_day UNIQUE(establishment_id, snapshot_date)
);

CREATE INDEX idx_metrics_establishment_date 
  ON metrics_snapshots(establishment_id, snapshot_date DESC);

-- =========================================
-- TRAINING RUNS
-- =========================================
CREATE TABLE training_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  model_version_id uuid REFERENCES model_versions(id) ON DELETE SET NULL,
  started_at timestamptz,
  finished_at timestamptz,
  status training_status NOT NULL,
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_training_runs_model_version 
  ON training_runs(model_version_id);

CREATE INDEX idx_training_runs_status 
  ON training_runs(status);