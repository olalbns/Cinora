CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  display_name text NOT NULL,
  role text NOT NULL DEFAULT 'user' CHECK (role IN ('user','editor','admin')),
  preferred_language text NOT NULL DEFAULT 'fr',
  subtitles_enabled boolean NOT NULL DEFAULT true,
  autoplay_enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS subjects (
  id text PRIMARY KEY,
  slug text NOT NULL UNIQUE,
  subject_type smallint NOT NULL CHECK (subject_type IN (1,2)),
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  release_date date,
  duration_seconds integer NOT NULL DEFAULT 0 CHECK (duration_seconds >= 0),
  genres text[] NOT NULL DEFAULT '{}',
  cover_url text NOT NULL DEFAULT '',
  backdrop_url text NOT NULL DEFAULT '',
  country_name text NOT NULL DEFAULT '',
  rating numeric(3,1) NOT NULL DEFAULT 0,
  rating_count integer NOT NULL DEFAULT 0,
  subtitles text[] NOT NULL DEFAULT '{}',
  dubs jsonb NOT NULL DEFAULT '[]',
  trailer jsonb,
  corner text NOT NULL DEFAULT '',
  quality text NOT NULL DEFAULT 'HD',
  has_resource boolean NOT NULL DEFAULT false,
  is_forbid boolean NOT NULL DEFAULT false,
  watch_time_limit integer NOT NULL DEFAULT 0,
  access_strategy jsonb,
  popularity integer NOT NULL DEFAULT 0,
  featured boolean NOT NULL DEFAULT false,
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS subjects_search_idx ON subjects USING gin (to_tsvector('simple', title || ' ' || description));
CREATE INDEX IF NOT EXISTS subjects_genres_idx ON subjects USING gin (genres);
CREATE INDEX IF NOT EXISTS subjects_release_idx ON subjects (release_date DESC);
CREATE INDEX IF NOT EXISTS subjects_popularity_idx ON subjects (popularity DESC);

CREATE TABLE IF NOT EXISTS staff (
  id text PRIMARY KEY,
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  biography text NOT NULL DEFAULT '',
  avatar_url text NOT NULL DEFAULT '',
  birth_date date,
  country_name text NOT NULL DEFAULT '',
  staff_type smallint NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS staff_name_idx ON staff (name);

CREATE TABLE IF NOT EXISTS subject_staff (
  subject_id text NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  staff_id text NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
  character_name text NOT NULL DEFAULT '',
  credit_order integer NOT NULL DEFAULT 0,
  PRIMARY KEY (subject_id, staff_id)
);

CREATE TABLE IF NOT EXISTS seasons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id text NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  season_number integer NOT NULL,
  title text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  UNIQUE(subject_id, season_number)
);

CREATE TABLE IF NOT EXISTS episodes (
  id text PRIMARY KEY,
  season_id uuid NOT NULL REFERENCES seasons(id) ON DELETE CASCADE,
  episode_number integer NOT NULL,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  duration_seconds integer NOT NULL DEFAULT 0,
  thumbnail_url text NOT NULL DEFAULT '',
  release_date date,
  resolutions integer[] NOT NULL DEFAULT '{720,1080}',
  published boolean NOT NULL DEFAULT true,
  UNIQUE(season_id, episode_number)
);

CREATE TABLE IF NOT EXISTS platforms (
  id text PRIMARY KEY,
  name text NOT NULL UNIQUE,
  description text NOT NULL DEFAULT '',
  color text NOT NULL DEFAULT '#777777',
  logo_url text NOT NULL DEFAULT '',
  upload_by text NOT NULL DEFAULT '',
  position integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS subject_platforms (
  subject_id text NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  platform_id text NOT NULL REFERENCES platforms(id) ON DELETE CASCADE,
  added_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY(subject_id, platform_id)
);

CREATE TABLE IF NOT EXISTS home_sections (
  id text PRIMARY KEY,
  section_type text NOT NULL DEFAULT 'SUBJECTS_MOVIE',
  title text NOT NULL,
  position integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  metadata jsonb NOT NULL DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS home_section_items (
  section_id text NOT NULL REFERENCES home_sections(id) ON DELETE CASCADE,
  subject_id text NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  position integer NOT NULL DEFAULT 0,
  PRIMARY KEY(section_id, subject_id)
);

CREATE TABLE IF NOT EXISTS rankings (
  id text PRIMARY KEY,
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  image_url text NOT NULL DEFAULT '',
  active boolean NOT NULL DEFAULT true,
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ranking_items (
  ranking_id text NOT NULL REFERENCES rankings(id) ON DELETE CASCADE,
  subject_id text NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  position integer NOT NULL,
  PRIMARY KEY(ranking_id, subject_id)
);

CREATE TABLE IF NOT EXISTS blog_posts (
  id text PRIMARY KEY,
  slug text NOT NULL UNIQUE,
  site_key text NOT NULL DEFAULT 'cinora',
  title text NOT NULL,
  excerpt text NOT NULL DEFAULT '',
  content text NOT NULL DEFAULT '',
  cover_url text NOT NULL DEFAULT '',
  author_name text NOT NULL DEFAULT '',
  language text NOT NULL DEFAULT 'fr',
  published boolean NOT NULL DEFAULT false,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS blog_site_idx ON blog_posts(site_key, published_at DESC);

CREATE TABLE IF NOT EXISTS custom_pages (
  id text PRIMARY KEY,
  site_key text NOT NULL DEFAULT 'cinora',
  page_key text NOT NULL,
  title text NOT NULL,
  layout text NOT NULL DEFAULT 'standard',
  content jsonb NOT NULL DEFAULT '{}',
  published boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(site_key, page_key)
);

CREATE TABLE IF NOT EXISTS seo_pages (
  path text PRIMARY KEY,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  keywords text NOT NULL DEFAULT '',
  h1 text NOT NULL DEFAULT '',
  image_url text NOT NULL DEFAULT '',
  indexable boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id text NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content text NOT NULL,
  rating smallint CHECK (rating BETWEEN 1 AND 10),
  status text NOT NULL DEFAULT 'published' CHECK (status IN ('pending','published','rejected')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS comments_subject_idx ON comments(subject_id, created_at DESC);

CREATE TABLE IF NOT EXISTS user_favorites (
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subject_id text NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY(user_id, subject_id)
);

CREATE TABLE IF NOT EXISTS user_history (
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subject_id text NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  progress integer NOT NULL DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
  season_number integer,
  episode_number integer,
  watched_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY(user_id, subject_id)
);

CREATE TABLE IF NOT EXISTS migrations (
  name text PRIMARY KEY,
  applied_at timestamptz NOT NULL DEFAULT now()
);
