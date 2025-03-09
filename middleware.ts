import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { EmployeePermissions } from './interfaces';
import { Employee } from './interfaces';
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
  '/dashboard/workers': {
    roles: ['admin', 'supervisor'],
    permissions: ['viewWorkers', 'createWorkers', 'updateWorkers', 'deleteWorkers', "managePermissions"],
  },
  '/dashboard/users': {
    roles: ['admin', 'supervisor'],
    permissions: ['viewUsers', 'createUsers', 'updateUsers', 'deleteUsers', "managePermissions"],
  },
  '/dashboard/drivers': {
    roles: ['admin', 'supervisor'],
    permissions: ['viewDrivers', 'createDrivers', 'updateDrivers', 'deleteDrivers', "managePermissions"],
  },
  '/dashboard/locations': {
    roles: ['admin', 'supervisor'],
    permissions: ['viewLocations', 'createLocations', 'updateLocations', 'deleteLocations', "managePermissions"],
  },
  '/dashboard/schedules': {
    roles: ['admin', 'supervisor'],
    permissions: ['viewSchedules', 'createSchedules', 'updateSchedules', 'deleteSchedules', "managePermissions"],
  },
  '/dashboard/reviews': {
    roles: ['admin', 'supervisor'],
    permissions: ['viewReviews', 'createReviews', 'updateReviews', 'deleteReviews', "managePermissions"],
  },
  '/dashboard/payments': {
    roles: ['admin', 'supervisor'],
    permissions: ['viewPayments', 'createPayments', 'updatePayments', 'deletePayments', "managePermissions"],
  },
  '/dashboard/coupons': {
    roles: ['admin', 'supervisor'],
    permissions: ['viewCoupons', 'createCoupons', 'updateCoupons', 'deleteCoupons', "managePermissions"],
  },
  '/dashboard/discounts': {
    roles: ['admin', 'supervisor'],
    permissions: ['viewDiscounts', 'createDiscounts', 'updateDiscounts', 'deleteDiscounts', "managePermissions"],
  },
  '/dashboard/gift-cards': {
    roles: ['admin', 'supervisor'],
    permissions: ['viewGiftCards', 'createGiftCards', 'updateGiftCards', 'deleteGiftCards', "managePermissions"],
  },
  '/dashboard/rewards': {
    roles: ['admin', 'supervisor'],
    permissions: ['viewRewards', 'createRewards', 'updateRewards', 'deleteRewards', "managePermissions"],
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
    const userRole = (token?.user as Employee)?.role as string;
    const userPermissions = (token?.user as Employee).permissions as EmployeePermissions;

    // التحقق من الدور
    if (!roles.includes(userRole)) {
      return NextResponse.redirect(new URL('/404', request.url));
    }

    // التحقق من الصلاحيات
    if (!permissions.some((permission) => userPermissions[permission as keyof EmployeePermissions])) {
      return NextResponse.redirect(new URL('/dashboard/unauthorized', request.url));
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