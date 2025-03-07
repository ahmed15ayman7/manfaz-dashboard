'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  Alert,
} from '@mui/material';
import { IconChevronDown } from '@tabler/icons-react';
import { EmployeePermissions, EmployeeRole } from '@/interfaces';

interface PermissionsManagerProps {
  role: EmployeeRole;
  permissions: EmployeePermissions;
  onUpdate: (permissions: EmployeePermissions) => void;
}

export default function PermissionsManager({
  role,
  permissions,
  onUpdate,
}: PermissionsManagerProps) {
  const [currentPermissions, setCurrentPermissions] = useState<EmployeePermissions>(permissions);

  // تحديث الصلاحيات عند تغيير الدور
  useEffect(() => {
    const defaultPermissions = getDefaultPermissionsByRole(role);
    setCurrentPermissions(defaultPermissions);
  }, [role]);

  // الحصول على الصلاحيات الافتراضية حسب الدور
  const getDefaultPermissionsByRole = (role: EmployeeRole): EmployeePermissions => {
    switch (role) {
      case 'customer_service':
        return {
          // إدارة الطلبات
          viewOrders: true,
          updateOrders: true,
          deleteOrders: false,

          // إدارة العملاء
          viewCustomers: true,
          updateCustomers: false,

          // إدارة الخدمات
          viewServices: true,
          createServices: false,
          updateServices: false,
          deleteServices: false,

          // إدارة العروض والخصومات
          viewOffers: true,
          createOffers: false,
          updateOffers: false,
          deleteOffers: false,

          // إدارة التصنيفات
          viewCategories: true,
          createCategories: false,
          updateCategories: false,
          deleteCategories: false,

          // إدارة المتاجر
          viewStores: true,
          createStores: false,
          updateStores: false,
          deleteStores: false,

          // إدارة مقدمي الخدمات
          viewProviders: true,
          approveProviders: false,
          updateProviders: false,
          deleteProviders: false,

          // إدارة المحافظ والمدفوعات
          viewWallets: false,
          manageTransactions: false,

          // إدارة التقارير
          viewBasicReports: true,
          viewAdvancedReports: false,
          exportReports: false,

          // إدارة الموظفين
          viewEmployees: false,
          createEmployees: false,
          updateEmployees: false,
          deleteEmployees: false,
          managePermissions: false,

          // إدارة النظام
          manageSettings: false,
          viewAuditLogs: false,
          manageBackups: false,
        };

      case 'sales':
        return {
          ...getDefaultPermissionsByRole('customer_service'),
          createServices: true,
          updateServices: true,
          createOffers: true,
          updateOffers: true,
          viewAdvancedReports: true,
          exportReports: true,
        };

      case 'supervisor':
        return {
          ...getDefaultPermissionsByRole('sales'),
          deleteOrders: true,
          updateCustomers: true,
          deleteServices: true,
          deleteOffers: true,
          createCategories: true,
          updateCategories: true,
          deleteCategories: true,
          createStores: true,
          updateStores: true,
          deleteStores: true,
          approveProviders: true,
          updateProviders: true,
          deleteProviders: true,
          viewWallets: true,
          manageTransactions: true,
          viewEmployees: true,
          createEmployees: true,
          updateEmployees: true,
          viewAuditLogs: true,
        };

      case 'admin':
        return {
          viewOrders: true,
          updateOrders: true,
          deleteOrders: true,
          viewCustomers: true,
          updateCustomers: true,
          viewServices: true,
          createServices: true,
          updateServices: true,
          deleteServices: true,
          viewOffers: true,
          createOffers: true,
          updateOffers: true,
          deleteOffers: true,
          viewCategories: true,
          createCategories: true,
          updateCategories: true,
          deleteCategories: true,
          viewStores: true,
          createStores: true,
          updateStores: true,
          deleteStores: true,
          viewProviders: true,
          approveProviders: true,
          updateProviders: true,
          deleteProviders: true,
          viewWallets: true,
          manageTransactions: true,
          viewBasicReports: true,
          viewAdvancedReports: true,
          exportReports: true,
          viewEmployees: true,
          createEmployees: true,
          updateEmployees: true,
          deleteEmployees: true,
          managePermissions: true,
          manageSettings: true,
          viewAuditLogs: true,
          manageBackups: true,
        };

      default:
        return {} as EmployeePermissions;
    }
  };

  const handlePermissionChange = (key: keyof EmployeePermissions) => {
    const updatedPermissions = {
      ...currentPermissions,
      [key]: !currentPermissions[key],
    };
    setCurrentPermissions(updatedPermissions);
    onUpdate(updatedPermissions);
  };

  const permissionGroups = [
    {
      title: 'إدارة الطلبات',
      permissions: [
        { key: 'viewOrders', label: 'عرض الطلبات' },
        { key: 'updateOrders', label: 'تحديث الطلبات' },
        { key: 'deleteOrders', label: 'حذف الطلبات' },
      ],
    },
    {
      title: 'إدارة العملاء',
      permissions: [
        { key: 'viewCustomers', label: 'عرض العملاء' },
        { key: 'updateCustomers', label: 'تحديث بيانات العملاء' },
      ],
    },
    {
      title: 'إدارة الخدمات',
      permissions: [
        { key: 'viewServices', label: 'عرض الخدمات' },
        { key: 'createServices', label: 'إضافة خدمات' },
        { key: 'updateServices', label: 'تعديل الخدمات' },
        { key: 'deleteServices', label: 'حذف الخدمات' },
      ],
    },
    {
      title: 'إدارة العروض والخصومات',
      permissions: [
        { key: 'viewOffers', label: 'عرض العروض' },
        { key: 'createOffers', label: 'إضافة عروض' },
        { key: 'updateOffers', label: 'تعديل العروض' },
        { key: 'deleteOffers', label: 'حذف العروض' },
      ],
    },
    {
      title: 'إدارة التصنيفات',
      permissions: [
        { key: 'viewCategories', label: 'عرض التصنيفات' },
        { key: 'createCategories', label: 'إضافة تصنيفات' },
        { key: 'updateCategories', label: 'تعديل التصنيفات' },
        { key: 'deleteCategories', label: 'حذف التصنيفات' },
      ],
    },
    {
      title: 'إدارة المتاجر',
      permissions: [
        { key: 'viewStores', label: 'عرض المتاجر' },
        { key: 'createStores', label: 'إضافة متاجر' },
        { key: 'updateStores', label: 'تعديل المتاجر' },
        { key: 'deleteStores', label: 'حذف المتاجر' },
      ],
    },
    {
      title: 'إدارة مقدمي الخدمات',
      permissions: [
        { key: 'viewProviders', label: 'عرض مقدمي الخدمات' },
        { key: 'approveProviders', label: 'الموافقة على مقدمي الخدمات' },
        { key: 'updateProviders', label: 'تعديل بيانات مقدمي الخدمات' },
        { key: 'deleteProviders', label: 'حذف مقدمي الخدمات' },
      ],
    },
    {
      title: 'إدارة المحافظ والمدفوعات',
      permissions: [
        { key: 'viewWallets', label: 'عرض المحافظ' },
        { key: 'manageTransactions', label: 'إدارة المعاملات المالية' },
      ],
    },
    {
      title: 'إدارة التقارير',
      permissions: [
        { key: 'viewBasicReports', label: 'عرض التقارير الأساسية' },
        { key: 'viewAdvancedReports', label: 'عرض التقارير المتقدمة' },
        { key: 'exportReports', label: 'تصدير التقارير' },
      ],
    },
    {
      title: 'إدارة الموظفين',
      permissions: [
        { key: 'viewEmployees', label: 'عرض الموظفين' },
        { key: 'createEmployees', label: 'إضافة موظفين' },
        { key: 'updateEmployees', label: 'تعديل بيانات الموظفين' },
        { key: 'deleteEmployees', label: 'حذف الموظفين' },
        { key: 'managePermissions', label: 'إدارة الصلاحيات' },
      ],
    },
    {
      title: 'إدارة النظام',
      permissions: [
        { key: 'manageSettings', label: 'إدارة إعدادات النظام' },
        { key: 'viewAuditLogs', label: 'عرض سجل النشاطات' },
        { key: 'manageBackups', label: 'إدارة النسخ الاحتياطية' },
      ],
    },
  ];

  return (
    <Box>
      <Alert severity="info" sx={{ mb: 2 }}>
        الصلاحيات المعروضة هي الصلاحيات الافتراضية للدور المحدد. يمكنك تعديلها حسب الحاجة.
      </Alert>

      {permissionGroups.map((group) => (
        <Accordion key={group.title} defaultExpanded>
          <AccordionSummary expandIcon={<IconChevronDown />}>
            <Typography variant="subtitle1" fontWeight="medium">
              {group.title}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <FormGroup>
              {group.permissions.map((permission) => (
                <FormControlLabel
                  key={permission.key}
                  control={
                    <Checkbox
                      checked={currentPermissions[permission.key as keyof EmployeePermissions]}
                      onChange={() =>
                        handlePermissionChange(permission.key as keyof EmployeePermissions)
                      }
                    />
                  }
                  label={permission.label}
                />
              ))}
            </FormGroup>
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
} 