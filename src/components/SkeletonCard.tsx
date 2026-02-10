import React from 'react';
import Skeleton from './Skeleton';

const SkeletonCard: React.FC = () => {
  return (
    <div className="bg-[#1a1a1a] border border-white/10 overflow-hidden rounded-sm shadow-2xl">
      {/* Image placeholder with gradient overlay */}
      <div className="aspect-[3/2] relative overflow-hidden">
        <Skeleton variant="rect" className="w-full h-full" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent opacity-60"></div>
        {/* Category badge placeholder */}
        <div className="absolute top-4 left-4">
          <Skeleton variant="rect" className="h-6 w-16" />
        </div>
      </div>
      
      <div className="p-6 space-y-4">
        {/* Title and price row */}
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <Skeleton variant="text" className="h-7 w-40" />
            <Skeleton variant="text" className="h-4 w-12" />
          </div>
          <div className="text-right space-y-2">
            <Skeleton variant="text" className="h-6 w-16" />
            <Skeleton variant="text" className="h-3 w-12" />
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2">
          <div className="flex items-center space-x-1">
            <Skeleton variant="rect" className="h-3 w-3" />
            <Skeleton variant="text" className="h-3 w-12" />
          </div>
          <div className="flex items-center space-x-1">
            <Skeleton variant="rect" className="h-3 w-3" />
            <Skeleton variant="text" className="h-3 w-10" />
          </div>
          <div className="flex items-center space-x-1">
            <Skeleton variant="rect" className="h-3 w-3" />
            <Skeleton variant="text" className="h-3 w-10" />
          </div>
        </div>

        {/* Button placeholder */}
        <Skeleton variant="rect" className="h-10 w-full" />
      </div>
    </div>
  );
};

export default SkeletonCard;
