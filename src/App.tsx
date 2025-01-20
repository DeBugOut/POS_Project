import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import Navigation from './components/Navigation';
import Sidebar from './components/Sidebar';
import ProductGrid from './components/ProductGrid';
import Cart from './components/Cart';
import Auth from './components/Auth';
import ProductList from './components/products/ProductList';
import type { Product, CartItem } from './types';

export default function App() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [session, setSession] = useState(null);
  const [showProductManagement, setShowProductManagement] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) {
      fetchProducts();
    }
  }, [session, selectedCategory]);

  const fetchProducts = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const query = supabase
        .from('products')
        .select('*')
        .eq('user_id', user.id);

      if (selectedCategory !== 'All') {
        query.ilike('category', selectedCategory);
      }

      const { data, error } = await query;
      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProductSelect = (product: Product) => {
    setCartItems(items => {
      const existing = items.find(item => item.id === product.id);
      if (existing) {
        return items.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...items, { ...product, quantity: 1 }];
    });
  };

  const handleUpdateQuantity = (id: string, change: number) => {
    setCartItems(items =>
      items.map(item =>
        item.id === id
          ? { ...item, quantity: Math.max(0, item.quantity + change) }
          : item
      ).filter(item => item.quantity > 0)
    );
  };

  const handleRemoveItem = (id: string) => {
    setCartItems(items => items.filter(item => item.id !== id));
  };

  const handleCheckout = () => {
    setCartItems([]);
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <Auth />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      <Navigation />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          onCategorySelect={setSelectedCategory}
          onManageProducts={() => setShowProductManagement(true)}
        />
        <main className="flex-1 flex overflow-hidden">
          {showProductManagement ? (
            <div className="flex-1 overflow-y-auto bg-gray-50">
              <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center p-6">
                  <h1 className="text-2xl font-bold">Product Management</h1>
                  <button
                    onClick={() => setShowProductManagement(false)}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    Back to POS
                  </button>
                </div>
                <ProductList />
              </div>
            </div>
          ) : (
            <>
              <ProductGrid
                products={products}
                onProductSelect={handleProductSelect}
                loading={loading}
              />
              <Cart
                items={cartItems}
                onUpdateQuantity={handleUpdateQuantity}
                onRemoveItem={handleRemoveItem}
                onCheckout={handleCheckout}
              />
            </>
          )}
        </main>
      </div>
    </div>
  );
}