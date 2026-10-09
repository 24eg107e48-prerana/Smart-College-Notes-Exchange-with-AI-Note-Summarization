import React from 'react';
import { Star } from 'lucide-react';

export const RatingStars = ({ rating = 0, maxRating = 5, onRate = null, size = 16 }) => {
  const stars = [];

  for (let i = 1; i <= maxRating; i++) {
    const isFilled = i <= Math.round(rating);
    stars.push(
      <span
        key={i}
        onClick={() => onRate && onRate(i)}
        style={{
          cursor: onRate ? 'pointer' : 'default',
          display: 'inline-flex',
          transition: 'transform 0.15s ease',
        }}
        title={`${i} Stars`}
      >
        <Star
          size={size}
          color={isFilled ? '#f59e0b' : '#cbd5e1'}
          fill={isFilled ? '#f59e0b' : 'transparent'}
        />
      </span>
    );
  }

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
      {stars}
    </div>
  );
};
