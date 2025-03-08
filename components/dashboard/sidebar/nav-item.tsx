'use client';

import { ListItemButton, ListItemIcon, ListItemText } from "@mui/material";
import Link from "next/link";
import { Icon } from "@tabler/icons-react";
import { alpha } from "@mui/material/styles";
import { Box } from "@mui/material";

interface NavItemProps {
  title: string;
  path: string;
  icon: Icon;
  active?: boolean;
}

export function NavItem({ title, path, icon: Icon, active }: NavItemProps) {
  return (
    <ListItemButton
      component={Link}
      href={path}
      sx={{
        mb: 0.5,
        py: 1.5,
        px: 2,
        borderRadius: 2,
        backgroundColor: active ? (theme) => alpha(theme.palette.primary.main, 0.08) : 'transparent',
        color: active ? "primary.main" : "text.primary",
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
        gap: 2,
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.08),
          transform: 'translateX(-8px)',
        },
      }}
    >
      <ListItemText
        primary={title}
        primaryTypographyProps={{
          fontSize: 14,
          fontWeight: active ? 600 : 400,
          textAlign: 'right',
        }}
        sx={{ margin: 0 }}
      />
      <ListItemIcon
        sx={{
          minWidth: 'unset',
          margin: 0,
          color: active ? "primary.main" : "text.primary",
        }}
      >
        <Box
          sx={{
            padding: '6px',
            borderRadius: '50%',
            backgroundColor: active ? (theme) => alpha(theme.palette.primary.main, 0.1) : 'transparent',
            transition: 'all 0.2s ease-in-out',
          }}
        >
          <Icon stroke={1.5} size={20} />
        </Box>
      </ListItemIcon>
    </ListItemButton>
  );
} 