'use client';

import { Box, Grid, Paper, Typography } from '@mui/material';
import { IconUsers, IconTruck, IconShoppingCart, IconCash } from '@tabler/icons-react';
import { StatsCard } from '@/components/dashboard/stats-card';
import { RecentOrders } from '@/components/dashboard/recent-orders';
import { RevenueChart } from '@/components/dashboard/revenue-chart';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import API_ENDPOINTS from '@/lib/apis';

export default function DashboardPage() {
  // استدعاء البيانات الإحصائية
  const { data: stats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const response = await axios.get('/api/dashboard/stats');
      return response.data;
    },
  });

  const defaultStats = {
    users: 0,
    workers: 0,
    drivers: 0,
    orders: 0,
    revenue: 0,
  };

  const { users = 0, workers = 0, drivers = 0, orders = 0, revenue = 0 } = stats || defaultStats;

  return (
    <Box>
      <Typography variant="h5" fontWeight="bold" mb={4}>
        لوحة التحكم
      </Typography>

      {/* البطاقات الإحصائية */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="المستخدمين"
            value={users}
            icon={IconUsers}
            trend={+12}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="مقدمي الخدمات"
            value={workers}
            icon={IconTruck}
            trend={+5}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="الطلبات"
            value={orders}
            icon={IconShoppingCart}
            trend={-2}
            color="warning"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="الإيرادات"
            value={revenue}
            icon={IconCash}
            trend={+8}
            color="info"
            isCurrency
          />
        </Grid>
      </Grid>

      {/* الرسوم البيانية والجداول */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight="medium" mb={2}>
              الإيرادات الشهرية
            </Typography>
            <RevenueChart />
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" fontWeight="medium" mb={2}>
              آخر الطلبات
            </Typography>
            <RecentOrders />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
} 