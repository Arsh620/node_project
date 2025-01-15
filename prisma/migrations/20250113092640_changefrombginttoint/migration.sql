-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "user_name" TEXT,
    "mobile" TEXT,
    "email" TEXT,
    "emailVerifiedAt" TIMESTAMP(6),
    "userType" TEXT,
    "ulbId" INTEGER,
    "password" TEXT NOT NULL,
    "suspended" BOOLEAN DEFAULT false,
    "superUser" BOOLEAN,
    "description" TEXT,
    "rememberToken" VARCHAR(100),
    "createdAt" TIMESTAMP(6),
    "updatedAt" TIMESTAMP(6),
    "workflowParticipant" BOOLEAN DEFAULT false,
    "photoRelativePath" TEXT,
    "photo" TEXT,
    "signRelativePath" TEXT,
    "signature" TEXT,
    "oldIds" BIGINT,
    "name" TEXT,
    "oldPassword" TEXT,
    "userCode" VARCHAR(50),
    "alternateMobile" TEXT,
    "address" TEXT,
    "empId" TEXT,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
