import { Star } from 'lucide-react';

const RatingStars = ({ rating = 0, numReviews, size = 'sm', showCount = true }) => {
  const iconSize = size === 'lg' ? 'w-5 h-5' : size === 'md' ? 'w-4 h-4' : 'w-3.5 h-3.5';
  const roundedRating = Math.round(rating * 10) / 10;

  return (
    <div className="flex items-center space-x-1.5">
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${iconSize} ${
              star <= Math.round(rating)
                ? 'text-amber-400 fill-amber-400'
                : 'text-gray-200 fill-gray-100'
            } transition-colors`}
          />
        ))}
      </div>
      {showCount && (
        <span className="text-xs font-semibold text-gray-700">
          {roundedRating > 0 ? roundedRating : 'New'}
          {numReviews !== undefined && (
            <span className="text-gray-400 font-normal ml-1">({numReviews})</span>
          )}
        </span>
      )}
    </div>
  );
};

export default RatingStars;
