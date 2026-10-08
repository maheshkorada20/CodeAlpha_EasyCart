import { Loader2 } from 'lucide-react';

const LoadingSpinner = ({ text = 'Loading...', fullScreen = false }) => {
  if (fullScreen) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 text-primary-600 animate-spin" />
        <p className="text-sm font-medium text-gray-500">{text}</p>
      </div>
    );
  }

  return (
    <div className="py-12 flex flex-col items-center justify-center space-y-3">
      <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
      <p className="text-xs font-medium text-gray-500">{text}</p>
    </div>
  );
};

export default LoadingSpinner;
