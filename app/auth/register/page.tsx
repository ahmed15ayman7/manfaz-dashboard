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
  Container,
  ToggleButtonGroup,
  ToggleButton,
  Grid,
} from '@mui/material';
import { IconBuildingStore, IconPhone, IconUserCircle, IconUserShield } from '@tabler/icons-react';
import axios from 'axios';
import API_ENDPOINTS from '@/lib/apis';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
export default function RegisterPage() {
  const router = useRouter();
  const [accountType, setAccountType] = useState<'customer_service' | 'sales' | 'supervisor' | 'admin'>('customer_service');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusPhone, setFocusPhone] = useState(false);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (formData.password !== formData.confirmPassword) {
      setError('كلمات المرور غير متطابقة');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(API_ENDPOINTS.auth.register({}), {
        ...formData,
        role: accountType,
      });

      if (response.data) {
        router.push('/auth/login?registered=true');
      }
    } catch (error: any) {
      setError(error.response?.data?.message || 'حدث خطأ أثناء التسجيل');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
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
            gap: 3,
          }}
        >
          <Box sx={{ textAlign: 'center', mb: 2 }}>
            <Typography variant="h5" component="h1" fontWeight="bold" gutterBottom>
              إنشاء حساب جديد
            </Typography>
            <Typography variant="body2" color="text.secondary">
              قم بإنشاء حساب للوصول إلى خدماتنا
            </Typography>
          </Box>

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
              value={accountType}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
              }}
              exclusive
              onChange={(e, value) => value && setAccountType(value)}
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
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  name="name"
                  label="الاسم"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  fullWidth
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  name="email"
                  label="البريد الإلكتروني"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  fullWidth
                />
              </Grid>
              <Grid item xs={12}>
                <div className="" style={{ direction: "ltr" }}>

                  <PhoneInput
                    country={"sa"}
                    onFocus={e => setFocusPhone(true)}
                    onBlur={e => setFocusPhone(false)}
                    containerClass={`border-2 rounded-[5px] py-2 bg-white ${focusPhone ? ' outline-none border-primary' : 'border-gray-300'}`}
                    dropdownStyle={{ border: "none !important" }}
                    value={formData.phone}
                    onChange={(value, data, event, formattedValue) => {
                      setFormData({ ...formData, phone: formattedValue });
                    }}
                  />
                </div>

              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  name="password"
                  label="كلمة المرور"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  name="confirmPassword"
                  label="تأكيد كلمة المرور"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  fullWidth
                />
              </Grid>
            </Grid>

            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={loading}
              fullWidth
              sx={{ mt: 3 }}
            >
              {loading ? 'جاري التسجيل...' : 'تسجيل'}
            </Button>

            <Button
              variant="text"
              fullWidth
              onClick={() => router.push('/auth/login')}
              sx={{ mt: 1 }}
            >
              لديك حساب بالفعل؟ تسجيل الدخول
            </Button>
          </form>
        </Paper>
      </Box>
    </Container>
  );
} 