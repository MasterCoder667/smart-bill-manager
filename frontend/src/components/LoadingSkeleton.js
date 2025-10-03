import React from 'react';

export const SubscriptionSkeleton = () => (
  <div className="subscription-item skeleton">
    <div className="skeleton-line wide"></div>
    <div className="skeleton-line medium"></div>
    <div className="skeleton-line narrow"></div>
  </div>
);

export const CardSkeleton = () => (
  <div className="card skeleton">
    <div className="skeleton-line wide"></div>
    <div className="skeleton-line medium"></div>
    <div className="skeleton-line narrow"></div>
  </div>
);

function LoadingSkeleton({ type = 'subscription', count = 1 }) {
  const SkeletonComponent = type === 'subscription' ? SubscriptionSkeleton : CardSkeleton;
  
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonComponent key={index} />
      ))}
    </>
  );
}

export default LoadingSkeleton;