-- CreateEnum
CREATE TYPE "TodoState" AS ENUM ('PENDING', 'IN_PROGRESS', 'ON_HOLD', 'DONE');

-- CreateTable
CREATE TABLE "todos" (
    "id" UUID NOT NULL,
    "parentId" UUID,
    "title" VARCHAR(255) NOT NULL,
    "contents" TEXT,
    "state" "TodoState" NOT NULL DEFAULT 'PENDING',
    "date" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deadline" TIMESTAMP(6),

    CONSTRAINT "todos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "todos_parentId_idx" ON "todos"("parentId");

-- CreateIndex
CREATE INDEX "todos_state_idx" ON "todos"("state");

-- AddForeignKey
ALTER TABLE "todos" ADD CONSTRAINT "todos_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "todos"("id") ON DELETE SET NULL ON UPDATE CASCADE;
