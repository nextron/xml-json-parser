-- CreateTable
CREATE TABLE "Make" (
    "makeId" INTEGER NOT NULL,
    "makeName" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "VehicleType" (
    "id" SERIAL NOT NULL,
    "typeId" INTEGER NOT NULL,
    "makeName" TEXT NOT NULL,
    "makeId" INTEGER NOT NULL,

    CONSTRAINT "VehicleType_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Make_makeId_key" ON "Make"("makeId");

-- AddForeignKey
ALTER TABLE "VehicleType" ADD CONSTRAINT "VehicleType_makeId_fkey" FOREIGN KEY ("makeId") REFERENCES "Make"("makeId") ON DELETE RESTRICT ON UPDATE CASCADE;
