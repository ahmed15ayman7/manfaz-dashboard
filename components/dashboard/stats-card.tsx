'use client';

import { Box, Paper, Typography } from '@mui/material';
import { Icon } from '@tabler/icons-react';
import { formatNumber } from '@/lib/utils';

export interface StatsCardProps {
  title: string;
  value: number;
  icon: Icon;
  trend: number;
  color: 'primary' | 'success' | 'warning' | 'info' | 'secondary';
  isCurrency?: boolean;
  isRating?: boolean;
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  trend,
  color,
  isCurrency,
  isRating,
}: StatsCardProps) {
  const formattedValue = isRating
    ? value.toFixed(1)
    : isCurrency
    ? formatNumber(value, 'currency')
    : formatNumber(value);

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
          color: `${color}.main`,
          opacity: 0.1,
        }}
      >
        <Icon size={64} stroke={1.5} />
      </Box>

      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
        {title}
      </Typography>

      <Typography variant="h4" fontWeight="bold">
        {formattedValue}
        {isRating && (
          <Typography
            component="span"
            variant="h6"
            color="text.secondary"
            sx={{ mr: 0.5 }}
          >
            / 5
          </Typography>
        )}
      </Typography>

      <Box
        sx={{
          mt: 1,
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
        }}
      >
        <Typography
          variant="caption"
          color={trend > 0 ? 'success.main' : 'error.main'}
          sx={{ display: 'flex', alignItems: 'center' }}
        >
          {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
        </Typography>
        <Typography variant="caption" color="text.secondary">
          مقارنة بالشهر السابق
        </Typography>
      </Box>
    </Paper>
  );
} 