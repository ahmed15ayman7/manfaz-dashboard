'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Box,
  Typography,
} from '@mui/material';
import { IconEye } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Order } from '@/interfaces';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

interface OrdersListProps {
  userId: string;
}

export function OrdersList({ userId }: OrdersListProps) {
  const { data: orders = [] } = useQuery<Order[]>({
    queryKey: ['user-orders', userId],
    queryFn: async () => {
      const response = await axios.get(`/api/users/${userId}/orders`);
      return response.data;
    },
  });

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'warning',
      in_progress: 'info',
      completed: 'success',
      canceled: 'error',
    };
    return colors[status as keyof typeof colors];
  };

  const getStatusText = (status: string) => {
    const texts = {
      pending: 'قيد الانتظار',
      in_progress: 'قيد التنفيذ',
      completed: 'مكتمل',
      canceled: 'ملغي',
    };
    return texts[status as keyof typeof texts];
  };

  if (orders.length === 0) {
    return (
      <Box
        sx={{
          textAlign: 'center',
          py: 4,
        }}
      >
        <Typography color="text.secondary">
          لا توجد طلبات حتى الآن
        </Typography>
      </Box>
    );
  }

  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>رقم الطلب</TableCell>
            <TableCell>نوع الخدمة</TableCell>
            <TableCell>التاريخ</TableCell>
            <TableCell>المبلغ</TableCell>
            <TableCell>الحالة</TableCell>
            <TableCell>الإجراءات</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell>#{order.id?.slice(-6)}</TableCell>
              <TableCell>{order.service?.name}</TableCell>
              <TableCell>
                {format(new Date(order.createdAt || ''), 'PPP', { locale: ar })}
              </TableCell>
              <TableCell>
                {new Intl.NumberFormat('ar-SA', {
                  style: 'currency',
                  currency: 'SAR',
                }).format(order.totalAmount)}
              </TableCell>
              <TableCell>
                <Chip
                  label={getStatusText(order.status)}
                  color={getStatusColor(order.status) as "default" | "error" | "primary" | "secondary" | "info" | "success" | "warning"}
                  size="small"
                />
              </TableCell>
              <TableCell>
                <IconButton
                  size="small"
                  color="primary"
                  onClick={() => {
                    // التنقل إلى صفحة تفاصيل الطلب
                  }}
                >
                  <IconEye size={18} />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
} 