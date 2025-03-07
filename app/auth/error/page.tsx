'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Box,
  Paper,
  Typography,
  Button,
  Container,
  Skeleton,
} from '@mui/material';
import { IconAlertTriangle, IconArrowLeft } from '@tabler/icons-react';

function AuthErrorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  useEffect(() => {
    if (!error) {
      router.push('/auth/login');
    }
  }, [error, router]);

  const getErrorMessage = () => {
    switch (error) {
      case 'AccessDenied':
        return 'ليس لديك صلاحية الوصول إلى هذه الصفحة';
      case 'Verification':
        return 'فشل في التحقق من البريد الإلكتروني';
      case 'OAuthSignin':
        return 'فشل في تسجيل الدخول باستخدام المزود';
      case 'OAuthCallback':
        return 'فشل في استجابة المزود';
      case 'OAuthCreateAccount':
        return 'فشل في إنشاء حساب المستخدم';
      case 'EmailCreateAccount':
        return 'فشل في إنشاء حساب المستخدم';
      case 'Callback':
        return 'فشل في استجابة المزود';
      case 'OAuthAccountNotLinked':
        return 'البريد الإلكتروني مستخدم بالفعل مع مزود آخر';
      case 'EmailSignin':
        return 'فشل في إرسال رابط تسجيل الدخول';
      case 'CredentialsSignin':
        return 'فشل في تسجيل الدخول. يرجى التحقق من بيانات الاعتماد الخاصة بك';
      case 'SessionRequired':
        return 'يرجى تسجيل الدخول للوصول إلى هذه الصفحة';
      default:
        return 'حدث خطأ غير متوقع';
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            width: '100%',
            maxWidth: 'sm',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 3,
          }}
        >
          <IconAlertTriangle size={48} color="#f44336" />

          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h5" component="h1" fontWeight="bold" gutterBottom>
              خطأ في المصادقة
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {getErrorMessage()}
            </Typography>
          </Box>

          <Button
            variant="contained"
            startIcon={<IconArrowLeft />}
            onClick={() => router.push('/auth/login')}
          >
            العودة إلى صفحة تسجيل الدخول
          </Button>
        </Paper>
      </Box>
    </Container>
  );
}
export default function Page() {
  return <Suspense fallback={<Skeleton variant="rectangular" height="100vh" />}>
    <AuthErrorPage />
  </Suspense>
}