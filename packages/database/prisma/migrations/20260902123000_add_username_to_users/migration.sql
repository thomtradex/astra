ALTER TABLE "users"
ADD COLUMN IF NOT EXISTS "username" TEXT;

UPDATE "users"
SET "username" =
  CASE
    WHEN NULLIF(
      regexp_replace(
        lower(split_part("email", '@', 1)),
        '[^a-z0-9_]+',
        '',
        'g'
      ),
      ''
    ) IS NULL
    THEN 'user_' || substr(replace("id"::text, '-', ''), 1, 12)
    ELSE
      regexp_replace(
        lower(split_part("email", '@', 1)),
        '[^a-z0-9_]+',
        '',
        'g'
      )
  END
WHERE "username" IS NULL;

WITH duplicates AS (
  SELECT
    "id",
    row_number() OVER (
      PARTITION BY "organization_id", "username"
      ORDER BY "created_at", "id"
    ) AS rn
  FROM "users"
  WHERE "username" IS NOT NULL
)
UPDATE "users" u
SET "username" = 'user_' || replace(u."id"::text, '-', '')
FROM duplicates d
WHERE u."id" = d."id"
  AND d.rn > 1;

CREATE UNIQUE INDEX IF NOT EXISTS "users_organization_id_username_key"
ON "users" ("organization_id", "username");

CREATE INDEX IF NOT EXISTS "users_username_idx"
ON "users" ("username");
