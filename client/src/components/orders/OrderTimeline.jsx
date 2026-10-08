import { CheckCircle2, Clock, Truck, PackageCheck, AlertCircle, RotateCcw } from 'lucide-react';

const OrderTimeline = ({ status = 'Pending', createdAt, deliveredAt }) => {
  const steps = [
    { label: 'Ordered', icon: Clock, key: 'Pending' },
    { label: 'Confirmed', icon: CheckCircle2, key: 'Confirmed' },
    { label: 'Shipped', icon: Truck, key: 'Shipped' },
    { label: 'Out for Delivery', icon: Truck, key: 'Out for Delivery' },
    { label: 'Delivered', icon: PackageCheck, key: 'Delivered' },
  ];

  if (status === 'Cancelled') {
    return (
      <div className="bg-rose-50 border border-rose-100 rounded-xl p-4 flex items-center space-x-3 text-rose-700">
        <AlertCircle className="w-5 h-5 flex-shrink-0" />
        <div>
          <h4 className="text-sm font-bold">Order Cancelled</h4>
          <p className="text-xs text-rose-600">This order has been cancelled and will not be delivered.</p>
        </div>
      </div>
    );
  }

  if (['Return Requested', 'Returned', 'Refunded'].includes(status)) {
    return (
      <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex items-center space-x-3 text-amber-800">
        <RotateCcw className="w-5 h-5 flex-shrink-0 text-amber-600" />
        <div>
          <h4 className="text-sm font-bold">Return Status: {status}</h4>
          <p className="text-xs text-amber-700">Your return or refund process is currently underway.</p>
        </div>
      </div>
    );
  }

  const getStepIndex = (currentStatus) => {
    switch (currentStatus) {
      case 'Pending': return 0;
      case 'Confirmed':
      case 'Processing':
      case 'Packed': return 1;
      case 'Shipped': return 2;
      case 'Out for Delivery': return 3;
      case 'Delivered': return 4;
      default: return 0;
    }
  };

  const currentIndex = getStepIndex(status);

  return (
    <div className="py-4">
      <div className="relative flex items-center justify-between">
        {/* Progress Bar Line */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-gray-200 w-full z-0">
          <div
            className="h-full bg-primary-600 transition-all duration-500"
            style={{ width: `${(currentIndex / (steps.length - 1)) * 100}%` }}
          />
        </div>

        {/* Steps */}
        {steps.map((step, idx) => {
          const isCompleted = idx <= currentIndex;
          const isCurrent = idx === currentIndex;
          const Icon = step.icon;

          return (
            <div key={step.label} className="relative z-10 flex flex-col items-center">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                  isCompleted
                    ? 'bg-primary-600 text-white shadow-md'
                    : 'bg-white border-2 border-gray-200 text-gray-400'
                } ${isCurrent ? 'ring-4 ring-primary-100' : ''}`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <span
                className={`text-[11px] font-semibold mt-2 text-center ${
                  isCompleted ? 'text-gray-900' : 'text-gray-400'
                }`}
              >
                {step.label}
              </span>
              {step.key === 'Delivered' && deliveredAt && (
                <span className="text-[10px] text-gray-400">
                  {new Date(deliveredAt).toLocaleDateString()}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OrderTimeline;
