-- CreateEnum
CREATE TYPE "RolUtilizator" AS ENUM ('ADMIN', 'CLIENT');

-- CreateEnum
CREATE TYPE "StatusComanda" AS ENUM ('IN_ASTEPTARE', 'CONFIRMATA', 'IN_PROCESARE', 'EXPEDIATA', 'LIVRATA', 'ANULATA');

-- CreateEnum
CREATE TYPE "MetodaPlata" AS ENUM ('CARD', 'RAMBURS', 'TRANSFER_BANCAR');

-- CreateTable
CREATE TABLE "utilizatori" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "nume" TEXT,
    "imagine" TEXT,
    "rol" "RolUtilizator" NOT NULL DEFAULT 'CLIENT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "utilizatori_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categorii_principale" (
    "id" TEXT NOT NULL,
    "nume" TEXT NOT NULL,
    "descriere" TEXT,
    "imagine" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "activ" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "categorii_principale_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subcategorii" (
    "id" TEXT NOT NULL,
    "nume" TEXT NOT NULL,
    "descriere" TEXT,
    "imagine" TEXT,
    "categoriePrincipalaId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "activ" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "subcategorii_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "produse" (
    "id" TEXT NOT NULL,
    "cod" TEXT NOT NULL,
    "nume" TEXT NOT NULL,
    "descriere" TEXT NOT NULL,
    "pret" DOUBLE PRECISION NOT NULL,
    "pretRedus" DOUBLE PRECISION,
    "stoc" INTEGER NOT NULL DEFAULT 0,
    "imagini" TEXT[],
    "specificatii" JSONB,
    "subcategorieId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "activ" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "produse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comenzi" (
    "id" TEXT NOT NULL,
    "utilizatorId" TEXT NOT NULL,
    "numarComanda" TEXT NOT NULL,
    "status" "StatusComanda" NOT NULL DEFAULT 'IN_ASTEPTARE',
    "adresaLivrare" TEXT NOT NULL,
    "telefon" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "metodaPlata" "MetodaPlata" NOT NULL,
    "totalComanda" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "comenzi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "detalii_comenzi" (
    "id" TEXT NOT NULL,
    "comandaId" TEXT NOT NULL,
    "produsId" TEXT NOT NULL,
    "cantitate" INTEGER NOT NULL,
    "pretUnitar" DOUBLE PRECISION NOT NULL,
    "subtotal" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "detalii_comenzi_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "utilizatori_email_key" ON "utilizatori"("email");

-- CreateIndex
CREATE UNIQUE INDEX "categorii_principale_nume_key" ON "categorii_principale"("nume");

-- CreateIndex
CREATE UNIQUE INDEX "subcategorii_nume_categoriePrincipalaId_key" ON "subcategorii"("nume", "categoriePrincipalaId");

-- CreateIndex
CREATE UNIQUE INDEX "produse_cod_key" ON "produse"("cod");

-- CreateIndex
CREATE UNIQUE INDEX "comenzi_numarComanda_key" ON "comenzi"("numarComanda");

-- AddForeignKey
ALTER TABLE "subcategorii" ADD CONSTRAINT "subcategorii_categoriePrincipalaId_fkey" FOREIGN KEY ("categoriePrincipalaId") REFERENCES "categorii_principale"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "produse" ADD CONSTRAINT "produse_subcategorieId_fkey" FOREIGN KEY ("subcategorieId") REFERENCES "subcategorii"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comenzi" ADD CONSTRAINT "comenzi_utilizatorId_fkey" FOREIGN KEY ("utilizatorId") REFERENCES "utilizatori"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detalii_comenzi" ADD CONSTRAINT "detalii_comenzi_comandaId_fkey" FOREIGN KEY ("comandaId") REFERENCES "comenzi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detalii_comenzi" ADD CONSTRAINT "detalii_comenzi_produsId_fkey" FOREIGN KEY ("produsId") REFERENCES "produse"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
