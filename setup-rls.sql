-- Required Row Level Security (RLS) Policies for Supabase
-- Run this in the Supabase SQL Editor after Prisma pushes your tables.

-- 1. Enable RLS on all configured tables
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Tenant" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Lead" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Message" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Transaction" ENABLE ROW LEVEL SECURITY;

-- 2. Define strict tenant-isolated access for public 'anon' fetching
-- Example assumes the client is passing their tenant ID via Supabase JWT or header context.
-- If accessing strictly via Express using Prisma/service_role, RLS will be bypassed automatically.

-- But to comply with strict isolation if querying via the frontend with anon key:
CREATE POLICY "Tenant can view their own profile"
ON "Tenant" FOR SELECT
USING (auth.uid()::text = "userId");

CREATE POLICY "Tenant can view their own leads"
ON "Lead" FOR SELECT
USING ("tenantId" IN (SELECT id FROM "Tenant" WHERE "userId" = auth.uid()::text));

CREATE POLICY "Tenant can view messages for their leads"
ON "Message" FOR SELECT
USING ("leadId" IN (
    SELECT id FROM "Lead" WHERE "tenantId" IN (
        SELECT id FROM "Tenant" WHERE "userId" = auth.uid()::text
    )
));

CREATE POLICY "Tenant can view their own transactions"
ON "Transaction" FOR SELECT
USING ("tenantId" IN (SELECT id FROM "Tenant" WHERE "userId" = auth.uid()::text));
