-- Add direct driver-to-vehicle assignment
ALTER TABLE "Driver" ADD COLUMN "assignedVehicleId" TEXT;

CREATE INDEX "Driver_assignedVehicleId_idx" ON "Driver"("assignedVehicleId");

ALTER TABLE "Driver"
ADD CONSTRAINT "Driver_assignedVehicleId_fkey"
FOREIGN KEY ("assignedVehicleId") REFERENCES "Vehicle"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

-- Add trip planning and lifecycle timestamps
ALTER TABLE "Trip" ADD COLUMN "origin" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Trip" ADD COLUMN "destination" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Trip" ADD COLUMN "scheduledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Trip" ADD COLUMN "startedAt" TIMESTAMP(3);
ALTER TABLE "Trip" ADD COLUMN "completedAt" TIMESTAMP(3);

CREATE INDEX "Trip_organizationId_scheduledAt_idx" ON "Trip"("organizationId", "scheduledAt");
