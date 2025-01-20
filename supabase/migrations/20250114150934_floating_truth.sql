/*
  # Product Management Schema

  1. New Tables
    - `products`
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text)
      - `price` (numeric)
      - `sku` (text, unique)
      - `category` (text)
      - `stock_quantity` (integer)
      - `image_url` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `orders`
      - `id` (uuid, primary key)
      - `order_number` (text, unique)
      - `total` (numeric)
      - `subtotal` (numeric)
      - `tax` (numeric)
      - `payment_method` (text)
      - `created_at` (timestamp)
    
    - `order_items`
      - `id` (uuid, primary key)
      - `order_id` (uuid, foreign key)
      - `product_id` (uuid, foreign key)
      - `quantity` (integer)
      - `price` (numeric)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create products table
CREATE TABLE products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  price numeric NOT NULL CHECK (price >= 0),
  sku text UNIQUE NOT NULL,
  category text NOT NULL,
  stock_quantity integer DEFAULT 0,
  image_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create orders table
CREATE TABLE orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text UNIQUE NOT NULL,
  total numeric NOT NULL CHECK (total >= 0),
  subtotal numeric NOT NULL CHECK (subtotal >= 0),
  tax numeric NOT NULL CHECK (tax >= 0),
  payment_method text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create order_items table
CREATE TABLE order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE RESTRICT,
  quantity integer NOT NULL CHECK (quantity > 0),
  price numeric NOT NULL CHECK (price >= 0),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow read access to all authenticated users for products"
  ON products FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow insert access to authenticated users for products"
  ON products FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow update access to authenticated users for products"
  ON products FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Allow read access to authenticated users for orders"
  ON orders FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow insert access to authenticated users for orders"
  ON orders FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow read access to authenticated users for order_items"
  ON order_items FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow insert access to authenticated users for order_items"
  ON order_items FOR INSERT TO authenticated WITH CHECK (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for products
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();