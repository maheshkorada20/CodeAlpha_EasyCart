const PrivacyPolicy = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-xs leading-relaxed text-gray-700">
      <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Privacy Policy</h1>
      <p className="text-gray-400 mb-8">Last updated: September 2026</p>

      <section className="space-y-4 mb-8">
        <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">1. Information We Collect</h2>
        <p>
          At EasyCart, we collect information needed to process your orders, deliver products to your specified addresses, and communicate regarding order tracking, refunds, and special coupons. This includes your name, email, phone number, and delivery addresses.
        </p>
      </section>

      <section className="space-y-4 mb-8">
        <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">2. How We Protect Your Data</h2>
        <p>
          Your passwords are encrypted using industry-standard bcrypt hashing algorithms. We employ secure HTTP-only cookies and JSON Web Tokens (JWT) for authentication sessions, ensuring that your private credentials are never exposed to cross-site scripting vulnerabilities.
        </p>
      </section>

      <section className="space-y-4 mb-8">
        <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">3. Sharing with Third Parties</h2>
        <p>
          We do not sell, trade, or rent personal identifiable information to third parties. Customer contact and address details are shared strictly with certified delivery logistics partners solely to fulfill doorstep orders and process return pickups.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">4. Contacting Our Data Officer</h2>
        <p>
          If you have questions about our data practices or wish to request profile deletion, email us at <strong className="text-primary-600">privacy@easycart.com</strong>.
        </p>
      </section>
    </div>
  );
};

export default PrivacyPolicy;
