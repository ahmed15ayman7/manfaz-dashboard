'use client';

import { useState } from 'react';
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
  Chip,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
} from '@mui/material';
import { IconPlus, IconEdit, IconTrash, IconSearch, IconGift, IconChartBar } from '@tabler/icons-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import API_ENDPOINTS from '@/lib/apis';
import { Reward, User } from '@/interfaces';

export default function RewardsPage() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [pointsFilter, setPointsFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [editingReward, setEditingReward] = useState<Reward | null>(null);
  const [rewardData, setRewardData] = useState({
    userId: '',
    points: 0,
    description: '',
  });

  const queryClient = useQueryClient();

  // استدعاء بيانات المكافآت
  const { data: rewards, isLoading } = useQuery<Reward[]>({
    queryKey: ['rewards'],
    queryFn: async () => {
      const response = await axios.get(API_ENDPOINTS.stores.rewards.getAll('all', {}));
      return response.data;
    },
  });

  // استدعاء بيانات المستخدمين
  const { data: users } = useQuery<User[]>({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await axios.get(API_ENDPOINTS.users.getAll({}));
      return response.data;
    },
  });

  // إضافة مكافأة جديدة
  const addRewardMutation = useMutation({
    mutationFn: async (reward: typeof rewardData) => {
      const response = await axios.post(API_ENDPOINTS.stores.rewards.create({}), reward);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rewards'] });
      handleCloseDialog();
    },
  });

  // تحديث مكافأة
  const updateRewardMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof rewardData }) => {
      const response = await axios.put(API_ENDPOINTS.stores.rewards.update(id, {}), data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rewards'] });
      handleCloseDialog();
    },
  });

  // حذف مكافأة
  const deleteRewardMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await axios.delete(API_ENDPOINTS.stores.rewards.delete(id, {}));
      return response.data;
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
        description: reward.description || '',
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
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  // التعامل مع تغيير عدد العناصر في الصفحة
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // تصفية المكافآت حسب البحث والنقاط
  const filteredRewards = rewards?.filter((reward) => {
    const matchesSearch = reward.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPoints = pointsFilter === 'all' || 
      (pointsFilter === 'high' && reward.points >= 100) ||
      (pointsFilter === 'medium' && reward.points >= 50 && reward.points < 100) ||
      (pointsFilter === 'low' && reward.points < 50);
    return matchesSearch && matchesPoints;
  });

  // حساب الإحصائيات
  const stats = {
    totalRewards: filteredRewards?.length || 0,
    totalPoints: filteredRewards?.reduce((sum, reward) => sum + reward.points, 0) || 0,
    averagePoints: filteredRewards?.length ? Math.round((filteredRewards.reduce((sum, reward) => sum + reward.points, 0) / filteredRewards.length) * 10) / 10 : 0,
  };

  // تنسيق التاريخ
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" fontWeight="bold">
          إدارة المكافآت
        </Typography>
        <Button
          variant="contained"
          startIcon={<IconPlus />}
          onClick={() => handleOpenDialog()}
          sx={{ backgroundColor: 'primary.main' }}
        >
          إضافة مكافأة جديدة
        </Button>
      </Box>

      {/* الإحصائيات */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconChartBar size={24} color="#0068FF" />
            <Box>
              <Typography variant="h6">{stats.totalRewards}</Typography>
              <Typography variant="body2" color="text.secondary">
                إجمالي المكافآت
              </Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconGift size={24} color="#4CAF50" />
            <Box>
              <Typography variant="h6">{stats.totalPoints}</Typography>
              <Typography variant="body2" color="text.secondary">
                إجمالي النقاط
              </Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconChartBar size={24} color="#FF9800" />
            <Box>
              <Typography variant="h6">{stats.averagePoints}</Typography>
              <Typography variant="body2" color="text.secondary">
                متوسط النقاط
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* قسم البحث والفلترة */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="البحث عن مكافأة..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: <IconSearch size={20} />,
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>النقاط</InputLabel>
              <Select
                value={pointsFilter}
                label="النقاط"
                onChange={(e) => setPointsFilter(e.target.value as typeof pointsFilter)}
              >
                <MenuItem value="all">الكل</MenuItem>
                <MenuItem value="high">عالية (100+)</MenuItem>
                <MenuItem value="medium">متوسطة (50-99)</MenuItem>
                <MenuItem value="low">منخفضة (0-49)</MenuItem>
              </Select>
            </FormControl>
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
              <TableCell>تاريخ الإضافة</TableCell>
              <TableCell>الإجراءات</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredRewards
              ?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((reward) => {
                const user = users?.find(u => u.id === reward.userId);
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
                        label={`${reward.points} نقطة`}
                        color={reward.points >= 100 ? 'success' : reward.points >= 50 ? 'warning' : 'info'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{
                          maxWidth: 300,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {reward.description}
                      </Typography>
                    </TableCell>
                    <TableCell>{formatDate(reward.createdAt)}</TableCell>
                    <TableCell>
                      <IconButton color="primary" size="small" onClick={() => handleOpenDialog(reward)}>
                        <IconEdit size={18} />
                      </IconButton>
                      <IconButton color="error" size="small" onClick={() => deleteRewardMutation.mutate(reward.id)}>
                        <IconTrash size={18} />
                      </IconButton>
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
          labelDisplayedRows={({ from, to, count }) =>
            `${from}-${to} من ${count !== -1 ? count : `أكثر من ${to}`}`
          }
        />
      </TableContainer>

      {/* نموذج إضافة مكافأة جديدة */}
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
                onChange={(e) => setRewardData({ ...rewardData, userId: e.target.value })}
              >
                {users?.map((user) => (
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
              onChange={(e) => setRewardData({ ...rewardData, points: parseInt(e.target.value) })}
              InputProps={{
                endAdornment: <InputAdornment position="end">نقطة</InputAdornment>,
              }}
            />
            <TextField
              fullWidth
              label="الوصف"
              multiline
              rows={3}
              value={rewardData.description}
              onChange={(e) => setRewardData({ ...rewardData, description: e.target.value })}
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
  );
} 