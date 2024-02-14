-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "limit" INTEGER NOT NULL,
    "initial_balance" INTEGER NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);
