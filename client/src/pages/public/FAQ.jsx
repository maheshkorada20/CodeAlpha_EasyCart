import { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(0);

  const faqs = [
    {
      q: 'How do I place an order with Cash on Delivery (COD)?',
      a: 'Add your preferred product variants to your cart, proceed to Checkout, select or enter your delivery address, and choose Cash on Delivery as your payment method. You will pay the courier executive in cash or UPI at the doorstep when your parcel arrives.',
    },
    {
      q: 'How does the 7-Day Easy Return / Exchange policy work?',
      a: 'If you are unsatisfied with your order or need another size, you can submit a return or exchange request directly from your My Orders page within 7 days of delivery. Our courier partner will pick up the item from your doorstep, and your refund will be processed upon inspection.',
    },
    {
      q: 'How can I apply promo coupons to save on my order?',
      a: 'You can discover active discount coupons on the Offers page or copy codes like WELCOME10 or EASY500. Enter the code in the coupon field during checkout or in your Cart to see immediate deductions reflected on your order total.',
    },
    {
      q: 'Can I choose different sizes and colors for a single product?',
      a: 'Yes! EasyCart features complete product variant support. On the Product Details page, click any available size and color to inspect current pricing, live inventory, and high-resolution variant images before adding to cart.',
    },
    {
      q: 'How do I track my order timeline?',
      a: 'Visit My Orders and click "Track" or "View Details" on your order. You will see a live graphical timeline updating from Ordered -> Confirmed -> Shipped -> Out for Delivery -> Delivered.',
    },
    {
      q: 'Are all customer reviews verified?',
      a: 'Yes. Only customers who have purchased and received the product can leave verified purchase reviews. Reviews are moderated to ensure genuine, authentic customer experiences.',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <span className="text-xs font-bold uppercase tracking-wider text-primary-600 bg-primary-50 px-3 py-1 rounded-full">
          Frequently Asked Questions
        </span>
        <h1 className="text-3xl font-extrabold text-gray-900 mt-3 mb-2">
          Got Questions? We Have Answers.
        </h1>
        <p className="text-xs text-gray-500">
          Everything you need to know about EasyCart orders, payments, returns, and delivery.
        </p>
      </div>

      <div className="space-y-3">
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm transition-all"
            >
              <button
                onClick={() => setOpenIndex(isOpen ? -1 : idx)}
                className="w-full flex items-center justify-between p-5 text-left text-xs font-bold text-gray-900 hover:text-primary-600 transition-colors"
              >
                <span className="flex items-center space-x-2">
                  <HelpCircle className="w-4 h-4 text-primary-500 flex-shrink-0" />
                  <span>{faq.q}</span>
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                    isOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {isOpen && (
                <div className="px-5 pb-5 text-xs text-gray-600 leading-relaxed border-t border-gray-50 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FAQ;
