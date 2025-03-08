'use client';

import {
  Box,
  Typography,
  Popover,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Divider,
  Badge,
} from '@mui/material';
import {
  IconBell,
  IconShoppingCart,
  IconTruck,
  IconWallet,
  IconCheck,
} from '@tabler/icons-react';
import { formatDistance } from 'date-fns';
import { arEG } from 'date-fns/locale';
import { alpha } from '@mui/material/styles';

interface NotificationsPopoverProps {
  open: boolean;
  anchorEl: HTMLElement | null;
  onClose: () => void;
}

interface Notification {
  id: string;
  title: string;
  description: string;
  type: 'order' | 'delivery' | 'wallet' | 'system';
  isRead: boolean;
  createdAt: Date;
}

// بيانات تجريبية للإشعارات
const notifications: Notification[] = [
  {
    id: '1',
    title: 'طلب جديد',
    description: 'تم إضافة طلب جديد بقيمة 150 ريال',
    type: 'order',
    isRead: false,
    createdAt: new Date(2024, 2, 8, 14, 30),
  },
  {
    id: '2',
    title: 'تحديث حالة التوصيل',
    description: 'السائق في الطريق إلى العميل',
    type: 'delivery',
    isRead: false,
    createdAt: new Date(2024, 2, 8, 13, 45),
  },
  {
    id: '3',
    title: 'إيداع في المحفظة',
    description: 'تم إيداع مبلغ 500 ريال في محفظتك',
    type: 'wallet',
    isRead: true,
    createdAt: new Date(2024, 2, 8, 12, 0),
  },
  {
    id: '4',
    title: 'تحديث النظام',
    description: 'تم تحديث النظام إلى الإصدار الجديد',
    type: 'system',
    isRead: true,
    createdAt: new Date(2024, 2, 8, 10, 15),
  },
];
let bgColor = (theme: any, type: Notification['type']) => {
  switch (type) {
    case 'order':
      return alpha(theme.palette.info.main, 0.1);
    case 'delivery':
      return alpha(theme.palette.success.main, 0.1);
    case 'wallet':
      return alpha(theme.palette.warning.main, 0.1);
    default:
      return alpha(theme.palette.primary.main, 0.1);
  }
}
let color = (theme: any, type: Notification['type']) => {
  switch (type) {
    case 'order':
      return theme.palette.info.main;
    case 'delivery':
      return theme.palette.success.main;
    case 'wallet':
      return theme.palette.warning.main;
    default:
      return theme.palette.primary.main;
  }
}
export function NotificationsPopover({ open, anchorEl, onClose }: NotificationsPopoverProps) {
  const unreadCount = notifications.filter(notification => !notification.isRead).length;

  const getNotificationIcon = (type: Notification['type']) => {
    const iconProps = {
      size: 20, color: `${(theme: any) => color(theme, type)}`,
      style: {
        padding: '8px',
        borderRadius: '50%',
        backgroundColor: `${(theme: any) => bgColor(theme, type)}`
      },
    };

    switch (type) {
      case 'order':
        return <IconShoppingCart {...iconProps} />;
      case 'delivery':
        return <IconTruck {...iconProps} />;
      case 'wallet':
        return <IconWallet {...iconProps} />;
      default:
        return <IconBell {...iconProps} />;
    }
  };

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'left',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'left',
      }}
      slotProps={{
        paper: {
          sx: {
            width: 360,
            maxHeight: 480,
            overflow: 'hidden',
            boxShadow: (theme) => `0 0 24px ${alpha(theme.palette.primary.main, 0.1)}`,
            border: '1px solid',
            borderColor: 'divider',
            backdropFilter: 'blur(8px)',
            backgroundColor: (theme) => alpha(theme.palette.background.paper, 0.9),
          },
        },
      }}
    >
      <Box
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid',
          borderColor: 'divider',
          backdropFilter: 'blur(8px)',
          backgroundColor: (theme) => alpha(theme.palette.background.paper, 0.9),
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600 }}>الإشعارات</Typography>
        <Badge
          badgeContent={unreadCount}
          color="error"
          sx={{
            '& .MuiBadge-badge': {
              animation: unreadCount > 0 ? 'pulse 2s infinite' : 'none',
              '@keyframes pulse': {
                '0%': {
                  transform: 'scale(1)',
                },
                '50%': {
                  transform: 'scale(1.2)',
                },
                '100%': {
                  transform: 'scale(1)',
                },
              },
            },
          }}
        >
          <IconBell size={24} />
        </Badge>
      </Box>
      <List
        sx={{
          p: 0,
          maxHeight: 400,
          overflowY: 'auto',
          '&::-webkit-scrollbar': {
            width: '6px',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'divider',
            borderRadius: '3px',
          },
        }}
      >
        {notifications.map((notification) => (
          <ListItem
            key={notification.id}
            sx={{
              py: 2,
              px: 2.5,
              transition: 'all 0.2s ease-in-out',
              backgroundColor: notification.isRead ? 'transparent' : (theme) => alpha(theme.palette.primary.main, 0.04),
              '&:hover': {
                backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.08),
                transform: 'translateX(-4px)',
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              {getNotificationIcon(notification.type)}
            </ListItemIcon>
            <ListItemText
              primary={
                <Typography variant="subtitle2" sx={{ fontWeight: notification.isRead ? 400 : 600 }}>
                  {notification.title}
                </Typography>
              }
              secondary={
                <Box component="span" sx={{ display: 'block' }}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 0.5 }}
                  >
                    {notification.description}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 0.5,
                    }}
                  >
                    {formatDistance(notification.createdAt, new Date(), {
                      addSuffix: true,
                      locale: arEG,
                    })}
                  </Typography>
                </Box>
              }
            />
            {!notification.isRead && (
              <IconButton
                size="small"
                color="primary"
                sx={{
                  transition: 'transform 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'scale(1.1)',
                  },
                }}
              >
                <IconCheck size={16} />
              </IconButton>
            )}
          </ListItem>
        ))}
      </List>
      {notifications.length === 0 && (
        <Box
          sx={{
            p: 4,
            textAlign: 'center',
            color: 'text.secondary',
          }}
        >
          <IconBell size={40} style={{ opacity: 0.3, marginBottom: 16 }} />
          <Typography variant="subtitle1" gutterBottom>
            لا توجد إشعارات
          </Typography>
          <Typography variant="body2" color="text.secondary">
            سنقوم بإعلامك عند وصول إشعارات جديدة
          </Typography>
        </Box>
      )}
    </Popover>
  );
} 