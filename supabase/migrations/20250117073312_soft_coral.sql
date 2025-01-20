/*
  # Update products table for new category structure

  1. Changes
    - Make category column nullable since we're using category_ids array
    - Set default value for category to maintain backwards compatibility
    - Add index on category_ids for better query performance

  2. Data Migration
    - Ensure existing records have a default category value
*/

-- Make category column nullable and set default
ALTER TABLE products 
  ALTER COLUMN category DROP NOT NULL,
  ALTER COLUMN category SET DEFAULT 'uncategorized';

-- Add index for category_ids array
CREATE INDEX idx_products_category_ids ON products USING GIN (category_ids);

-- Update any existing NULL categories to default value
UPDATE products SET category = 'uncategorized' WHERE category IS NULL;