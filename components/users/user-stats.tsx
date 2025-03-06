'use client';

import { Grid, Paper, Typography, Box } from '@mui/material';
import {
  IconShoppingCart,
  IconWallet,
  IconMapPin,
  IconStar,
  IconClock,
} from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

interface UserStats {
  totalOrders: number;
  completedOrders: number;
  walletBalance: number;
  totalLocations: number;
  rating?: number;
  memberSince: string;
}

interface UserStatsProps {
  userId: string;
}

export function UserStats({ userId }: UserStatsProps) {
  const { data: stats } = useQuery<UserStats>({
    queryKey: ['user-stats', userId],
    queryFn: async () => {
      const response = await axios.get(`/api/users/${userId}/stats`);
      return response.data;
    },
  });

  if (!stats) return null;

  const statItems = [
    {
      icon: IconShoppingCart,
      label: 'إجمالي الطلبات',
      value: stats.totalOrders,
      color: 'primary.main',
    },
    {
      icon: IconWallet,
      label: 'رصيد المحفظة',
      value: new Intl.NumberFormat('ar-SA', {
        style: 'currency',
        currency: 'SAR',
      }).format(stats.walletBalance),
      color: 'success.main',
    },
    {
      icon: IconMapPin,
      label: 'العناوين المحفوظة',
      value: stats.totalLocations,
      color: 'warning.main',
    },
    {
      icon: IconStar,
      label: 'التقييم',
      value: stats.rating ? `${stats.rating.toFixed(1)} / 5` : 'لا يوجد',
      color: 'secondary.main',
    },
    {
      icon: IconClock,
      label: 'عضو منذ',
      value: stats.memberSince,
      color: 'info.main',
    },
  ];

  return (
    <Grid container spacing={2}>
      {statItems.map((item, index) => (
        <Grid item xs={12} sm={6} md={4} key={index}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: `${item.color}15`,
                color: item.color,
              }}
            >
              <item.icon size={24} />
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                {item.label}
              </Typography>
              <Typography variant="h6" fontWeight="bold">
                {item.value}
              </Typography>
            </Box>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
} 