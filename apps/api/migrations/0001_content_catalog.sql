-- Original CodeSaga catalog only. Identity and learner data start in later milestones.
CREATE TABLE courses (
  id uuid PRIMARY KEY,
  slug text NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text NOT NULL CHECK (length(title) BETWEEN 1 AND 200),
  summary text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE chapters (
  id uuid PRIMARY KEY,
  course_id uuid NOT NULL REFERENCES courses(id),
  slug text NOT NULL CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text NOT NULL CHECK (length(title) BETWEEN 1 AND 200),
  position integer NOT NULL CHECK (position >= 0),
  UNIQUE (course_id, slug),
  UNIQUE (course_id, position)
);

CREATE TABLE lessons (
  id uuid PRIMARY KEY,
  chapter_id uuid NOT NULL REFERENCES chapters(id),
  slug text NOT NULL CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  position integer NOT NULL CHECK (position >= 0),
  UNIQUE (chapter_id, slug),
  UNIQUE (chapter_id, position)
);

CREATE TABLE lesson_versions (
  id uuid PRIMARY KEY,
  lesson_id uuid NOT NULL REFERENCES lessons(id),
  version integer NOT NULL CHECK (version > 0),
  title text NOT NULL CHECK (length(title) BETWEEN 1 AND 200),
  body text NOT NULL,
  provenance text NOT NULL CHECK (length(provenance) > 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (lesson_id, version)
);

CREATE INDEX courses_published_slug_idx ON courses(slug) WHERE status = 'published';
