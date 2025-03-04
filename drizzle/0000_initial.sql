-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username TEXT NOT NULL,
  password TEXT NOT NULL,
  "isPremium" BOOLEAN NOT NULL DEFAULT false,
  "generationCount" INTEGER NOT NULL DEFAULT 0
);

-- Create resumes table
CREATE TABLE IF NOT EXISTS resumes (
  id SERIAL PRIMARY KEY,
  "userId" INTEGER NOT NULL,
  name TEXT NOT NULL,
  "templateId" TEXT NOT NULL,
  content JSONB NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create session table for connect-pg-simple
CREATE TABLE IF NOT EXISTS "session" (
  "sid" varchar NOT NULL COLLATE "default",
  "sess" json NOT NULL,
  "expire" timestamp(6) NOT NULL,
  CONSTRAINT "session_pkey" PRIMARY KEY ("sid")
); 