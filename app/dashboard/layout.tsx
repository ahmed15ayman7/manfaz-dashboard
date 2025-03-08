'use client';

import { Box } from '@mui/material';
import { Sidebar } from '@/components/dashboard/sidebar';
import { Topbar } from '@/components/dashboard/topbar';
import { useState } from 'react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleToggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', width: "100%" }}>
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <Box
        component="main"
        sx={{
          minHeight: '100vh',
          marginLeft: { xs: 0, md: `280px` },
          transition: 'margin 0.3s ease-in-out',
          width: { xs: '100%', md: `calc(100% - 280px)` },
        }}
      >

        <Box sx={{ flexGrow: 1 }}>
          <Topbar onToggleSidebar={handleToggleSidebar} />
          <Box
            component="main"
            sx={{
              p: 3,
              pt: 10,
              maxWidth: '100vw',
              overflowX: 'hidden',
            }}
          >
            {children}
          </Box>
        </Box>
      </Box>
    </Box>
  );
} 