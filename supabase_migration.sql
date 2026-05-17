-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- Adds the consumed and wasted columns required for the Use/Waste buttons

ALTER TABLE inventory_items
  ADD COLUMN IF NOT EXISTS consumed BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS wasted   BOOLEAN NOT NULL DEFAULT false;
