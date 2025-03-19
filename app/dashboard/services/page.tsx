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
  InputAdornment,
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
  IconTool,
  IconCategory,
  IconClock,
  IconCash,
  IconStar,
  IconUsers,
  IconPrinter,
  IconEye,
} from '@tabler/icons-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import API_ENDPOINTS from '@/lib/apis';
import type { Service, Category, ServiceParameter } from '@/interfaces';
import { ImageUpload } from '@/components/shared/image-upload';
import { ExcelExport } from '@/components/shared/excel-export';
import { PDFDocument } from '@/components/shared/pdf-document';
import { PermissionGuard } from '@/components/common/PermissionGuard';
import { formatNumber } from '@/lib/utils';

export default function ServicesPage() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [serviceData, setServiceData] = useState<{
    name: string;
    description: string;
    categoryId: string;
    type: 'service' | 'delivery';
    subType?: 'delivery_service' | 'delivery_driver';
    price: number;
    duration: number;
    availability: boolean;
    imageUrl: string;
    iconUrl: string;
    warranty?: number;
    installmentAvailable: boolean;
    installmentMonths?: number;
    monthlyInstallment?: number;
    parameters: ServiceParameter[];
  }>({
    name: '',
    description: '',
    categoryId: '',
    type: 'service',
    price: 0,
    duration: 0,
    availability: true,
    imageUrl: '',
    iconUrl: '',
    installmentAvailable: false,
    parameters: [],
  });
  const [openPrintDialog, setOpenPrintDialog] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  const queryClient = useQueryClient();

  // استدعاء البيانات
  const { data: services, isLoading } = useQuery<Service[]>({
    queryKey: ['services'],
    queryFn: async () => {
      const response = await axios.get(API_ENDPOINTS.services.getAll({}));
      return response.data.data;
    },
  });

  const { data: categories } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await axios.get(API_ENDPOINTS.categories.getAll({}));
      return response.data.data.categories;
    },
  });

  // إضافة خدمة جديدة
  const addServiceMutation = useMutation({
    mutationFn: async (service: typeof serviceData) => {
      const response = await axios.post(API_ENDPOINTS.services.create({}), service);
      return response.data.data;
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
      return response.data.data;
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
      return response.data.data;
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
        description: service.description || '',
        categoryId: service.categoryId,
        type: service.type,
        subType: service.subType,
        price: service.price || 0,
        duration: service.duration || 0,
        availability: service.availability,
        imageUrl: service.imageUrl || '',
        iconUrl: service.iconUrl || '',
        warranty: service.warranty,
        installmentAvailable: service.installmentAvailable,
        installmentMonths: service.installmentMonths,
        monthlyInstallment: service.monthlyInstallment,
        parameters: service.parameters || [],
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
        installmentAvailable: false,
        parameters: [],
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
      installmentAvailable: false,
      parameters: [],
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
  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  // التعامل مع تغيير عدد العناصر في الصفحة
  const handleChangeRowsPerPage = (event: ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // تصفية الخدمات حسب البحث
  const filteredServices = services?.filter((service: Service) => {
    const category = categories?.find((c: Category) => c.id === service.categoryId);
    const searchLower = searchQuery.toLowerCase();
    
    return (
      service.name.toLowerCase().includes(searchLower) ||
      service.description?.toLowerCase().includes(searchLower) ||
      category?.name.toLowerCase().includes(searchLower)
    );
  });

  // حساب الإحصائيات
  const stats = {
    totalServices: filteredServices?.length || 0,
    activeServices: filteredServices?.filter((s: Service) => s.availability).length || 0,
    averageRating: filteredServices ? 
      filteredServices.reduce((sum: number, service: Service) => sum + (service.rating || 0), 0) / 
      (filteredServices.length || 1) : 0,
    totalParameters: filteredServices?.reduce((sum: number, service: Service) => sum + (service.parameters?.length || 0), 0) || 0,
  };

  // تعريف أعمدة Excel
  const excelColumns = [
    { header: 'اسم الخدمة', key: 'name', width: 30 },
    { header: 'التصنيف', key: 'category', width: 20 },
    { header: 'النوع', key: 'type', width: 15 },
    { header: 'السعر', key: 'price', width: 15 },
    { header: 'المدة', key: 'duration', width: 15 },
    { header: 'التقييم', key: 'rating', width: 15 },
    { header: 'الحالة', key: 'status', width: 15 },
  ];

  // تحضير بيانات Excel
  const excelData = services?.map((service: Service) => ({
    name: service.name,
    category: categories?.find((c: Category) => c.id === service.categoryId)?.name || '',
    type: service.type === 'service' ? 'خدمة' : 'توصيل',
    price: service.price || 0,
    duration: service.duration || 0,
    rating: service.rating || 0,
    status: service.availability ? 'متاح' : 'غير متاح',
  })) || [];

  if (isLoading) {
    return (
      <Box>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" fontWeight="bold">
            الخدمات
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
    <PermissionGuard requiredPermissions={['viewServices']}>
      <Box>
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5" fontWeight="bold">
            الخدمات
          </Typography>
          <Stack direction="row" spacing={2}>
            <ExcelExport
              columns={excelColumns}
              data={excelData}
              filename="services-report"
              sheetName="الخدمات"
            />
            <Button
              variant="contained"
              startIcon={<IconPlus size={20} />}
              onClick={() => handleOpenDialog()}
            >
              إضافة خدمة جديدة
            </Button>
          </Stack>
        </Box>

        {/* الإحصائيات */}
        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
              <IconTool size={24} color="#0068FF" />
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
              <IconStar size={24} color="#4CAF50" />
              <Box>
                <Typography variant="h6">{stats.activeServices}</Typography>
                <Typography variant="body2" color="text.secondary">
                  الخدمات المتاحة
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
              <IconCategory size={24} color="#F44336" />
              <Box>
                <Typography variant="h6">{stats.totalParameters}</Typography>
                <Typography variant="body2" color="text.secondary">
                  إجمالي المعايير
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
                placeholder="البحث في الخدمات..."
                value={searchQuery}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
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
                <TableCell>النوع</TableCell>
                <TableCell>السعر</TableCell>
                <TableCell>المدة</TableCell>
                <TableCell>التقييم</TableCell>
                <TableCell>الحالة</TableCell>
                <TableCell>الإجراءات</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredServices
                ?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((service: Service) => {
                  const category = categories?.find((c: Category) => c.id === service.categoryId);
                  
                  return (
                    <TableRow key={service.id}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar src={service.imageUrl} variant="rounded">
                            {service.name[0]}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2">{service.name}</Typography>
                            <Typography variant="caption" color="text.secondary" noWrap>
                              {service.description}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={category?.name}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={service.type === 'service' ? 'خدمة' : 'توصيل'}
                          size="small"
                          color={service.type === 'service' ? 'info' : 'warning'}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {formatNumber(service.price || 0)} ر.س
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {service.duration} دقيقة
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Rating value={service.rating || 0} readOnly size="small" />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={service.availability ? 'متاح' : 'غير متاح'}
                          color={service.availability ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1}>
                          <IconButton
                            color="info"
                            size="small"
                            onClick={() => {
                              setSelectedService(service);
                              setOpenPrintDialog(true);
                            }}
                          >
                            <IconEye size={18} />
                          </IconButton>
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
                        </Stack>
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
            labelDisplayedRows={({ from, to, count }: { from: number; to: number; count: number }) =>
              `${from}-${to} من ${count !== -1 ? count : `أكثر من ${to}`}`
            }
          />
        </TableContainer>

        {/* نموذج إضافة/تحديث خدمة */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
          <DialogTitle>
            {editingService ? 'تحديث الخدمة' : 'إضافة خدمة جديدة'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <ImageUpload
                    value={serviceData.imageUrl}
                    onChange={(url: string) => setServiceData({ ...serviceData, imageUrl: url })}
                    label="صورة الخدمة"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="اسم الخدمة"
                    value={serviceData.name}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setServiceData({ ...serviceData, name: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>التصنيف</InputLabel>
                    <Select
                      value={serviceData.categoryId}
                      label="التصنيف"
                      onChange={(e: SelectChangeEvent) => setServiceData({ ...serviceData, categoryId: e.target.value })}
                    >
                      {categories?.map((category: Category) => (
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
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setServiceData({ ...serviceData, description: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>النوع</InputLabel>
                    <Select
                      value={serviceData.type}
                      label="النوع"
                      onChange={(e: SelectChangeEvent) => setServiceData({ ...serviceData, type: e.target.value as 'service' | 'delivery' })}
                    >
                      <MenuItem value="service">خدمة</MenuItem>
                      <MenuItem value="delivery">توصيل</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                {serviceData.type === 'delivery' && (
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>النوع الفرعي</InputLabel>
                      <Select
                        value={serviceData.subType}
                        label="النوع الفرعي"
                        onChange={(e: SelectChangeEvent) => setServiceData({ ...serviceData, subType: e.target.value as 'delivery_service' | 'delivery_driver' })}
                      >
                        <MenuItem value="delivery_service">خدمة توصيل</MenuItem>
                        <MenuItem value="delivery_driver">سائق توصيل</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                )}
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="السعر"
                    value={serviceData.price}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setServiceData({ ...serviceData, price: parseFloat(e.target.value) })}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">ر.س</InputAdornment>,
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="المدة (بالدقائق)"
                    value={serviceData.duration}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setServiceData({ ...serviceData, duration: parseInt(e.target.value) })}
                    InputProps={{
                      startAdornment: <InputAdornment position="start"><IconClock size={20} /></InputAdornment>,
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="فترة الضمان (بالأيام)"
                    value={serviceData.warranty}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setServiceData({ ...serviceData, warranty: parseInt(e.target.value) })}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={serviceData.installmentAvailable}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setServiceData({ ...serviceData, installmentAvailable: e.target.checked })}
                      />
                    }
                    label="متاح للتقسيط"
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
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setServiceData({ ...serviceData, installmentMonths: parseInt(e.target.value) })}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        type="number"
                        label="القسط الشهري"
                        value={serviceData.monthlyInstallment}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setServiceData({ ...serviceData, monthlyInstallment: parseFloat(e.target.value) })}
                        InputProps={{
                          startAdornment: <InputAdornment position="start">ر.س</InputAdornment>,
                        }}
                      />
                    </Grid>
                  </>
                )}
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={serviceData.availability}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setServiceData({ ...serviceData, availability: e.target.checked })}
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
              disabled={!serviceData.name || !serviceData.categoryId || !serviceData.type}
            >
              {editingService ? 'تحديث' : 'إضافة'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* نموذج عرض تفاصيل الخدمة */}
        <Dialog open={openPrintDialog} onClose={() => setOpenPrintDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>
            تفاصيل الخدمة
          </DialogTitle>
          <DialogContent>
            {selectedService && (
              <PDFDocument
                title="تفاصيل الخدمة"
                data={{
                  ...selectedService,
                  category: categories?.find((c: Category) => c.id === selectedService.categoryId)?.name,
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