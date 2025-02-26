-- CreateEnum
CREATE TYPE "StareProdus" AS ENUM ('NOU', 'UTILIZAT');

-- AlterTable
ALTER TABLE "produse" ADD COLUMN     "stare" "StareProdus" NOT NULL DEFAULT 'NOU';
