export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  sku: string;
  category_ids: string[];
  stock_quantity: number;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  user_id: string;
  created_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  total: number;
  subtotal: number;
  tax: number;
  payment_method: string;
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product: Product;
  quantity: number;
  price: number;
  created_at: string;
}