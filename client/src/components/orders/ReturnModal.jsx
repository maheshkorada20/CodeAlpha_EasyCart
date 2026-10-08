import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Modal from '../common/Modal';

const ReturnModal = ({ isOpen, onClose, order, onSuccess }) => {
  const { api } = useAuth();
  const [requestType, setRequestType] = useState('Return');
  const [reason, setReason] = useState('Defective or damaged product');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!order) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const itemsPayload = order.items.map(item => ({
        product: item.product,
        name: item.name,
        quantity: item.quantity,
        price: item.discountPrice || item.price,
      }));

      await api.post('/returns', {
        orderId: order._id,
        items: itemsPayload,
        requestType,
        reason,
        description,
      });

      setSubmitting(false);
      onClose();
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit return request');
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Request Return / Exchange: #${order.orderNumber}`}>
      {error && (
        <div className="p-3 mb-4 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div>
          <label className="block font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
            Request Type
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setRequestType('Return')}
              className={`py-2 px-4 rounded-lg font-bold border transition-all ${
                requestType === 'Return'
                  ? 'border-primary-600 bg-primary-50 text-primary-700 ring-1 ring-primary-600'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
              }`}
            >
              Return & Refund
            </button>
            <button
              type="button"
              onClick={() => setRequestType('Exchange')}
              className={`py-2 px-4 rounded-lg font-bold border transition-all ${
                requestType === 'Exchange'
                  ? 'border-primary-600 bg-primary-50 text-primary-700 ring-1 ring-primary-600'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
              }`}
            >
              Exchange Size / Item
            </button>
          </div>
        </div>

        <div>
          <label className="block font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
            Reason for {requestType}
          </label>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-primary-500 focus:border-primary-500 outline-none text-xs"
          >
            <option value="Defective or damaged product">Defective or damaged product</option>
            <option value="Size or fit issue">Size or fit issue</option>
            <option value="Received wrong item or variant">Received wrong item or variant</option>
            <option value="Item not as described or shown">Item not as described or shown</option>
            <option value="Quality not satisfactory">Quality not satisfactory</option>
          </select>
        </div>

        <div>
          <label className="block font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
            Additional Details / Notes
          </label>
          <textarea
            rows={3}
            placeholder="Please describe the issue in detail..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-primary-500 focus:border-primary-500 outline-none text-xs resize-none"
            required
          />
        </div>

        <div className="p-3 bg-gray-50 rounded-lg text-gray-500 leading-relaxed text-[11px]">
          ℹ️ Our courier partner will inspect the items at the doorstep during pickup. Once received and verified, the refund will be completed.
        </div>

        <div className="flex items-center justify-end space-x-3 pt-3 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2 text-xs font-bold text-white bg-primary-600 hover:bg-primary-700 rounded-lg shadow-sm transition-colors disabled:opacity-50"
          >
            {submitting ? 'Submitting...' : `Submit ${requestType} Request`}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ReturnModal;
