'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ReactNode, useEffect } from 'react';
import { EmployeePermissions } from '@/interfaces';

interface PermissionGuardProps {
  children: ReactNode;
  requiredPermissions: Array<keyof EmployeePermissions>;
  requireAll?: boolean;
  fallback?: ReactNode;
}

export function PermissionGuard({
  children,
  requiredPermissions,
  requireAll = true,
  fallback = null
}: PermissionGuardProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const permissions = session?.user?.permissions as EmployeePermissions | undefined;

  useEffect(() => {
    if (!session) {
      router.push('/auth/login');
      return;
    }

    if (!permissions) {
      router.push('/dashboard/unauthorized');
      return;
    }

    const hasPermission = requireAll
      ? requiredPermissions.every(permission => permissions[permission])
      : requiredPermissions.some(permission => permissions[permission]);

    if (!hasPermission) {
      router.push('/dashboard/unauthorized');
    }
  }, [session, permissions, requiredPermissions, requireAll, router]);

  if (!session || !permissions) {
    return null;
  }

  const hasPermission = requireAll
    ? requiredPermissions.every(permission => permissions[permission])
    : requiredPermissions.some(permission => permissions[permission]);

  return hasPermission ? <>{children}</> : <>{fallback}</>;
} 