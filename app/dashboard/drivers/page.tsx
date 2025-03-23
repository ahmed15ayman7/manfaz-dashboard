'use client';

import type { ChangeEvent } from 'react';
import { useState } from 'react';
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
  Stack,
  Rating,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  IconPlus,
  IconEdit,
  IconTrash,
  IconSearch,
  IconTruck,
  IconStar,
  IconCash,
  IconMapPin,
  IconPrinter,
  IconEye,
} from '@tabler/icons-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import API_ENDPOINTS from '@/lib/apis';
import type { DeliveryDriver, User } from '@/interfaces';
import { ImageUpload } from '@/components/shared/image-upload';
import { ExcelExport } from '@/components/shared/excel-export';
import { PDFDocument } from '@/components/shared/pdf-document';
import { PermissionGuard } from '@/components/common/PermissionGuard';
import { formatNumber } from '@/lib/utils';

export default function DriversPage() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingDriver, setEditingDriver] = useState<DeliveryDriver | null>(null);
  const [driverData, setDriverData] = useState<{
    userId: string;
    vehicleType: string;
    license: string;
    availability: boolean;
  }>({
    userId: '',
    vehicleType: '',
    license: '',
    availability: true,
  });
  const [openPrintDialog, setOpenPrintDialog] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<DeliveryDriver | null>(null);

  const queryClient = useQueryClient();

  // استدعاء البيانات
  const { data: drivers, isLoading } = useQuery<DeliveryDriver[]>({
    queryKey: ['drivers'],
    queryFn: async () => {
      const response = await axios.get(API_ENDPOINTS.deliveryDrivers.getAll({}));
      return response.data.data.drivers;
    },
  });

  const { data: users } = useQuery<User[]>({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await axios.get(API_ENDPOINTS.users.getAll({}));
      return response.data.data;
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
        vehicleType: driver.vehicleType || '',
        license: driver.license || '',
        availability: driver.availability,
      });
    } else {
      setEditingDriver(null);
      setDriverData({
        userId: '',
        vehicleType: '',
        license: '',
        availability: true,
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
  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  // التعامل مع تغيير عدد العناصر في الصفحة
  const handleChangeRowsPerPage = (event: ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // تصفية السائقين حسب البحث
  const filteredDrivers = drivers?.filter((driver: DeliveryDriver) => {
    const user = users?.find((u: User) => u.id === driver.userId);
    const searchLower = searchQuery.toLowerCase();
    
    return (
      user?.name.toLowerCase().includes(searchLower) ||
      user?.phone.toLowerCase().includes(searchLower) ||
      driver.vehicleType?.toLowerCase().includes(searchLower)
    );
  });

  // حساب الإحصائيات
  const stats = {
    totalDrivers: filteredDrivers?.length || 0,
    activeDrivers: filteredDrivers?.filter((d: DeliveryDriver) => d.availability).length || 0,
    averageRating: filteredDrivers && filteredDrivers.length > 0 
      ? filteredDrivers.reduce((sum: number, driver: DeliveryDriver) => sum + (driver.rating || 0), 0) / filteredDrivers.length 
      : 0,
    totalEarnings: filteredDrivers?.reduce((sum: number, driver: DeliveryDriver) => sum + (driver.earnings || 0), 0) || 0,
  };

  // تعريف أعمدة Excel
  const excelColumns = [
    { header: 'اسم السائق', key: 'name', width: 30 },
    { header: 'رقم الهاتف', key: 'phone', width: 20 },
    { header: 'نوع المركبة', key: 'vehicleType', width: 20 },
    { header: 'رقم الرخصة', key: 'license', width: 20 },
    { header: 'التقييم', key: 'rating', width: 15 },
    { header: 'الطلبات المكتملة', key: 'completedOrders', width: 20 },
    { header: 'الأرباح', key: 'earnings', width: 20 },
    { header: 'الحالة', key: 'status', width: 15 },
  ];

  // تحضير بيانات Excel
  const excelData = drivers?.map((driver: DeliveryDriver) => {
    const user = users?.find((u: User) => u.id === driver.userId);
    return {
      name: user?.name || '',
      phone: user?.phone || '',
      vehicleType: driver.vehicleType || '',
      license: driver.license || '',
      rating: driver.rating || 0,
      completedOrders: driver.completedOrders || 0,
      earnings: driver.earnings || 0,
      status: driver.availability ? 'متاح' : 'غير متاح',
    };
  }) || [];

  if (isLoading) {
    return (
      <Box>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" fontWeight="bold">
            السائقين
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
    <PermissionGuard requiredPermissions={['viewProviders']}>
      <Box>
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5" fontWeight="bold">
            السائقين
          </Typography>
          <Stack direction="row" spacing={2}>
            <ExcelExport
              columns={excelColumns}
              data={excelData}
              filename="drivers-report"
              sheetName="السائقين"
            />
            <Button
              variant="contained"
              startIcon={<IconPlus size={20} />}
              onClick={() => handleOpenDialog()}
            >
              إضافة سائق جديد
            </Button>
          </Stack>
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
              <IconMapPin size={24} color="#4CAF50" />
              <Box>
                <Typography variant="h6">{stats.activeDrivers}</Typography>
                <Typography variant="body2" color="text.secondary">
                  السائقين المتاحين
                </Typography>
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
              <IconStar size={24} color="#FF9800" />
              <Box>
                <Typography variant="h6">{stats.averageRating.toFixed(1)}</Typography>
                <Typography variant="body2" color="text.secondary">
                  متوسط التقييم
                </Typography>
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
              <IconCash size={24} color="#F44336" />
              <Box>
                <Typography variant="h6">{formatNumber(stats.totalEarnings)} ر.س</Typography>
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
                placeholder="البحث في السائقين..."
                value={searchQuery}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
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
                <TableCell>التقييم</TableCell>
                <TableCell>الطلبات المكتملة</TableCell>
                <TableCell>الأرباح</TableCell>
                <TableCell>الحالة</TableCell>
                <TableCell>الإجراءات</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredDrivers
                ?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((driver: DeliveryDriver) => {
                  const user = users?.find((u: User) => u.id === driver.userId);
                  
                  return (
                    <TableRow key={driver.id}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar src={user?.imageUrl}>
                            {user?.name[0]}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2">{user?.name}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {user?.phone}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {driver.vehicleType}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {driver.license}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Rating value={driver.rating || 0} readOnly size="small" />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {driver.completedOrders || 0}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {formatNumber(driver.earnings || 0)} ر.س
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={driver.availability ? 'متاح' : 'غير متاح'}
                          color={driver.availability ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1}>
                          <IconButton
                            color="info"
                            size="small"
                            onClick={() => {
                              setSelectedDriver(driver);
                              setOpenPrintDialog(true);
                            }}
                          >
                            <IconEye size={18} />
                          </IconButton>
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
                        </Stack>
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
            labelDisplayedRows={({ from, to, count }: { from: number; to: number; count: number }) =>
              `${from}-${to} من ${count !== -1 ? count : `أكثر من ${to}`}`
            }
          />
        </TableContainer>

        {/* نموذج إضافة/تحديث سائق */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
          <DialogTitle>
            {editingDriver ? 'تحديث بيانات السائق' : 'إضافة سائق جديد'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>المستخدم</InputLabel>
                    <Select
                      value={driverData.userId}
                      label="المستخدم"
                      onChange={(e: SelectChangeEvent) => setDriverData({ ...driverData, userId: e.target.value })}
                    >
                      {users?.filter(u => !drivers?.some(d => d.userId === u.id)).map((user: User) => (
                        <MenuItem key={user.id} value={user.id}>
                          {user.name} - {user.phone}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="نوع المركبة"
                    value={driverData.vehicleType}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setDriverData({ ...driverData, vehicleType: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="رقم الرخصة"
                    value={driverData.license}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setDriverData({ ...driverData, license: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={driverData.availability}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setDriverData({ ...driverData, availability: e.target.checked })}
                      />
                    }
                    label="متاح"
                  />
                </Grid>
              </Grid>
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

        {/* نموذج عرض تفاصيل السائق */}
        <Dialog open={openPrintDialog} onClose={() => setOpenPrintDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>
            تفاصيل السائق
          </DialogTitle>
          <DialogContent>
            {selectedDriver && (
              <PDFDocument
                title="تفاصيل السائق"
                data={{
                  ...selectedDriver,
                  user: users?.find((u: User) => u.id === selectedDriver.userId),
                }}
                template="report"
              />
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenPrintDialog(false)}>إغلاق</Button>
            <Button
              variant="contained"
              startIcon={<IconPrinter size={20} />}
              onClick={() => window.print()}
            >
              طباعة
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </PermissionGuard>
  );
} 