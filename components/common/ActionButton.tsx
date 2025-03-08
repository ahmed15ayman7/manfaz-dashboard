'use client';

import { Button, ButtonProps, Tooltip } from '@mui/material';
import { useSession } from 'next-auth/react';
import { EmployeePermissions } from '@/interfaces';
import { ReactNode } from 'react';

interface ActionButtonProps extends Omit<ButtonProps, 'children'> {
  children: ReactNode;
  requiredPermissions: Array<keyof EmployeePermissions>;
  requireAll?: boolean;
  hideOnNoPermission?: boolean;
  tooltipText?: string;
}

export function ActionButton({
  children,
  requiredPermissions,
  requireAll = true,
  hideOnNoPermission = false,
  tooltipText = 'ليس لديك صلاحية لتنفيذ هذا الإجراء',
  ...buttonProps
}: ActionButtonProps) {
  const { data: session } = useSession();
  const permissions = session?.user?.permissions as EmployeePermissions | undefined;

  if (!permissions) {
    return hideOnNoPermission ? null : (
      <Tooltip title={tooltipText}>
        <span>
          <Button {...buttonProps} disabled>
            {children}
          </Button>
        </span>
      </Tooltip>
    );
  }

  const hasPermission = requireAll
    ? requiredPermissions.every(permission => permissions[permission])
    : requiredPermissions.some(permission => permissions[permission]);

  if (!hasPermission && hideOnNoPermission) {
    return null;
  }

  if (!hasPermission) {
    return (
      <Tooltip title={tooltipText}>
        <span>
          <Button {...buttonProps} disabled>
            {children}
          </Button>
        </span>
      </Tooltip>
    );
  }

  return <Button {...buttonProps}>{children}</Button>;
} 