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
} from '@mui/material';
import { IconPlus, IconEdit, IconTrash, IconSearch, IconUsers, IconBuildingStore, IconTool, IconPrinter } from '@tabler/icons-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import API_ENDPOINTS from '@/lib/apis';
import { User } from '@/interfaces';
import { ImageUpload } from '@/components/shared/image-upload';
import { ExcelExport } from '@/components/shared/excel-export';
import { PDFDocument, PrintButton } from '@/components/shared/pdf-document';
import { SearchPagination } from '@/components/shared/search-pagination';
import { SkeletonLoader } from '@/components/shared/skeleton-loader';
import { DataTable } from '@/components/shared/data-table';

export default function UsersPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<Partial<User>>({
    name: '',
    email: '',
    phone: '',
    password: '',
    imageUrl: '',
    role: 'user',
  });
  const [openPrintDialog, setOpenPrintDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const queryClient = useQueryClient();

  // استدعاء بيانات المستخدمين مع البحث والتنقل
  const { data, isLoading } = useQuery({
    queryKey: ['users', searchQuery, page, limit],
    queryFn: async () => {
      const response = await axios.get(API_ENDPOINTS.users.getAll({
        q: searchQuery,
        page: page.toString(),
        limit: limit.toString()
      }));
      return response.data;
    },
  });

  // إضافة مستخدم جديد
  const addUserMutation = useMutation({
    mutationFn: async (user: typeof userData) => {
      const response = await axios.post(API_ENDPOINTS.auth.register({}), user);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      handleCloseDialog();
    },
  });

  // تحديث بيانات مستخدم
  const updateUserMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof userData }) => {
      const response = await axios.put(API_ENDPOINTS.users.update(id, {}), data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      handleCloseDialog();
    },
  });

  // حذف مستخدم
  const deleteUserMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await axios.delete(API_ENDPOINTS.users.delete(id, {}));
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const handleOpenDialog = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setUserData({
        name: user.name,
        email: user.email,
        phone: user.phone,
        imageUrl: user.imageUrl,
        role: user.role,
      });
    } else {
      setEditingUser(null);
      setUserData({
        name: '',
        email: '',
        phone: '',
        password: '',
        imageUrl: '',
        role: 'user',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingUser(null);
    setUserData({
      name: '',
      email: '',
      phone: '',
      password: '',
      imageUrl: '',
      role: 'user',
    });
  };

  const handleSubmit = () => {
    if (editingUser) {
      updateUserMutation.mutate({ id: editingUser.id, data: userData });
    } else {
      addUserMutation.mutate(userData);
    }
  };

  // تعريف أعمدة الجدول
  const columns = [
    { field: 'name', headerName: 'الاسم', width: 200 },
    { field: 'email', headerName: 'البريد الإلكتروني', width: 250 },
    { field: 'phone', headerName: 'رقم الهاتف', width: 150 },
    { field: 'accountType', headerName: 'نوع الحساب', width: 150 },
    { field: 'role', headerName: 'الدور', width: 150 },
    { 
      field: 'createdAt', 
      headerName: 'تاريخ التسجيل', 
      width: 200,
      renderCell: (params: any) => new Date(params.value).toLocaleDateString('ar-SA')
    },
  ];

  // حساب الإحصائيات
  const stats = {
    totalUsers: data?.total || 0,
    activeUsers: data?.users?.filter(u => u.role === 'user').length || 0,
    stores: data?.users?.filter(u => u.role === 'store').length || 0,
    workers: data?.users?.filter(u => u.role === 'worker').length || 0,
  };

  // تعريف أعمدة ملف Excel
  const excelColumns = [
    { header: 'الاسم', key: 'name', width: 30 },
    { header: 'البريد الإلكتروني', key: 'email', width: 30 },
    { header: 'رقم الهاتف', key: 'phone', width: 20 },
    { header: 'نوع الحساب', key: 'role', width: 15 },
    { header: 'عدد الطلبات', key: 'ordersCount', width: 15 },
    { header: 'رصيد المحفظة', key: 'balance', width: 15 },
    { header: 'تاريخ التسجيل', key: 'createdAt', width: 20 },
  ];

  // تحضير بيانات Excel
  const excelData = data?.users?.map(user => ({
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role === 'user' ? 'مستخدم' :
          user.role === 'store' ? 'متجر' : 'مقدم خدمة',
    ordersCount: user.orders?.length || 0,
    balance: user.wallet?.balance || 0,
    createdAt: new Date(user.createdAt).toLocaleDateString('ar-SA'),
  })) || [];

  // تحضير بيانات التقرير
  const handlePrintReport = (user: User) => {
    setSelectedUser(user);
    setOpenPrintDialog(true);
  };

  const reportData = selectedUser ? {
    title: `تقرير المستخدم - ${selectedUser.name}`,
    date: new Date().toLocaleDateString('ar-SA'),
    description: `تقرير تفصيلي عن نشاط المستخدم ${selectedUser.name}`,
    sections: [
      {
        title: 'معلومات الحساب',
        content: `
          البريد الإلكتروني: ${selectedUser.email}
          رقم الهاتف: ${selectedUser.phone}
          نوع الحساب: ${selectedUser.role === 'user' ? 'مستخدم' :
                        selectedUser.role === 'store' ? 'متجر' : 'مقدم خدمة'}
          تاريخ التسجيل: ${new Date(selectedUser.createdAt).toLocaleDateString('ar-SA')}
        `
      },
      {
        title: 'إحصائيات النشاط',
        content: `
          عدد الطلبات: ${selectedUser.orders?.length || 0}
          رصيد المحفظة: ${selectedUser.wallet?.balance || 0} ريال
          عدد العناوين المسجلة: ${selectedUser.locations?.length || 0}
        `
      },
    ],
  } : null;

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" fontWeight="bold">
          إدارة المستخدمين
        </Typography>
          <Button
            variant="contained"
            startIcon={<IconPlus />}
          onClick={() => handleOpenDialog()}
          sx={{ backgroundColor: 'primary.main' }}
          >
          إضافة مستخدم جديد
          </Button>
      </Box>

      {/* الإحصائيات */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconUsers size={24} color="#0068FF" />
            <Box>
              <Typography variant="h6">{stats.totalUsers}</Typography>
              <Typography variant="body2" color="text.secondary">
                إجمالي المستخدمين
              </Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconUsers size={24} color="#4CAF50" />
            <Box>
              <Typography variant="h6">{stats.activeUsers}</Typography>
              <Typography variant="body2" color="text.secondary">
                المستخدمين النشطين
              </Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconBuildingStore size={24} color="#FF9800" />
            <Box>
              <Typography variant="h6">{stats.stores}</Typography>
              <Typography variant="body2" color="text.secondary">
                المتاجر
              </Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconTool size={24} color="#F44336" />
            <Box>
              <Typography variant="h6">{stats.workers}</Typography>
              <Typography variant="body2" color="text.secondary">
                مقدمي الخدمات
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* مكون البحث والتنقل */}
      <Paper className="p-4">
        <SearchPagination
          totalItems={data?.total || 0}
          onSearch={setSearchQuery}
          onPageChange={setPage}
          onLimitChange={setLimit}
        />
      </Paper>

      {/* عرض البيانات أو Skeleton */}
      <Box className="mt-4">
        {isLoading ? (
          <SkeletonLoader type="table" count={limit} />
        ) : (
          <DataTable
            rows={data?.users || []}
            columns={columns}
            rowCount={data?.total || 0}
            loading={isLoading}
          />
        )}
      </Box>

      {/* أزرار التصدير والطباعة */}
      <Box sx={{ mb: 2, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <ExcelExport
          data={excelData}
          columns={excelColumns}
          filename="users.xlsx"
          sheetName="المستخدمين"
        />
      </Box>

      {/* نافذة عرض وطباعة التقرير */}
      <Dialog
        open={openPrintDialog}
        onClose={() => setOpenPrintDialog(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedUser && reportData && (
          <PDFDocument
            title="تقرير مستخدم"
            data={reportData}
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

      {/* نموذج إضافة/تحديث مستخدم */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingUser ? 'تحديث بيانات المستخدم' : 'إضافة مستخدم جديد'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="الاسم"
                  value={userData.name}
                  onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="البريد الإلكتروني"
                  type="email"
                  value={userData.email}
                  onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="رقم الهاتف"
                  value={userData.phone}
                  onChange={(e) => setUserData({ ...userData, phone: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>نوع الحساب</InputLabel>
                  <Select
                    value={userData.role}
                    label="نوع الحساب"
                    onChange={(e) => setUserData({ ...userData, role: e.target.value as User['role'] })}
                  >
                    <MenuItem value="user">مستخدم</MenuItem>
                    <MenuItem value="store">متجر</MenuItem>
                    <MenuItem value="worker">مقدم خدمة</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              {!editingUser && (
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="كلمة المرور"
                    type="password"
                    value={userData.password}
                    onChange={(e) => setUserData({ ...userData, password: e.target.value })}
                  />
                </Grid>
              )}
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>
                  الصورة الشخصية
                </Typography>
                <ImageUpload
                  value={userData.imageUrl}
                  onChange={(url) => setUserData({ ...userData, imageUrl: url })}
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
            disabled={!userData.name || !userData.email || !userData.phone || (!editingUser && !userData.password)}
          >
            {editingUser ? 'تحديث' : 'إضافة'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 