import React from 'react';
import { Star } from 'lucide-react';

export const RatingStars = ({ rating = 0, maxRating = 5, className = "" }) => {
  return (
    <div className={`flex gap-1 ${className}`}>
      {[...Array(maxRating)].map((_, i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${
            i < Math.round(rating) 
              ? "fill-amber-400 text-amber-400" 
              : "text-stone-600 fill-transparent"
          }`}
        />
      ))}
    </div>
  );
};

export default RatingStars;