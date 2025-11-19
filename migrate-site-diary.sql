-- Complete Database Schema Migration
-- Run this entire script in your Supabase SQL Editor to set up the database from scratch
-- This includes all tables, indexes, and constraints needed for the Site Diary application

-- ============================================================================
-- 1. SITE DIARIES TABLE
-- ============================================================================
-- Main table for storing site diary entries
CREATE TABLE IF NOT EXISTS site_diaries (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL,
  description TEXT NOT NULL,
  weather TEXT NOT NULL CHECK (weather IN ('sunny', 'partly-cloudy', 'cloudy', 'rainy', 'stormy', 'windy', 'foggy', 'snowy')),
  temperature INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Create index for faster date-based queries
CREATE INDEX IF NOT EXISTS idx_site_diaries_date ON site_diaries(date DESC);
CREATE INDEX IF NOT EXISTS idx_site_diaries_created_at ON site_diaries(created_at DESC);

-- Add comment
COMMENT ON TABLE site_diaries IS 'Main table for site diary entries with date, description, weather, and temperature';

-- ============================================================================
-- 2. VISITORS TABLE
-- ============================================================================
-- Stores visitor information for each site diary entry
CREATE TABLE IF NOT EXISTS visitors (
  id SERIAL PRIMARY KEY,
  site_diary_id INTEGER NOT NULL REFERENCES site_diaries(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  company_name TEXT,
  purpose_of_visit TEXT,
  email TEXT,
  contact_details TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Create index for faster queries by site_diary_id
CREATE INDEX IF NOT EXISTS idx_visitors_site_diary_id ON visitors(site_diary_id);

-- Add comment
COMMENT ON TABLE visitors IS 'Records visitors for each site diary entry with optional company, purpose, email, and contact details';

-- ============================================================================
-- 3. RESOURCES TABLE
-- ============================================================================
-- Master table for resources/equipment that can be used across multiple diary entries
CREATE TABLE IF NOT EXISTS resources (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  unit_of_measurement TEXT NOT NULL,
  serial_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  UNIQUE(name, serial_number)
);

-- Create index for faster name lookups
CREATE INDEX IF NOT EXISTS idx_resources_name ON resources(name);

-- Add comment
COMMENT ON TABLE resources IS 'Master list of resources/equipment with units of measurement and optional serial numbers';

-- ============================================================================
-- 4. RESOURCE UTILIZATION TABLE
-- ============================================================================
-- Junction table linking site diaries to resources with usage values
CREATE TABLE IF NOT EXISTS resource_utilization (
  id SERIAL PRIMARY KEY,
  site_diary_id INTEGER NOT NULL REFERENCES site_diaries(id) ON DELETE CASCADE,
  resource_id INTEGER NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
  value NUMERIC NOT NULL CHECK (value >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  -- Prevent duplicate resource entries for the same diary
  UNIQUE(site_diary_id, resource_id)
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_resource_utilization_site_diary_id ON resource_utilization(site_diary_id);
CREATE INDEX IF NOT EXISTS idx_resource_utilization_resource_id ON resource_utilization(resource_id);

-- Add comment
COMMENT ON TABLE resource_utilization IS 'Tracks which resources were used on each site diary entry and their quantities';

-- ============================================================================
-- 5. INCIDENTS TABLE
-- ============================================================================
-- Stores incidents that occurred on each site diary entry date
CREATE TABLE IF NOT EXISTS incidents (
  id SERIAL PRIMARY KEY,
  site_diary_id INTEGER NOT NULL REFERENCES site_diaries(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_incidents_site_diary_id ON incidents(site_diary_id);

-- Add comment
COMMENT ON TABLE incidents IS 'Records incidents that occurred on a site diary entry date';

-- ============================================================================
-- 6. TRIGGERS FOR UPDATED_AT TIMESTAMPS
-- ============================================================================
-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for site_diaries table
DROP TRIGGER IF EXISTS update_site_diaries_updated_at ON site_diaries;
CREATE TRIGGER update_site_diaries_updated_at
  BEFORE UPDATE ON site_diaries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for incidents table
DROP TRIGGER IF EXISTS update_incidents_updated_at ON incidents;
CREATE TRIGGER update_incidents_updated_at
  BEFORE UPDATE ON incidents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
-- All tables, indexes, constraints, and triggers have been created.
-- The database is now ready to use with the Site Diary application.

