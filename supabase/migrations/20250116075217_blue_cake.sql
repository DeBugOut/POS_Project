/*
  # Add user_id to products table

  1. Changes
    - Add user_id column to products table
    - Add foreign key constraint to auth.users
    - Update RLS policies to use user_id for row-level access control

  2. Security
    - Enable RLS
    - Add policies for user-specific access
*/

-- Add user_id column
ALTER TABLE products ADD COLUMN user_id uuid REFERENCES auth.users(id);

-- Make user_id NOT NULL for new rows
ALTER TABLE products ALTER COLUMN user_id SET NOT NULL;

-- Drop existing policies
DROP POLICY IF EXISTS "Allow read access to all authenticated users for products" ON products;
DROP POLICY IF EXISTS "Allow insert access to authenticated users for products" ON products;
DROP POLICY IF EXISTS "Allow update access to authenticated users for products" ON products;

-- Create new policies with user_id checks
CREATE POLICY "Users can view their own products"
  ON products FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own products"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own products"
  ON products FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own products"
  ON products FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);