'use client';

import { Box, Typography, Button, Container } from '@mui/material';
import { IconAlertTriangle, IconArrowLeft } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';

export default function NotFound() {
  const router = useRouter();

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          gap: 3,
        }}
      >
        <IconAlertTriangle size={64} color="var(--warning)" />
        <Typography variant="h4" fontWeight="bold" color="text.primary">
          404 - الصفحة غير موجودة
        </Typography>
        <Typography variant="body1" color="text.secondary">
          عذراً، الصفحة التي تحاول الوصول إليها غير موجودة أو ليس لديك صلاحية الوصول إليها.
        </Typography>
        <Button
          variant="contained"
          startIcon={<IconArrowLeft />}
          onClick={() => router.back()}
        >
          العودة للخلف
        </Button>
      </Box>
    </Container>
  );
} 