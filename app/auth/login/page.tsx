'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';
import { useMutation } from '@tanstack/react-query';
import axios from '@/lib/axios';
import API_ENDPOINTS from '@/lib/apis';
import authService from '@/lib/services/auth.service';
import { IconBuildingStore, IconPhone, IconUserShield } from '@tabler/icons-react';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { IconUserCircle } from '@tabler/icons-react';

interface LoginCredentials {
  password: string;
  email: string;
  phone: string;
  role: 'customer_service' | 'sales' | 'supervisor' | 'admin';
}
const checkIfPhone = (value: string) => {

  // نزيل كل الرموز ماعدا الأرقام
  const numbersOnly = value.replace(/[^0-9]/g, '');
  const wordOnly = value.replace(/[^a-zA-Z]/g, '');
  // إذا كان المدخل يحتوي على 3 أرقام أو أكثر، نعتبره رقم هاتف

  if (wordOnly.length >= 1) {
    return false;
  }
  if (numbersOnly.length >= 1) {
    return true;
  }
  return false;
};

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string>('');
  const [focusPhone, setFocusPhone] = useState(false);
  const [isPhoneInput, setIsPhoneInput] = useState(false);
  const [credentials, setCredentials] = useState<LoginCredentials>({
    password: '',
    email: '',
    phone: '',
    role: 'customer_service',
  });
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const phoneInputRef = useRef<any>(null);
  const emailInputRef = useRef<any>(null);
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
    loginMutation.mutate({ ...credentials, email: isPhoneInput ? '' : emailOrPhone, phone: isPhoneInput ? emailOrPhone : '' });
  };
  const handleInputChange = (value: string) => {
    setEmailOrPhone(value);
    setIsPhoneInput(checkIfPhone(value));
  };

  useEffect(() => {
    setIsPhoneInput(checkIfPhone(emailOrPhone));
  }, [emailOrPhone]);
  useEffect(() => {
    if (isPhoneInput && phoneInputRef.current) {
      phoneInputRef.current.focus();
      setFocusPhone(true);
    } else if (!isPhoneInput && emailInputRef.current?.focus) {
      emailInputRef.current.focus();
    }
  }, [isPhoneInput]);
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
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            نوع الحساب
          </Typography>
          <ToggleButtonGroup
            value={credentials.role}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
            }}
            exclusive
            onChange={(e, value) => value && setCredentials({ ...credentials, role: value })}
            fullWidth
          >
            {/* "customer_service" | "sales" | "supervisor" | "admin" */}
            <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1 }}>
              <ToggleButton value="customer_service">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <IconPhone size={20} />
                  <span>خدمة العملاء</span>
                </Box>
              </ToggleButton>
              <ToggleButton value="admin">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <IconUserShield size={20} />
                  <span>مدير النظام</span>
                </Box>
              </ToggleButton>

            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1 }}>
              <ToggleButton value="sales">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <IconBuildingStore size={20} />
                  <span>موظف مبيعات</span>
                </Box>
              </ToggleButton>
              <ToggleButton value="supervisor">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <IconUserCircle size={20} />
                  <span>موظف مشرف</span>
                </Box>
              </ToggleButton>

            </Box>
          </ToggleButtonGroup>
        </Box>
        <form onSubmit={handleSubmit}>
          {!isPhoneInput ? (
            <TextField

              inputRef={emailInputRef}
              fullWidth
              label="البريد الإلكتروني"
              type="email"
              value={emailOrPhone}
              onChange={e => handleInputChange(e.target.value)}
              sx={{ mb: 2 }}
              required
            />
          ) : (
            <Box className="" style={{ direction: "ltr", marginBottom: '24px' }}>

              <PhoneInput
                country={"sa"}
                inputProps={{
                  ref: phoneInputRef
                }}
                onFocus={e => setFocusPhone(true)}
                onBlur={e => setFocusPhone(false)}
                containerClass={`border-2 rounded-[5px] py-[10px] bg-white ${focusPhone ? ' outline-none border-primary' : 'border-gray-300'}`}
                dropdownStyle={{ border: "none !important" }}
                value={emailOrPhone}
                onChange={(value, data, event, formattedValue) => {
                  handleInputChange(formattedValue);
                }}
              />
            </Box>
          )}

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