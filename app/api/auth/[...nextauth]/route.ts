import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import axios from "axios";
import axiosInstance from "@/lib/axios";
import API_ENDPOINTS from "@/lib/apis";
import { Employee } from "@/interfaces";
import authService from "@/lib/services/auth.service";
import Cookies from 'js-cookie';

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "البريد الإلكتروني", type: "email" },
        phone: { label: "رقم الهاتف", type: "text" },
        password: { label: "كلمة المرور", type: "password" },
        role: { label: "الدور", type: "text" }
      },
      async authorize(credentials) {
        try {
          const response = await axiosInstance.post(API_ENDPOINTS.auth.login({}, false), {
            email: credentials?.email,
            phone: credentials?.phone,
            password: credentials?.password,
            role: credentials?.role,
          });

          const user = response.data;
          if (user) {
            if (user) {
              authService.setTokens(user.accessToken, user.refreshToken);
              Cookies.set('authToken', user.accessToken, { expires: 7 }); // تخزين الكوكيز لمدة 7 أيام
            }
            return {
              id: user.data.id,
              name: user.data.name,
              email: user.data.email,
              role: user.data.role,
              permissions: user.data.permissions,
              accessToken: user.accessToken,
              refreshToken: user.refreshToken,
            };
          }
          return null;
        } catch (error: any) {
          throw new Error("فشل تسجيل الدخول. يرجى التحقق من بيانات الاعتماد الخاصة بك." + error.message);
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const userData = user as Employee & {
          accessToken: string;
          refreshToken: string;
        };
        token = { ...token, user: userData }
        return token;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user = token.user as Employee;
        session.accessToken = (token.user as any).accessToken as string;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith('/auth/login')) {
        return baseUrl;
      }
      if (!url.startsWith(baseUrl)) {
        return baseUrl;
      }
      return url;
    }
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
});

export { handler as GET, handler as POST }; 