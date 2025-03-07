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
} from '@mui/material';
import { IconPlus, IconEdit, IconTrash, IconSearch, IconTruck, IconCash, IconChartBar, IconPrinter } from '@tabler/icons-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import API_ENDPOINTS from '@/lib/apis';
import { Order, User, Service, Worker, DeliveryDriver, UserLocation } from '@/interfaces';
import { ExcelExport } from '@/components/shared/excel-export';
import { PDFDocument, PrintButton } from '@/components/shared/pdf-document';

export default function OrdersPage() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [orderData, setOrderData] = useState<Partial<Order>>({
    userId: '',
    serviceId: '',
    providerId: '',
    deliveryDriverId: '',
    description: '',
    locationId: '',
    notes: '',
    price: 0,
    duration: 0,
    status: 'pending',
    paymentStatus: 'pending',
  });
  const [openPrintDialog, setOpenPrintDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const queryClient = useQueryClient();

  // استدعاء البيانات
  const { data: users } = useQuery<User[]>({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await axios.get(API_ENDPOINTS.users.getAll({}));
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

  const { data: workers } = useQuery<Worker[]>({
    queryKey: ['workers'],
    queryFn: async () => {
      const response = await axios.get(API_ENDPOINTS.workers.getAll({}));
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

  const { data: orders } = useQuery<Order[]>({
    queryKey: ['orders'],
    queryFn: async () => {
      const response = await axios.get(API_ENDPOINTS.orders.getAll({}));
      return response.data;
    },
  });

  // إضافة طلب جديد
  const addOrderMutation = useMutation({
    mutationFn: async (order: typeof orderData) => {
      const response = await axios.post(API_ENDPOINTS.orders.create({}), order);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      handleCloseDialog();
    },
  });

  // تحديث طلب
  const updateOrderMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof orderData }) => {
      const response = await axios.put(API_ENDPOINTS.orders.update(id, {}), data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      handleCloseDialog();
    },
  });

  // حذف طلب
  const deleteOrderMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await axios.delete(API_ENDPOINTS.orders.delete(id, {}));
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });

  // تعريف أعمدة ملف Excel
  const excelColumns = [
    { header: 'رقم الطلب', key: 'id', width: 20 },
    { header: 'العميل', key: 'customerName', width: 30 },
    { header: 'الخدمة', key: 'serviceName', width: 30 },
    { header: 'مقدم الخدمة', key: 'providerName', width: 30 },
    { header: 'السعر', key: 'price', width: 15 },
    { header: 'حالة الطلب', key: 'status', width: 15 },
    { header: 'حالة الدفع', key: 'paymentStatus', width: 15 },
    { header: 'تاريخ الطلب', key: 'createdAt', width: 20 },
  ];

  // تحضير بيانات Excel
  const excelData = orders?.map(order => ({
    id: order.id,
    customerName: order.user?.name,
    serviceName: order.service?.name,
    providerName: order.provider?.user?.name,
    price: order.price,
    status: order.status === 'pending' ? 'قيد الانتظار' :
      order.status === 'in_progress' ? 'قيد التنفيذ' :
        order.status === 'completed' ? 'مكتمل' : 'ملغي',
    paymentStatus: order.paymentStatus === 'pending' ? 'قيد الانتظار' :
      order.paymentStatus === 'paid' ? 'مدفوع' : 'فشل الدفع',
    createdAt: order.createdAt ? new Date(order.createdAt).toLocaleDateString('ar-SA') : '',
  })) || [];

  const handleOpenDialog = (order?: Order) => {
    if (order) {
      setEditingOrder(order);
      setOrderData({
        userId: order.userId,
        serviceId: order.serviceId,
        providerId: order.providerId,
        deliveryDriverId: order.deliveryDriverId,
        description: order.description,
        locationId: order.locationId,
        notes: order.notes,
        price: order.price,
        duration: order.duration,
        status: order.status,
        paymentStatus: order.paymentStatus,
      });
    } else {
      setEditingOrder(null);
      setOrderData({
        userId: '',
        serviceId: '',
        providerId: '',
        deliveryDriverId: '',
        description: '',
        locationId: '',
        notes: '',
        price: 0,
        duration: 0,
        status: 'pending',
        paymentStatus: 'pending',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingOrder(null);
    setOrderData({
      userId: '',
      serviceId: '',
      providerId: '',
      deliveryDriverId: '',
      description: '',
      locationId: '',
      notes: '',
      price: 0,
      duration: 0,
      status: 'pending',
      paymentStatus: 'pending',
    });
  };

  const handleSubmit = () => {
    if (editingOrder) {
      updateOrderMutation.mutate({ id: editingOrder.id!, data: orderData });
    } else {
      addOrderMutation.mutate(orderData);
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

  // تصفية الطلبات حسب البحث
  const filteredOrders = orders?.filter((order) => {
    const user = users?.find(u => u.id === order.userId);
    return user?.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // حساب الإحصائيات
  const stats = {
    totalOrders: filteredOrders?.length || 0,
    pendingOrders: filteredOrders?.filter(o => o.status === 'pending').length || 0,
    completedOrders: filteredOrders?.filter(o => o.status === 'completed').length || 0,
    totalRevenue: filteredOrders?.reduce((sum, order) => sum + (order.price || 0), 0) || 0,
  };

  // تنسيق التاريخ
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // تحضير بيانات الفاتورة
  const handlePrintInvoice = (order: Order) => {
    setSelectedOrder(order);
    setOpenPrintDialog(true);
  };

  const invoiceData = selectedOrder ? {
    invoiceNumber: selectedOrder.id,
    date: selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleDateString('ar-SA') : '',
    customerName: selectedOrder.user?.name,
    items: [{
      description: selectedOrder.service?.name,
      quantity: 1,
      price: selectedOrder.price,
      total: selectedOrder.price,
    }],
    total: selectedOrder.price,
    tax: selectedOrder.price ? selectedOrder.price * 0.15 : 0, // 15% ضريبة القيمة المضافة
    grandTotal: selectedOrder.price ? selectedOrder.price * 1.15 : 0,
  } : null;

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" fontWeight="bold">
          إدارة الطلبات
        </Typography>
        <Button
          variant="contained"
          startIcon={<IconPlus />}
          onClick={() => handleOpenDialog()}
          sx={{ backgroundColor: 'primary.main' }}
        >
          إضافة طلب جديد
        </Button>
      </Box>

      {/* الإحصائيات */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconTruck size={24} color="#0068FF" />
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
            <IconChartBar size={24} color="#4CAF50" />
            <Box>
              <Typography variant="h6">{stats.pendingOrders}</Typography>
              <Typography variant="body2" color="text.secondary">
                الطلبات المعلقة
              </Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconTruck size={24} color="#FF9800" />
            <Box>
              <Typography variant="h6">{stats.completedOrders}</Typography>
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
              <Typography variant="h6">{stats.totalRevenue}</Typography>
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
              placeholder="البحث عن طلب..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: <IconSearch size={20} />,
              }}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* أزرار التصدير والطباعة */}
      <Box sx={{ mb: 2, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <ExcelExport
          data={excelData}
          columns={excelColumns}
          filename="orders.xlsx"
          sheetName="الطلبات"
        />
      </Box>

      {/* جدول الطلبات */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>العميل</TableCell>
              <TableCell>الخدمة</TableCell>
              <TableCell>مقدم الخدمة</TableCell>
              <TableCell>السعر</TableCell>
              <TableCell>الحالة</TableCell>
              <TableCell>حالة الدفع</TableCell>
              <TableCell>التاريخ</TableCell>
              <TableCell>الإجراءات</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredOrders
              ?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((order) => {
                const user = users?.find(u => u.id === order.userId);
                const service = services?.find(s => s.id === order.serviceId);
                const provider = workers?.find(w => w.id === order.providerId);
                return (
                  <TableRow key={order.id}>
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
                    <TableCell>{service?.name}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar src={provider?.user?.imageUrl}>
                          {provider?.user?.name?.[0]}
                        </Avatar>
                        <Typography variant="subtitle2">{provider?.user?.name}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {order.price} ريال
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={
                          order.status === 'completed'
                            ? 'مكتمل'
                            : order.status === 'pending'
                              ? 'معلق'
                              : order.status === 'in_progress'
                                ? 'قيد التنفيذ'
                                : 'ملغي'
                        }
                        color={
                          order.status === 'completed'
                            ? 'success'
                            : order.status === 'pending'
                              ? 'warning'
                              : order.status === 'in_progress'
                                ? 'info'
                                : 'error'
                        }
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={
                          order.paymentStatus === 'paid'
                            ? 'مدفوع'
                            : order.paymentStatus === 'pending'
                              ? 'معلق'
                              : 'فشل'
                        }
                        color={
                          order.paymentStatus === 'paid'
                            ? 'success'
                            : order.paymentStatus === 'pending'
                              ? 'warning'
                              : 'error'
                        }
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{formatDate(order.createdAt!)}</TableCell>
                    <TableCell>
                      <IconButton
                        color="primary"
                        size="small"
                        onClick={() => handleOpenDialog(order)}
                      >
                        <IconEdit size={18} />
                      </IconButton>
                      <IconButton
                        color="error"
                        size="small"
                        onClick={() => deleteOrderMutation.mutate(order.id!)}
                      >
                        <IconTrash size={18} />
                      </IconButton>
                      <IconButton
                        color="info"
                        size="small"
                        onClick={() => handlePrintInvoice(order)}
                      >
                        <IconPrinter size={18} />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={filteredOrders?.length || 0}
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

      {/* نافذة عرض وطباعة الفاتورة */}
      <Dialog
        open={openPrintDialog}
        onClose={() => setOpenPrintDialog(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedOrder && invoiceData && (
          <PDFDocument
            title="فاتورة طلب"
            data={invoiceData}
            template="invoice"
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

      {/* نموذج إضافة/تحديث طلب */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingOrder ? 'تحديث الطلب' : 'إضافة طلب جديد'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControl fullWidth>
              <InputLabel>العميل</InputLabel>
              <Select
                value={orderData.userId}
                label="العميل"
                onChange={(e) => setOrderData({ ...orderData, userId: e.target.value })}
              >
                {users?.map((user) => (
                  <MenuItem key={user.id} value={user.id}>
                    {user.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>الخدمة</InputLabel>
              <Select
                value={orderData.serviceId}
                label="الخدمة"
                onChange={(e) => setOrderData({ ...orderData, serviceId: e.target.value })}
              >
                {services?.map((service) => (
                  <MenuItem key={service.id} value={service.id}>
                    {service.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>مقدم الخدمة</InputLabel>
              <Select
                value={orderData.providerId}
                label="مقدم الخدمة"
                onChange={(e) => setOrderData({ ...orderData, providerId: e.target.value })}
              >
                {workers?.map((worker) => (
                  <MenuItem key={worker.id} value={worker.id}>
                    {worker.user?.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>السائق</InputLabel>
              <Select
                value={orderData.deliveryDriverId}
                label="السائق"
                onChange={(e) => setOrderData({ ...orderData, deliveryDriverId: e.target.value })}
              >
                <MenuItem value="">بدون سائق</MenuItem>
                {drivers?.map((driver) => (
                  <MenuItem key={driver.id} value={driver.id}>
                    {driver.user?.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="الوصف"
              multiline
              rows={3}
              value={orderData.description}
              onChange={(e) => setOrderData({ ...orderData, description: e.target.value })}
            />
            <TextField
              fullWidth
              label="ملاحظات"
              multiline
              rows={2}
              value={orderData.notes}
              onChange={(e) => setOrderData({ ...orderData, notes: e.target.value })}
            />
            <TextField
              fullWidth
              label="السعر"
              type="number"
              value={orderData.price}
              onChange={(e) => setOrderData({ ...orderData, price: parseFloat(e.target.value) })}
              InputProps={{
                endAdornment: <InputAdornment position="end">ريال</InputAdornment>,
              }}
            />
            <TextField
              fullWidth
              label="المدة (بالدقائق)"
              type="number"
              value={orderData.duration}
              onChange={(e) => setOrderData({ ...orderData, duration: parseInt(e.target.value) })}
            />
            <FormControl fullWidth>
              <InputLabel>حالة الطلب</InputLabel>
              <Select
                value={orderData.status}
                label="حالة الطلب"
                onChange={(e) => setOrderData({ ...orderData, status: e.target.value as Order['status'] })}
              >
                <MenuItem value="pending">معلق</MenuItem>
                <MenuItem value="in_progress">قيد التنفيذ</MenuItem>
                <MenuItem value="completed">مكتمل</MenuItem>
                <MenuItem value="canceled">ملغي</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>حالة الدفع</InputLabel>
              <Select
                value={orderData.paymentStatus}
                label="حالة الدفع"
                onChange={(e) => setOrderData({ ...orderData, paymentStatus: e.target.value as Order['paymentStatus'] })}
              >
                <MenuItem value="pending">معلق</MenuItem>
                <MenuItem value="paid">مدفوع</MenuItem>
                <MenuItem value="failed">فشل</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>إلغاء</Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={!orderData.userId || !orderData.serviceId || !orderData.providerId}
          >
            {editingOrder ? 'تحديث' : 'إضافة'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 