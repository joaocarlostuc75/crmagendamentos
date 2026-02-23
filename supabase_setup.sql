-- Multi-tenant Setup for Beauty Agenda Studio
-- Execute this in your Supabase SQL Editor
-- This script is idempotent and can be run multiple times.

-- 1. Create Tables IF THEY DO NOT EXIST

-- Profiles (Establishment details)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  owner TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  instagram TEXT,
  opening_hours TEXT,
  logo_url TEXT,
  is_super_admin BOOLEAN DEFAULT FALSE,
  plan_id UUID,
  whatsapp_number TEXT,
  slug TEXT UNIQUE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Plans
CREATE TABLE IF NOT EXISTS plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  features JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- System Features (Global toggles)
CREATE TABLE IF NOT EXISTS system_features (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  key TEXT NOT NULL UNIQUE,
  description TEXT,
  is_enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Add plan_id column to profiles if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='plan_id') THEN
    ALTER TABLE profiles ADD COLUMN plan_id UUID;
  END IF;
END $$;

-- Add foreign key to profiles after plans table is created
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'profiles_plan_id_fkey') THEN
    ALTER TABLE profiles ADD CONSTRAINT profiles_plan_id_fkey FOREIGN KEY (plan_id) REFERENCES plans(id);
  END IF;
END $$;

-- Collaborators
CREATE TABLE IF NOT EXISTS collaborators (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  email TEXT NOT NULL,
  role TEXT DEFAULT 'collaborator',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  UNIQUE(user_id, email)
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL,
  data JSONB,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Clients
CREATE TABLE IF NOT EXISTS clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  instagram TEXT,
  notes TEXT,
  img_url TEXT,
  points INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Services
CREATE TABLE IF NOT EXISTS services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  price TEXT,
  duration TEXT,
  description TEXT,
  img_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Appointments
CREATE TABLE IF NOT EXISTS appointments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES clients ON DELETE SET NULL,
  service_id UUID REFERENCES services ON DELETE SET NULL,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  status TEXT DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 2. Enable Row Level Security (RLS)

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_features ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user is super admin
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND is_super_admin = TRUE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Create RLS Policies (Drop if exists to ensure they are up-to-date)

-- Collaborators: Users can only see and edit their own collaborators
DROP POLICY IF EXISTS "Users can view own collaborators" ON collaborators;
CREATE POLICY "Users can view own collaborators" ON collaborators FOR SELECT USING (auth.uid() = user_id OR is_super_admin());

DROP POLICY IF EXISTS "Users can insert own collaborators" ON collaborators;
CREATE POLICY "Users can insert own collaborators" ON collaborators FOR INSERT WITH CHECK (auth.uid() = user_id OR is_super_admin());

DROP POLICY IF EXISTS "Users can delete own collaborators" ON collaborators;
CREATE POLICY "Users can delete own collaborators" ON collaborators FOR DELETE USING (auth.uid() = user_id OR is_super_admin());

-- Notifications: Users can only see and edit their own notifications
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id OR is_super_admin());

DROP POLICY IF EXISTS "Users can insert own notifications" ON notifications;
CREATE POLICY "Users can insert own notifications" ON notifications FOR INSERT WITH CHECK (auth.uid() = user_id OR is_super_admin());

DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id OR is_super_admin());

-- Profiles: Users can only see and edit their own profile, Super Admins see all
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id OR is_super_admin());

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id OR is_super_admin());

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id OR is_super_admin());

-- Clients: Users can only see and edit their own clients, Super Admins see all
DROP POLICY IF EXISTS "Users can view own clients" ON clients;
CREATE POLICY "Users can view own clients" ON clients FOR SELECT USING (auth.uid() = user_id OR is_super_admin());

DROP POLICY IF EXISTS "Users can insert own clients" ON clients;
CREATE POLICY "Users can insert own clients" ON clients FOR INSERT WITH CHECK (auth.uid() = user_id OR is_super_admin());

DROP POLICY IF EXISTS "Users can update own clients" ON clients;
CREATE POLICY "Users can update own clients" ON clients FOR UPDATE USING (auth.uid() = user_id OR is_super_admin());

DROP POLICY IF EXISTS "Users can delete own clients" ON clients;
CREATE POLICY "Users can delete own clients" ON clients FOR DELETE USING (auth.uid() = user_id OR is_super_admin());

-- Services: Users can only see and edit their own services, Super Admins see all
DROP POLICY IF EXISTS "Users can view own services" ON services;
CREATE POLICY "Users can view own services" ON services FOR SELECT USING (auth.uid() = user_id OR is_super_admin());

DROP POLICY IF EXISTS "Users can insert own services" ON services;
CREATE POLICY "Users can insert own services" ON services FOR INSERT WITH CHECK (auth.uid() = user_id OR is_super_admin());

DROP POLICY IF EXISTS "Users can update own services" ON services;
CREATE POLICY "Users can update own services" ON services FOR UPDATE USING (auth.uid() = user_id OR is_super_admin());

DROP POLICY IF EXISTS "Users can delete own services" ON services;
CREATE POLICY "Users can delete own services" ON services FOR DELETE USING (auth.uid() = user_id OR is_super_admin());

-- Appointments: Users can only see and edit their own appointments, Super Admins see all
DROP POLICY IF EXISTS "Users can view own appointments" ON appointments;
CREATE POLICY "Users can view own appointments" ON appointments FOR SELECT USING (auth.uid() = user_id OR is_super_admin());

DROP POLICY IF EXISTS "Users can insert own appointments" ON appointments;
CREATE POLICY "Users can insert own appointments" ON appointments FOR INSERT WITH CHECK (auth.uid() = user_id OR is_super_admin());

DROP POLICY IF EXISTS "Users can update own appointments" ON appointments;
CREATE POLICY "Users can update own appointments" ON appointments FOR UPDATE USING (auth.uid() = user_id OR is_super_admin());

DROP POLICY IF EXISTS "Users can delete own appointments" ON appointments;
CREATE POLICY "Users can delete own appointments" ON appointments FOR DELETE USING (auth.uid() = user_id OR is_super_admin());

-- Plans: Super Admins can do everything, others can only view active plans
DROP POLICY IF EXISTS "Super Admins can manage plans" ON plans;
CREATE POLICY "Super Admins can manage plans" ON plans FOR ALL USING (is_super_admin());

DROP POLICY IF EXISTS "Everyone can view active plans" ON plans;
CREATE POLICY "Everyone can view active plans" ON plans FOR SELECT USING (is_active = TRUE);

-- System Features: Super Admins can do everything, others can only view
DROP POLICY IF EXISTS "Super Admins can manage features" ON system_features;
CREATE POLICY "Super Admins can manage features" ON system_features FOR ALL USING (is_super_admin());

DROP POLICY IF EXISTS "Everyone can view features" ON system_features;
CREATE POLICY "Everyone can view features" ON system_features FOR SELECT USING (TRUE);

-- 4. Public Access
CREATE POLICY "Public can view profiles by slug" ON profiles FOR SELECT USING (true);
CREATE POLICY "Public can view services of a profile" ON services FOR SELECT USING (true);
