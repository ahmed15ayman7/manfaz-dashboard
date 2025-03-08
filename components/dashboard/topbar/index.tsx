'use client';

import {
  Box,
  IconButton,
  Stack,
  AppBar,
  Toolbar,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { IconMenu2, IconBell, IconUser } from '@tabler/icons-react';
import { useSession } from 'next-auth/react';
import { NotificationsPopover } from '@/components/dashboard/notifications/notifications-popover';
import { ProfilePopover } from '@/components/common/profile-popover';
import { useState } from 'react';

interface TopbarProps {
  onToggleSidebar: () => void;
}

export function Topbar({ onToggleSidebar }: TopbarProps) {
  const { data: session } = useSession();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [notificationsAnchor, setNotificationsAnchor] = useState<null | HTMLElement>(null);
  const [profileAnchor, setProfileAnchor] = useState<null | HTMLElement>(null);

  const handleOpenNotifications = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationsAnchor(event.currentTarget);
  };

  const handleCloseNotifications = () => {
    setNotificationsAnchor(null);
  };

  const handleOpenProfile = (event: React.MouseEvent<HTMLElement>) => {
    setProfileAnchor(event.currentTarget);
  };

  const handleCloseProfile = () => {
    setProfileAnchor(null);
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        backgroundColor: 'background.paper',
        color: 'text.primary',
        boxShadow: 1,
      }}
    >
      <Toolbar>
        {isMobile && (
          <IconButton
            onClick={onToggleSidebar}
            sx={{
              ml: { xs: 0, md: 2 },
              display: { xs: 'inline-flex', md: 'none' },
            }}
          >
            <IconMenu2 />
          </IconButton>
        )}
        <Box sx={{ flexGrow: 1 }} />
        <Stack direction="row" spacing={1} alignItems="center">
          <IconButton onClick={handleOpenNotifications}>
            <IconBell />
          </IconButton>
          <IconButton onClick={handleOpenProfile}>
            <IconUser />
          </IconButton>
        </Stack>

        <NotificationsPopover
          open={Boolean(notificationsAnchor)}
          anchorEl={notificationsAnchor}
          onClose={handleCloseNotifications}
        />

        <ProfilePopover
          open={Boolean(profileAnchor)}
          anchorEl={profileAnchor}
          onClose={handleCloseProfile}
          user={session?.user}
        />
      </Toolbar>
    </AppBar>
  );
} 