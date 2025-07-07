import React, { Suspense } from 'react';
import LoadingSpinner from './LoadingSpinner';

interface LazyLoaderProps {
  children: React.ReactNode;
}

const LazyLoader: React.FC<LazyLoaderProps> = ({ children }) => (
  <Suspense fallback={<LoadingSpinner />}>
    {children}
  </Suspense>
);

export default LazyLoader; 