import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'rect' | 'circle';
  width?: string | number;
  height?: string | number;
}

const Skeleton: React.FC<SkeletonProps> = ({ 
  className = '', 
  variant = 'rect', 
  width, 
  height 
}) => {
  const baseClass = 'animate-pulse bg-gray-200 dark:bg-gray-700';
  
  const variantClasses = {
    text: 'rounded',
    rect: 'rounded-lg',
    circle: 'rounded-full',
  };

  const style: React.CSSProperties = {
    width: width || '100%',
    height: height || 'auto',
  };

  return (
    <div
      className={`${baseClass} ${variantClasses[variant]} ${className}`}
      style={style}
    />
  );
};

// Preset Skeleton Components for common patterns
export const SkeletonCard: React.FC = () => (
  <div className="bg-white rounded-2xl shadow-md border border-slate-100 overflow-hidden flex flex-col">
    <Skeleton variant="rect" className="aspect-[4/3] w-full" />
    <div className="p-5 space-y-4">
      <Skeleton variant="text" className="h-6 w-3/4" />
      <Skeleton variant="text" className="h-4 w-1/2" />
      <div className="grid grid-cols-3 gap-3 py-3 border-y border-slate-100">
        <Skeleton variant="rect" className="h-12" />
        <Skeleton variant="rect" className="h-12" />
        <Skeleton variant="rect" className="h-12" />
      </div>
      <div className="flex gap-2">
        <Skeleton variant="rect" className="h-10 flex-1" />
        <Skeleton variant="rect" className="h-10 w-10" />
      </div>
    </div>
  </div>
);

export const SkeletonTableRow: React.FC<{ columns: number }> = ({ columns }) => (
  <tr className="border-b border-gray-100">
    {Array.from({ length: columns }).map((_, i) => (
      <td key={i} className="px-6 py-4">
        <Skeleton variant="text" className="h-4 w-20" />
      </td>
    ))}
  </tr>
);

export const SkeletonTable: React.FC<{ rows?: number; columns: number }> = ({ rows = 5, columns }) => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
    <div className="p-4 border-b border-gray-100">
      <Skeleton variant="text" className="h-6 w-48" />
    </div>
    <table className="w-full">
      <thead>
        <tr className="bg-gray-50">
          {Array.from({ length: columns }).map((_, i) => (
            <th key={i} className="px-6 py-3">
              <Skeleton variant="text" className="h-4 w-20" />
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: rows }).map((_, i) => (
          <SkeletonTableRow key={i} columns={columns} />
        ))}
      </tbody>
    </table>
  </div>
);

export const SkeletonStats: React.FC = () => (
  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
    {Array.from({ length: 4 }).map((_, i) => (
      <div key={i} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <Skeleton variant="text" className="h-4 w-32" />
        <Skeleton variant="text" className="h-8 w-20 mt-2" />
      </div>
    ))}
  </div>
);

export const SkeletonChart: React.FC = () => (
  <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100 space-y-6">
    <Skeleton variant="text" className="h-6 w-40" />
    <Skeleton variant="rect" className="h-[300px] w-full" />
  </div>
);

export const SkeletonForm: React.FC = () => (
  <div className="space-y-6">
    <Skeleton variant="text" className="h-8 w-48" />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton variant="text" className="h-4 w-24" />
          <Skeleton variant="rect" className="h-12 w-full" />
        </div>
      ))}
    </div>
  </div>
);

export const SkeletonProfile: React.FC = () => (
  <div className="glass p-8 rounded-sm space-y-6">
    <div className="flex items-center space-x-6">
      <Skeleton variant="circle" className="w-20 h-20" />
      <div className="space-y-2">
        <Skeleton variant="text" className="h-6 w-40" />
        <Skeleton variant="text" className="h-4 w-24" />
      </div>
    </div>
    <div className="grid grid-cols-2 gap-4">
      <Skeleton variant="rect" className="h-24" />
      <Skeleton variant="rect" className="h-24" />
    </div>
  </div>
);

export default Skeleton;
