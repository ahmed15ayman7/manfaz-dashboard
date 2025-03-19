'use client';

import {
  Box,
  List,
  Typography,
  Paper,
  Drawer,
  IconButton,
  useTheme,
  useMediaQuery,
  alpha,
} from '@mui/material';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { NavItem } from './nav-item';
import { EmployeePermissions } from '@/interfaces';
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
  IconX,
  IconUsersGroup,
  IconCalendar,
  IconStar,
  IconDiscount,
  IconTicket,
  IconGiftCard
} from '@tabler/icons-react';
import { useEffect, useState } from 'react';

interface MenuItem {
  title: string;
  path: string;
  icon: any;
  permissions?: Array<keyof EmployeePermissions>;
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const menuItems: MenuItem[] = [
  {
    title: 'لوحة التحكم',
    path: '/dashboard',
    icon: IconDashboard,
  },
  {
    title: 'المستخدمين',
    path: '/dashboard/users',
    icon: IconUsers,
    permissions: ['viewCustomers'],
  },
  {
    title: 'الموظفين',
    path: '/dashboard/employees',
    icon: IconUsersGroup,
    permissions: ['viewEmployees'],
  },
  {
    title: 'التصنيفات',
    path: '/dashboard/categories',
    icon: IconCategory,
    permissions: ['viewCategories'],
  },
  {
    title: 'الخدمات',
    path: '/dashboard/services',
    icon: IconTool,
    permissions: ['viewServices'],
  },
  {
    title: 'مقدمي الخدمات',
    path: '/dashboard/workers',
    icon: IconUsers,
    permissions: ['viewProviders'],
  },
  {
    title: 'السائقين',
    path: '/dashboard/drivers',
    icon: IconTruck,
    permissions: ['viewProviders'],
  },
  {
    title: 'الطلبات',
    path: '/dashboard/orders',
    icon: IconShoppingCart,
    permissions: ['viewOrders'],
  },
  {
    title: 'المحافظ',
    path: '/dashboard/wallets',
    icon: IconWallet,
    permissions: ['viewWallets'],
  },
  {
    title: 'المتاجر',
    path: '/dashboard/stores',
    icon: IconBuilding,
    permissions: ['viewStores'],
  },

  {
    title: 'المواقع',
    path: '/dashboard/locations',
    icon: IconMapPin,
    permissions: ['viewLocations'],
  },
  {
    title: 'المواعيد',
    path: '/dashboard/schedules',
    icon: IconCalendar,
    permissions: ['viewSchedules'],
  },
  {
    title: 'التقييمات',
    path: '/dashboard/reviews',
    icon: IconStar,
    permissions: ['viewReviews'],
  },
  {
    title: 'المدفوعات',
    path: '/dashboard/payments',
    icon: IconWallet,
    permissions: ['viewPayments'],
  },
  {
    title: 'الكوبونات',
    path: '/dashboard/coupons',
    icon: IconTicket,
    permissions: ['viewCoupons'],
  },
  {
    title: 'الخصومات',
    path: '/dashboard/discounts',
    icon: IconDiscount,
    permissions: ['viewDiscounts'],
  },
  {
    title: 'البطاقات',
    path: '/dashboard/gift-cards',
    icon: IconGiftCard,
    permissions: ['viewGiftCards'],
  },
  {
    title: 'المكافآت',
    path: '/dashboard/rewards',
    icon: IconGift,
    permissions: ['viewRewards'],
  },

];

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  let [permissions, setPermissions] = useState<EmployeePermissions | undefined>(session?.user?.permissions)
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [filteredMenuItems, setFilteredMenuItems] = useState(menuItems);
  useEffect(() => {
    status !== "loading" && setPermissions(session?.user?.permissions)
    status !== "loading" && setFilteredMenuItems(menuItems.filter(item => {
      if (!item.permissions) return true;
      if (!permissions) return false;
      return item.permissions.some(permission => session?.user?.permissions[permission]);
    }))
  }, [session])
  const sidebarWidth = 280;
  if (status === "loading") {
    return null
  }
  const sidebarContent = (
    <Box
      sx={{
        overflow:'scroll',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: (theme) => `linear-gradient(${alpha(theme.palette.primary.main, 0.03)}, ${alpha(theme.palette.primary.main, 0.03)})`,
      }}
    >
      <Box sx={{ p: 3 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 1,
            mb: 3,
            '& img': {
              filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.1))',
              transition: 'transform 0.3s ease-in-out',
              '&:hover': {
                transform: 'scale(1.05)',
              },
            },
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              transition: 'transform 0.3s ease-in-out',
              '&:hover': {
                transform: 'translateX(-5px)',
              },
            }}
          >
            <img src="/logo.svg" alt="المُنفذ" width={32} height={32} />
            <Typography
              variant="h6"
              fontWeight="bold"
              sx={{
                background: (theme) => `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                color: 'transparent',
                textShadow: '0px 2px 4px rgba(0,0,0,0.1)',
              }}
            >
              المُنفذ
            </Typography>
          </Box>
          {isMobile && (
            <IconButton
              onClick={onClose}
              size="small"
              sx={{
                transition: 'transform 0.2s ease-in-out',
                '&:hover': {
                  transform: 'rotate(90deg)',
                },
              }}
            >
              <IconX size={20} />
            </IconButton>
          )}
        </Box>

        <List
          sx={{
            p: 0,
            '& > *': {
              transition: 'transform 0.2s ease-in-out',
              '&:hover': {
                transform: 'translateX(-8px)',
              },
            },
          }}
        >
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
    </Box>
  );

  if (isMobile) {
    return (
      <Drawer
        anchor="right"
        open={isOpen}
        onClose={onClose}
        variant="temporary"
        PaperProps={{
          sx: {
            width: sidebarWidth,
            border: 'none',
            boxShadow: (theme) => `0 0 24px ${alpha(theme.palette.primary.main, 0.1)}`,
            backdropFilter: 'blur(8px)',
            backgroundColor: (theme) => alpha(theme.palette.background.paper, 0.9),
          },
        }}
      >
        {sidebarContent}
      </Drawer>
    );
  }

  return (
    <>
      <Paper
        elevation={0}
        sx={{
          height: '100vh',
          width: sidebarWidth,
          position: 'fixed',
          top: 0,
          left: 0,
          borderLeft: '1px solid',
          borderColor: 'divider',
          display: { xs: 'none', md: 'block' },
          backdropFilter: 'blur(8px)',
          backgroundColor: (theme) => alpha(theme.palette.background.paper, 0.9),
          boxShadow: (theme) => `0 0 24px ${alpha(theme.palette.primary.main, 0.1)}`,
          zIndex: (theme) => theme.zIndex.drawer,
        }}
      >
        {sidebarContent}
      </Paper>

    </>
  );
} 