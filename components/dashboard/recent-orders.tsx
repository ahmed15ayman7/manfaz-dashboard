'use client';

import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { Order } from '@/interfaces';
import axiosInstance from '@/lib/axios';
import API_ENDPOINTS from '@/lib/apis';
export function RecentOrders() {
  const { data: orders = [] } = useQuery<Order[]>({
    queryKey: ['recent-orders'],
    queryFn: async () => {
      const response = await axiosInstance.get(API_ENDPOINTS.orders.getAll({ limit: 5 }, false));
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

  return (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>رقم الطلب</TableCell>
            <TableCell>العميل</TableCell>
            <TableCell>الحالة</TableCell>
            <TableCell align="left">المبلغ</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell>#{order.id?.slice(-4)}</TableCell>
              <TableCell>{order.user?.name}</TableCell>
              <TableCell>
                <Chip
                  label={getStatusText(order.status)}
                  color={getStatusColor(order.status) as any}
                  size="small"
                />
              </TableCell>
              <TableCell align="left">
                {new Intl.NumberFormat('ar-SA', {
                  style: 'currency',
                  currency: 'SAR',
                }).format(order.totalAmount)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
} 