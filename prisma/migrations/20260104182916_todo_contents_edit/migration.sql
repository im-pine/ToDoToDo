/*
  Warnings:

  - Made the column `contents` on table `todos` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "todos" ALTER COLUMN "contents" SET NOT NULL,
ALTER COLUMN "contents" SET DEFAULT '';
