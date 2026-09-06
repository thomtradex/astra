CREATE TABLE "enterprise_requests" (
    "id" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "projects" TEXT,
    "needs" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "enterprise_requests_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "enterprise_requests_email_idx"
ON "enterprise_requests"("email");

CREATE INDEX "enterprise_requests_status_idx"
ON "enterprise_requests"("status");

CREATE INDEX "enterprise_requests_created_at_idx"
ON "enterprise_requests"("created_at");
