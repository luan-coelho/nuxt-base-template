ALTER TABLE
  "users"
ADD
  COLUMN "password_must_change" boolean DEFAULT false NOT NULL;