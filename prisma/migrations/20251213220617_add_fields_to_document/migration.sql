/*
  Warnings:

  - Added the required column `date` to the `documents` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `documents` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "documents" ADD COLUMN     "comments" TEXT,
ADD COLUMN     "date" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "title" TEXT NOT NULL;
