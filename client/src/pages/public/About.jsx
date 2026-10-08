import { ShieldCheck, Truck, Headphones, RotateCcw, Heart } from 'lucide-react';

const About = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <span className="text-xs font-bold uppercase tracking-wider text-primary-600 bg-primary-50 px-3 py-1 rounded-full">
          About EasyCart
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mt-4 mb-4">
          Everything You Need, Delivered Simply.
        </h1>
        <p className="text-sm text-gray-600 leading-relaxed">
          EasyCart was founded with a singular ambition: to provide a seamless, trustworthy, and modern shopping experience. Inspired by the best e-commerce platforms, we curate top-tier electronics, fashion, lifestyle, and home products with complete transparency and customer-first care.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-3">Our Core Philosophy</h2>
          <p className="text-xs text-gray-600 leading-relaxed">
            Shopping should be straightforward, fast, and secure. We focus on rigorous product curation, clear variant options (sizes, colors, and accurate specifications), verified customer ratings, and upfront pricing with zero hidden charges.
          </p>
        </div>
        <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-3">Customer Trust First</h2>
          <p className="text-xs text-gray-600 leading-relaxed">
            From flexible Cash on Delivery to doorstep return pickups and fast refund processing, every touchpoint in EasyCart is designed to protect your peace of mind and deliver value at every step.
          </p>
        </div>
      </div>

      {/* Value Pillars */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 text-center">
        <div className="p-6 bg-gray-50 rounded-2xl">
          <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-xl flex items-center justify-center mx-auto mb-3">
            <Truck className="w-6 h-6" />
          </div>
          <h3 className="text-xs font-bold text-gray-900 mb-1">Fast Delivery</h3>
          <p className="text-[11px] text-gray-500">Expedited fulfillment across major pin codes.</p>
        </div>
        <div className="p-6 bg-gray-50 rounded-2xl">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-3">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-xs font-bold text-gray-900 mb-1">100% Genuine</h3>
          <p className="text-[11px] text-gray-500">Directly sourced authentic quality products.</p>
        </div>
        <div className="p-6 bg-gray-50 rounded-2xl">
          <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center mx-auto mb-3">
            <RotateCcw className="w-6 h-6" />
          </div>
          <h3 className="text-xs font-bold text-gray-900 mb-1">7-Day Returns</h3>
          <p className="text-[11px] text-gray-500">Hassle-free doorstep returns and exchanges.</p>
        </div>
        <div className="p-6 bg-gray-50 rounded-2xl">
          <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-xl flex items-center justify-center mx-auto mb-3">
            <Headphones className="w-6 h-6" />
          </div>
          <h3 className="text-xs font-bold text-gray-900 mb-1">24/7 Support</h3>
          <p className="text-[11px] text-gray-500">Dedicated support team ready to assist you.</p>
        </div>
      </div>
    </div>
  );
};

export default About;
