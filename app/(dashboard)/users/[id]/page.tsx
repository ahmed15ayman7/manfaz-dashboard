'use client';

import { useParams, useRouter } from 'next/navigation';
import {
  Box,
  Paper,
  Grid,
  Typography,
  Avatar,
  Chip,
  Button,
  Tabs,
  Tab,
  Divider,
} from '@mui/material';
import {
  IconArrowRight,
  IconEdit,
  IconTrash,
  IconWallet,
  IconShoppingCart,
  IconMapPin,
  IconStar,
} from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { User } from '@/interfaces';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { useState } from 'react';
import { OrdersList } from '@/components/users/orders-list';
import { LocationsList } from '@/components/users/locations-list';
import { WalletTransactions } from '@/components/users/wallet-transactions';
import { ReviewsList } from '@/components/users/reviews-list';
import { UserStats } from '@/components/users/user-stats';
import { EditUserDialog } from '@/components/users/edit-user-dialog';
import { toast } from 'react-toastify';

export default function UserDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(0);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const { data: user, refetch } = useQuery<User>({
    queryKey: ['user', params.id],
    queryFn: async () => {
      const response = await axios.get(`/api/users/${params.id}`);
      return response.data;
    },
  });

  if (!user) return null;

  const roleColors = {
    user: 'primary',
    store: 'success',
    worker: 'warning',
  };

  const roleNames = {
    user: 'عميل',
    store: 'متجر',
    worker: 'مقدم خدمة',
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleDeleteUser = async () => {
    if (window.confirm('هل أنت متأكد من حذف هذا المستخدم؟')) {
      try {
        await axios.delete(`/api/users/${user.id}`);
        toast.success('تم حذف المستخدم بنجاح');
        router.push('/users');
      } catch (error) {
        toast.error('حدث خطأ أثناء حذف المستخدم');
      }
    }
  };

  return (
    <Box>
      {/* رأس الصفحة */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          mb: 3,
        }}
      >
        <Button
          startIcon={<IconArrowRight />}
          onClick={() => router.back()}
        >
          رجوع
        </Button>
        <Typography variant="h5" fontWeight="bold">
          تفاصيل المستخدم
        </Typography>
      </Box>

      {/* بطاقة معلومات المستخدم */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <Avatar
                src={user.imageUrl || '/placeholder.png'}
                sx={{ width: 120, height: 120 }}
              />
              <Typography variant="h6" fontWeight="bold">
                {user.name}
              </Typography>
              <Chip
                label={roleNames[user.role as keyof typeof roleNames]}
                color={roleColors[user.role as keyof typeof roleColors]}
              />
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  color="info"
                  startIcon={<IconEdit />}
                  onClick={() => setIsEditDialogOpen(true)}
                >
                  تعديل
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<IconTrash />}
                  onClick={handleDeleteUser}
                >
                  حذف
                </Button>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} md={8}>
            <UserStats userId={user.id} />
          </Grid>
        </Grid>
      </Paper>

      {/* التبويبات */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab icon={<IconShoppingCart size={20} />} label="الطلبات" />
          <Tab icon={<IconWallet size={20} />} label="المحفظة" />
          <Tab icon={<IconMapPin size={20} />} label="العناوين" />
          {user.role === 'worker' && (
            <Tab icon={<IconStar size={20} />} label="التقييمات" />
          )}
        </Tabs>
        <Divider />
        <Box sx={{ p: 3 }}>
          {activeTab === 0 && <OrdersList userId={user.id} />}
          {activeTab === 1 && <WalletTransactions userId={user.id} />}
          {activeTab === 2 && <LocationsList userId={user.id} />}
          {activeTab === 3 && user.role === 'worker' && (
            <ReviewsList userId={user.id} />
          )}
        </Box>
      </Paper>

      {/* حوار تعديل المستخدم */}
      <EditUserDialog
        open={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        onSuccess={() => {
          setIsEditDialogOpen(false);
          refetch();
        }}
        user={user}
      />
    </Box>
  );
} 