'use client';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-toastify';
import axios from 'axios';
import { ImageUpload } from '@/components/shared/image-upload';

const categorySchema = z.object({
  name: z.string().min(3, 'اسم التصنيف يجب أن يكون 3 أحرف على الأقل'),
  subName: z.string().optional(),
  description: z.string().min(10, 'الوصف يجب أن يكون 10 أحرف على الأقل'),
  type: z.enum(['service', 'delivery']),
  status: z.enum(['active', 'inactive']),
  imageUrl: z.string().min(1, 'الصورة مطلوبة'),
  info: z.string().optional(),
  price: z.number().optional(),
  sortOrder: z.number().min(0),
});

type CategoryFormData = z.infer<typeof categorySchema>;

interface AddCategoryDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddCategoryDialog({ open, onClose, onSuccess }: AddCategoryDialogProps) {
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      type: 'service',
      status: 'active',
      sortOrder: 0,
    },
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmit = async (data: CategoryFormData) => {
    try {
      await axios.post('/api/categories', data);
      toast.success('تم إضافة التصنيف بنجاح');
      onSuccess();
      handleClose();
    } catch (error) {
      toast.error('حدث خطأ أثناء إضافة التصنيف');
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>إضافة تصنيف جديد</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Controller
                name="imageUrl"
                control={control}
                render={({ field }) => (
                  <>
                    <ImageUpload
                      value={field.value}
                      onChange={(url) => setValue('imageUrl', url)}
                      aspectRatio={16/9}
                    />
                    {errors.imageUrl && (
                      <Typography color="error" variant="caption" sx={{ mt: 1 }}>
                        {errors.imageUrl.message}
                      </Typography>
                    )}
                  </>
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="اسم التصنيف"
                    fullWidth
                    error={!!errors.name}
                    helperText={errors.name?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="subName"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="الاسم الفرعي (اختياري)"
                    fullWidth
                    error={!!errors.subName}
                    helperText={errors.subName?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="الوصف"
                    fullWidth
                    multiline
                    rows={3}
                    error={!!errors.description}
                    helperText={errors.description?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="type"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel>نوع التصنيف</InputLabel>
                    <Select {...field} label="نوع التصنيف">
                      <MenuItem value="service">خدمة</MenuItem>
                      <MenuItem value="delivery">توصيل</MenuItem>
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel>الحالة</InputLabel>
                    <Select {...field} label="الحالة">
                      <MenuItem value="active">نشط</MenuItem>
                      <MenuItem value="inactive">غير نشط</MenuItem>
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="price"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type="number"
                    label="السعر الافتراضي (اختياري)"
                    fullWidth
                    error={!!errors.price}
                    helperText={errors.price?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="sortOrder"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type="number"
                    label="ترتيب العرض"
                    fullWidth
                    error={!!errors.sortOrder}
                    helperText={errors.sortOrder?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="info"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="معلومات إضافية (اختياري)"
                    fullWidth
                    multiline
                    rows={2}
                    error={!!errors.info}
                    helperText={errors.info?.message}
                  />
                )}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>إلغاء</Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting}
          >
            إضافة
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
} 