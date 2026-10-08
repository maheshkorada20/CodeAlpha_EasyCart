import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="mb-8 md:mb-0">
            <span className="font-bold text-2xl text-white tracking-tight mb-4 block">EasyCart</span>
            <p className="text-gray-400 text-sm leading-relaxed">
              Everything you need, delivered simply. Your one-stop shop for premium products at great prices.
            </p>
          </div>
          
          <div>
            <h3 className="text-white font-semibold mb-4">Shop</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/products" className="hover:text-primary-500 transition-colors">All Products</Link></li>
              <li><Link to="/category/electronics" className="hover:text-primary-500 transition-colors">Electronics</Link></li>
              <li><Link to="/category/fashion" className="hover:text-primary-500 transition-colors">Fashion</Link></li>
              <li><Link to="/category/home-kitchen" className="hover:text-primary-500 transition-colors">Home & Kitchen</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-white font-semibold mb-4">Customer Service</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/customer/dashboard" className="hover:text-primary-500 transition-colors">My Account</Link></li>
              <li><Link to="/customer/orders" className="hover:text-primary-500 transition-colors">Track Order</Link></li>
              <li><Link to="/returns" className="hover:text-primary-500 transition-colors">Returns & Exchanges</Link></li>
              <li><Link to="/faq" className="hover:text-primary-500 transition-colors">FAQ</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-white font-semibold mb-4">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/about" className="hover:text-primary-500 transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-primary-500 transition-colors">Contact Us</Link></li>
              <li><Link to="/privacy-policy" className="hover:text-primary-500 transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-primary-500 transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} EasyCart. All rights reserved.
          </p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            {/* Social Icons could go here */}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
