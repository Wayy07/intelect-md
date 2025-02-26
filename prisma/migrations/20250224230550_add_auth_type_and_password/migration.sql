-- CreateEnum
CREATE TYPE "TipAutentificare" AS ENUM ('EMAIL_PAROLA', 'GOOGLE');

-- AlterTable
ALTER TABLE "utilizatori" ADD COLUMN     "parola" TEXT,
ADD COLUMN     "tipAuth" "TipAutentificare" NOT NULL DEFAULT 'GOOGLE';
