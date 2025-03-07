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
  Rating,
  Switch,
  FormControlLabel,
} from '@mui/material';
import { IconPlus, IconEdit, IconTrash, IconSearch, IconTools, IconClock, IconCash } from '@tabler/icons-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import API_ENDPOINTS from '@/lib/apis';
import { Service, Category } from '@/interfaces';
import { ImageUpload } from '@/components/shared/image-upload';

export default function ServicesPage() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [serviceData, setServiceData] = useState<Partial<Service>>({
    name: '',
    description: '',
    categoryId: '',
    type: 'service',
    price: 0,
    duration: 0,
    availability: true,
    imageUrl: '',
    iconUrl: '',
    warranty: 0,
    installmentAvailable: false,
    installmentMonths: 0,
    monthlyInstallment: 0,
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

  const { data: services } = useQuery<Service[]>({
    queryKey: ['services'],
    queryFn: async () => {
      const response = await axios.get(API_ENDPOINTS.services.getAll({}));
      return response.data;
    },
  });

  // إضافة خدمة جديدة
  const addServiceMutation = useMutation({
    mutationFn: async (service: typeof serviceData) => {
      const response = await axios.post(API_ENDPOINTS.services.create({}), service);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      handleCloseDialog();
    },
  });

  // تحديث خدمة
  const updateServiceMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof serviceData }) => {
      const response = await axios.put(API_ENDPOINTS.services.update(id, {}), data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      handleCloseDialog();
    },
  });

  // حذف خدمة
  const deleteServiceMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await axios.delete(API_ENDPOINTS.services.delete(id, {}));
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
    },
  });

  const handleOpenDialog = (service?: Service) => {
    if (service) {
      setEditingService(service);
      setServiceData({
        name: service.name,
        description: service.description,
        categoryId: service.categoryId,
        type: service.type,
        price: service.price,
        duration: service.duration,
        availability: service.availability,
        imageUrl: service.imageUrl,
        iconUrl: service.iconUrl,
        warranty: service.warranty,
        installmentAvailable: service.installmentAvailable,
        installmentMonths: service.installmentMonths,
        monthlyInstallment: service.monthlyInstallment,
      });
    } else {
      setEditingService(null);
      setServiceData({
        name: '',
        description: '',
        categoryId: '',
        type: 'service',
        price: 0,
        duration: 0,
        availability: true,
        imageUrl: '',
        iconUrl: '',
        warranty: 0,
        installmentAvailable: false,
        installmentMonths: 0,
        monthlyInstallment: 0,
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingService(null);
    setServiceData({
      name: '',
      description: '',
      categoryId: '',
      type: 'service',
      price: 0,
      duration: 0,
      availability: true,
      imageUrl: '',
      iconUrl: '',
      warranty: 0,
      installmentAvailable: false,
      installmentMonths: 0,
      monthlyInstallment: 0,
    });
  };

  const handleSubmit = () => {
    if (editingService) {
      updateServiceMutation.mutate({ id: editingService.id, data: serviceData });
    } else {
      addServiceMutation.mutate(serviceData);
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

  // تصفية الخدمات حسب البحث
  const filteredServices = services?.filter((service) =>
    service.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // حساب الإحصائيات
  const stats = {
    totalServices: filteredServices?.length || 0,
    availableServices: filteredServices?.filter(s => s.availability).length || 0,
    averagePrice: filteredServices?.reduce((sum, service) => sum + (service.price || 0), 0) / (filteredServices?.length || 1),
    averageDuration: filteredServices?.reduce((sum, service) => sum + (service.duration || 0), 0) / (filteredServices?.length || 1),
  };

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" fontWeight="bold">
          إدارة الخدمات
        </Typography>
        <Button
          variant="contained"
          startIcon={<IconPlus />}
          onClick={() => handleOpenDialog()}
          sx={{ backgroundColor: 'primary.main' }}
        >
          إضافة خدمة جديدة
        </Button>
      </Box>

      {/* الإحصائيات */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconTools size={24} color="#0068FF" />
            <Box>
              <Typography variant="h6">{stats.totalServices}</Typography>
              <Typography variant="body2" color="text.secondary">
                إجمالي الخدمات
              </Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconTools size={24} color="#4CAF50" />
            <Box>
              <Typography variant="h6">{stats.availableServices}</Typography>
              <Typography variant="body2" color="text.secondary">
                الخدمات المتاحة
              </Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconCash size={24} color="#FF9800" />
            <Box>
              <Typography variant="h6">{stats.averagePrice.toFixed(2)} ريال</Typography>
              <Typography variant="body2" color="text.secondary">
                متوسط السعر
              </Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconClock size={24} color="#F44336" />
            <Box>
              <Typography variant="h6">{stats.averageDuration.toFixed(0)} دقيقة</Typography>
              <Typography variant="body2" color="text.secondary">
                متوسط المدة
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
              placeholder="البحث عن خدمة..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: <IconSearch size={20} />,
              }}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* جدول الخدمات */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>الخدمة</TableCell>
              <TableCell>التصنيف</TableCell>
              <TableCell>السعر</TableCell>
              <TableCell>المدة</TableCell>
              <TableCell>الحالة</TableCell>
              <TableCell>التقييم</TableCell>
              <TableCell>التقسيط</TableCell>
              <TableCell>الإجراءات</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredServices
              ?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((service) => {
                const category = categories?.find(c => c.id === service.categoryId);
                return (
                  <TableRow key={service.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar src={service.imageUrl} variant="rounded">
                          {service.name[0]}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2">{service.name}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {service.description}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>{category?.name}</TableCell>
                    <TableCell>{service.price} ريال</TableCell>
                    <TableCell>{service.duration} دقيقة</TableCell>
                    <TableCell>
                      <Chip
                        label={service.availability ? 'متاحة' : 'غير متاحة'}
                        color={service.availability ? 'success' : 'error'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Rating value={service.rating} readOnly size="small" />
                        <Typography variant="caption" color="text.secondary">
                          ({service.ratingCount})
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={service.installmentAvailable ? 'متاح' : 'غير متاح'}
                        color={service.installmentAvailable ? 'info' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton 
                        color="primary" 
                        size="small"
                        onClick={() => handleOpenDialog(service)}
                      >
                        <IconEdit size={18} />
                      </IconButton>
                      <IconButton 
                        color="error" 
                        size="small"
                        onClick={() => deleteServiceMutation.mutate(service.id)}
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
          count={filteredServices?.length || 0}
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

      {/* نموذج إضافة/تحديث خدمة */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingService ? 'تحديث بيانات الخدمة' : 'إضافة خدمة جديدة'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="اسم الخدمة"
                  value={serviceData.name}
                  onChange={(e) => setServiceData({ ...serviceData, name: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>التصنيف</InputLabel>
                  <Select
                    value={serviceData.categoryId}
                    label="التصنيف"
                    onChange={(e) => setServiceData({ ...serviceData, categoryId: e.target.value })}
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
                  label="وصف الخدمة"
                  value={serviceData.description}
                  onChange={(e) => setServiceData({ ...serviceData, description: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="السعر"
                  value={serviceData.price}
                  onChange={(e) => setServiceData({ ...serviceData, price: Number(e.target.value) })}
                  InputProps={{
                    endAdornment: <Typography>ريال</Typography>,
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="المدة"
                  value={serviceData.duration}
                  onChange={(e) => setServiceData({ ...serviceData, duration: Number(e.target.value) })}
                  InputProps={{
                    endAdornment: <Typography>دقيقة</Typography>,
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="مدة الضمان"
                  value={serviceData.warranty}
                  onChange={(e) => setServiceData({ ...serviceData, warranty: Number(e.target.value) })}
                  InputProps={{
                    endAdornment: <Typography>يوم</Typography>,
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={serviceData.availability}
                      onChange={(e) => setServiceData({ ...serviceData, availability: e.target.checked })}
                    />
                  }
                  label="متاحة للحجز"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={serviceData.installmentAvailable}
                      onChange={(e) => setServiceData({ ...serviceData, installmentAvailable: e.target.checked })}
                    />
                  }
                  label="متاح التقسيط"
                />
              </Grid>
              {serviceData.installmentAvailable && (
                <>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      type="number"
                      label="عدد الأشهر"
                      value={serviceData.installmentMonths}
                      onChange={(e) => setServiceData({ ...serviceData, installmentMonths: Number(e.target.value) })}
                      InputProps={{
                        endAdornment: <Typography>شهر</Typography>,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      type="number"
                      label="القسط الشهري"
                      value={serviceData.monthlyInstallment}
                      onChange={(e) => setServiceData({ ...serviceData, monthlyInstallment: Number(e.target.value) })}
                      InputProps={{
                        endAdornment: <Typography>ريال</Typography>,
                      }}
                    />
                  </Grid>
                </>
              )}
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>
                  صورة الخدمة
                </Typography>
                <ImageUpload
                  value={serviceData.imageUrl}
                  onChange={(url) => setServiceData({ ...serviceData, imageUrl: url })}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>
                  أيقونة الخدمة
                </Typography>
                <ImageUpload
                  value={serviceData.iconUrl}
                  onChange={(url) => setServiceData({ ...serviceData, iconUrl: url })}
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
            disabled={!serviceData.name || !serviceData.categoryId || !serviceData.price}
          >
            {editingService ? 'تحديث' : 'إضافة'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 