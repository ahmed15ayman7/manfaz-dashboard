'use client';

import { useState } from 'react';
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
  Box,
  Avatar,
  Grid,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-toastify';
import axios from 'axios';
import { IconUpload } from '@tabler/icons-react';
import { User } from '@/interfaces';

const userSchema = z.object({
  name: z.string().min(3, 'الاسم يجب أن يكون 3 أحرف على الأقل'),
  email: z.string().email('البريد الإلكتروني غير صحيح'),
  phone: z.string().min(10, 'رقم الجوال غير صحيح'),
  role: z.enum(['user', 'store', 'worker']),
  imageUrl: z.string().optional(),
  password: z.string().min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل').optional(),
});

type UserFormData = z.infer<typeof userSchema>;

interface EditUserDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  user: User;
}

export function EditUserDialog({ open, onClose, onSuccess, user }: EditUserDialogProps) {
  const [imagePreview, setImagePreview] = useState<string | null>(user.imageUrl || null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role as "user" | "store" | "worker",
      imageUrl: user.imageUrl,
    },
  });

  const handleClose = () => {
    reset();
    setImagePreview(user.imageUrl || null);
    onClose();
  };

  const onSubmit = async (data: UserFormData) => {
    try {
      await axios.put(`/api/users/${user.id}`, data);
      toast.success('تم تحديث بيانات المستخدم بنجاح');
      onSuccess();
      handleClose();
    } catch (error) {
      toast.error('حدث خطأ أثناء تحديث بيانات المستخدم');
    }
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>تعديل بيانات المستخدم</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Grid container spacing={3}>
            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center' }}>
              <Box sx={{ position: 'relative' }}>
                <Avatar
                  src={imagePreview || '/placeholder.png'}
                  sx={{ width: 100, height: 100 }}
                />
                <Button
                  component="label"
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    minWidth: 'auto',
                    p: 0.5,
                  }}
                >
                  <IconUpload size={20} />
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </Button>
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="الاسم"
                    fullWidth
                    error={!!errors.name}
                    helperText={errors.name?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="البريد الإلكتروني"
                    fullWidth
                    error={!!errors.email}
                    helperText={errors.email?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="phone"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="رقم الجوال"
                    fullWidth
                    error={!!errors.phone}
                    helperText={errors.phone?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="role"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.role}>
                    <InputLabel>نوع الحساب</InputLabel>
                    <Select {...field} label="نوع الحساب">
                      <MenuItem value="user">عميل</MenuItem>
                      <MenuItem value="store">متجر</MenuItem>
                      <MenuItem value="worker">مقدم خدمة</MenuItem>
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="password"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type="password"
                    label="كلمة المرور الجديدة (اختياري)"
                    fullWidth
                    error={!!errors.password}
                    helperText={errors.password?.message}
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
            حفظ التغييرات
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
} 