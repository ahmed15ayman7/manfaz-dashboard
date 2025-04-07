import type { Metadata } from "next";
import { Tajawal } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

const tajawal = Tajawal({
  subsets: ["arabic"],
  weight: ["200", "300", "400", "500", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "منصة المُنفذ | لوحة التحكم",
  description: "منصة المُنفذ لإدارة الخدمات المنزلية وخدمات التوصيل",

};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      </head>
      <body className={tajawal.className}>
        <Providers>
          {children}
          <ToastContainer position="top-center" />
        </Providers>
      </body>
    </html>
  );
}
