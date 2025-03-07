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
  Rating,
  Avatar,
} from '@mui/material';
import { IconPlus, IconEdit, IconTrash, IconSearch, IconStar } from '@tabler/icons-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import API_ENDPOINTS from '@/lib/apis';
import { Review, User, Worker } from '@/interfaces';

export default function ReviewsPage() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [reviewData, setReviewData] = useState({
    workerId: '',
    userId: '',
    rating: 5,
    comment: '',
  });

  const queryClient = useQueryClient();

  // استدعاء بيانات المراجعات
  const { data: workers } = useQuery<Review[]>({
    queryKey: ['workers'],
    queryFn: async () => {
      const response = await axios.get(API_ENDPOINTS.workers.getAll({}));
      const workers = response.data;
      const reviews = workers.reduce((acc: Review[], worker: Worker) => {
        return [...acc, ...worker.reviews];
      }, []);
      return reviews;
    },
  });

  // استدعاء بيانات المستخدمين
  const { data: users } = useQuery<User[]>({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await axios.get(API_ENDPOINTS.users.getAll({}));
      return response.data;
    },
  });

  // إضافة مراجعة جديدة
  const addReviewMutation = useMutation({
    mutationFn: async (review: typeof reviewData) => {
      const response = await axios.post(API_ENDPOINTS.workers.reviews.create(review.workerId, {}), review);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workers'] });
      handleCloseDialog();
    },
  });

  // تحديث مراجعة
  const updateReviewMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof reviewData }) => {
      const response = await axios.put(API_ENDPOINTS.workers.reviews.update(data.workerId, id, {}), data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workers'] });
      handleCloseDialog();
    },
  });

  // حذف مراجعة
  const deleteReviewMutation = useMutation({
    mutationFn: async ({ workerId, reviewId }: { workerId: string; reviewId: string }) => {
      const response = await axios.delete(API_ENDPOINTS.workers.reviews.delete(workerId, reviewId, {}));
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workers'] });
    },
  });

  const handleOpenDialog = (review?: Review) => {
    if (review) {
      setEditingReview(review);
      setReviewData({
        workerId: review.workerId,
        userId: review.userId,
        rating: review.rating,
        comment: review.comment,
      });
    } else {
      setEditingReview(null);
      setReviewData({
        workerId: '',
        userId: '',
        rating: 5,
        comment: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingReview(null);
    setReviewData({
      workerId: '',
      userId: '',
      rating: 5,
      comment: '',
    });
  };

  const handleSubmit = () => {
    if (editingReview) {
      updateReviewMutation.mutate({ id: editingReview.id, data: reviewData });
    } else {
      addReviewMutation.mutate(reviewData);
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

  // تصفية المراجعات حسب البحث
  const filteredReviews = workers?.filter((review) =>
    review.comment.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // تنسيق التاريخ
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" fontWeight="bold">
          إدارة المراجعات
        </Typography>
        <Button
          variant="contained"
          startIcon={<IconPlus />}
          onClick={() => handleOpenDialog()}
          sx={{ backgroundColor: 'primary.main' }}
        >
          إضافة مراجعة جديدة
        </Button>
      </Box>

      {/* قسم البحث */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="البحث في المراجعات..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: <IconSearch size={20} />,
              }}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* جدول المراجعات */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>المستخدم</TableCell>
              <TableCell>مقدم الخدمة</TableCell>
              <TableCell>التقييم</TableCell>
              <TableCell>التعليق</TableCell>
              <TableCell>التاريخ</TableCell>
              <TableCell>الإجراءات</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredReviews
              ?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((review) => {
                const user = users?.find(u => u.id === review.userId);
                const worker = users?.find(w => w.id === review.workerId);
                return (
                  <TableRow key={review.id}>
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
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar src={worker?.imageUrl}>
                          {worker?.name?.[0]}
                        </Avatar>
                        <Typography variant="subtitle2">{worker?.name}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Rating
                        value={review.rating}
                        readOnly
                        icon={<IconStar size={16} />}
                        emptyIcon={<IconStar size={16} />}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{
                          maxWidth: 300,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {review.comment}
                      </Typography>
                    </TableCell>
                    <TableCell>{formatDate(review.createdAt)}</TableCell>
                    <TableCell>
                      <IconButton
                        color="primary"
                        size="small"
                        onClick={() => handleOpenDialog(review)}
                      >
                        <IconEdit size={18} />
                      </IconButton>
                      <IconButton
                        color="error"
                        size="small"
                        onClick={() => deleteReviewMutation.mutate({ workerId: review.workerId, reviewId: review.id })}
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
          count={filteredReviews?.length || 0}
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

      {/* نموذج إضافة/تحديث مراجعة */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingReview ? 'تحديث المراجعة' : 'إضافة مراجعة جديدة'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControl fullWidth>
              <InputLabel>المستخدم</InputLabel>
              <Select
                value={reviewData.userId}
                label="المستخدم"
                onChange={(e) => setReviewData({ ...reviewData, userId: e.target.value })}
              >
                {users?.map((user) => (
                  <MenuItem key={user.id} value={user.id}>
                    {user.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>مقدم الخدمة</InputLabel>
              <Select
                value={reviewData.workerId}
                label="مقدم الخدمة"
                onChange={(e) => setReviewData({ ...reviewData, workerId: e.target.value })}
              >
                {users?.filter(user => user.role === 'worker').map((worker) => (
                  <MenuItem key={worker.id} value={worker.id}>
                    {worker.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Box>
              <Typography component="legend">التقييم</Typography>
              <Rating
                value={reviewData.rating}
                onChange={(event, newValue) => {
                  setReviewData({ ...reviewData, rating: newValue || 0 });
                }}
                icon={<IconStar size={24} />}
                emptyIcon={<IconStar size={24} />}
              />
            </Box>
            <TextField
              fullWidth
              label="التعليق"
              multiline
              rows={3}
              value={reviewData.comment}
              onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>إلغاء</Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={!reviewData.userId || !reviewData.workerId || !reviewData.rating || !reviewData.comment}
          >
            {editingReview ? 'تحديث' : 'إضافة'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 