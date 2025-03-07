import { Box, Skeleton } from '@mui/material';

interface SkeletonLoaderProps {
  type: 'table' | 'card' | 'details';
  count?: number;
}

export const SkeletonLoader = ({ type, count = 1 }: SkeletonLoaderProps) => {
  const renderTableSkeleton = () => (
    <Box className="w-full">
      {/* رأس الجدول */}
      <Box className="flex gap-4 mb-4">
        <Skeleton variant="rectangular" width={150} height={40} />
        <Skeleton variant="rectangular" width={200} height={40} />
      </Box>
      
      {/* صفوف الجدول */}
      {Array(count).fill(0).map((_, index) => (
        <Box key={index} className="flex gap-4 mb-4">
          <Skeleton variant="rectangular" width="100%" height={50} />
        </Box>
      ))}
    </Box>
  );

  const renderCardSkeleton = () => (
    <Box className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array(count).fill(0).map((_, index) => (
        <Box key={index} className="p-4 rounded-xl border">
          <Skeleton variant="rectangular" width="100%" height={200} className="mb-4 rounded-lg" />
          <Skeleton variant="text" width="80%" height={24} className="mb-2" />
          <Skeleton variant="text" width="60%" height={20} className="mb-4" />
          <Box className="flex gap-2">
            <Skeleton variant="rectangular" width={100} height={36} className="rounded-lg" />
            <Skeleton variant="rectangular" width={100} height={36} className="rounded-lg" />
          </Box>
        </Box>
      ))}
    </Box>
  );

  const renderDetailsSkeleton = () => (
    <Box className="w-full max-w-2xl mx-auto">
      <Box className="flex gap-4 mb-6">
        <Skeleton variant="circular" width={80} height={80} />
        <Box className="flex-1">
          <Skeleton variant="text" width="60%" height={32} className="mb-2" />
          <Skeleton variant="text" width="40%" height={24} />
        </Box>
      </Box>
      
      {Array(4).fill(0).map((_, index) => (
        <Box key={index} className="mb-4">
          <Skeleton variant="text" width="30%" height={20} className="mb-2" />
          <Skeleton variant="rectangular" width="100%" height={56} className="rounded-lg" />
        </Box>
      ))}
    </Box>
  );

  switch (type) {
    case 'table':
      return renderTableSkeleton();
    case 'card':
      return renderCardSkeleton();
    case 'details':
      return renderDetailsSkeleton();
    default:
      return null;
  }
}; 