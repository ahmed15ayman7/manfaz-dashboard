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
  IconTool,
  IconStar,
  IconCash,
  IconBuildingStore,
  IconPrinter,
  IconEye,
  IconPhone,
  IconMail,
  IconMapPin,
  IconCheck,
  IconX,
} from '@tabler/icons-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import API_ENDPOINTS from '@/lib/apis';
import { Worker, User, Service } from '@/interfaces';
import { ImageUpload } from '@/components/shared/image-upload';
import { ExcelExport } from '@/components/shared/excel-export';
import { PDFDocument } from '@/components/shared/pdf-document';
import { PermissionGuard } from '@/components/common/PermissionGuard';
import { ActionButton } from '@/components/common/ActionButton';
import { formatDate, formatNumber } from '@/lib/utils';

export default function WorkersPage() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingWorker, setEditingWorker] = useState<Worker | null>(null);
  const [workerData, setWorkerData] = useState<Partial<Worker>>({
    userId: '',
    title: '',
    description: '',
    hourlyRate: 0,
    isAvailable: true,
    skills: [],
  });
  const [openPrintDialog, setOpenPrintDialog] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);

  const queryClient = useQueryClient();

  // استدعاء البيانات
  const { data: workers, isLoading } = useQuery<Worker[]>({
    queryKey: ['workers'],
    queryFn: async () => {
      const response = await axios.get(API_ENDPOINTS.workers.getAll({}));
      return response.data.data;
    },
  });

  const { data: users } = useQuery<User[]>({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await axios.get(API_ENDPOINTS.users.getAll({}));
      return response.data.data;
    },
  });

  const { data: services } = useQuery<Service[]>({
    queryKey: ['services'],
    queryFn: async () => {
      const response = await axios.get(API_ENDPOINTS.services.getAll({}));
      return response.data;
    },
  });

  // إضافة مقدم خدمة جديد
  const addWorkerMutation = useMutation({
    mutationFn: async (worker: typeof workerData) => {
      const response = await axios.post(API_ENDPOINTS.workers.create({}), worker);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workers'] });
      handleCloseDialog();
    },
  });

  // تحديث مقدم خدمة
  const updateWorkerMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof workerData }) => {
      const response = await axios.put(API_ENDPOINTS.workers.update(id, {}), data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workers'] });
      handleCloseDialog();
    },
  });

  // حذف مقدم خدمة
  const deleteWorkerMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await axios.delete(API_ENDPOINTS.workers.delete(id, {}));
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workers'] });
    },
  });

  // تصفية مقدمي الخدمات حسب البحث
  const filteredWorkers = workers?.filter((worker) =>
    worker.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    worker.user?.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // حساب الإحصائيات
  const stats = {
    totalWorkers: filteredWorkers?.length || 0,
    activeWorkers: filteredWorkers?.filter(w => w.isAvailable).length || 0,
    totalJobs: filteredWorkers?.reduce((sum, worker) => sum + (worker.totalJobsDone || 0), 0) || 0,
    totalEarnings: filteredWorkers?.reduce((sum, worker) => sum + (worker.totalEarned || 0), 0) || 0,
  };

  // تعريف أعمدة Excel
  const excelColumns = [
    { header: 'الاسم', key: 'name', width: 30 },
    { header: 'المهنة', key: 'title', width: 30 },
    { header: 'التقييم', key: 'rating', width: 15 },
    { header: 'عدد التقييمات', key: 'reviewsCount', width: 15 },
    { header: 'الطلبات المنجزة', key: 'totalJobs', width: 15 },
    { header: 'المبلغ المحصل', key: 'earnings', width: 20 },
    { header: 'الحالة', key: 'status', width: 15 },
  ];

  // تحضير بيانات Excel
  const excelData = workers?.map(worker => ({
    name: worker.user?.name || '',
    title: worker.title,
    rating: worker.rating,
    reviewsCount: worker.reviewsCount,
    totalJobs: worker.totalJobsDone,
    earnings: worker.totalEarned,
    status: worker.isAvailable ? 'متاح' : 'غير متاح',
  })) || [];

  const handleOpenDialog = (worker?: Worker) => {
    if (worker) {
      setEditingWorker(worker);
      setWorkerData({
        userId: worker.userId,
        title: worker.title,
        description: worker.description,
        hourlyRate: worker.hourlyRate,
        isAvailable: worker.isAvailable,
        skills: worker.skills,
      });
    } else {
      setEditingWorker(null);
      setWorkerData({
        userId: '',
        title: '',
        description: '',
        hourlyRate: 0,
        isAvailable: true,
        skills: [],
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingWorker(null);
    setWorkerData({
      userId: '',
      title: '',
      description: '',
      hourlyRate: 0,
      isAvailable: true,
      skills: [],
    });
  };

  const handleSubmit = () => {
    if (editingWorker) {
      updateWorkerMutation.mutate({ id: editingWorker.id!, data: workerData });
    } else {
      addWorkerMutation.mutate(workerData);
    }
  };

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleViewWorker = (worker: Worker) => {
    setSelectedWorker(worker);
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
    <PermissionGuard requiredPermissions={['viewProviders']}>
    <Box>
        {/* رأس الصفحة */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" fontWeight="bold">
            مقدمي الخدمات
        </Typography>
          <ActionButton
            requiredPermissions={['createProviders']}
          variant="contained"
            startIcon={<IconPlus size={20} />}
            onClick={() => handleOpenDialog()}
        >
            إضافة مقدم خدمة
          </ActionButton>
      </Box>

        {/* الإحصائيات */}
        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
              <IconTool size={24} color="#0068FF" />
              <Box>
                <Typography variant="h6">{stats.totalWorkers}</Typography>
                <Typography variant="body2" color="text.secondary">
                  إجمالي مقدمي الخدمات
                </Typography>
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
              <IconCheck size={24} color="#4CAF50" />
              <Box>
                <Typography variant="h6">{stats.activeWorkers}</Typography>
                <Typography variant="body2" color="text.secondary">
                  المتاحين حالياً
                </Typography>
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
              <IconBuildingStore size={24} color="#FF9800" />
              <Box>
                <Typography variant="h6">{stats.totalJobs}</Typography>
                <Typography variant="body2" color="text.secondary">
                  إجمالي الطلبات المنجزة
                </Typography>
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
              <IconCash size={24} color="#F44336" />
              <Box>
                <Typography variant="h6">{formatNumber(stats.totalEarnings, 'currency')}</Typography>
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
              placeholder="البحث عن مقدم خدمة..."
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
                  filename="workers.xlsx"
                  sheetName="مقدمي الخدمات"
                />
              </Stack>
            </Grid>
        </Grid>
      </Paper>

      {/* جدول مقدمي الخدمات */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>مقدم الخدمة</TableCell>
                <TableCell>معلومات الاتصال</TableCell>
              <TableCell>المهنة</TableCell>
              <TableCell>التقييم</TableCell>
                <TableCell>النشاط</TableCell>
              <TableCell>الحالة</TableCell>
              <TableCell>الإجراءات</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
              {(filteredWorkers || [])
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((worker) => (
                <TableRow key={worker.id}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar src={worker.user?.imageUrl}>
                          {worker.user?.name?.charAt(0)}
                        </Avatar>
                      <Box>
                          <Typography fontWeight="medium">{worker.user?.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                            {worker.title}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                      <Stack spacing={1}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <IconPhone size={16} />
                          <Typography variant="body2">{worker.user?.phone}</Typography>
                        </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <IconMail size={16} />
                          <Typography variant="body2">{worker.user?.email}</Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Stack spacing={1}>
                        {worker.skills?.map((skill, index) => (
                          <Chip
                            key={index}
                            label={skill}
                        size="small"
                            color="primary"
                            variant="outlined"
                          />
                        ))}
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Rating value={worker.rating} readOnly size="small" />
                        <Typography variant="body2">
                        ({worker.reviewsCount} تقييم)
                      </Typography>
                    </Box>
                  </TableCell>
                    <TableCell>
                      <Stack spacing={1}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <IconBuildingStore size={16} />
                          <Typography variant="body2">
                            {worker.totalJobsDone} طلب
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <IconCash size={16} />
                          <Typography variant="body2">
                            {formatNumber(worker.totalEarned || 0, 'currency')}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                  <TableCell>
                    <Chip
                      label={worker.isAvailable ? 'متاح' : 'غير متاح'}
                        color={worker.isAvailable ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                      <Stack direction="row" spacing={1}>
                        <IconButton
                          size="small"
                          color="info"
                          onClick={() => handleViewWorker(worker)}
                        >
                          <IconEye size={18} />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleOpenDialog(worker)}
                        >
                      <IconEdit size={18} />
                    </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => deleteWorkerMutation.mutate(worker.id!)}
                        >
                      <IconTrash size={18} />
                    </IconButton>
                      </Stack>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={filteredWorkers?.length || 0}
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

        {/* نموذج إضافة/تعديل مقدم خدمة */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
          <DialogTitle>
            {editingWorker ? 'تعديل بيانات مقدم الخدمة' : 'إضافة مقدم خدمة جديد'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>المستخدم</InputLabel>
                    <Select
                      value={workerData.userId}
                      label="المستخدم"
                      onChange={(e) => setWorkerData({ ...workerData, userId: e.target.value })}
                    >
                      {users?.map((user) => (
                        <MenuItem key={user.id} value={user.id}>
                          {user.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="المهنة"
                    value={workerData.title}
                    onChange={(e) => setWorkerData({ ...workerData, title: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="الوصف"
                    value={workerData.description}
                    onChange={(e) => setWorkerData({ ...workerData, description: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="السعر بالساعة"
                    value={workerData.hourlyRate}
                    onChange={(e) => setWorkerData({ ...workerData, hourlyRate: Number(e.target.value) })}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">ريال</InputAdornment>,
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>الحالة</InputLabel>
                    <Select
                      value={workerData.isAvailable}
                      label="الحالة"
                      onChange={(e) => setWorkerData({ ...workerData, isAvailable: e.target.value === 'true' })}
                    >
                      <MenuItem value="true">متاح</MenuItem>
                      <MenuItem value="false">غير متاح</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="المهارات"
                    placeholder="أدخل المهارات مفصولة بفواصل"
                    value={workerData.skills?.join(', ')}
                    onChange={(e) => setWorkerData({ ...workerData, skills: e.target.value.split(',').map(s => s.trim()) })}
                    helperText="مثال: سباكة، كهرباء، نجارة"
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
              disabled={!workerData.userId || !workerData.title}
            >
              {editingWorker ? 'تحديث' : 'إضافة'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* نافذة عرض تفاصيل مقدم الخدمة */}
        <Dialog
          open={openPrintDialog}
          onClose={() => setOpenPrintDialog(false)}
          maxWidth="md"
          fullWidth
        >
          {selectedWorker && (
            <PDFDocument
              title={`تقرير مقدم الخدمة - ${selectedWorker.user?.name}`}
              data={{
                title: `تقرير مقدم الخدمة - ${selectedWorker.user?.name}`,
                date: formatDate(new Date()),
                description: `تقرير تفصيلي عن مقدم الخدمة ${selectedWorker.user?.name}`,
                sections: [
                  {
                    title: 'المعلومات الشخصية',
                    content: `
                      الاسم: ${selectedWorker.user?.name}
                      المهنة: ${selectedWorker.title}
                      البريد الإلكتروني: ${selectedWorker.user?.email}
                      رقم الهاتف: ${selectedWorker.user?.phone}
                      المهارات: ${selectedWorker.skills?.join(', ')}
                    `
                  },
                  {
                    title: 'إحصائيات النشاط',
                    content: `
                      عدد الطلبات المنجزة: ${selectedWorker.totalJobsDone}
                      التقييم: ${selectedWorker.rating} (${selectedWorker.reviewsCount} تقييم)
                      إجمالي الإيرادات: ${formatNumber(selectedWorker.totalEarned || 0, 'currency')}
                      السعر بالساعة: ${formatNumber(selectedWorker.hourlyRate, 'currency')}
                      الحالة: ${selectedWorker.isAvailable ? 'متاح' : 'غير متاح'}
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