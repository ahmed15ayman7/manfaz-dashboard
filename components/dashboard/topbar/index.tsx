'use client';

import {
  AppBar,
  Avatar,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
} from "@mui/material";
import { IconMenu2 } from "@tabler/icons-react";
import { signOut, useSession } from "next-auth/react";
import { useState } from "react";

interface TopbarProps {
  onDrawerToggle: () => void;
}

export function Topbar({ onDrawerToggle }: TopbarProps) {
  const { data: session } = useSession();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    signOut();
    handleClose();
  };

  return (
    <AppBar
      position="sticky"
      color="inherit"
      elevation={1}
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={onDrawerToggle}
          sx={{ ml: 2, display: { md: "none" } }}
        >
          <IconMenu2 />
        </IconButton>

        <Box sx={{ flexGrow: 1 }} />

        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Typography variant="subtitle1">
            {session?.user?.name || "مستخدم"}
          </Typography>
          <IconButton
            size="large"
            aria-label="account of current user"
            aria-controls="menu-appbar"
            aria-haspopup="true"
            onClick={handleMenu}
            color="inherit"
          >
            <Avatar
              alt={session?.user?.name || "مستخدم"}
              src={session?.user?.imageUrl || "https://res.cloudinary.com/dixa9yvlz/image/upload/v1741264530/Manfaz/default-profile.jpg"}
              sx={{ width: 32, height: 32 }}
            />
          </IconButton>
          <Menu
            id="menu-appbar"
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "left",
            }}
            keepMounted
            transformOrigin={{
              vertical: "top",
              horizontal: "left",
            }}
            open={Boolean(anchorEl)}
            onClose={handleClose}
          >
            <MenuItem onClick={handleClose}>الملف الشخصي</MenuItem>
            <MenuItem onClick={handleClose}>الإعدادات</MenuItem>
            <MenuItem onClick={handleLogout}>تسجيل الخروج</MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
} 