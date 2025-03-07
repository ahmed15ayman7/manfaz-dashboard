import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import axios from "axios";
import API_ENDPOINTS from "@/lib/apis";
import { Employee } from "@/interfaces";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "البريد الإلكتروني", type: "email" },
        password: { label: "كلمة المرور", type: "password" }
      },
      async authorize(credentials) {
        try {
          const response = await axios.post(API_ENDPOINTS.auth.login({}), {
            email: credentials?.email,
            password: credentials?.password,
          });

          const user = response.data;

          if (user) {
            return {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role,
              token: user.token,
            };
          }

          return null;
        } catch (error) {
          throw new Error("فشل تسجيل الدخول. يرجى التحقق من بيانات الاعتماد الخاصة بك.");
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
        const userData = user as Employee;
        token.role = userData.role;
        token.token = userData.token;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user = token.user as Employee;
        session.accessToken = token.accessToken as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
});

export { handler as GET, handler as POST }; 