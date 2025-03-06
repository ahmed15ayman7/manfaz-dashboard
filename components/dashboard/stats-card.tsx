'use client';

import { Box, Paper, Typography } from '@mui/material';
import { Icon } from '@tabler/icons-react';

interface StatsCardProps {
  title: string;
  value: number;
  icon: Icon;
  trend: number;
  color: 'primary' | 'success' | 'warning' | 'info';
  isCurrency?: boolean;
}

export function StatsCard({ title, value, icon: Icon, trend, color, isCurrency }: StatsCardProps) {
  const formatValue = (val: number) => {
    if (isCurrency) {
      return new Intl.NumberFormat('ar-SA', {
        style: 'currency',
        currency: 'SAR',
      }).format(val);
    }
    return new Intl.NumberFormat('ar-SA').format(val);
  };

  const getColorValue = (color: string) => {
    const colors = {
      primary: '#0068FF',
      success: '#4CAF50',
      warning: '#FFC107',
      info: '#5A9CFF',
    };
    return colors[color as keyof typeof colors];
  };

  return (
    <Paper
      sx={{
        p: 3,
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          right: 0,
          p: 2,
          color: getColorValue(color),
        }}
      >
        <Icon size={24} />
      </Box>

      <Box>
        <Typography variant="subtitle2" color="text.secondary">
          {title}
        </Typography>
        <Typography variant="h4" fontWeight="bold" mt={1}>
          {formatValue(value)}
        </Typography>
        <Typography
          variant="caption"
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            color: trend > 0 ? 'success.main' : 'error.main',
            mt: 1,
          }}
        >
          {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
        </Typography>
      </Box>
    </Paper>
  );
} 