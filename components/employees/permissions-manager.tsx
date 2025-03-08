'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Grid,
  Paper,
  Button,
  Divider,
  Alert,
} from '@mui/material';
import type { EmployeeRole, EmployeePermissions } from '@/interfaces';

interface PermissionsManagerProps {
  role: EmployeeRole;
  permissions: EmployeePermissions;
  onUpdate: (permissions: EmployeePermissions) => void;
}

const permissionGroups = {
  orders: {
    title: 'إدارة الطلبات',
    permissions: ['viewOrders', 'updateOrders', 'deleteOrders'],
  },
  customers: {
    title: 'إدارة العملاء',
    permissions: ['viewCustomers', 'updateCustomers'],
  },
  services: {
    title: 'إدارة الخدمات',
    permissions: ['viewServices', 'createServices', 'updateServices', 'deleteServices'],
  },
  offers: {
    title: 'إدارة العروض والخصومات',
    permissions: ['viewOffers', 'createOffers', 'updateOffers', 'deleteOffers'],
  },
  categories: {
    title: 'إدارة التصنيفات',
    permissions: ['viewCategories', 'createCategories', 'updateCategories', 'deleteCategories'],
  },
  stores: {
    title: 'إدارة المتاجر',
    permissions: ['viewStores', 'createStores', 'updateStores', 'deleteStores'],
  },
  providers: {
    title: 'إدارة مقدمي الخدمات',
    permissions: ['viewProviders', 'createProviders', 'approveProviders', 'updateProviders', 'deleteProviders'],
  },
  wallets: {
    title: 'إدارة المحافظ والمدفوعات',
    permissions: ['viewWallets', 'manageTransactions'],
  },
  reports: {
    title: 'إدارة التقارير',
    permissions: ['viewBasicReports', 'viewAdvancedReports', 'exportReports'],
  },
  employees: {
    title: 'إدارة الموظفين',
    permissions: ['viewEmployees', 'createEmployees', 'updateEmployees', 'deleteEmployees', 'managePermissions'],
  },
  system: {
    title: 'إدارة النظام',
    permissions: ['manageSettings', 'viewAuditLogs', 'manageBackups'],
  },
};

const permissionLabels: Record<keyof EmployeePermissions, string> = {
  viewOrders: 'عرض الطلبات',
  updateOrders: 'تحديث الطلبات',
  deleteOrders: 'حذف الطلبات',
  viewCustomers: 'عرض العملاء',
  updateCustomers: 'تحديث بيانات العملاء',
  viewServices: 'عرض الخدمات',
  createServices: 'إضافة خدمات',
  updateServices: 'تحديث الخدمات',
  deleteServices: 'حذف الخدمات',
  viewOffers: 'عرض العروض',
  createOffers: 'إضافة عروض',
  updateOffers: 'تحديث العروض',
  deleteOffers: 'حذف العروض',
  viewCategories: 'عرض التصنيفات',
  createCategories: 'إضافة تصنيفات',
  updateCategories: 'تحديث التصنيفات',
  deleteCategories: 'حذف التصنيفات',
  viewStores: 'عرض المتاجر',
  createStores: 'إضافة متاجر',
  updateStores: 'تحديث المتاجر',
  deleteStores: 'حذف المتاجر',
  viewProviders: 'عرض مقدمي الخدمات',
  createProviders: 'إضافة مقدمي خدمات',
  approveProviders: 'اعتماد مقدمي الخدمات',
  updateProviders: 'تحديث مقدمي الخدمات',
  deleteProviders: 'حذف مقدمي الخدمات',
  viewWallets: 'عرض المحافظ',
  manageTransactions: 'إدارة المعاملات المالية',
  viewBasicReports: 'عرض التقارير الأساسية',
  viewAdvancedReports: 'عرض التقارير المتقدمة',
  exportReports: 'تصدير التقارير',
  viewEmployees: 'عرض الموظفين',
  createEmployees: 'إضافة موظفين',
  updateEmployees: 'تحديث الموظفين',
  deleteEmployees: 'حذف الموظفين',
  managePermissions: 'إدارة الصلاحيات',
  manageSettings: 'إدارة إعدادات النظام',
  viewAuditLogs: 'عرض سجلات النظام',
  manageBackups: 'إدارة النسخ الاحتياطية',
};

const defaultPermissions: Record<EmployeeRole, (keyof EmployeePermissions)[]> = {
  admin: Object.keys(permissionLabels) as (keyof EmployeePermissions)[],
  supervisor: [
    'viewOrders',
    'updateOrders',
    'viewCustomers',
    'updateCustomers',
    'viewServices',
    'viewOffers',
    'viewCategories',
    'viewStores',
    'viewProviders',
    'approveProviders',
    'viewWallets',
    'viewBasicReports',
    'viewAdvancedReports',
    'exportReports',
    'viewEmployees',
    'viewAuditLogs',
  ],
  sales: [
    'viewOrders',
    'updateOrders',
    'viewCustomers',
    'viewServices',
    'viewOffers',
    'viewCategories',
    'viewStores',
    'viewProviders',
    'viewBasicReports',
  ],
  customer_service: [
    'viewOrders',
    'updateOrders',
    'viewCustomers',
    'viewServices',
    'viewOffers',
    'viewCategories',
    'viewStores',
    'viewProviders',
  ],
};

export default function PermissionsManager({
  role,
  permissions: initialPermissions,
  onUpdate,
}: PermissionsManagerProps) {
  const [permissions, setPermissions] = useState<EmployeePermissions>(initialPermissions);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setPermissions(initialPermissions);
    setHasChanges(false);
  }, [initialPermissions]);

  const handlePermissionChange = (key: keyof EmployeePermissions) => {
    const newPermissions = {
      ...permissions,
      [key]: !permissions[key],
    };
    setPermissions(newPermissions);
    setHasChanges(true);
  };

  const handleSave = () => {
    onUpdate(permissions);
    setHasChanges(false);
  };

  const handleReset = () => {
    setPermissions(initialPermissions);
    setHasChanges(false);
  };

  const handleApplyDefaults = () => {
    const defaultRolePermissions = defaultPermissions[role];
    const newPermissions = Object.keys(permissionLabels).reduce(
      (acc, key) => ({
        ...acc,
        [key]: defaultRolePermissions.includes(key as keyof EmployeePermissions),
      }),
      {} as EmployeePermissions
    );
    setPermissions(newPermissions);
    setHasChanges(true);
  };

  return (
    <Box>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">
          صلاحيات {role === 'admin' ? 'المدير' : role === 'supervisor' ? 'المشرف' : role === 'sales' ? 'المبيعات' : 'خدمة العملاء'}
        </Typography>
        <Box>
          <Button
            variant="outlined"
            color="primary"
            onClick={handleApplyDefaults}
            sx={{ ml: 1 }}
          >
            تطبيق الصلاحيات الافتراضية
          </Button>
          <Button
            variant="outlined"
            color="warning"
            onClick={handleReset}
            sx={{ ml: 1 }}
            disabled={!hasChanges}
          >
            إلغاء التغييرات
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSave}
            disabled={!hasChanges}
          >
            حفظ التغييرات
          </Button>
        </Box>
      </Box>

      {role === 'admin' && (
        <Alert severity="info" sx={{ mb: 2 }}>
          المدير لديه جميع الصلاحيات بشكل افتراضي
        </Alert>
      )}

      <Grid container spacing={2}>
        {Object.entries(permissionGroups).map(([group, { title, permissions: groupPermissions }]) => (
          <Grid item xs={12} md={6} key={group}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                {title}
              </Typography>
              <Divider sx={{ my: 1 }} />
              <FormGroup>
                {groupPermissions.map((permission) => (
                  <FormControlLabel
                    key={permission}
                    control={
                      <Checkbox
                        checked={permissions[permission as keyof EmployeePermissions] || false}
                        onChange={() => handlePermissionChange(permission as keyof EmployeePermissions)}
                        disabled={role === 'admin'}
                      />
                    }
                    label={permissionLabels[permission as keyof EmployeePermissions]}
                  />
                ))}
              </FormGroup>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {hasChanges && (
        <Alert severity="warning" sx={{ mt: 2 }}>
          لديك تغييرات غير محفوظة. يرجى حفظ التغييرات أو إلغائها.
        </Alert>
      )}
    </Box>
  );
} 