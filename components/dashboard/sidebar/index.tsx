'use client';

import { Box, List, Typography, Paper } from "@mui/material";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { NavItem } from "./nav-item";
import { EmployeePermissions } from "@/interfaces";
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

interface MenuItem {
  title: string;
  path: string;
  icon: any;
  permissions?: Array<keyof EmployeePermissions>;
}

const menuItems: MenuItem[] = [
  {
    title: "لوحة التحكم",
    path: "/dashboard",
    icon: IconDashboard,
  },
  {
    title: "المستخدمين",
    path: "/dashboard/users",
    icon: IconUsers,
    permissions: ["viewCustomers"],
  },
  {
    title: "التصنيفات",
    path: "/dashboard/categories",
    icon: IconCategory,
    permissions: ["viewCategories"],
  },
  {
    title: "الخدمات",
    path: "/dashboard/services",
    icon: IconTool,
    permissions: ["viewServices"],
  },
  {
    title: "مقدمي الخدمات",
    path: "/dashboard/workers",
    icon: IconUsers,
    permissions: ["viewProviders"],
  },
  {
    title: "السائقين",
    path: "/dashboard/drivers",
    icon: IconTruck,
    permissions: ["viewProviders"],
  },
  {
    title: "الطلبات",
    path: "/dashboard/orders",
    icon: IconShoppingCart,
    permissions: ["viewOrders"],
  },
  {
    title: "المحافظ",
    path: "/dashboard/wallets",
    icon: IconWallet,
    permissions: ["viewWallets"],
  },
  {
    title: "المتاجر",
    path: "/dashboard/stores",
    icon: IconBuilding,
    permissions: ["viewStores"],
  },
  {
    title: "المكافآت",
    path: "/dashboard/rewards",
    icon: IconGift,
    permissions: ["viewOffers"],
  },
  {
    title: "المواقع",
    path: "/dashboard/locations",
    icon: IconMapPin,
    permissions: ["viewLocations"],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const permissions = session?.user?.permissions as EmployeePermissions | undefined;

  const filteredMenuItems = menuItems.filter(item => {
    if (!item.permissions) return true;
    if (!permissions) return false;
    return item.permissions.some(permission => permissions[permission]);
  });

  return (
    <Paper
      elevation={0}
      sx={{
        height: "100%",
        width: 280,
        zIndex: 1000,
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
          {filteredMenuItems.map((item) => (
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