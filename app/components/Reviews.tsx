'use client';

import React from 'react';
import Image from 'next/image';
import { Review } from '../lib/types';
import { getImageUrl } from '../lib/appwrite';

interface ReviewsProps {
  reviews: Review[];
}

const Reviews: React.FC<ReviewsProps> = ({ reviews }) => {
  if (reviews.length === 0) {
    return <p className="p-4 text-gray-600">No reviews yet.</p>;
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold mb-4">Reviews</h2>
      <ul className="space-y-4">
        {reviews.map((review) => {
          // Convert reviewerAvatar file ID into URL if it exists.
          const reviewerAvatarUrl = review.reviewerAvatar
            ? getImageUrl(review.reviewerAvatar)
            : null;
          return (
            <li key={review.$id} className="border p-4 rounded-lg">
              <div className="flex items-center mb-2">
                {reviewerAvatarUrl && (
                  <div className="relative w-10 h-10 rounded-full overflow-hidden mr-3">
                    <Image
                      src={reviewerAvatarUrl}
                      alt={review.reviewerName}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div>
                  <p className="font-bold">{review.reviewerName}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-yellow-500">
                  {'★'.repeat(review.rating)}{' '}
                  {'☆'.repeat(5 - review.rating)}
                </p>
                <p className="mt-2 text-gray-700">{review.comment}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default Reviews;
