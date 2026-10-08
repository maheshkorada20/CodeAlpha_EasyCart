import { Link } from 'react-router-dom';
import { Home, Search, ArrowLeft, ShoppingBag } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-16 animate-fade-in">
      <div className="text-center max-w-lg">
        {/* Giant 404 number */}
        <div className="relative">
          <h1 className="text-[140px] sm:text-[180px] font-black text-gray-100 leading-none select-none">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 text-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-2">
                <Search className="w-8 h-8" />
              </div>
              <p className="text-sm font-black text-gray-700 uppercase tracking-widest">
                Page Not Found
              </p>
            </div>
          </div>
        </div>

        <h2 className="text-2xl font-black text-gray-900 mt-2 tracking-tight">
          Oops! This page doesn&apos;t exist.
        </h2>
        <p className="text-gray-500 text-sm mt-3 leading-relaxed">
          The page you're looking for may have been moved, deleted, or never existed. 
          Let's get you back to shopping!
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold text-sm transition-all shadow-sm hover:shadow-md"
          >
            <Home className="w-4 h-4" />
            Back to Home
          </Link>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white hover:bg-gray-50 text-gray-800 border border-gray-200 rounded-xl font-bold text-sm transition-all shadow-sm"
          >
            <ShoppingBag className="w-4 h-4" />
            Browse Products
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
