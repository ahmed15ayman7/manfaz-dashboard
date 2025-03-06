'use client';

import { useState } from "react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Topbar } from "@/components/dashboard/topbar";
import { Drawer, Box } from "@mui/material";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar للشاشات الكبيرة */}
      <Box
        component="nav"
        sx={{
          width: { md: 280 },
          flexShrink: { md: 0 },
          display: { xs: "none", md: "block" },
        }}
      >
        <Sidebar />
      </Box>

      {/* Drawer للشاشات الصغيرة */}
      <Drawer
        variant="temporary"
        anchor="right"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": { width: 280 },
        }}
      >
        <Sidebar />
      </Drawer>

      {/* المحتوى الرئيسي */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minHeight: "100vh",
          overflow: "hidden",
        }}
      >
        <Topbar onDrawerToggle={handleDrawerToggle} />
        <Box sx={{ p: 3 }}>{children}</Box>
      </Box>
    </Box>
  );
} 