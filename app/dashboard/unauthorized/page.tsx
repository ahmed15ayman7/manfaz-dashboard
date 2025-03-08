'use client';

import { Box, Typography, Button } from '@mui/material';
import { useRouter } from 'next/navigation';
import { IconLock } from '@tabler/icons-react';

export default function UnauthorizedPage() {
  const router = useRouter();

  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        textAlign: 'center',
        p: 3,
      }}
    >
      <IconLock size={64} stroke={1.5} />
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        غير مصرح بالوصول
      </Typography>
      <Typography color="text.secondary" sx={{ maxWidth: 500, mb: 3 }}>
        عذراً، ليس لديك الصلاحيات اللازمة للوصول إلى هذه الصفحة. يرجى التواصل مع مدير النظام إذا كنت تعتقد أن هذا خطأ.
      </Typography>
      <Button
        variant="contained"
        onClick={() => router.push('/dashboard')}
      >
        العودة إلى لوحة التحكم
      </Button>
    </Box>
  );
} 