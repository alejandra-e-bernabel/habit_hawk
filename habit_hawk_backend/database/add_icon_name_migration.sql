-- Migration: Add icon_name column to habits table
-- Date: 2026-07-19
-- Description: Adds icon_name field to support custom habit icons in UI

-- Add icon_name column (nullable, defaults to NULL)
ALTER TABLE habits ADD COLUMN icon_name VARCHAR(50);

-- The column is nullable, so existing habits will have NULL icon_name
-- The frontend will show a default fallback icon (circle-dashed) for NULL values
