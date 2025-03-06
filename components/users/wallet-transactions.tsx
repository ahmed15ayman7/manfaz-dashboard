'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Typography,
  Chip,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Transaction } from '@/interfaces';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

interface WalletTransactionsProps {
  userId: string;
}

export function WalletTransactions({ userId }: WalletTransactionsProps) {
  const { data: transactions = [] } = useQuery<Transaction[]>({
    queryKey: ['user-transactions', userId],
    queryFn: async () => {
      const response = await axios.get(`/api/users/${userId}/transactions`);
      return response.data;
    },
  });

  if (transactions.length === 0) {
    return (
      <Box
        sx={{
          textAlign: 'center',
          py: 4,
        }}
      >
        <Typography color="text.secondary">
          لا توجد معاملات حتى الآن
        </Typography>
      </Box>
    );
  }

  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>رقم العملية</TableCell>
            <TableCell>النوع</TableCell>
            <TableCell>المبلغ</TableCell>
            <TableCell>الحالة</TableCell>
            <TableCell>التاريخ</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {transactions.map((transaction) => (
            <TableRow key={transaction.id}>
              <TableCell>#{transaction.id.slice(-6)}</TableCell>
              <TableCell>
                <Chip
                  label={transaction.type === 'deposit' ? 'إيداع' : 'سحب'}
                  color={transaction.type === 'deposit' ? 'success' : 'warning'}
                  size="small"
                />
              </TableCell>
              <TableCell>
                <Typography
                  color={transaction.type === 'deposit' ? 'success.main' : 'error.main'}
                  fontWeight="medium"
                >
                  {transaction.type === 'deposit' ? '+' : '-'}
                  {new Intl.NumberFormat('ar-SA', {
                    style: 'currency',
                    currency: 'SAR',
                  }).format(transaction.amount)}
                </Typography>
              </TableCell>
              <TableCell>
                <Chip
                  label={
                    transaction.status === 'completed'
                      ? 'مكتمل'
                      : transaction.status === 'pending'
                      ? 'قيد المعالجة'
                      : 'فشل'
                  }
                  color={
                    transaction.status === 'completed'
                      ? 'success'
                      : transaction.status === 'pending'
                      ? 'warning'
                      : 'error'
                  }
                  size="small"
                />
              </TableCell>
              <TableCell>
                {format(new Date(transaction.createdAt), 'PPP', { locale: ar })}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
} 