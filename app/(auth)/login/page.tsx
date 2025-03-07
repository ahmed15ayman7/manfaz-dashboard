'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
} from '@mui/material';
import { useMutation } from '@tanstack/react-query';
import axios from '@/lib/axios';
import API_ENDPOINTS from '@/lib/apis';
import authService from '@/lib/services/auth.service';

interface LoginCredentials {
  email: string;
  password: string;
}

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string>('');
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: '',
    password: '',
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginCredentials) => {
      const response = await axios.post(API_ENDPOINTS.auth.login({}), data);
      return response.data;
    },
    onSuccess: (data) => {
      // تعيين التوكن وتوجيه المستخدم للصفحة الرئيسية
      authService.setTokens(data.accessToken, data.refreshToken);
      router.push('/dashboard');
    },
    onError: (error: any) => {
      setError(error.response?.data?.message || 'حدث خطأ أثناء تسجيل الدخول');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    loginMutation.mutate(credentials);
  };

  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          width: '100%',
          maxWidth: 400,
        }}
      >
        <Typography variant="h5" textAlign="center" mb={3} fontWeight="bold">
          تسجيل الدخول
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="البريد الإلكتروني"
            type="email"
            value={credentials.email}
            onChange={(e) =>
              setCredentials({ ...credentials, email: e.target.value })
            }
            sx={{ mb: 2 }}
            required
          />

          <TextField
            fullWidth
            label="كلمة المرور"
            type="password"
            value={credentials.password}
            onChange={(e) =>
              setCredentials({ ...credentials, password: e.target.value })
            }
            sx={{ mb: 3 }}
            required
          />

          <Button
            fullWidth
            type="submit"
            variant="contained"
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending ? 'جاري التسجيل...' : 'تسجيل الدخول'}
          </Button>
        </form>
      </Paper>
    </Box>
  );
} 