import { Trash2, Plus, Minus, Loader2, CreditCard, QrCode, Banknote } from 'lucide-react';
import { useState } from 'react';
import { supabase } from '../lib/supabase';
import type { CartItem } from '../types';
import ReceiptModal from './receipts/ReceiptModal';

type PaymentMethod = 'qr' | 'cash' | 'card' | null;

interface CartProps {
  items: CartItem[];
  onUpdateQuantity: (id: string, change: number) => void;
  onRemoveItem: (id: string) => void;
  onCheckout: () => void;
}

export default function Cart({ items, onUpdateQuantity, onRemoveItem, onCheckout }: CartProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stockErrors, setStockErrors] = useState<Record<string, string>>({});
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [showPaymentSelection, setShowPaymentSelection] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<any>(null);

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + tax;

  const handlePaymentSelect = async (method: PaymentMethod) => {
    setSelectedPayment(method);
    await processPayment(method);
  };

  const processPayment = async (paymentMethod: PaymentMethod) => {
    setLoading(true);
    setError(null);
    setStockErrors({});

    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) throw new Error('Authentication error: ' + authError.message);
      if (!user) throw new Error('Please sign in to complete your order');

      // Validate stock availability only for items with stock tracking enabled
      const newStockErrors: Record<string, string> = {};
      let hasStockError = false;

      for (const item of items) {
        if (item.stock_quantity !== null) {
          const { data: product, error: stockError } = await supabase
            .from('products')
            .select('stock_quantity')
            .eq('id', item.id)
            .single();

          if (stockError) throw new Error('Failed to check stock availability');
          if (!product) throw new Error(`Product ${item.name} not found`);
          
          if (product.stock_quantity < item.quantity) {
            newStockErrors[item.id] = `Only ${product.stock_quantity} available`;
            hasStockError = true;
          }
        }
      }

      if (hasStockError) {
        setStockErrors(newStockErrors);
        throw new Error('Some items have insufficient stock');
      }

      // Create order
      const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([{
          order_number: orderNumber,
          total,
          subtotal,
          tax,
          payment_method: paymentMethod,
          user_id: user.id
        }])
        .select()
        .single();

      if (orderError) throw new Error('Failed to create order: ' + orderError.message);
      if (!order) throw new Error('Order creation failed');

      // Create order items
      const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.id,
        quantity: item.quantity,
        price: item.price
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw new Error('Failed to create order items: ' + itemsError.message);

      // Update stock quantities only for items with stock tracking enabled
      for (const item of items) {
        if (item.stock_quantity !== null) {
          const { error: stockError } = await supabase
            .from('products')
            .update({ 
              stock_quantity: supabase.raw('stock_quantity - ?', [item.quantity])
            })
            .eq('id', item.id)
            .gt('stock_quantity', item.quantity - 1);

          if (stockError) throw new Error(`Failed to update stock for ${item.name}`);
        }
      }

      setOrderSuccess(true);
      setCurrentOrder({ ...order, items: items });
      setShowReceipt(true);
      
      setTimeout(() => {
        onCheckout();
        setOrderSuccess(false);
        setShowPaymentSelection(false);
        setSelectedPayment(null);
      }, 5000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to process order';
      setError(errorMessage);
      console.error('Checkout error:', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleProceedToPayment = () => {
    if (items.length === 0) {
      setError('Cart is empty');
      return;
    }
    setShowPaymentSelection(true);
  };

  return (
    <div className="bg-gray-50 w-96 p-4 flex flex-col h-full">
      <h2 className="text-xl font-bold mb-4">Current Order</h2>
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4">
          {error}
        </div>
      )}
      {orderSuccess && (
        <div className="bg-green-50 text-green-600 p-3 rounded-md mb-4">
          Order processed successfully! Generating receipt...
        </div>
      )}
      
      {showPaymentSelection ? (
        <div className="flex-1 flex flex-col space-y-4">
          <h3 className="text-lg font-semibold">Select Payment Method</h3>
          <button
            onClick={() => handlePaymentSelect('qr')}
            disabled={loading}
            className="flex items-center justify-center space-x-2 p-4 rounded-lg border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-colors disabled:opacity-50"
          >
            <QrCode className="h-6 w-6" />
            <span>QR Code Payment</span>
          </button>
          <button
            onClick={() => handlePaymentSelect('cash')}
            disabled={loading}
            className="flex items-center justify-center space-x-2 p-4 rounded-lg border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-colors disabled:opacity-50"
          >
            <Banknote className="h-6 w-6" />
            <span>Cash Payment</span>
          </button>
          <button
            onClick={() => handlePaymentSelect('card')}
            disabled={loading}
            className="flex items-center justify-center space-x-2 p-4 rounded-lg border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-colors disabled:opacity-50"
          >
            <CreditCard className="h-6 w-6" />
            <span>Credit Card Payment</span>
          </button>
          {loading && (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="animate-spin h-6 w-6 text-blue-600" />
              <span className="ml-2">Processing payment...</span>
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="flex-1 overflow-y-auto">
            {items.map((item) => (
              <div key={item.id} className="bg-white p-3 rounded-lg mb-2 shadow-sm">
                <div className="flex justify-between items-start">
                  <h3 className="font-medium">{item.name}</h3>
                  <button
                    onClick={() => onRemoveItem(item.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onUpdateQuantity(item.id, -1)}
                      className="p-1 rounded-full hover:bg-gray-100"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <button
                      onClick={() => onUpdateQuantity(item.id, 1)}
                      className="p-1 rounded-full hover:bg-gray-100"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <span className="font-medium">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
                {stockErrors[item.id] && (
                  <div className="mt-2 text-sm text-red-600">
                    {stockErrors[item.id]}
                  </div>
                )}
                {item.stock_quantity !== null && (
                  <div className="mt-1 text-sm text-gray-500">
                    In stock: {item.stock_quantity}
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="border-t pt-4 mt-4 space-y-2">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax (8%)</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <button
              onClick={handleProceedToPayment}
              disabled={items.length === 0 || loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              Proceed to Payment
            </button>
          </div>
        </>
      )}

      {showReceipt && currentOrder && (
        <ReceiptModal
          order={currentOrder}
          items={items}
          onClose={() => setShowReceipt(false)}
        />
      )}
    </div>
  );
}