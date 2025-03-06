'use client';

import { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  InputAdornment,
  Button,
  IconButton,
  Chip,
  ButtonGroup,
} from '@mui/material';
import {
  IconSearch,
  IconPlus,
  IconEdit,
  IconTrash,
  IconEye,
  IconFileExport,
  IconFilter,
} from '@tabler/icons-react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { User } from '@/interfaces';
import { AddUserDialog } from '@/components/users/add-user-dialog';
import { UsersFilters } from '@/components/users/users-filters';
import { toast } from 'react-toastify';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

export default function UsersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [filters, setFilters] = useState({});

  const { data: users = [], refetch } = useQuery<User[]>({
    queryKey: ['users', searchQuery, filters],
    queryFn: async () => {
      const response = await axios.get('/api/users', {
        params: {
          search: searchQuery,
          ...filters,
        },
      });
      return response.data;
    },
  });

  const handleDeleteUser = async (userId: string) => {
    try {
      await axios.delete(`/api/users/${userId}`);
      toast.success('تم حذف المستخدم بنجاح');
      refetch();
    } catch (error) {
      toast.error('حدث خطأ أثناء حذف المستخدم');
    }
  };

  const handleExportExcel = () => {
    const exportData = users.map((user) => ({
      'الاسم': user.name,
      'البريد الإلكتروني': user.email,
      'رقم الجوال': user.phone,
      'نوع الحساب': user.role === 'user' ? 'عميل' : user.role === 'store' ? 'متجر' : 'مقدم خدمة',
      'تاريخ التسجيل': format(new Date(user.createdAt || ''), 'PPP', { locale: ar }),
    }));

    const ws = XLSX.utils.json_to_sheet(exportData, { header: Object.keys(exportData[0]) });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'المستخدمين');
    XLSX.writeFile(wb, `المستخدمين-${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
  };

  const columns: GridColDef[] = [
    {
      field: 'name',
      headerName: 'الاسم',
      flex: 1,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <img
            src={params.row.imageUrl || '/placeholder.png'}
            alt={params.row.name}
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              objectFit: 'cover',
            }}
          />
          {params.row.name}
        </Box>
      ),
    },
    { field: 'email', headerName: 'البريد الإلكتروني', flex: 1 },
    { field: 'phone', headerName: 'رقم الجوال', flex: 1 },
    {
      field: 'role',
      headerName: 'نوع الحساب',
      width: 120,
      renderCell: (params) => {
        const roleColors = {
          user: 'primary',
          store: 'success',
          worker: 'warning',
        };
        const roleNames = {
          user: 'عميل',
          store: 'متجر',
          worker: 'مقدم خدمة',
        };
        return (
          <Chip
            label={roleNames[params.row.role as keyof typeof roleNames]}
            color={roleColors[params.row.role as keyof typeof roleColors]}
            size="small"
          />
        );
      },
    },
    {
      field: 'createdAt',
      headerName: 'تاريخ التسجيل',
      width: 150,
      valueFormatter: (params) =>
        format(new Date(params.value || ''), 'PPP', { locale: ar }),
    },
    {
      field: 'actions',
      headerName: 'الإجراءات',
      width: 160,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton
            size="small"
            color="primary"
            onClick={() => setSelectedUser(params.row)}
          >
            <IconEye size={18} />
          </IconButton>
          <IconButton
            size="small"
            color="info"
            onClick={() => setSelectedUser(params.row)}
          >
            <IconEdit size={18} />
          </IconButton>
          <IconButton
            size="small"
            color="error"
            onClick={() => handleDeleteUser(params.row.id)}
          >
            <IconTrash size={18} />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Typography variant="h5" fontWeight="bold">
          المستخدمين
        </Typography>
        <ButtonGroup>
          <Button
            variant="outlined"
            startIcon={<IconFileExport />}
            onClick={handleExportExcel}
          >
            تصدير Excel
          </Button>
          <Button
            variant="contained"
            startIcon={<IconPlus />}
            onClick={() => setIsAddDialogOpen(true)}
          >
            إضافة مستخدم
          </Button>
        </ButtonGroup>
      </Box>

      <UsersFilters onFilter={setFilters} />

      <Paper sx={{ p: 2, mb: 3 }}>
        <TextField
          fullWidth
          placeholder="البحث عن مستخدم..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <IconSearch size={20} />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 2 }}
        />

        <DataGrid
          rows={users}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 10 },
            },
          }}
          pageSizeOptions={[10, 25, 50]}
          checkboxSelection
          disableRowSelectionOnClick
          autoHeight
        />
      </Paper>

      <AddUserDialog
        open={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onSuccess={() => {
          setIsAddDialogOpen(false);
          refetch();
        }}
      />
    </Box>
  );
} 