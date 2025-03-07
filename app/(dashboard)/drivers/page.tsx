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
  Switch,
  FormControlLabel,
} from '@mui/material';
import { IconPlus, IconEdit, IconTrash, IconSearch, IconTruck, IconCash, IconChartBar } from '@tabler/icons-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import API_ENDPOINTS from '@/lib/apis';
import { DeliveryDriver, User } from '@/interfaces';

export default function DriversPage() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingDriver, setEditingDriver] = useState<DeliveryDriver | null>(null);
  const [driverData, setDriverData] = useState<Partial<DeliveryDriver>>({
    userId: '',
    vehicleType: '',
    license: '',
    availability: true,
    rating: 0,
    reviewsCount: 0,
    completedOrders: 0,
    earnings: 0,
  });

  const queryClient = useQueryClient();

  // استدعاء البيانات
  const { data: users } = useQuery<User[]>({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await axios.get(API_ENDPOINTS.users.getAll({}));
      return response.data;
    },
  });

  const { data: drivers } = useQuery<DeliveryDriver[]>({
    queryKey: ['drivers'],
    queryFn: async () => {
      const response = await axios.get(API_ENDPOINTS.deliveryDrivers.getAll({}));
      return response.data;
    },
  });

  // إضافة سائق جديد
  const addDriverMutation = useMutation({
    mutationFn: async (driver: typeof driverData) => {
      const response = await axios.post(API_ENDPOINTS.deliveryDrivers.create({}), driver);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
      handleCloseDialog();
    },
  });

  // تحديث سائق
  const updateDriverMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof driverData }) => {
      const response = await axios.put(API_ENDPOINTS.deliveryDrivers.update(id, {}), data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
      handleCloseDialog();
    },
  });

  // حذف سائق
  const deleteDriverMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await axios.delete(API_ENDPOINTS.deliveryDrivers.delete(id, {}));
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
    },
  });

  const handleOpenDialog = (driver?: DeliveryDriver) => {
    if (driver) {
      setEditingDriver(driver);
      setDriverData({
        userId: driver.userId,
        vehicleType: driver.vehicleType,
        license: driver.license,
        availability: driver.availability,
        rating: driver.rating,
        reviewsCount: driver.reviewsCount,
        completedOrders: driver.completedOrders,
        earnings: driver.earnings,
      });
    } else {
      setEditingDriver(null);
      setDriverData({
        userId: '',
        vehicleType: '',
        license: '',
        availability: true,
        rating: 0,
        reviewsCount: 0,
        completedOrders: 0,
        earnings: 0,
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingDriver(null);
    setDriverData({
      userId: '',
      vehicleType: '',
      license: '',
      availability: true,
      rating: 0,
      reviewsCount: 0,
      completedOrders: 0,
      earnings: 0,
    });
  };

  const handleSubmit = () => {
    if (editingDriver) {
      updateDriverMutation.mutate({ id: editingDriver.id, data: driverData });
    } else {
      addDriverMutation.mutate(driverData);
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

  // تصفية السائقين حسب البحث
  const filteredDrivers = drivers?.filter((driver) => {
    const user = users?.find(u => u.id === driver.userId);
    return user?.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // حساب الإحصائيات
  const stats = {
    totalDrivers: filteredDrivers?.length || 0,
    availableDrivers: filteredDrivers?.filter(d => d.availability).length || 0,
    totalCompletedOrders: filteredDrivers?.reduce((sum, driver) => sum + driver.completedOrders, 0) || 0,
    totalEarnings: filteredDrivers?.reduce((sum, driver) => sum + driver.earnings, 0) || 0,
  };

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" fontWeight="bold">
          إدارة السائقين
        </Typography>
        <Button
          variant="contained"
          startIcon={<IconPlus />}
          onClick={() => handleOpenDialog()}
          sx={{ backgroundColor: 'primary.main' }}
        >
          إضافة سائق جديد
        </Button>
      </Box>

      {/* الإحصائيات */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconTruck size={24} color="#0068FF" />
            <Box>
              <Typography variant="h6">{stats.totalDrivers}</Typography>
              <Typography variant="body2" color="text.secondary">
                إجمالي السائقين
              </Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconTruck size={24} color="#4CAF50" />
            <Box>
              <Typography variant="h6">{stats.availableDrivers}</Typography>
              <Typography variant="body2" color="text.secondary">
                السائقين المتاحين
              </Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconChartBar size={24} color="#FF9800" />
            <Box>
              <Typography variant="h6">{stats.totalCompletedOrders}</Typography>
              <Typography variant="body2" color="text.secondary">
                الطلبات المكتملة
              </Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconCash size={24} color="#F44336" />
            <Box>
              <Typography variant="h6">{stats.totalEarnings}</Typography>
              <Typography variant="body2" color="text.secondary">
                إجمالي الأرباح
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
              placeholder="البحث عن سائق..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: <IconSearch size={20} />,
              }}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* جدول السائقين */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>السائق</TableCell>
              <TableCell>نوع المركبة</TableCell>
              <TableCell>رقم الرخصة</TableCell>
              <TableCell>الحالة</TableCell>
              <TableCell>التقييم</TableCell>
              <TableCell>الطلبات المكتملة</TableCell>
              <TableCell>الأرباح</TableCell>
              <TableCell>الإجراءات</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredDrivers
              ?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((driver) => {
                const user = users?.find(u => u.id === driver.userId);
                return (
                  <TableRow key={driver.id}>
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
                    <TableCell>{driver.vehicleType}</TableCell>
                    <TableCell>{driver.license}</TableCell>
                    <TableCell>
                      <Chip
                        label={driver.availability ? 'متاح' : 'غير متاح'}
                        color={driver.availability ? 'success' : 'error'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2">{driver.rating}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          ({driver.reviewsCount} تقييم)
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{driver.completedOrders}</TableCell>
                    <TableCell>{driver.earnings} ريال</TableCell>
                    <TableCell>
                      <IconButton 
                        color="primary" 
                        size="small"
                        onClick={() => handleOpenDialog(driver)}
                      >
                        <IconEdit size={18} />
                      </IconButton>
                      <IconButton 
                        color="error" 
                        size="small"
                        onClick={() => deleteDriverMutation.mutate(driver.id)}
                      >
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
          count={filteredDrivers?.length || 0}
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

      {/* نموذج إضافة/تحديث سائق */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingDriver ? 'تحديث بيانات السائق' : 'إضافة سائق جديد'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControl fullWidth>
              <InputLabel>السائق</InputLabel>
              <Select
                value={driverData.userId}
                label="السائق"
                onChange={(e) => setDriverData({ ...driverData, userId: e.target.value })}
              >
                {users?.filter(user => !drivers?.find(d => d.userId === user.id)).map((user) => (
                  <MenuItem key={user.id} value={user.id}>
                    {user.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="نوع المركبة"
              value={driverData.vehicleType}
              onChange={(e) => setDriverData({ ...driverData, vehicleType: e.target.value })}
            />
            <TextField
              fullWidth
              label="رقم الرخصة"
              value={driverData.license}
              onChange={(e) => setDriverData({ ...driverData, license: e.target.value })}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={driverData.availability}
                  onChange={(e) => setDriverData({ ...driverData, availability: e.target.checked })}
                />
              }
              label="متاح للعمل"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>إلغاء</Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={!driverData.userId || !driverData.vehicleType || !driverData.license}
          >
            {editingDriver ? 'تحديث' : 'إضافة'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 