'use client';

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "@mui/material/styles";
import { createTheme } from "@mui/material/styles";
import rtlPlugin from "stylis-plugin-rtl";
import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";
import { prefixer } from "stylis";

const queryClient = new QueryClient();

// إنشاء الثيم الخاص بالتطبيق
const theme = createTheme({
  direction: "rtl",
  palette: {
    primary: {
      main: "#0068FF",
      light: "#5A9CFF",
      dark: "#0041B3",
    },
    secondary: {
      main: "#FFC107",
      light: "#FFD54F",
      dark: "#FFA000",
    },
  },
  typography: {
    fontFamily: "Tajawal, sans-serif",
  },
});

// إنشاء كاش للـ RTL
const cacheRtl = createCache({
  key: "muirtl",
  stylisPlugins: [prefixer, rtlPlugin],
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <CacheProvider value={cacheRtl}>
      <ThemeProvider theme={theme}>
        <QueryClientProvider client={queryClient}>
          <SessionProvider>{children}</SessionProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </CacheProvider>
  );
} 