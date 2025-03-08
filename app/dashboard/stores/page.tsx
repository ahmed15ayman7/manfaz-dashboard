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
  InputAdornment,
  Skeleton,
  Stack,
  Rating,
} from '@mui/material';
import {
  IconPlus,
  IconEdit,
  IconTrash,
  IconSearch,
  IconBuildingStore,
  IconMapPin,
  IconPhone,
  IconMail,
  IconClock,
  IconStar,
  IconTruck,
  IconCash,
  IconPrinter,
  IconEye,
} from '@tabler/icons-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import API_ENDPOINTS from '@/lib/apis';
import { Store, Category, User } from '@/interfaces';
import { ImageUpload } from '@/components/shared/image-upload';
import { ExcelExport } from '@/components/shared/excel-export';
import { PDFDocument } from '@/components/shared/pdf-document';
import { PermissionGuard } from '@/components/common/PermissionGuard';
import { ActionButton } from '@/components/common/ActionButton';
import { formatDate, formatNumber } from '@/lib/utils';
let daysOfWeek = ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];
export default function StoresPage() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingStore, setEditingStore] = useState<Store | null>(null);
  const [storeData, setStoreData] = useState<Partial<Store>>({
    name: '',
    description: '',
    categoryId: '',
    userId: '',
    address: '',
    phone: '',
    email: '',
    workingHours: [],
    logo: '',
    coverImage: '',
    images: [],
    status: 'active',
  });
  const [openPrintDialog, setOpenPrintDialog] = useState(false);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);

  const queryClient = useQueryClient();

  // استدعاء البيانات
  const { data: stores, isLoading } = useQuery<Store[]>({
    queryKey: ['stores'],
    queryFn: async () => {
      const response = await axios.get(API_ENDPOINTS.stores.getAll({}));
      return response.data;
    },
  });

  const { data: categories } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await axios.get(API_ENDPOINTS.categories.getAll({}));
      return response.data;
    },
  });

  const { data: users } = useQuery<User[]>({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await axios.get(API_ENDPOINTS.users.getAll({}));
      return response.data;
    },
  });

  // إضافة متجر جديد
  const addStoreMutation = useMutation({
    mutationFn: async (store: typeof storeData) => {
      const response = await axios.post(API_ENDPOINTS.stores.create({}), store);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stores'] });
      handleCloseDialog();
    },
  });

  // تحديث متجر
  const updateStoreMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof storeData }) => {
      const response = await axios.put(API_ENDPOINTS.stores.update(id, {}), data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stores'] });
      handleCloseDialog();
    },
  });

  // حذف متجر
  const deleteStoreMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await axios.delete(API_ENDPOINTS.stores.delete(id, {}));
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stores'] });
    },
  });

  // تصفية المتاجر حسب البحث
  const filteredStores = stores?.filter((store) =>
    store.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // حساب الإحصائيات
  const stats = {
    totalStores: filteredStores?.length || 0,
    activeStores: filteredStores?.filter(s => s.status === 'active').length || 0,
    totalOrders: filteredStores?.reduce((sum, store) => sum + (store.orders?.length || 0), 0) || 0,
    totalRevenue: filteredStores?.reduce((sum, store) =>
      sum + (store.orders?.reduce((orderSum, order) => orderSum + (order.price || 0), 0) || 0), 0) || 0,
  };

  // تعريف أعمدة Excel
  const excelColumns = [
    { header: 'اسم المتجر', key: 'name', width: 30 },
    { header: 'التصنيف', key: 'category', width: 20 },
    { header: 'العنوان', key: 'address', width: 30 },
    { header: 'رقم الهاتف', key: 'phone', width: 20 },
    { header: 'البريد الإلكتروني', key: 'email', width: 30 },
    { header: 'التقييم', key: 'rating', width: 15 },
    { header: 'عدد الطلبات', key: 'ordersCount', width: 15 },
    { header: 'الحالة', key: 'status', width: 15 },
  ];

  // تحضير بيانات Excel
  const excelData = stores?.map(store => ({
    name: store.name,
    category: categories?.find(c => c.id === store.categoryId)?.name || '',
    address: store.address,
    phone: store.phone,
    email: store.email,
    rating: store.rating || 0,
    ordersCount: store.orders?.length || 0,
    status: store.status === 'active' ? 'نشط' : 'غير نشط',
  })) || [];

  const handleOpenDialog = (store?: Store) => {
    if (store) {
      setEditingStore(store);
      setStoreData({
        name: store.name,
        description: store.description,
        userId: store.userId,
        categoryId: store.categoryId,
        address: store.address,
        phone: store.phone,
        email: store.email,
        workingHours: store.workingHours,
        logo: store.logo,
        coverImage: store.coverImage,
        images: store.images,
        status: store.status,
      });
    } else {
      setEditingStore(null);
      setStoreData({
        name: '',
        description: '',
        userId: '',
        categoryId: '',
        address: '',
        phone: '',
        email: '',
        workingHours: [],
        logo: '',
        coverImage: '',
        images: [],
        status: 'active',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingStore(null);
    setStoreData({
      name: '',
      description: '',
      userId: '',
      categoryId: '',
      address: '',
      phone: '',
      email: '',
      workingHours: [],
      logo: '',
      coverImage: '',
      images: [],
      status: 'active',
    });
  };

  const handleSubmit = () => {
    if (editingStore) {
      updateStoreMutation.mutate({ id: editingStore.id!, data: storeData });
    } else {
      addStoreMutation.mutate(storeData);
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleViewStore = (store: Store) => {
    setSelectedStore(store);
    setOpenPrintDialog(true);
  };

  if (isLoading) {
    return (
      <Box>
        <Box sx={{ mb: 4 }}>
          <Skeleton variant="text" width={200} height={40} />
        </Box>
        <Grid container spacing={3} mb={4}>
          {[...Array(4)].map((_, index) => (
            <Grid item xs={12} md={3} key={index}>
              <Skeleton variant="rectangular" height={100} />
            </Grid>
          ))}
        </Grid>
        <Skeleton variant="rectangular" height={400} />
      </Box>
    );
  }

  return (
    <PermissionGuard requiredPermissions={['viewStores']}>
      <Box>
        {/* رأس الصفحة */}
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5" fontWeight="bold">
            المتاجر
          </Typography>
          <ActionButton
            requiredPermissions={['createStores']}
            variant="contained"
            startIcon={<IconPlus size={20} />}
            onClick={() => handleOpenDialog()}
          >
            إضافة متجر
          </ActionButton>
        </Box>

        {/* الإحصائيات */}
        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
              <IconBuildingStore size={24} color="#0068FF" />
              <Box>
                <Typography variant="h6">{stats.totalStores}</Typography>
                <Typography variant="body2" color="text.secondary">
                  إجمالي المتاجر
                </Typography>
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
              <IconBuildingStore size={24} color="#4CAF50" />
              <Box>
                <Typography variant="h6">{stats.activeStores}</Typography>
                <Typography variant="body2" color="text.secondary">
                  المتاجر النشطة
                </Typography>
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
              <IconTruck size={24} color="#FF9800" />
              <Box>
                <Typography variant="h6">{stats.totalOrders}</Typography>
                <Typography variant="body2" color="text.secondary">
                  إجمالي الطلبات
                </Typography>
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
              <IconCash size={24} color="#F44336" />
              <Box>
                <Typography variant="h6">{formatNumber(stats.totalRevenue, 'currency')}</Typography>
                <Typography variant="body2" color="text.secondary">
                  إجمالي الإيرادات
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
                placeholder="البحث عن متجر..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: <IconSearch size={20} />,
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Stack direction="row" spacing={2} justifyContent="flex-end">
                <ExcelExport
                  data={excelData}
                  columns={excelColumns}
                  filename="stores.xlsx"
                  sheetName="المتاجر"
                />
              </Stack>
            </Grid>
          </Grid>
        </Paper>

        {/* جدول المتاجر */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>المتجر</TableCell>
                <TableCell>معلومات الاتصال</TableCell>
                <TableCell>التصنيف</TableCell>
                <TableCell>التقييم</TableCell>
                <TableCell>النشاط</TableCell>
                <TableCell>الحالة</TableCell>
                <TableCell>الإجراءات</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(filteredStores || [])
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((store) => {
                  const category = categories?.find(c => c.id === store.categoryId);
                  return (
                    <TableRow key={store.id}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar src={store.logo} alt={store.name}>
                            {store.name.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography fontWeight="medium">{store.name}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {store.description}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Stack spacing={1}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <IconMapPin size={16} />
                            <Typography variant="body2">{store.address}</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <IconPhone size={16} />
                            <Typography variant="body2">{store.phone}</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <IconMail size={16} />
                            <Typography variant="body2">{store.email}</Typography>
                          </Box>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={category?.name || 'غير محدد'}
                          color="primary"
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Rating value={store.rating || 0} readOnly size="small" />
                          <Typography variant="body2">
                            ({store.reviewsCount || 0})
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Stack spacing={1}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <IconTruck size={16} />
                            <Typography variant="body2">
                              {store.orders?.length || 0} طلب
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <IconClock size={16} />
                            <Typography variant="body2">
                              {store.workingHours.map(wh => `${wh.dayOfWeek} ${wh.openTime} - ${wh.closeTime}`).join(', ')}
                            </Typography>
                          </Box>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={store.status === 'active' ? 'نشط' : 'غير نشط'}
                          color={store.status === 'active' ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1}>
                          <IconButton
                            size="small"
                            color="info"
                            onClick={() => handleViewStore(store)}
                          >
                            <IconEye size={18} />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleOpenDialog(store)}
                          >
                            <IconEdit size={18} />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => deleteStoreMutation.mutate(store.id!)}
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
            count={filteredStores?.length || 0}
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

        {/* نموذج إضافة/تعديل متجر */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
          <DialogTitle>
            {editingStore ? 'تعديل بيانات المتجر' : 'إضافة متجر جديد'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="اسم المتجر"
                    value={storeData.name}
                    onChange={(e) => setStoreData({ ...storeData, name: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>التصنيف</InputLabel>
                    <Select
                      value={storeData.categoryId}
                      label="التصنيف"
                      onChange={(e) => setStoreData({ ...storeData, categoryId: e.target.value })}
                    >
                      {categories?.map((category) => (
                        <MenuItem key={category.id} value={category.id}>
                          {category.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="وصف المتجر"
                    value={storeData.description}
                    onChange={(e) => setStoreData({ ...storeData, description: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="العنوان"
                    value={storeData.address}
                    onChange={(e) => setStoreData({ ...storeData, address: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="رقم الهاتف"
                    value={storeData.phone}
                    onChange={(e) => setStoreData({ ...storeData, phone: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="البريد الإلكتروني"
                    type="email"
                    value={storeData.email}
                    onChange={(e) => setStoreData({ ...storeData, email: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>المالك</InputLabel>
                    <Select
                      value={storeData.userId}
                      label="المالك"
                      onChange={(e) => setStoreData({ ...storeData, userId: e.target.value })}
                    >
                      {users?.map((user) => (
                        <MenuItem key={user.id} value={user.id}>
                          {user.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                {Array.from({ length: 7 }).map((_, index) => (
                  <>
                    <Grid item xs={12} md={6} key={index}>
                      <TextField
                        fullWidth
                        label={`وقت الفتح ${daysOfWeek[index]}`}
                        value={storeData.workingHours?.[index]?.openTime || ""}
                        onChange={(e) => setStoreData((prev) => ({ ...prev, workingHours: prev.workingHours?.map((wh, i) => i === index ? { ...wh, openTime: e.target.value } : wh) || [] }))}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="وقت الإغلاق"
                        value={storeData.workingHours?.[index]?.closeTime || ""}
                        onChange={(e) => setStoreData((prev) => ({ ...prev, workingHours: prev.workingHours?.map((wh, i) => i === index ? { ...wh, closeTime: e.target.value } : wh) || [] }))}
                      />

                    </Grid></>))}
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>الحالة</InputLabel>
                    <Select
                      value={storeData.status}
                      label="الحالة"
                      onChange={(e) => setStoreData({ ...storeData, status: e.target.value as Store['status'] })}
                    >
                      <MenuItem value="active">نشط</MenuItem>
                      <MenuItem value="inactive">غير نشط</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    شعار المتجر
                  </Typography>
                  <ImageUpload
                    value={storeData.logo}
                    onChange={(url) => setStoreData({ ...storeData, logo: url })}
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
              disabled={!storeData.name || !storeData.categoryId || !storeData.userId}
            >
              {editingStore ? 'تحديث' : 'إضافة'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* نافذة عرض تفاصيل المتجر */}
        <Dialog
          open={openPrintDialog}
          onClose={() => setOpenPrintDialog(false)}
          maxWidth="md"
          fullWidth
        >
          {selectedStore && (
            <PDFDocument
              title={`تقرير المتجر - ${selectedStore.name}`}
              data={{
                title: `تقرير المتجر - ${selectedStore.name}`,
                date: formatDate(new Date()),
                description: `تقرير تفصيلي عن المتجر ${selectedStore.name}`,
                sections: [
                  {
                    title: 'معلومات المتجر',
                    content: `
                      الاسم: ${selectedStore.name}
                      التصنيف: ${categories?.find(c => c.id === selectedStore.categoryId)?.name || 'غير محدد'}
                      العنوان: ${selectedStore.address}
                      رقم الهاتف: ${selectedStore.phone}
                      البريد الإلكتروني: ${selectedStore.email}
                      أوقات العمل: ${selectedStore.workingHours.map(wh => `${daysOfWeek[wh.dayOfWeek]} ${wh.openTime} - ${wh.closeTime}`).join(', ')}
                    `
                  },
                  {
                    title: 'إحصائيات النشاط',
                    content: `
                      عدد الطلبات: ${selectedStore.orders?.length || 0}
                      التقييم: ${selectedStore.rating || 0} (${selectedStore.reviewsCount || 0} تقييم)
                      الحالة: ${selectedStore.status === 'active' ? 'نشط' : 'غير نشط'}
                    `
                  }
                ]
              }}
              template="report"
              companyInfo={{
                name: 'منفذ',
                address: 'المملكة العربية السعودية',
                phone: '+966 123456789',
                email: 'info@manfath.com',
                logo: '/images/logo.png',
              }}
            />
          )}
        </Dialog>
      </Box>
    </PermissionGuard>
  );
} 