import { Printer, X } from 'lucide-react';

const InvoiceModal = ({ isOpen, onClose, order }) => {
  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm print:p-0 print:bg-white animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto print:max-w-none print:max-h-none print:shadow-none print:border-none print:p-8">
        {/* Header with Print and Close */}
        <div className="flex items-center justify-between pb-6 border-b border-gray-200 print:hidden">
          <h2 className="text-xl font-bold text-gray-900">Tax Invoice</h2>
          <div className="flex items-center space-x-3">
            <button
              onClick={handlePrint}
              className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-semibold hover:bg-primary-700 transition-colors shadow-sm"
            >
              <Printer className="w-4 h-4 mr-2" />
              Print Invoice
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Invoice Body (Visible in Print) */}
        <div className="pt-6 space-y-6 text-sm">
          {/* Company Brand & Invoice Meta */}
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-gray-900">
                Easy<span className="text-primary-600">Cart</span>
              </h1>
              <p className="text-xs text-gray-500 mt-1">Everything you need, delivered simply.</p>
              <p className="text-xs text-gray-400 mt-0.5">GSTIN: 27AABCE1234F1Z5</p>
            </div>
            <div className="text-right">
              <span className="inline-block px-2.5 py-1 bg-gray-100 text-gray-800 text-xs font-bold rounded">
                INVOICE
              </span>
              <p className="text-xs font-mono font-bold text-gray-900 mt-1">#{order.orderNumber}</p>
              <p className="text-xs text-gray-500 mt-0.5">
                Date: {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
            </div>
          </div>

          {/* Billing & Shipping Details */}
          <div className="grid grid-cols-2 gap-6 p-4 bg-gray-50 rounded-xl">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Billed & Shipped To:</h3>
              <p className="font-bold text-gray-900">{order.shippingAddress?.fullName}</p>
              <p className="text-xs text-gray-600 leading-relaxed mt-0.5">
                {order.shippingAddress?.addressLine}
                {order.shippingAddress?.landmark ? `, ${order.shippingAddress.landmark}` : ''}<br />
                {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.postalCode}<br />
                Phone: {order.shippingAddress?.phone}
              </p>
            </div>
            <div className="text-right">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Payment Information:</h3>
              <p className="text-xs text-gray-700">Method: <strong className="text-gray-900">{order.paymentMethod}</strong></p>
              <p className="text-xs text-gray-700 mt-0.5">Payment Status: <strong className="text-gray-900">{order.paymentStatus}</strong></p>
              <p className="text-xs text-gray-700 mt-0.5">Order Status: <strong className="text-gray-900">{order.orderStatus}</strong></p>
            </div>
          </div>

          {/* Items Table */}
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200 text-left">
              <thead className="bg-gray-50 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Item Description</th>
                  <th className="px-4 py-3">Variant / SKU</th>
                  <th className="px-4 py-3 text-center">Qty</th>
                  <th className="px-4 py-3 text-right">Price</th>
                  <th className="px-4 py-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {order.items?.map((item, idx) => (
                  <tr key={idx}>
                    <td className="px-4 py-3 font-semibold text-gray-900">
                      {item.name}
                    </td>
                    <td className="px-4 py-3 text-gray-500 font-mono text-[11px]">
                      {item.size ? `Size: ${item.size}` : ''} {item.color ? `• ${item.color}` : ''}
                      <span className="block text-[10px] text-gray-400">{item.sku}</span>
                    </td>
                    <td className="px-4 py-3 text-center text-gray-700">{item.quantity}</td>
                    <td className="px-4 py-3 text-right text-gray-700">₹{(item.discountPrice || item.price).toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3 text-right font-bold text-gray-900">₹{item.total.toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals Breakdown */}
          <div className="flex justify-end">
            <div className="w-64 space-y-2 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal:</span>
                <span className="font-semibold text-gray-900">₹{order.subtotal?.toLocaleString('en-IN')}</span>
              </div>
              {order.couponDiscount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Coupon Savings:</span>
                  <span className="font-semibold">-₹{order.couponDiscount?.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-600">
                <span>Delivery Charge:</span>
                <span className="font-semibold text-gray-900">
                  {order.deliveryCharge === 0 ? 'FREE' : `₹${order.deliveryCharge}`}
                </span>
              </div>
              <div className="flex justify-between text-base font-extrabold text-gray-900 pt-2 border-t border-gray-200">
                <span>Total Amount:</span>
                <span className="text-primary-600">₹{order.totalAmount?.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Footer note */}
          <div className="pt-6 border-t border-gray-200 text-center text-[11px] text-gray-400">
            Thank you for shopping with EasyCart! For support, contact support@easycart.com.
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceModal;
