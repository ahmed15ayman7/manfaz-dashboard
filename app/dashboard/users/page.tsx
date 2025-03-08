'use client';

import { useState, Suspense } from 'react';
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
  Skeleton,
  InputAdornment,
  Tooltip,
  Badge,
  Stack,
} from '@mui/material';
import {
  IconPlus,
  IconEdit,
  IconTrash,
  IconSearch,
  IconUsers,
  IconBuildingStore,
  IconTool,
  IconPrinter,
  IconEye,
  IconPhone,
  IconMail,
  IconMapPin,
  IconWallet,
  IconShoppingCart,
  IconCalendar,
  IconFilter,
  IconSortAscending,
  IconSortDescending,
} from '@tabler/icons-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import API_ENDPOINTS from '@/lib/apis';
import { User } from '@/interfaces';
import { ImageUpload } from '@/components/shared/image-upload';
import { ExcelExport } from '@/components/shared/excel-export';
import { PDFDocument, PrintButton } from '@/components/shared/pdf-document';
import { PermissionGuard } from '@/components/common/PermissionGuard';
import { ActionButton } from '@/components/common/ActionButton';
import { formatDate, formatNumber } from '@/lib/utils';

function UsersPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [openPrintDialog, setOpenPrintDialog] = useState(false);
  const [sortBy, setSortBy] = useState<'name' | 'createdAt'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [userData, setUserData] = useState<Partial<User>>({
    name: '',
    email: '',
    phone: '',
    password: '',
    imageUrl: '',
    role: 'user',
  });

  const queryClient = useQueryClient();

  // استدعاء بيانات المستخدمين مع البحث والتنقل
  const { data: users, isLoading } = useQuery({
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

  // تصفية وترتيب المستخدمين
  const filteredUsers = users
    ?.filter((user: User) => {
      const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.phone.includes(searchQuery);
      const matchesRole = filterRole === 'all' || user.role === filterRole;
      return matchesSearch && matchesRole;
    })
    .sort((a: User, b: User) => {
      if (sortBy === 'name') {
        return sortOrder === 'asc'
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      } else {
        const dateA = new Date(a.createdAt || 0).getTime();
        const dateB = new Date(b.createdAt || 0).getTime();
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      }
    });

  // حساب الإحصائيات
  const stats = {
    totalUsers: users?.length || 0,
    activeUsers: users?.filter((u: User) => u.role === 'user').length || 0,
    stores: users?.filter((u: User) => u.role === 'store').length || 0,
    workers: users?.filter((u: User) => u.role === 'worker').length || 0,
  };

  // تعريف أعمدة Excel
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
  const excelData = users?.map((user: User) => ({
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role === 'user' ? 'مستخدم' :
      user.role === 'store' ? 'متجر' : 'مقدم خدمة',
    ordersCount: user.orders?.length || 0,
    balance: user.wallet?.balance || 0,
    createdAt: user.createdAt ? formatDate(user.createdAt) : '',
  })) || [];

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

  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setOpenPrintDialog(true);
  };

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const toggleSort = (field: 'name' | 'createdAt') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
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
    <PermissionGuard requiredPermissions={['viewCustomers']}>
      <Box>
        {/* رأس الصفحة */}
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5" fontWeight="bold">
            إدارة المستخدمين
          </Typography>
          <ActionButton
            requiredPermissions={['updateCustomers']}
            variant="contained"
            startIcon={<IconPlus size={20} />}
            onClick={() => handleOpenDialog()}
          >
            إضافة مستخدم
          </ActionButton>
        </Box>

        {/* الإحصائيات */}
        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
              <Badge badgeContent={stats.totalUsers} color="primary">
                <IconUsers size={24} color="#0068FF" />
              </Badge>
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
              <Badge badgeContent={stats.activeUsers} color="success">
                <IconUsers size={24} color="#4CAF50" />
              </Badge>
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
              <Badge badgeContent={stats.stores} color="warning">
                <IconBuildingStore size={24} color="#FF9800" />
              </Badge>
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
              <Badge badgeContent={stats.workers} color="error">
                <IconTool size={24} color="#F44336" />
              </Badge>
              <Box>
                <Typography variant="h6">{stats.workers}</Typography>
                <Typography variant="body2" color="text.secondary">
                  مقدمي الخدمات
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>

        {/* أدوات البحث والتصفية */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="البحث عن مستخدم..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><IconSearch size={20} /></InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>تصفية حسب النوع</InputLabel>
                <Select
                  value={filterRole}
                  label="تصفية حسب النوع"
                  onChange={(e) => setFilterRole(e.target.value)}
                  startAdornment={<IconFilter size={20} />}
                >
                  <MenuItem value="all">الكل</MenuItem>
                  <MenuItem value="user">مستخدم</MenuItem>
                  <MenuItem value="store">متجر</MenuItem>
                  <MenuItem value="worker">مقدم خدمة</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={5}>
              <Stack direction="row" spacing={1} justifyContent="flex-end">
                <Button
                  variant="outlined"
                  startIcon={sortOrder === 'asc' ? <IconSortAscending /> : <IconSortDescending />}
                  onClick={() => toggleSort('name')}
                  color={sortBy === 'name' ? 'primary' : 'inherit'}
                >
                  الترتيب حسب الاسم
                </Button>
                <Button
                  variant="outlined"
                  startIcon={sortOrder === 'asc' ? <IconSortAscending /> : <IconSortDescending />}
                  onClick={() => toggleSort('createdAt')}
                  color={sortBy === 'createdAt' ? 'primary' : 'inherit'}
                >
                  الترتيب حسب التاريخ
                </Button>
                <ExcelExport
                  data={excelData}
                  columns={excelColumns}
                  filename="users.xlsx"
                  sheetName="المستخدمين"
                />
              </Stack>
            </Grid>
          </Grid>
        </Paper>

        {/* جدول المستخدمين */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>المستخدم</TableCell>
                <TableCell>معلومات الاتصال</TableCell>
                <TableCell>نوع الحساب</TableCell>
                <TableCell>النشاط</TableCell>
                <TableCell>تاريخ التسجيل</TableCell>
                <TableCell>الإجراءات</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(filteredUsers || [])
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((user: User) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar src={user.imageUrl} alt={user.name}>
                          {user.name.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography fontWeight="medium">{user.name}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {user.email}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Stack spacing={1}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <IconPhone size={16} />
                          <Typography variant="body2">{user.phone}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <IconMapPin size={16} />
                          <Typography variant="body2">
                            {user.locations?.length || 0} عنوان
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={
                          user.role === 'user' ? 'مستخدم' :
                            user.role === 'store' ? 'متجر' : 'مقدم خدمة'
                        }
                        color={
                          user.role === 'user' ? 'primary' :
                            user.role === 'store' ? 'warning' : 'success'
                        }
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Stack spacing={1}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <IconShoppingCart size={16} />
                          <Typography variant="body2">
                            {user.orders?.length || 0} طلب
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <IconWallet size={16} />
                          <Typography variant="body2">
                            {formatNumber(user.wallet?.balance || 0, 'currency')}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <IconCalendar size={16} />
                        <Typography variant="body2">
                          {user.createdAt ? formatDate(user.createdAt) : '-'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <Tooltip title="عرض التفاصيل">
                          <IconButton
                            size="small"
                            color="info"
                            onClick={() => handleViewUser(user)}
                          >
                            <IconEye size={18} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="تعديل">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleOpenDialog(user)}
                          >
                            <IconEdit size={18} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="حذف">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => deleteUserMutation.mutate(user.id)}
                          >
                            <IconTrash size={18} />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
          <TablePagination
            component="div"
            count={filteredUsers?.length || 0}
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

        {/* نموذج إضافة/تعديل مستخدم */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
          <DialogTitle>
            {editingUser ? 'تعديل بيانات المستخدم' : 'إضافة مستخدم جديد'}
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

        {/* نافذة عرض تفاصيل المستخدم */}
        <Dialog
          open={openPrintDialog}
          onClose={() => setOpenPrintDialog(false)}
          maxWidth="md"
          fullWidth
        >
          {selectedUser && (
            <PDFDocument
              title={`تقرير المستخدم - ${selectedUser.name}`}
              data={{
                title: `تقرير المستخدم - ${selectedUser.name}`,
                date: formatDate(new Date()),
                description: `تقرير تفصيلي عن نشاط المستخدم ${selectedUser.name}`,
                sections: [
                  {
                    title: 'معلومات الحساب',
                    content: `
                      البريد الإلكتروني: ${selectedUser.email}
                      رقم الهاتف: ${selectedUser.phone}
                      نوع الحساب: ${selectedUser.role === 'user' ? 'مستخدم' :
                        selectedUser.role === 'store' ? 'متجر' : 'مقدم خدمة'}
                      تاريخ التسجيل: ${selectedUser.createdAt ? formatDate(selectedUser.createdAt) : '-'}
                    `
                  },
                  {
                    title: 'إحصائيات النشاط',
                    content: `
                      عدد الطلبات: ${selectedUser.orders?.length || 0}
                      رصيد المحفظة: ${formatNumber(selectedUser.wallet?.balance || 0, 'currency')}
                      عدد العناوين المسجلة: ${selectedUser.locations?.length || 0}
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
export default function Page() {
  return <Suspense fallback={<Skeleton variant="rectangular" height="100vh" />}>
    <UsersPage />
  </Suspense>
}
