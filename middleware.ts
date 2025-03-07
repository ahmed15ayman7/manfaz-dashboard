import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// تعريف المسارات المحمية وصلاحياتها
const protectedRoutes = {
  '/dashboard/employees': {
    roles: ['admin', 'supervisor'],
    permissions: ['viewEmployees'],
  },
  '/dashboard/orders': {
    roles: ['admin', 'supervisor', 'sales', 'customer_service'],
    permissions: ['viewOrders'],
  },
  '/dashboard/services': {
    roles: ['admin', 'supervisor', 'sales'],
    permissions: ['viewServices'],
  },
  '/dashboard/categories': {
    roles: ['admin', 'supervisor'],
    permissions: ['viewCategories'],
  },
  '/dashboard/stores': {
    roles: ['admin', 'supervisor'],
    permissions: ['viewStores'],
  },
  '/dashboard/providers': {
    roles: ['admin', 'supervisor', 'sales'],
    permissions: ['viewProviders'],
  },
  '/dashboard/wallets': {
    roles: ['admin', 'supervisor'],
    permissions: ['viewWallets'],
  },
  '/dashboard/reports': {
    roles: ['admin', 'supervisor', 'sales'],
    permissions: ['viewBasicReports'],
  },
  '/dashboard/settings': {
    roles: ['admin'],
    permissions: ['manageSettings'],
  },
  '/dashboard/audit-logs': {
    roles: ['admin', 'supervisor'],
    permissions: ['viewAuditLogs'],
  },
};

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  // التحقق من وجود توكن صالح
  if (!token) {
    const url = new URL('/auth/login', request.url);
    url.searchParams.set('callbackUrl', request.url);
    return NextResponse.redirect(url);
  }

  // التحقق من الصلاحيات للمسارات المحمية
  const path = request.nextUrl.pathname;
  const route = Object.entries(protectedRoutes).find(([route]) =>
    path.startsWith(route)
  );

  if (route) {
    const [, { roles, permissions }] = route;
    const userRole = token.role as string;
    const userPermissions = token.permissions as string[];

    // التحقق من الدور
    if (!roles.includes(userRole)) {
      return NextResponse.redirect(new URL('/404', request.url));
    }

    // التحقق من الصلاحيات
    if (!permissions.some((permission) => userPermissions.includes(permission))) {
      return NextResponse.redirect(new URL('/404', request.url));
    }
  }

  return NextResponse.next();
}

// تكوين المسارات التي سيتم تطبيق الحماية عليها
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/dashboard/:path*',
  ],
}; 