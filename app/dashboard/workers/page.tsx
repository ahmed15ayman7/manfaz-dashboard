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
} from '@mui/material';
import { IconPlus, IconEdit, IconTrash, IconSearch, IconStar } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import API_ENDPOINTS from '@/lib/apis';
import { Worker } from '@/interfaces';

export default function WorkersPage() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');

  // استدعاء بيانات العمال
  const { data: workers, isLoading } = useQuery<Worker[]>({
    queryKey: ['workers'],
    queryFn: async () => {
      const response = await axios.get(API_ENDPOINTS.workers.getAll({}));
      return response.data;
    },
  });

  // التعامل مع تغيير الصفحة
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  // التعامل مع تغيير عدد العناصر في الصفحة
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // تصفية العمال حسب البحث
  const filteredWorkers = workers?.filter((worker) =>
    worker.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" fontWeight="bold">
          إدارة مقدمي الخدمات
        </Typography>
        <Button
          variant="contained"
          startIcon={<IconPlus />}
          sx={{ backgroundColor: 'primary.main' }}
        >
          إضافة مقدم خدمة جديد
        </Button>
      </Box>

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
        </Grid>
      </Paper>

      {/* جدول مقدمي الخدمات */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>مقدم الخدمة</TableCell>
              <TableCell>المهنة</TableCell>
              <TableCell>التقييم</TableCell>
              <TableCell>الطلبات المنجزة</TableCell>
              <TableCell>الحالة</TableCell>
              <TableCell>الإجراءات</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredWorkers
              ?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((worker) => (
                <TableRow key={worker.id}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar src={worker.user?.imageUrl} />
                      <Box>
                        <Typography variant="subtitle2">{worker.user?.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {worker.user?.email}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>{worker.title}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Rating
                        value={worker.rating}
                        readOnly
                        size="small"
                        icon={<IconStar size={16} />}
                        emptyIcon={<IconStar size={16} />}
                      />
                      <Typography variant="caption">
                        ({worker.reviewsCount} تقييم)
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{worker.totalJobsDone}</TableCell>
                  <TableCell>
                    <Chip
                      label={worker.isAvailable ? 'متاح' : 'غير متاح'}
                      color={worker.isAvailable ? 'success' : 'error'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton color="primary" size="small">
                      <IconEdit size={18} />
                    </IconButton>
                    <IconButton color="error" size="small">
                      <IconTrash size={18} />
                    </IconButton>
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
    </Box>
  );
} 