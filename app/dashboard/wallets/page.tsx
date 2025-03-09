'use client';

import type { ChangeEvent } from 'react';
import { useState } from 'react';
import type {
  SelectChangeEvent,
} from '@mui/material';
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
import { IconPlus, IconEdit, IconTrash, IconSearch, IconWallet, IconCash, IconChartBar } from '@tabler/icons-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import API_ENDPOINTS from '@/lib/apis';
import type { User, Wallet, Transaction } from '@/interfaces';
import { PermissionGuard } from '@/components/common/PermissionGuard';
import { formatNumber } from '@/lib/utils';

export default function WalletsPage() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [transactionData, setTransactionData] = useState<{
    walletId: string;
    type: 'deposit' | 'withdrawal';
    amount: number;
    status: 'pending' | 'completed' | 'failed';
  }>({
    walletId: '',
    type: 'deposit',
    amount: 0,
    status: 'pending',
  });

  const queryClient = useQueryClient();

  // استدعاء بيانات المستخدمين
  const { data: users, isLoading } = useQuery<User[]>({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await axios.get(API_ENDPOINTS.users.getAll({}));
      return response.data.data;
    },
  });

  // إضافة معاملة جديدة
  const addTransactionMutation = useMutation({
    mutationFn: async (transaction: typeof transactionData) => {
      const response = await axios.post(API_ENDPOINTS.wallets.transactions.create(transaction.walletId, {}), transaction);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      handleCloseDialog();
    },
  });

  // تحديث معاملة
  const updateTransactionMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof transactionData }) => {
      const response = await axios.put(API_ENDPOINTS.wallets.transactions.update(data.walletId, id, {}), data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      handleCloseDialog();
    },
  });

  // حذف معاملة
  const deleteTransactionMutation = useMutation({
    mutationFn: async ({ walletId, transactionId }: { walletId: string; transactionId: string }) => {
      const response = await axios.delete(API_ENDPOINTS.wallets.transactions.delete(walletId, transactionId, {}));
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const handleOpenDialog = (transaction?: Transaction) => {
    if (transaction) {
      setEditingTransaction(transaction);
      setTransactionData({
        walletId: transaction.walletId,
        type: transaction.type,
        amount: transaction.amount,
        status: transaction.status,
      });
    } else {
      setEditingTransaction(null);
      setTransactionData({
        walletId: '',
        type: 'deposit',
        amount: 0,
        status: 'pending',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingTransaction(null);
    setTransactionData({
      walletId: '',
      type: 'deposit',
      amount: 0,
      status: 'pending',
    });
  };

  const handleSubmit = () => {
    if (editingTransaction) {
      updateTransactionMutation.mutate({ id: editingTransaction.id, data: transactionData });
    } else {
      addTransactionMutation.mutate(transactionData);
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

  // جمع جميع المعاملات من المحافظ
  const allTransactions = users?.reduce<Transaction[]>((acc: Transaction[], user: User) => {
    if (user.wallet?.transactions) {
      return [...acc, ...user.wallet.transactions];
    }
    return acc;
  }, []);

  // تصفية المعاملات حسب البحث
  const filteredTransactions = allTransactions?.filter((transaction: Transaction) => {
    const user = users?.find((u: User) => u.wallet?.id === transaction.walletId);
    return user?.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // حساب الإحصائيات
  const stats = {
    totalBalance: users?.reduce((sum: number, user: User) => sum + (user.wallet?.balance || 0), 0) || 0,
    totalTransactions: filteredTransactions?.length || 0,
    totalDeposits: filteredTransactions?.filter((t: Transaction) => t.type === 'deposit').reduce((sum: number, t: Transaction) => sum + t.amount, 0) || 0,
    totalWithdrawals: filteredTransactions?.filter((t: Transaction) => t.type === 'withdrawal').reduce((sum: number, t: Transaction) => sum + t.amount, 0) || 0,
  };

  // تنسيق التاريخ
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <Box>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" fontWeight="bold">
            إدارة المحافظ
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
    <PermissionGuard requiredPermissions={['viewWallets']}>
      <Box>
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5" fontWeight="bold">
            إدارة المحافظ
          </Typography>
          <Button
            variant="contained"
            startIcon={<IconPlus size={20} />}
            onClick={() => handleOpenDialog()}
          >
            إضافة معاملة جديدة
          </Button>
        </Box>

        {/* الإحصائيات */}
        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
              <IconWallet size={24} color="#0068FF" />
              <Box>
                <Typography variant="h6">{formatNumber(stats.totalBalance, 'currency')}</Typography>
                <Typography variant="body2" color="text.secondary">
                  إجمالي الرصيد
                </Typography>
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
              <IconChartBar size={24} color="#4CAF50" />
              <Box>
                <Typography variant="h6">{stats.totalTransactions}</Typography>
                <Typography variant="body2" color="text.secondary">
                  إجمالي المعاملات
                </Typography>
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
              <IconCash size={24} color="#FF9800" />
              <Box>
                <Typography variant="h6">{formatNumber(stats.totalDeposits, 'currency')}</Typography>
                <Typography variant="body2" color="text.secondary">
                  إجمالي الإيداعات
                </Typography>
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
              <IconCash size={24} color="#F44336" />
              <Box>
                <Typography variant="h6">{formatNumber(stats.totalWithdrawals, 'currency')}</Typography>
                <Typography variant="body2" color="text.secondary">
                  إجمالي السحوبات
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
                placeholder="البحث عن معاملة..."
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: <IconSearch size={20} />,
                }}
              />
            </Grid>
          </Grid>
        </Paper>

        {/* جدول المعاملات */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>المستخدم</TableCell>
                <TableCell>نوع المعاملة</TableCell>
                <TableCell>المبلغ</TableCell>
                <TableCell>الحالة</TableCell>
                <TableCell>التاريخ</TableCell>
                <TableCell>الإجراءات</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredTransactions
                ?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((transaction) => {
                  const user = users?.find(u => u.wallet?.id === transaction.walletId);
                  return (
                    <TableRow key={transaction.id}>
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
                          label={transaction.type === 'deposit' ? 'إيداع' : 'سحب'}
                          color={transaction.type === 'deposit' ? 'success' : 'error'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="body2"
                          color={transaction.type === 'deposit' ? 'success.main' : 'error.main'}
                        >
                          {transaction.type === 'deposit' ? '+' : '-'} {formatNumber(transaction.amount, 'currency')}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={
                            transaction.status === 'completed'
                              ? 'مكتملة'
                              : transaction.status === 'pending'
                              ? 'قيد المعالجة'
                              : 'فشلت'
                          }
                          color={
                            transaction.status === 'completed'
                              ? 'success'
                              : transaction.status === 'pending'
                              ? 'warning'
                              : 'error'
                          }
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{formatDate(transaction.createdAt)}</TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1}>
                          <IconButton 
                            color="primary" 
                            size="small"
                            onClick={() => handleOpenDialog(transaction)}
                          >
                            <IconEdit size={18} />
                          </IconButton>
                          <IconButton 
                            color="error" 
                            size="small"
                            onClick={() => deleteTransactionMutation.mutate({ 
                              walletId: transaction.walletId, 
                              transactionId: transaction.id 
                            })}
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
            count={filteredTransactions?.length || 0}
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

        {/* نموذج إضافة/تحديث معاملة */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>
            {editingTransaction ? 'تحديث المعاملة' : 'إضافة معاملة جديدة'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <FormControl fullWidth>
                <InputLabel>المستخدم</InputLabel>
                <Select
                  value={transactionData.walletId}
                  label="المستخدم"
                  onChange={(e: SelectChangeEvent) => setTransactionData({ ...transactionData, walletId: e.target.value })}
                >
                  {users?.map((user) => (
                    user.wallet && (
                      <MenuItem key={user.wallet.id} value={user.wallet.id}>
                        {user.name}
                      </MenuItem>
                    )
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>نوع المعاملة</InputLabel>
                <Select
                  value={transactionData.type}
                  label="نوع المعاملة"
                  onChange={(e) => setTransactionData({ ...transactionData, type: e.target.value as 'deposit' | 'withdrawal' })}
                >
                  <MenuItem value="deposit">إيداع</MenuItem>
                  <MenuItem value="withdrawal">سحب</MenuItem>
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="المبلغ"
                type="number"
                value={transactionData.amount}
                onChange={(e) => setTransactionData({ ...transactionData, amount: parseFloat(e.target.value) })}
                InputProps={{
                  endAdornment: <InputAdornment position="end">ريال</InputAdornment>,
                }}
              />
              <FormControl fullWidth>
                <InputLabel>الحالة</InputLabel>
                <Select
                  value={transactionData.status}
                  label="الحالة"
                  onChange={(e) => setTransactionData({ ...transactionData, status: e.target.value as 'pending' | 'completed' | 'failed' })}
                >
                  <MenuItem value="pending">قيد المعالجة</MenuItem>
                  <MenuItem value="completed">مكتملة</MenuItem>
                  <MenuItem value="failed">فشلت</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>إلغاء</Button>
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={!transactionData.walletId || !transactionData.amount}
            >
              {editingTransaction ? 'تحديث' : 'إضافة'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </PermissionGuard>
  );
} 