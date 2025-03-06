'use client';

import { useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Box } from '@mui/material';
import { motion } from 'framer-motion';

interface RevenueData {
  month: string;
  revenue: number;
}

export function RevenueChart() {
  const chartRef = useRef<HTMLDivElement>(null);

  const { data: revenueData = [] } = useQuery<RevenueData[]>({
    queryKey: ['revenue-chart'],
    queryFn: async () => {
      const response = await axios.get('/api/dashboard/revenue');
      return response.data;
    },
  });

  const maxRevenue = Math.max(...revenueData.map((item) => item.revenue));

  return (
    <Box
      ref={chartRef}
      sx={{
        display: 'flex',
        alignItems: 'flex-end',
        gap: 2,
        height: 300,
        mt: 2,
      }}
    >
      {revenueData.map((item, index) => (
        <Box
          key={item.month}
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: `${(item.revenue / maxRevenue) * 100}%` }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            style={{
              width: '100%',
              backgroundColor: '#0068FF',
              borderRadius: 8,
            }}
          />
          <Box sx={{ textAlign: 'center' }}>
            <Box sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
              {item.month}
            </Box>
            <Box sx={{ fontSize: '0.875rem', fontWeight: 'medium' }}>
              {new Intl.NumberFormat('ar-SA', {
                style: 'currency',
                currency: 'SAR',
              }).format(item.revenue)}
            </Box>
          </Box>
        </Box>
      ))}
    </Box>
  );
} 