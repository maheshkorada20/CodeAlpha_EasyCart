const TermsConditions = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-xs leading-relaxed text-gray-700">
      <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Terms & Conditions</h1>
      <p className="text-gray-400 mb-8">Effective Date: September 2026</p>

      <section className="space-y-3 mb-8">
        <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">1. Acceptance of Terms</h2>
        <p>
          By creating an account, browsing products, or placing an order on EasyCart, you agree to abide by these Terms and Conditions and our Privacy Policy.
        </p>
      </section>

      <section className="space-y-3 mb-8">
        <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">2. Product Pricing & Variants</h2>
        <p>
          All product listings showcase transparent pricing, discount margins, and variant specifications (sizes, colors, stock status). Product prices are calculated and verified on our secure backend at the time of checkout.
        </p>
      </section>

      <section className="space-y-3 mb-8">
        <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">3. Order Cancellations & Returns</h2>
        <p>
          Orders can be cancelled before they are dispatched for shipping. Delivered items are eligible for our 7-Day Return and Exchange policy provided they are intact, unused, and accompanied by original packaging.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">4. User Conduct</h2>
        <p>
          Fraudulent orders, repeated abuse of coupon discounts, or unauthorized attempts to access administrator dashboards will result in immediate termination of user privileges.
        </p>
      </section>
    </div>
  );
};

export default TermsConditions;
