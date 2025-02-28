/*
  Warnings:

  - Added the required column `numeClient` to the `comenzi` table without a default value. This is not possible if the table is not empty.
  - Added the required column `orasClient` to the `comenzi` table without a default value. This is not possible if the table is not empty.
  - Added the required column `prenumeClient` to the `comenzi` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "MetodaPlata" ADD VALUE 'RIDICARE_MAGAZIN';

-- DropForeignKey
ALTER TABLE "comenzi" DROP CONSTRAINT "comenzi_utilizatorId_fkey";

-- AlterTable
ALTER TABLE "comenzi" ADD COLUMN     "codPostal" TEXT,
ADD COLUMN     "note" TEXT,
ADD COLUMN     "numeClient" TEXT NOT NULL,
ADD COLUMN     "orasClient" TEXT NOT NULL,
ADD COLUMN     "prenumeClient" TEXT NOT NULL,
ALTER COLUMN "utilizatorId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "comenzi" ADD CONSTRAINT "comenzi_utilizatorId_fkey" FOREIGN KEY ("utilizatorId") REFERENCES "utilizatori"("id") ON DELETE SET NULL ON UPDATE CASCADE;
