'use client';

import type { ChangeEvent } from 'react';
import { useState, useEffect } from 'react';
import type { SelectChangeEvent } from '@mui/material';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Button,
  TextField,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar,
  Chip,
  InputAdornment,
  Stack,
} from '@mui/material';
import {
  IconPlus,
  IconEdit,
  IconTrash,
  IconSearch,
  IconGift,
  IconCoin,
  IconTrophy,
  IconUsers,
} from '@tabler/icons-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import API_ENDPOINTS from '@/lib/apis';
import type { Reward, User, Store } from '@/interfaces';
import { PermissionGuard } from '@/components/common/PermissionGuard';
import { formatNumber } from '@/lib/utils';
import axiosInstance from '@/lib/axios';
export default function RewardsPage() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingReward, setEditingReward] = useState<Reward | null>(null);
  const [rewardData, setRewardData] = useState<{
    userId: string;
    points: number;
    description?: string;
  }>({
    userId: '',
    points: 0,
    description: '',
  });
  const [storeId, setStoreId] = useState('');

  const queryClient = useQueryClient();

  let { data: stores, isLoading: isLoadingStores } = useQuery<Store[]>({
    queryKey: ['stores'],
    queryFn: async () => {
      const response = await axiosInstance.get(API_ENDPOINTS.stores.getAll({}, false));
      return response.data.data.stores;
    },
  });
  const { data: rewards, isLoading, refetch } = useQuery<Reward[]>({
    queryKey: ['rewards'],
    queryFn: async () => {
      const response = await axiosInstance.get(API_ENDPOINTS.stores.rewards.getAll(storeId, { limit: rowsPerPage, page, search: searchQuery }, false));
      return response.data.data;
    },
    enabled: !!storeId,
  });
  useEffect(() => {
    refetch();
  }, [searchQuery, rowsPerPage, page]);

  const { data: users } = useQuery<User[]>({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await axiosInstance.get(API_ENDPOINTS.users.getAll({}, false));
      return response.data.data.users;
    },
  });

  // إضافة مكافأة جديدة
  const addRewardMutation = useMutation({
    mutationFn: async (reward: typeof rewardData) => {
      const response = await axiosInstance.post(API_ENDPOINTS.stores.rewards.create({}, false), reward);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rewards'] });
      handleCloseDialog();
    },
  });

  // تحديث مكافأة
  const updateRewardMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof rewardData }) => {
      const response = await axiosInstance.put(API_ENDPOINTS.stores.rewards.update(id, {}, false), data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rewards'] });
      handleCloseDialog();
    },
  });

  // حذف مكافأة
  const deleteRewardMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await axiosInstance.delete(API_ENDPOINTS.stores.rewards.delete(id, {}, false));
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rewards'] });
    },
  });

  const handleOpenDialog = (reward?: Reward) => {
    if (reward) {
      setEditingReward(reward);
      setRewardData({
        userId: reward.userId,
        points: reward.points,
        description: reward.description,
      });
    } else {
      setEditingReward(null);
      setRewardData({
        userId: '',
        points: 0,
        description: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingReward(null);
    setRewardData({
      userId: '',
      points: 0,
      description: '',
    });
  };

  const handleSubmit = () => {
    if (editingReward) {
      updateRewardMutation.mutate({ id: editingReward.id, data: rewardData });
    } else {
      addRewardMutation.mutate(rewardData);
    }
  };

  // التعامل مع تغيير الصفحة
  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  // التعامل مع تغيير عدد العناصر في الصفحة
  const handleChangeRowsPerPage = (event: ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // تصفية المكافآت حسب البحث
  const filteredRewards = rewards?.filter((reward: Reward) => {
    const user = users?.find((u: User) => u.id === reward.userId);
    const searchLower = searchQuery.toLowerCase();

    return (
      user?.name.toLowerCase().includes(searchLower) ||
      reward.description?.toLowerCase().includes(searchLower)
    );
  });

  // حساب الإحصائيات
  const stats = {
    totalRewards: filteredRewards?.length || 0,
    totalPoints: filteredRewards?.reduce((sum: number, reward: Reward) => sum + reward.points, 0) || 0,
    averagePoints: Math.round(
      (filteredRewards?.reduce((sum: number, reward: Reward) => sum + reward.points, 0) || 0) /
      (filteredRewards?.length || 1)
    ),
    uniqueUsers: new Set(filteredRewards?.map(r => r.userId)).size || 0,
  };

  // تنسيق التاريخ
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (isLoading || isLoadingStores) {
    return (
      <Box>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" fontWeight="bold">
            المكافآت والنقاط
          </Typography>
        </Box>
        <Grid container spacing={3} mb={4}>
          {[...Array(4)].map((_, index) => (
            <Grid item xs={12} md={3} key={index}>
              <Paper sx={{ p: 3, height: 100 }} />
            </Grid>
          ))}
        </Grid>
        <Paper sx={{ p: 3, height: 400 }} />
      </Box>
    );
  }

  return (
    <PermissionGuard requiredPermissions={['viewOffers']}>
      <Box>
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5" fontWeight="bold">
            المكافآت والنقاط
          </Typography>
          <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: "10px" }}>
            <Select
              value={storeId}
              defaultValue=""
              onChange={(e: SelectChangeEvent) => {
                setStoreId(e.target.value);
                refetch();
              }}
            >
              <MenuItem disabled selected value="">
                اختر المتجر
              </MenuItem>
              {stores?.map((store: Store) => (
                <MenuItem key={store.id} value={store.id}>
                  {store.name}
                </MenuItem>
              ))}
            </Select>
            <Button
              variant="contained"
              startIcon={<IconPlus size={20} />}
              onClick={() => handleOpenDialog()}
            >
              إضافة مكافأة جديدة
            </Button>
          </Box>
        </Box>


        {/* الإحصائيات */}
        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
              <IconGift size={24} color="#0068FF" />
              <Box>
                <Typography variant="h6">{stats.totalRewards}</Typography>
                <Typography variant="body2" color="text.secondary">
                  إجمالي المكافآت
                </Typography>
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
              <IconCoin size={24} color="#4CAF50" />
              <Box>
                <Typography variant="h6">{formatNumber(stats.totalPoints)}</Typography>
                <Typography variant="body2" color="text.secondary">
                  إجمالي النقاط
                </Typography>
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
              <IconTrophy size={24} color="#FF9800" />
              <Box>
                <Typography variant="h6">{formatNumber(stats.averagePoints)}</Typography>
                <Typography variant="body2" color="text.secondary">
                  متوسط النقاط
                </Typography>
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
              <IconUsers size={24} color="#F44336" />
              <Box>
                <Typography variant="h6">{stats.uniqueUsers}</Typography>
                <Typography variant="body2" color="text.secondary">
                  المستخدمين المستفيدين
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>

        {/* قسم البحث */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="البحث في المكافآت..."
                value={searchQuery}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: <IconSearch size={20} />,
                }}
              />
            </Grid>
          </Grid>
        </Paper>

        {/* جدول المكافآت */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>المستخدم</TableCell>
                <TableCell>النقاط</TableCell>
                <TableCell>الوصف</TableCell>
                <TableCell>التاريخ</TableCell>
                <TableCell>الإجراءات</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredRewards
                ?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((reward: Reward) => {
                  const user = users?.find((u: User) => u.id === reward.userId);
                  return (
                    <TableRow key={reward.id}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar src={user?.imageUrl}>
                            {user?.name?.[0]}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2">{user?.name}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {user?.email}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={formatNumber(reward.points)}
                          color="primary"
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ maxWidth: 300 }} noWrap>
                          {reward.description}
                        </Typography>
                      </TableCell>
                      <TableCell>{formatDate(reward.createdAt)}</TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1}>
                          <IconButton
                            color="primary"
                            size="small"
                            onClick={() => handleOpenDialog(reward)}
                          >
                            <IconEdit size={18} />
                          </IconButton>
                          <IconButton
                            color="error"
                            size="small"
                            onClick={() => deleteRewardMutation.mutate(reward.id)}
                          >
                            <IconTrash size={18} />
                          </IconButton>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
          <TablePagination
            component="div"
            count={filteredRewards?.length || 0}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="عدد العناصر في الصفحة"
            labelDisplayedRows={({ from, to, count }: { from: number; to: number; count: number }) =>
              `${from}-${to} من ${count !== -1 ? count : `أكثر من ${to}`}`
            }
          />
        </TableContainer>

        {/* نموذج إضافة/تحديث مكافأة */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>
            {editingReward ? 'تحديث المكافأة' : 'إضافة مكافأة جديدة'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <FormControl fullWidth>
                <InputLabel>المستخدم</InputLabel>
                <Select
                  value={rewardData.userId}
                  label="المستخدم"
                  onChange={(e: SelectChangeEvent) => setRewardData({ ...rewardData, userId: e.target.value })}
                >
                  {users?.map((user: User) => (
                    <MenuItem key={user.id} value={user.id}>
                      {user.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="النقاط"
                type="number"
                value={rewardData.points}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setRewardData({ ...rewardData, points: parseInt(e.target.value) })}
                InputProps={{
                  endAdornment: <InputAdornment position="end">نقطة</InputAdornment>,
                }}
              />
              <TextField
                fullWidth
                multiline
                rows={4}
                label="الوصف"
                value={rewardData.description}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setRewardData({ ...rewardData, description: e.target.value })}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>إلغاء</Button>
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={!rewardData.userId || !rewardData.points}
            >
              {editingReward ? 'تحديث' : 'إضافة'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </PermissionGuard >
  );
} 