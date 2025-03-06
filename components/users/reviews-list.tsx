'use client';

import {
  Box,
  Paper,
  Typography,
  Rating,
  Avatar,
  Grid,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material';
import { IconTrash } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Review } from '@/interfaces';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { useState } from 'react';
import { toast } from 'react-toastify';

interface ReviewsListProps {
  userId: string;
}

export function ReviewsList({ userId }: ReviewsListProps) {
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);

  const { data: reviews = [], refetch } = useQuery<Review[]>({
    queryKey: ['worker-reviews', userId],
    queryFn: async () => {
      const response = await axios.get(`/api/workers/${userId}/reviews`);
      return response.data;
    },
  });

  const handleDeleteReview = async (reviewId: string) => {
    try {
      await axios.delete(`/api/reviews/${reviewId}`);
      toast.success('تم حذف التقييم بنجاح');
      refetch();
      setSelectedReview(null);
    } catch (error) {
      toast.error('حدث خطأ أثناء حذف التقييم');
    }
  };

  if (reviews.length === 0) {
    return (
      <Box
        sx={{
          textAlign: 'center',
          py: 4,
        }}
      >
        <Typography color="text.secondary">
          لا توجد تقييمات حتى الآن
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <Grid container spacing={2}>
        {reviews.map((review) => (
          <Grid item xs={12} md={6} key={review.id}>
            <Paper
              sx={{
                p: 2,
                position: 'relative',
                '&:hover': {
                  boxShadow: (theme) => theme.shadows[4],
                },
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Avatar
                    src={review.user.imageUrl || '/placeholder.png'}
                    alt={review.user.name}
                    sx={{ width: 40, height: 40 }}
                  />
                  <Box>
                    <Typography variant="subtitle2" fontWeight="bold">
                      {review.user.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {format(new Date(review.createdAt), 'PPP', { locale: ar })}
                    </Typography>
                  </Box>
                </Box>
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => setSelectedReview(review)}
                >
                  <IconTrash size={16} />
                </IconButton>
              </Box>

              <Rating value={review.rating} readOnly precision={0.5} />
              
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  mt: 1,
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {review.comment}
              </Typography>

              <Box sx={{ mt: 2 }}>
                <Chip
                  label={`طلب #${review.orderId?.slice(-6)}`}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* حوار تأكيد الحذف */}
      <Dialog
        open={!!selectedReview}
        onClose={() => setSelectedReview(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>تأكيد الحذف</DialogTitle>
        <DialogContent>
          <Typography>
            هل أنت متأكد من حذف هذا التقييم؟
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedReview(null)}>
            إلغاء
          </Button>
          <Button
            color="error"
            onClick={() => selectedReview && handleDeleteReview(selectedReview.id)}
          >
            حذف
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
} 