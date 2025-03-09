import { jwtDecode } from 'jwt-decode';
import API_ENDPOINTS from '@/lib/apis';
import { redirect } from 'next/navigation';
import axiosInstance from '@/lib/axios';
import Cookies from 'js-cookie';

interface TokenPayload {
  exp: number;
  user: {
    id: string;
    email: string;
    role: string;
  };
}

class AuthService {
  private static instance: AuthService;
  private refreshTokenTimeout?: NodeJS.Timeout;
  private accessToken: string = '';
  private refresh_token: string = '';

  private constructor() { }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  // تعيين التوكن عند تسجيل الدخول
  public setTokens(accessToken: string, refreshToken: string) {
    this.accessToken = accessToken;
    this.refresh_token = refreshToken;
    Cookies.set('accessToken', accessToken, { path: '/', secure: true, sameSite: 'Lax' });
    Cookies.set('refreshToken', refreshToken, { path: '/', secure: true, sameSite: 'Lax', expires: 7 });
    console.log("Cookies after setting:", Cookies.get('accessToken'), Cookies.get('refreshToken'));
    this.startRefreshTokenTimer();
  }

  // الحصول على التوكن الحالي
  public getAccessToken(): string {
    return this.accessToken || Cookies.get('accessToken') || '';
  }

  // التحقق من حالة تسجيل الدخول
  public isAuthenticated(): boolean {
    const token = this.getAccessToken();
    if (!token) return false;

    try {
      const decodedToken = jwtDecode<TokenPayload>(token);
      return decodedToken.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  }

  // بدء مؤقت تجديد التوكن
  private startRefreshTokenTimer() {
    try {
      const decodedToken = jwtDecode<TokenPayload>(this.accessToken);
      const expires = new Date(decodedToken.exp * 1000);
      const timeout = expires.getTime() - Date.now() - (60 * 1000); // تجديد قبل دقيقة من الانتهاء

      this.refreshTokenTimeout = setTimeout(() => this.refreshToken(), timeout);
    } catch (error) {
      console.error('Error starting refresh timer:', error);
    }
  }

  // إيقاف مؤقت تجديد التوكن
  private stopRefreshTokenTimer() {
    if (this.refreshTokenTimeout) {
      clearTimeout(this.refreshTokenTimeout);
    }
  }

  // تجديد التوكن
  public async refreshToken(): Promise<string> {
    try {
      const response = await axiosInstance.post(API_ENDPOINTS.auth.refreshToken({}, false), {
        refreshToken: this.refresh_token || Cookies.get('refreshToken')
      });

      const { accessToken, refreshToken } = response.data;
      this.setTokens(accessToken, refreshToken);
      return accessToken;
    } catch (error) {
      this.logout();
      throw new Error('Failed to refresh token');
    }
  }

  // تسجيل الخروج
  public logout() {
    this.accessToken = '';
    this.refresh_token = '';
    Cookies.remove('accessToken');
    Cookies.remove('refreshToken');
    this.stopRefreshTokenTimer();
    redirect('/auth/login');
  }
}

export default AuthService.getInstance(); 