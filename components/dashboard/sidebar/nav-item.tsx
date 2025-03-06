'use client';

import { ListItemButton, ListItemIcon, ListItemText } from "@mui/material";
import Link from "next/link";
import { Icon } from "@tabler/icons-react";

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
        backgroundColor: active ? "primary.lighter" : "transparent",
        color: active ? "primary.main" : "text.primary",
        "&:hover": {
          backgroundColor: "primary.lighter",
        },
      }}
    >
      <ListItemIcon
        sx={{
          minWidth: 40,
          color: active ? "primary.main" : "text.primary",
        }}
      >
        <Icon stroke={1.5} size={20} />
      </ListItemIcon>
      <ListItemText
        primary={title}
        primaryTypographyProps={{
          fontSize: 14,
          fontWeight: active ? 600 : 400,
        }}
      />
    </ListItemButton>
  );
} 