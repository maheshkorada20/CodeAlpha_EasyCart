import { Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';

const EmptyState = ({
  icon: Icon = ShoppingBag,
  title = 'Nothing here yet',
  description = 'Looks like you have not added anything yet.',
  actionText = 'Explore Products',
  actionLink = '/products',
}) => {
  return (
    <div className="py-16 text-center max-w-md mx-auto px-4">
      <div className="w-16 h-16 bg-primary-50 text-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-sm border border-primary-100">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 mb-6 leading-relaxed">{description}</p>
      {actionLink && (
        <Link
          to={actionLink}
          className="inline-flex items-center justify-center px-6 py-2.5 bg-primary-600 text-white text-sm font-semibold rounded-lg shadow-sm hover:bg-primary-700 transition-colors"
        >
          {actionText}
        </Link>
      )}
    </div>
  );
};

export default EmptyState;
