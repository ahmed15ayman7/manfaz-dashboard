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
  Rating,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { IconPlus, IconEdit, IconTrash, IconSearch, IconShoppingBag, IconCash, IconStar } from '@tabler/icons-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import API_ENDPOINTS from '@/lib/apis';
import { Store, Category } from '@/interfaces';
import { ImageUpload } from '@/components/shared/image-upload';

export default function StoresPage() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingStore, setEditingStore] = useState<Store | null>(null);
  const [storeData, setStoreData] = useState<Partial<Store>>({
    name: '',
    description: '',
    type: '',
    logo: '',
    coverImage: '',
    address: '',
    phone: '',
    email: '',
    status: 'active',
    categoryId: '',
  });

  const queryClient = useQueryClient();

  // استدعاء البيانات
  const { data: categories } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await axios.get(API_ENDPOINTS.categories.getAll({}));
      return response.data;
    },
  });

  const { data: stores } = useQuery<Store[]>({
    queryKey: ['stores'],
    queryFn: async () => {
      const response = await axios.get(API_ENDPOINTS.stores.getAll({}));
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

  const handleOpenDialog = (store?: Store) => {
    if (store) {
      setEditingStore(store);
      setStoreData({
        name: store.name,
        description: store.description,
        type: store.type,
        logo: store.logo,
        coverImage: store.coverImage,
        address: store.address,
        phone: store.phone,
        email: store.email,
        status: store.status,
        categoryId: store.categoryId,
      });
    } else {
      setEditingStore(null);
      setStoreData({
        name: '',
        description: '',
        type: '',
        logo: '',
        coverImage: '',
        address: '',
        phone: '',
        email: '',
        status: 'active',
        categoryId: '',
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
      type: '',
      logo: '',
      coverImage: '',
      address: '',
      phone: '',
      email: '',
      status: 'active',
      categoryId: '',
    });
  };

  const handleSubmit = () => {
    if (editingStore) {
      updateStoreMutation.mutate({ id: editingStore.id, data: storeData });
    } else {
      addStoreMutation.mutate(storeData);
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

  // تصفية المتاجر حسب البحث
  const filteredStores = stores?.filter((store) =>
    store.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // حساب الإحصائيات
  const stats = {
    totalStores: filteredStores?.length || 0,
    activeStores: filteredStores?.filter(s => s.status === 'active').length || 0,
    totalProducts: filteredStores?.reduce((sum, store) => sum + (store.products?.length || 0), 0) || 0,
    totalOrders: filteredStores?.reduce((sum, store) => sum + (store.orders?.length || 0), 0) || 0,
  };

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" fontWeight="bold">
          إدارة المتاجر
        </Typography>
        <Button
          variant="contained"
          startIcon={<IconPlus />}
          onClick={() => handleOpenDialog()}
          sx={{ backgroundColor: 'primary.main' }}
        >
          إضافة متجر جديد
        </Button>
      </Box>

      {/* الإحصائيات */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconShoppingBag size={24} color="#0068FF" />
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
            <IconShoppingBag size={24} color="#4CAF50" />
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
            <IconStar size={24} color="#FF9800" />
            <Box>
              <Typography variant="h6">{stats.totalProducts}</Typography>
              <Typography variant="body2" color="text.secondary">
                إجمالي المنتجات
              </Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconCash size={24} color="#F44336" />
            <Box>
              <Typography variant="h6">{stats.totalOrders}</Typography>
              <Typography variant="body2" color="text.secondary">
                إجمالي الطلبات
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
        </Grid>
      </Paper>

      {/* جدول المتاجر */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>المتجر</TableCell>
              <TableCell>التصنيف</TableCell>
              <TableCell>العنوان</TableCell>
              <TableCell>الحالة</TableCell>
              <TableCell>التقييم</TableCell>
              <TableCell>المنتجات</TableCell>
              <TableCell>الطلبات</TableCell>
              <TableCell>الإجراءات</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredStores
              ?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((store) => {
                const category = categories?.find(c => c.id === store.categoryId);
                return (
                  <TableRow key={store.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar src={store.logo} variant="rounded">
                          {store.name[0]}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2">{store.name}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {store.email}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>{category?.name}</TableCell>
                    <TableCell>{store.address}</TableCell>
                    <TableCell>
                      <Chip
                        label={
                          store.status === 'active'
                            ? 'نشط'
                            : store.status === 'inactive'
                            ? 'غير نشط'
                            : 'مغلق'
                        }
                        color={
                          store.status === 'active'
                            ? 'success'
                            : store.status === 'inactive'
                            ? 'warning'
                            : 'error'
                        }
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Rating value={store.rating} readOnly size="small" />
                        <Typography variant="caption" color="text.secondary">
                          ({store.reviewsCount})
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{store.products?.length || 0}</TableCell>
                    <TableCell>{store.orders?.length || 0}</TableCell>
                    <TableCell>
                      <IconButton 
                        color="primary" 
                        size="small"
                        onClick={() => handleOpenDialog(store)}
                      >
                        <IconEdit size={18} />
                      </IconButton>
                      <IconButton 
                        color="error" 
                        size="small"
                        onClick={() => deleteStoreMutation.mutate(store.id)}
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

      {/* نموذج إضافة/تحديث متجر */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingStore ? 'تحديث بيانات المتجر' : 'إضافة متجر جديد'}
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
                  value={storeData.email}
                  onChange={(e) => setStoreData({ ...storeData, email: e.target.value })}
                />
              </Grid>
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
                    <MenuItem value="closed">مغلق</MenuItem>
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
                  label="اختر شعار المتجر"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>
                  صورة الغلاف
                </Typography>
                <ImageUpload
                  value={storeData.coverImage}
                  onChange={(url) => setStoreData({ ...storeData, coverImage: url })}
                  label="اختر صورة الغلاف"
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
            disabled={!storeData.name || !storeData.categoryId}
          >
            {editingStore ? 'تحديث' : 'إضافة'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 