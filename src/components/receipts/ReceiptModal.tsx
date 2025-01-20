import { X, Printer, Mail, Download } from 'lucide-react';
import type { CartItem } from '../../types';

interface ReceiptModalProps {
  order: any;
  items: CartItem[];
  onClose: () => void;
}

export default function ReceiptModal({ order, items, onClose }: ReceiptModalProps) {
  const handlePrint = () => {
    window.print();
  };

  const handleEmail = () => {
    // Email functionality would be implemented here
    console.log('Email receipt');
  };

  const handleDownload = () => {
    // PDF download functionality would be implemented here
    console.log('Download receipt');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Receipt</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="space-y-6 print:space-y-4">
            {/* Header */}
            <div className="text-center">
              <h1 className="text-2xl font-bold">Your Store Name</h1>
              <p className="text-gray-600">123 Store Street, City, Country</p>
              <p className="text-gray-600">Tel: (123) 456-7890</p>
            </div>

            {/* Order Details */}
            <div className="border-t border-b py-4">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p><span className="font-medium">Order #:</span> {order.order_number}</p>
                  <p><span className="font-medium">Date:</span> {new Date(order.created_at).toLocaleString()}</p>
                </div>
                <div>
                  <p><span className="font-medium">Payment Method:</span> {order.payment_method}</p>
                </div>
              </div>
            </div>

            {/* Items */}
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Item</th>
                  <th className="text-right py-2">Qty</th>
                  <th className="text-right py-2">Price</th>
                  <th className="text-right py-2">Total</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-b">
                    <td className="py-2">{item.name}</td>
                    <td className="text-right py-2">{item.quantity}</td>
                    <td className="text-right py-2">${item.price.toFixed(2)}</td>
                    <td className="text-right py-2">
                      ${(item.price * item.quantity).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${order.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax</span>
                <span>${order.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>${order.total.toFixed(2)}</span>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center text-gray-600 text-sm">
              <p>Thank you for your purchase!</p>
              <p>All sales are final. Returns accepted within 30 days with receipt.</p>
            </div>

            {/* Actions */}
            <div className="flex justify-center space-x-4 print:hidden">
              <button
                onClick={handlePrint}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <Printer className="h-4 w-4 mr-2" />
                Print
              </button>
              <button
                onClick={handleEmail}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <Mail className="h-4 w-4 mr-2" />
                Email
              </button>
              <button
                onClick={handleDownload}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}