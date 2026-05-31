-- ================================================
-- PadangPicks: Expand Favorites to Hotel & Lifestyle
-- ================================================

-- Add item_type column to favorites table to support multiple categories
ALTER TABLE favorites ADD COLUMN IF NOT EXISTS item_type TEXT NOT NULL DEFAULT 'coffee_shop';

-- Rename coffee_shop_id to item_id for generic usage (if exists)
-- First, check and add item_id column
ALTER TABLE favorites ADD COLUMN IF NOT EXISTS item_id UUID;

-- Copy existing coffee_shop_id data to item_id
UPDATE favorites SET item_id = coffee_shop_id WHERE item_id IS NULL AND coffee_shop_id IS NOT NULL;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_favorites_user_type ON favorites(user_id, item_type);
CREATE INDEX IF NOT EXISTS idx_favorites_item ON favorites(item_id, item_type);

-- Update RLS policies to include new favorite types
-- Drop old policy if exists and recreate
DROP POLICY IF EXISTS "Users can view their own favorites" ON favorites;
CREATE POLICY "Users can view their own favorites" ON favorites
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own favorites" ON favorites;
CREATE POLICY "Users can insert their own favorites" ON favorites
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own favorites" ON favorites;
CREATE POLICY "Users can delete their own favorites" ON favorites
  FOR DELETE USING (auth.uid() = user_id);

-- Create unique constraint to prevent duplicate favorites
ALTER TABLE favorites DROP CONSTRAINT IF EXISTS unique_user_item_favorite;
ALTER TABLE favorites ADD CONSTRAINT unique_user_item_favorite 
  UNIQUE (user_id, item_id, item_type);

-- ================================================
-- Usage example:
-- INSERT INTO favorites (user_id, item_id, item_type) VALUES (auth.uid(), 'hotel-uuid', 'hotel');
-- INSERT INTO favorites (user_id, item_id, item_type) VALUES (auth.uid(), 'lifestyle-uuid', 'lifestyle');
-- ================================================
