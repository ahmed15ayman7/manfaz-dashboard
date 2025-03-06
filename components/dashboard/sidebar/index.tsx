'use client';

import { Box, List, Typography, Paper } from "@mui/material";
import { usePathname } from "next/navigation";
import { NavItem } from "./nav-item";
import {
  IconDashboard,
  IconUsers,
  IconCategory,
  IconTool,
  IconTruck,
  IconShoppingCart,
  IconWallet,
  IconBuilding,
  IconGift,
  IconMapPin,
} from "@tabler/icons-react";

const menuItems = [
  {
    title: "لوحة التحكم",
    path: "/dashboard",
    icon: IconDashboard,
  },
  {
    title: "المستخدمين",
    path: "/dashboard/users",
    icon: IconUsers,
  },
  {
    title: "التصنيفات",
    path: "/dashboard/categories",
    icon: IconCategory,
  },
  {
    title: "الخدمات",
    path: "/dashboard/services",
    icon: IconTool,
  },
  {
    title: "مقدمي الخدمات",
    path: "/dashboard/workers",
    icon: IconUsers,
  },
  {
    title: "السائقين",
    path: "/dashboard/drivers",
    icon: IconTruck,
  },
  {
    title: "الطلبات",
    path: "/dashboard/orders",
    icon: IconShoppingCart,
  },
  {
    title: "المحافظ",
    path: "/dashboard/wallets",
    icon: IconWallet,
  },
  {
    title: "المتاجر",
    path: "/dashboard/stores",
    icon: IconBuilding,
  },
  {
    title: "المكافآت",
    path: "/dashboard/rewards",
    icon: IconGift,
  },
  {
    title: "المواقع",
    path: "/dashboard/locations",
    icon: IconMapPin,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <Paper
      elevation={0}
      sx={{
        height: "100%",
        width: 280,
        position: "fixed",
        borderLeft: "1px solid",
        borderColor: "divider",
      }}
    >
      <Box sx={{ p: 3 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            mb: 3,
          }}
        >
          <img src="/logo.svg" alt="المُنفذ" width={32} height={32} />
          <Typography variant="h6" fontWeight="bold">
            المُنفذ
          </Typography>
        </Box>

        <List sx={{ p: 0 }}>
          {menuItems.map((item) => (
            <NavItem
              key={item.path}
              title={item.title}
              path={item.path}
              icon={item.icon}
              active={pathname === item.path}
            />
          ))}
        </List>
      </Box>
    </Paper>
  );
} 