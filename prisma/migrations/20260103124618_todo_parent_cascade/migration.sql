/*
  Warnings:

  - The primary key for the `todos` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `todos` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `parentId` column on the `todos` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- DropForeignKey
ALTER TABLE "todos" DROP CONSTRAINT "todos_parentId_fkey";

-- AlterTable
ALTER TABLE "todos" DROP CONSTRAINT "todos_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "parentId",
ADD COLUMN     "parentId" INTEGER,
ADD CONSTRAINT "todos_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE INDEX "todos_parentId_idx" ON "todos"("parentId");

-- AddForeignKey
ALTER TABLE "todos" ADD CONSTRAINT "todos_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "todos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
