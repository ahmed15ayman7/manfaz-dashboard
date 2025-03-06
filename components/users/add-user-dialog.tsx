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
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-toastify';
import axios from 'axios';
import { IconUpload } from '@tabler/icons-react';

const userSchema = z.object({
  name: z.string().min(3, 'الاسم يجب أن يكون 3 أحرف على الأقل'),
  email: z.string().email('البريد الإلكتروني غير صحيح'),
  phone: z.string().min(10, 'رقم الجوال غير صحيح'),
  password: z.string().min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'),
  role: z.enum(['user', 'store', 'worker']),
  imageUrl: z.string().optional(),
});

type UserFormData = z.infer<typeof userSchema>;

interface AddUserDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddUserDialog({ open, onClose, onSuccess }: AddUserDialogProps) {
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      role: 'user',
    },
  });

  const handleClose = () => {
    reset();
    setImagePreview(null);
    onClose();
  };

  const onSubmit = async (data: UserFormData) => {
    try {
      await axios.post('/api/users', data);
      toast.success('تم إضافة المستخدم بنجاح');
      onSuccess();
      handleClose();
    } catch (error) {
      toast.error('حدث خطأ أثناء إضافة المستخدم');
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
      <DialogTitle>إضافة مستخدم جديد</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
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
          </Box>

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
                sx={{ mb: 2 }}
              />
            )}
          />

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
                sx={{ mb: 2 }}
              />
            )}
          />

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
                sx={{ mb: 2 }}
              />
            )}
          />

          <Controller
            name="password"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                type="password"
                label="كلمة المرور"
                fullWidth
                error={!!errors.password}
                helperText={errors.password?.message}
                sx={{ mb: 2 }}
              />
            )}
          />

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