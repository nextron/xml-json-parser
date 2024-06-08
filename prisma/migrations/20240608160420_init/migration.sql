/*
  Warnings:

  - You are about to drop the column `makeName` on the `VehicleType` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[typeId,makeId]` on the table `VehicleType` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `typeName` to the `VehicleType` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "VehicleType" DROP COLUMN "makeName",
ADD COLUMN     "typeName" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "VehicleType_typeId_makeId_key" ON "VehicleType"("typeId", "makeId");
