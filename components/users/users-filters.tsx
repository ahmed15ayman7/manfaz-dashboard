'use client';

import {
  Box,
  Paper,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  IconButton,
  Collapse,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { IconFilter, IconX } from '@tabler/icons-react';
import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';

interface FiltersData {
  name?: string;
  email?: string;
  phone?: string;
  role?: 'user' | 'store' | 'worker' | '';
  startDate?: Date | null;
  endDate?: Date | null;
}

interface UsersFiltersProps {
  onFilter: (filters: FiltersData) => void;
}

export function UsersFilters({ onFilter }: UsersFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const { control, handleSubmit, reset } = useForm<FiltersData>({
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      role: '',
      startDate: null,
      endDate: null,
    },
  });

  const onSubmit = (data: FiltersData) => {
    onFilter(data);
  };

  const handleReset = () => {
    reset();
    onFilter({});
  };

  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <IconButton
          size="small"
          onClick={() => setIsExpanded(!isExpanded)}
          sx={{
            transform: isExpanded ? 'rotate(180deg)' : 'none',
            transition: 'transform 0.3s',
          }}
        >
          <IconFilter size={20} />
        </IconButton>
        تصفية متقدمة
      </Box>

      <Collapse in={isExpanded}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={4}>
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="الاسم"
                    fullWidth
                    size="small"
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="البريد الإلكتروني"
                    fullWidth
                    size="small"
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Controller
                name="phone"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="رقم الجوال"
                    fullWidth
                    size="small"
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Controller
                name="role"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth size="small">
                    <InputLabel>نوع الحساب</InputLabel>
                    <Select {...field} label="نوع الحساب">
                      <MenuItem value="">الكل</MenuItem>
                      <MenuItem value="user">عميل</MenuItem>
                      <MenuItem value="store">متجر</MenuItem>
                      <MenuItem value="worker">مقدم خدمة</MenuItem>
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Controller
                name="startDate"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    {...field}
                    label="من تاريخ"
                    slotProps={{ textField: { size: 'small', fullWidth: true } }}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Controller
                name="endDate"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    {...field}
                    label="إلى تاريخ"
                    slotProps={{ textField: { size: 'small', fullWidth: true } }}
                  />
                )}
              />
            </Grid>
          </Grid>

          <Box sx={{ display: 'flex', gap: 1, mt: 2, justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              startIcon={<IconX size={18} />}
              onClick={handleReset}
            >
              إعادة تعيين
            </Button>
            <Button
              type="submit"
              variant="contained"
              startIcon={<IconFilter size={18} />}
            >
              تصفية
            </Button>
          </Box>
        </form>
      </Collapse>
    </Paper>
  );
} 