import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  FolderTree,
  Tag,
  Image,
  RotateCcw,
  Star,
  Users,
  AlertTriangle,
  ExternalLink,
  LogOut,
  Menu,
  X,
  ShieldCheck,
} from 'lucide-react';
import { useState } from 'react';

const AdminLayout = ({ children, title, subtitle, action }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { label: 'Dashboard & Analytics', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Products & Variants', path: '/admin/products', icon: Package },
    { label: 'Orders Management', path: '/admin/orders', icon: ShoppingBag },
    { label: 'Categories', path: '/admin/categories', icon: FolderTree },
    { label: 'Coupons & Discounts', path: '/admin/coupons', icon: Tag },
    { label: 'Banners & Offers', path: '/admin/banners', icon: Image },
    { label: 'Returns & Refunds', path: '/admin/returns', icon: RotateCcw },
    { label: 'Review Moderation', path: '/admin/reviews', icon: Star },
    { label: 'Customer Directory', path: '/admin/users', icon: Users },
    { label: 'Inventory Monitor', path: '/admin/inventory', icon: AlertTriangle },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100/70 flex flex-col md:flex-row">
      {/* Mobile Header Bar */}
      <div className="md:hidden bg-gray-900 text-white px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-5 h-5 text-primary-400" />
          <span className="font-bold text-sm tracking-tight">EasyCart Admin</span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-1.5 text-gray-400 hover:text-white"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed md:sticky top-0 left-0 h-screen w-64 bg-gray-900 text-gray-300 flex flex-col z-50 transition-transform duration-300 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="p-6 border-b border-gray-800 flex items-center justify-between">
          <div>
            <span className="text-xl font-black text-white tracking-tight flex items-center gap-1.5">
              Easy<span className="text-primary-400">Cart</span>
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-primary-400 bg-primary-950/60 border border-primary-900 px-2 py-0.5 rounded-full inline-block mt-1">
              Admin Portal
            </span>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="md:hidden text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto hide-scrollbar text-xs font-semibold">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl transition-colors ${
                  isActive
                    ? 'bg-primary-600 text-white font-bold shadow-sm'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Footer Actions */}
        <div className="p-4 border-t border-gray-800 space-y-2 text-xs">
          <Link
            to="/"
            className="flex items-center space-x-2 text-gray-400 hover:text-white px-3 py-2 rounded-xl hover:bg-gray-800 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            <span>View Public Storefront</span>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-2 text-rose-400 hover:text-rose-300 px-3 py-2 rounded-xl hover:bg-rose-950/30 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <div className="p-6 sm:p-8 max-w-7xl w-full mx-auto space-y-6">
          {/* Top Section Header */}
          {(title || action) && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-gray-200 gap-4">
              <div>
                <h1 className="text-2xl font-black text-gray-900 tracking-tight">{title}</h1>
                {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
              </div>
              {action && <div>{action}</div>}
            </div>
          )}

          {/* Page Body */}
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
