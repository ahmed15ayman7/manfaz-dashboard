'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Badge,
  Menu,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Chip,
} from '@mui/material';
import {
  IconBell,
  IconShoppingCart,
  IconAlertTriangle,
  IconUserExclamation,
  IconCheck,
} from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import API_ENDPOINTS from '@/lib/apis';

interface Notification {
  id: string;
  type: 'order' | 'alert' | 'user' | 'system';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
}

export default function NotificationCenter() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  // استدعاء التنبيهات
  const { data: notifications } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const response = await axios.get('/api/notifications');
      return response.data;
    },
    refetchInterval: 30000, // تحديث كل 30 ثانية
  });

  // تحديث عدد التنبيهات غير المقروءة
  useEffect(() => {
    if (notifications) {
      const count = notifications.filter(
        (notification: Notification) => !notification.isRead
      ).length;
      setUnreadCount(count);
    }
  }, [notifications]);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await axios.put(`/api/notifications/${id}/read`);
      // تحديث الواجهة
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'order':
        return <IconShoppingCart size={20} />;
      case 'alert':
        return <IconAlertTriangle size={20} color="error" />;
      case 'user':
        return <IconUserExclamation size={20} />;
      default:
        return <IconBell size={20} />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'order':
        return 'primary';
      case 'alert':
        return 'error';
      case 'user':
        return 'warning';
      default:
        return 'info';
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString('ar-SA', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    });
  };

  return (
    <Box>
      <IconButton onClick={handleClick}>
        <Badge badgeContent={unreadCount} color="error">
          <IconBell size={24} />
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          sx: {
            width: 360,
            maxHeight: 400,
          },
        }}
      >
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="subtitle1" fontWeight="bold">
            التنبيهات
          </Typography>
        </Box>

        <List sx={{ p: 0 }}>
          {notifications?.length > 0 ? (
            notifications.map((notification: Notification) => (
              <Box key={notification.id}>
                <ListItem
                  sx={{
                    bgcolor: notification.isRead ? 'transparent' : 'action.hover',
                  }}
                >
                  <ListItemIcon>
                    {getNotificationIcon(notification.type)}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <Typography variant="subtitle2">
                          {notification.title}
                        </Typography>
                        <Chip
                          label={formatDate(notification.createdAt)}
                          size="small"
                          color={getNotificationColor(notification.type)}
                          variant="outlined"
                        />
                      </Box>
                    }
                    secondary={notification.message}
                  />
                  {!notification.isRead && (
                    <IconButton
                      size="small"
                      onClick={() => handleMarkAsRead(notification.id)}
                    >
                      <IconCheck size={16} />
                    </IconButton>
                  )}
                </ListItem>
                <Divider />
              </Box>
            ))
          ) : (
            <ListItem>
              <ListItemText
                primary={
                  <Typography variant="body2" align="center" color="text.secondary">
                    لا توجد تنبيهات جديدة
                  </Typography>
                }
              />
            </ListItem>
          )}
        </List>
      </Menu>
    </Box>
  );
} 