'use client';

import { Box, Grid, Paper, Typography, Skeleton } from '@mui/material';
import {
  IconUsers,
  IconTruck,
  IconShoppingCart,
  IconCash,
  IconBuildingStore,
  IconCategory,
  IconWallet,
  IconStar
} from '@tabler/icons-react';
import { StatsCard } from '@/components/dashboard/stats-card';
import { RecentOrders } from '@/components/dashboard/recent-orders';
import { RevenueChart } from '@/components/dashboard/revenue-chart';
import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import API_ENDPOINTS from '@/lib/apis';
import { PermissionGuard } from '@/components/common/PermissionGuard';
import { EmployeePermissions } from '@/interfaces';
import axiosInstance from '@/lib/axios';

interface DashboardStats {
  users: number;
  workers: number;
  drivers: number;
  orders: number;
  revenue: number;
  stores: number;
  categories: number;
  services: number;
  wallets: number;
  offers: number;
  employees: number;
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const permissions = session?.user?.permissions as EmployeePermissions | undefined;

  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const response = await axiosInstance.get(API_ENDPOINTS.dashboard.getStats({}));
      return response.data.data;
    },
  });

  const defaultStats: DashboardStats = {
    users: 0,
    workers: 0,
    drivers: 0,
    orders: 0,
    revenue: 0,
    stores: 0,
    categories: 0,
    wallets: 0,
    services: 0,
    offers: 0,
    employees: 0,
  };

  const {
    users = 0,
    workers = 0,
    drivers = 0,
    orders = 0,
    revenue = 0,
    stores = 0,
    categories = 0,
    wallets = 0,
    services = 0,
    offers = 0,
    employees = 0,
  } = stats || defaultStats;

  if (isLoading) {
    return (
      <Box>
        <Typography variant="h5" fontWeight="bold" mb={4}>
          لوحة التحكم
        </Typography>
        <Grid container spacing={3}>
          {[...Array(8)].map((_, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Skeleton variant="rectangular" height={160} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" fontWeight="bold" mb={4}>
        لوحة التحكم
      </Typography>

      <Grid container spacing={3} mb={4}>
        {permissions?.viewCustomers && (
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard
              title="المستخدمين"
              value={users}
              icon={IconUsers}
              trend={+12}
              color="primary"
            />
          </Grid>
        )}

        {permissions?.viewProviders && (
          <>
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
                title="السائقين"
                value={drivers}
                icon={IconTruck}
                trend={+3}
                color="secondary"
              />
            </Grid>
          </>
        )}

        {permissions?.viewOrders && (
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard
              title="الطلبات"
              value={orders}
              icon={IconShoppingCart}
              trend={-2}
              color="warning"
            />
          </Grid>
        )}

        {permissions?.viewWallets && (
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
        )}

        {permissions?.viewStores && (
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard
              title="المتاجر"
              value={stores}
              icon={IconBuildingStore}
              trend={+4}
              color="success"
            />
          </Grid>
        )}

        {permissions?.viewCategories && (
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard
              title="التصنيفات"
              value={categories}
              icon={IconCategory}
              trend={+1}
              color="primary"
            />
          </Grid>
        )}

        {permissions?.viewWallets && (
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard
              title="المحافظ"
              value={wallets}
              icon={IconWallet}
              trend={+6}
              color="warning"
            />
          </Grid>
        )}

        {permissions?.viewServices && (
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard
              title="الخدمات"
              value={services}
              icon={IconCategory}
              trend={+1}
              color="primary"
            />
          </Grid>
        )}

        {permissions?.viewServices && (
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard
              title="العروض"
              value={offers}
              icon={IconStar}
              trend={+1}
              color="primary"
            />
          </Grid>
        )}

        {permissions?.viewEmployees && (
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard
              title="الموظفين"
              value={employees}
              icon={IconUsers}
              trend={+1}
              color="primary"
            />
          </Grid>
        )}

      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <PermissionGuard
            requiredPermissions={['viewBasicReports']}
            fallback={
              <Paper sx={{ p: 3, textAlign: 'center' }}>
                <Typography color="text.secondary">
                  ليس لديك صلاحية لعرض الرسوم البيانية
                </Typography>
              </Paper>
            }
          >
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight="medium" mb={2}>
                الإيرادات الشهرية
              </Typography>
              <RevenueChart />
            </Paper>
          </PermissionGuard>
        </Grid>

        <Grid item xs={12} md={4}>
          <PermissionGuard
            requiredPermissions={['viewOrders']}
            fallback={
              <Paper sx={{ p: 3, textAlign: 'center', height: '100%' }}>
                <Typography color="text.secondary">
                  ليس لديك صلاحية لعرض الطلبات
                </Typography>
              </Paper>
            }
          >
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" fontWeight="medium" mb={2}>
                آخر الطلبات
              </Typography>
              <RecentOrders />
            </Paper>
          </PermissionGuard>
        </Grid>
      </Grid>
    </Box>
  );
}