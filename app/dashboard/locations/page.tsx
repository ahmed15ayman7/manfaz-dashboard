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
} from '@mui/material';
import {
  IconPlus,
  IconEdit,
  IconTrash,
  IconSearch,
  IconMapPin,
  IconHome,
  IconBuilding,
  IconUsers,
} from '@tabler/icons-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import API_ENDPOINTS from '@/lib/apis';
import type { UserLocation, User } from '@/interfaces';
import { PermissionGuard } from '@/components/common/PermissionGuard';

export default function LocationsPage() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingLocation, setEditingLocation] = useState<UserLocation | null>(null);
  const [locationData, setLocationData] = useState<{
    userId: string;
    name: string;
    address: string;
    apartment?: string;
    floor?: string;
    building?: string;
    street?: string;
    area?: string;
    city: string;
    latitude: number;
    longitude: number;
    isDefault: boolean;
    type: 'home' | 'work' | 'other';
    notes?: string;
  }>({
    userId: '',
    name: '',
    address: '',
    city: '',
    latitude: 0,
    longitude: 0,
    isDefault: false,
    type: 'home',
  });

  const queryClient = useQueryClient();

  // استدعاء البيانات
  const { data: locations, isLoading } = useQuery<UserLocation[]>({
    queryKey: ['locations'],
    queryFn: async () => {
      const response = await axios.get(API_ENDPOINTS.locations.getAll({}));
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

  // إضافة موقع جديد
  const addLocationMutation = useMutation({
    mutationFn: async (location: typeof locationData) => {
      const response = await axios.post(API_ENDPOINTS.locations.create(location.userId, location));
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      handleCloseDialog();
    },
  });

  // تحديث موقع
  const updateLocationMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof locationData }) => {
      const response = await axios.put(API_ENDPOINTS.locations.update(id, {}), data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      handleCloseDialog();
    },
  });

  // حذف موقع
  const deleteLocationMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await axios.delete(API_ENDPOINTS.locations.delete(id, {}));
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
    },
  });

  const handleOpenDialog = (location?: UserLocation) => {
    if (location) {
      setEditingLocation(location);
      setLocationData({
        userId: location.userId,
        name: location.name,
        address: location.address,
        apartment: location.apartment,
        floor: location.floor,
        building: location.building,
        street: location.street,
        area: location.area,
        city: location.city,
        latitude: location.latitude,
        longitude: location.longitude,
        isDefault: location.isDefault,
        type: location.type,
        notes: location.notes,
      });
    } else {
      setEditingLocation(null);
      setLocationData({
        userId: '',
        name: '',
        address: '',
        city: '',
        latitude: 0,
        longitude: 0,
        isDefault: false,
        type: 'home',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingLocation(null);
    setLocationData({
      userId: '',
      name: '',
      address: '',
      city: '',
      latitude: 0,
      longitude: 0,
      isDefault: false,
      type: 'home',
    });
  };

  const handleSubmit = () => {
    if (editingLocation) {
      updateLocationMutation.mutate({ id: editingLocation.id, data: locationData });
    } else {
      addLocationMutation.mutate(locationData);
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

  // تصفية المواقع حسب البحث
  const filteredLocations = locations?.filter((location: UserLocation) => {
    const user = users?.find((u: User) => u.id === location.userId);
    const searchLower = searchQuery.toLowerCase();

    return (
      user?.name.toLowerCase().includes(searchLower) ||
      location.name.toLowerCase().includes(searchLower) ||
      location.address.toLowerCase().includes(searchLower) ||
      location.city.toLowerCase().includes(searchLower)
    );
  });

  // حساب الإحصائيات
  const stats = {
    totalLocations: filteredLocations?.length || 0,
    homeLocations: filteredLocations?.filter((l: UserLocation) => l.type === 'home').length || 0,
    workLocations: filteredLocations?.filter((l: UserLocation) => l.type === 'work').length || 0,
    uniqueUsers: new Set(filteredLocations?.map(l => l.userId)).size || 0,
  };

  // تنسيق التاريخ
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <Box>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" fontWeight="bold">
            المواقع والعناوين
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
    <PermissionGuard requiredPermissions={['viewLocations']}>
      <Box>
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5" fontWeight="bold">
            المواقع والعناوين
          </Typography>
          <Button
            variant="contained"
            startIcon={<IconPlus size={20} />}
            onClick={() => handleOpenDialog()}
          >
            إضافة موقع جديد
          </Button>
        </Box>

        {/* الإحصائيات */}
        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
              <IconMapPin size={24} color="#0068FF" />
              <Box>
                <Typography variant="h6">{stats.totalLocations}</Typography>
                <Typography variant="body2" color="text.secondary">
                  إجمالي المواقع
                </Typography>
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
              <IconHome size={24} color="#4CAF50" />
              <Box>
                <Typography variant="h6">{stats.homeLocations}</Typography>
                <Typography variant="body2" color="text.secondary">
                  مواقع المنازل
                </Typography>
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
              <IconBuilding size={24} color="#FF9800" />
              <Box>
                <Typography variant="h6">{stats.workLocations}</Typography>
                <Typography variant="body2" color="text.secondary">
                  مواقع العمل
                </Typography>
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
              <IconUsers size={24} color="#F44336" />
              <Box>
                <Typography variant="h6">{stats.uniqueUsers}</Typography>
                <Typography variant="body2" color="text.secondary">
                  المستخدمين
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
                placeholder="البحث في المواقع..."
                value={searchQuery}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: <IconSearch size={20} />,
                }}
              />
            </Grid>
          </Grid>
        </Paper>

        {/* جدول المواقع */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>المستخدم</TableCell>
                <TableCell>الاسم</TableCell>
                <TableCell>العنوان</TableCell>
                <TableCell>النوع</TableCell>
                <TableCell>التاريخ</TableCell>
                <TableCell>الإجراءات</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredLocations
                ?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((location: UserLocation) => {
                  const user = users?.find((u: User) => u.id === location.userId);
                  return (
                    <TableRow key={location.id}>
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
                      <TableCell>
                        <Typography variant="body2">
                          {location.name}
                          {location.isDefault && (
                            <Chip
                              label="افتراضي"
                              color="primary"
                              size="small"
                              sx={{ ml: 1 }}
                            />
                          )}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ maxWidth: 300 }} noWrap>
                          {location.address}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={location.type === 'home' ? <IconHome size={16} /> : <IconBuilding size={16} />}
                          label={location.type === 'home' ? 'منزل' : location.type === 'work' ? 'عمل' : 'آخر'}
                          color={location.type === 'home' ? 'success' : location.type === 'work' ? 'warning' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{formatDate(location.createdAt)}</TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1}>
                          <IconButton
                            color="primary"
                            size="small"
                            onClick={() => handleOpenDialog(location)}
                          >
                            <IconEdit size={18} />
                          </IconButton>
                          <IconButton
                            color="error"
                            size="small"
                            onClick={() => deleteLocationMutation.mutate(location.id)}
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
            count={filteredLocations?.length || 0}
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

        {/* نموذج إضافة/تحديث موقع */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>
            {editingLocation ? 'تحديث الموقع' : 'إضافة موقع جديد'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <FormControl fullWidth>
                <InputLabel>المستخدم</InputLabel>
                <Select
                  value={locationData.userId}
                  label="المستخدم"
                  onChange={(e: SelectChangeEvent) => setLocationData({ ...locationData, userId: e.target.value })}
                >
                  {users?.map((user: User) => (
                    <MenuItem key={user.id} value={user.id}>
                      {user.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="اسم الموقع"
                value={locationData.name}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setLocationData({ ...locationData, name: e.target.value })}
              />
              <TextField
                fullWidth
                label="العنوان"
                value={locationData.address}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setLocationData({ ...locationData, address: e.target.value })}
              />
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="الشقة"
                    value={locationData.apartment}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setLocationData({ ...locationData, apartment: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="الطابق"
                    value={locationData.floor}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setLocationData({ ...locationData, floor: e.target.value })}
                  />
                </Grid>
              </Grid>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="المبنى"
                    value={locationData.building}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setLocationData({ ...locationData, building: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="الشارع"
                    value={locationData.street}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setLocationData({ ...locationData, street: e.target.value })}
                  />
                </Grid>
              </Grid>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="المنطقة"
                    value={locationData.area}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setLocationData({ ...locationData, area: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="المدينة"
                    value={locationData.city}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setLocationData({ ...locationData, city: e.target.value })}
                  />
                </Grid>
              </Grid>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="خط العرض"
                    type="number"
                    value={locationData.latitude}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setLocationData({ ...locationData, latitude: parseFloat(e.target.value) })}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="خط الطول"
                    type="number"
                    value={locationData.longitude}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setLocationData({ ...locationData, longitude: parseFloat(e.target.value) })}
                  />
                </Grid>
              </Grid>
              <FormControl fullWidth>
                <InputLabel>النوع</InputLabel>
                <Select
                  value={locationData.type}
                  label="النوع"
                  onChange={(e: SelectChangeEvent) => setLocationData({ ...locationData, type: e.target.value as 'home' | 'work' | 'other' })}
                >
                  <MenuItem value="home">منزل</MenuItem>
                  <MenuItem value="work">عمل</MenuItem>
                  <MenuItem value="other">آخر</MenuItem>
                </Select>
              </FormControl>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="ملاحظات"
                value={locationData.notes}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setLocationData({ ...locationData, notes: e.target.value })}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>إلغاء</Button>
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={!locationData.userId || !locationData.name || !locationData.address || !locationData.city}
            >
              {editingLocation ? 'تحديث' : 'إضافة'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </PermissionGuard>
  );
} 