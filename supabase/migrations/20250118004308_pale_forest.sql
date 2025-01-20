/*
  # Add user_id to orders table

  1. Changes
    - Add user_id column to orders table
    - Make user_id NOT NULL
    - Add foreign key constraint to auth.users
    - Update RLS policies to use user_id

  2. Security
    - Drop existing policies
    - Add new policies for user-specific access
*/

-- Add user_id column
ALTER TABLE orders ADD COLUMN user_id uuid REFERENCES auth.users(id);

-- Make user_id NOT NULL for new rows
ALTER TABLE orders ALTER COLUMN user_id SET NOT NULL;

-- Drop existing policies
DROP POLICY IF EXISTS "Allow read access to authenticated users for orders" ON orders;
DROP POLICY IF EXISTS "Allow insert access to authenticated users for orders" ON orders;

-- Create new policies with user_id checks
CREATE POLICY "Users can view their own orders"
  ON orders FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own orders"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Update order_items policies
DROP POLICY IF EXISTS "Allow read access to authenticated users for order_items" ON order_items;
DROP POLICY IF EXISTS "Allow insert access to authenticated users for order_items" ON order_items;

CREATE POLICY "Users can view their own order items"
  ON order_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders o
      WHERE o.id = order_id
      AND o.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create their own order items"
  ON order_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders o
      WHERE o.id = order_id
      AND o.user_id = auth.uid()
    )
  );