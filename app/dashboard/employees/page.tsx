'use client';

import { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Grid,
  Alert,
  Pagination,
  Stack,
  Tab,
  Tabs,
  Skeleton,
} from '@mui/material';
import {
  IconEdit,
  IconTrash,
  IconPlus,
  IconUserCircle,
  IconActivity,
  IconFileReport,
  IconLock,
} from '@tabler/icons-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import API_ENDPOINTS from '@/lib/apis';
import { ExcelExport } from '@/components/shared/excel-export';
import { PDFDocument } from '@/components/shared/pdf-document';
import { Employee, EmployeeRole, EmployeePermissions } from '@/interfaces';
import PermissionsManager from '@/components/employees/permissions-manager';
import { PermissionGuard } from '@/components/common/PermissionGuard';
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`employee-tabpanel-${index}`}
      aria-labelledby={`employee-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function EmployeesPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [openPrintDialog, setOpenPrintDialog] = useState(false);
  const [openActivityDialog, setOpenActivityDialog] = useState(false);
  const [openPermissionsDialog, setOpenPermissionsDialog] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'customer_service' as EmployeeRole,
    permissions: {} as EmployeePermissions,
  });

  // استدعاء قائمة الموظفين
  const { data: employeesData, isLoading } = useQuery({
    queryKey: ['employees', page, search],
    queryFn: async () => {
      const response = await axios.get(API_ENDPOINTS.employees.getAll({ page, search }));
      return response.data.data;
    },
  });

  // استدعاء نشاطات الموظف
  const { data: activitiesData, isLoading: isActivitiesLoading } = useQuery({
    queryKey: ['employee-activities', selectedEmployee?.id],
    queryFn: async () => {
      if (!selectedEmployee) return null;
      const response = await axios.get(
        API_ENDPOINTS.employeeActivities.getByEmployee(selectedEmployee.id, {})
      );
      return response.data.data;
    },
    enabled: !!selectedEmployee,
  });

  // إضافة موظف جديد
  const addMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await axios.post(API_ENDPOINTS.employees.create({}), data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      handleCloseDialog();
    },
  });

  // تحديث موظف
  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await axios.put(
        API_ENDPOINTS.employees.update(selectedEmployee!.id, {}),
        data
      );
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      handleCloseDialog();
    },
  });

  // حذف موظف
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await axios.delete(API_ENDPOINTS.employees.delete(id, {}));
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });

  // تحديث صلاحيات الموظف
  const updatePermissionsMutation = useMutation({
    mutationFn: async (permissions: EmployeePermissions) => {
      const response = await axios.put(
        API_ENDPOINTS.employees.updatePermissions(selectedEmployee!.id, {}),
        { permissions }
      );
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      setOpenPermissionsDialog(false);
    },
  });

  const handleOpenDialog = (employee?: Employee) => {
    if (employee) {
      setSelectedEmployee(employee);
      setFormData({
        name: employee.name,
        email: employee.email,
        phone: employee.phone,
        password: '',
        role: employee.role,
        permissions: employee.permissions,
      });
    } else {
      setSelectedEmployee(null);
      setFormData({
        name: '',
        email: '',
        phone: '',
        password: '',
        role: 'customer_service',
        permissions: {} as EmployeePermissions,
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedEmployee(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedEmployee) {
      await updateMutation.mutateAsync(formData);
    } else {
      await addMutation.mutateAsync(formData);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا الموظف؟')) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const handleUpdatePermissions = async (permissions: EmployeePermissions) => {
    await updatePermissionsMutation.mutateAsync(permissions);
  };

  const handleViewActivities = (employee: Employee) => {
    setSelectedEmployee(employee);
    setOpenActivityDialog(true);
  };

  const handlePrintReport = (employee: Employee) => {
    setSelectedEmployee(employee);
    setOpenPrintDialog(true);
  };

  const handleOpenPermissions = (employee: Employee) => {
    setSelectedEmployee(employee);
    setOpenPermissionsDialog(true);
  };

  // تعريف أعمدة ملف Excel
  const excelColumns = [
    { header: 'الاسم', key: 'name' },
    { header: 'البريد الإلكتروني', key: 'email' },
    { header: 'رقم الهاتف', key: 'phone' },
    { header: 'الدور', key: 'role' },
    { header: 'الحالة', key: 'isActive' },
    { header: 'تاريخ الإنشاء', key: 'createdAt' },
  ];
  if (isLoading || isActivitiesLoading) {
    return (
      <Box>
        <Box sx={{ mb: 4 }}>
          <Skeleton variant="text" width={200} height={40} />
        </Box>
        <Grid container spacing={3} mb={4}>
          {[...Array(4)].map((_, index) => (
            <Grid item xs={12} md={3} key={index}>
              <Skeleton variant="rectangular" height={100} />
            </Grid>
          ))}
        </Grid>
        <Skeleton variant="rectangular" height={400} />
      </Box>
    );
  }
  // تحضير بيانات ملف Excel
  const excelData = employeesData?.employees.map((employee: Employee) => ({
    name: employee.name,
    email: employee.email,
    phone: employee.phone,
    role: employee.role,
    isActive: employee.isActive ? 'نشط' : 'غير نشط',
    createdAt: new Date(employee.createdAt).toLocaleDateString('ar-SA'),
  }));

  // تحضير بيانات تقرير PDF
  const pdfData = selectedEmployee ? {
    title: `تقرير الموظف: ${selectedEmployee.name}`,
    subtitle: 'تفاصيل الموظف ونشاطاته',
    data: {
      name: selectedEmployee.name,
      email: selectedEmployee.email,
      phone: selectedEmployee.phone,
      role: selectedEmployee.role,
      isActive: selectedEmployee.isActive ? 'نشط' : 'غير نشط',
      createdAt: new Date(selectedEmployee.createdAt).toLocaleDateString('ar-SA'),
      activities: activitiesData?.activities || [],
    },
  } : null;

  return (
    <PermissionGuard requiredPermissions={['viewEmployees', 'createEmployees', 'updateEmployees', 'deleteEmployees', "managePermissions"]}>
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" fontWeight="bold">
            إدارة الموظفين
          </Typography>
          <Stack direction="row" sx={{
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: { xs: 'center', md: 'flex-start' },
          }} spacing={2}>
            <ExcelExport
              data={excelData || []}
              columns={excelColumns}
              filename="الموظفين"
            />
            <Button
              variant="contained"
              startIcon={<IconPlus size={20} />}
              onClick={() => handleOpenDialog()}
            >
              إضافة موظف
            </Button>
          </Stack>
        </Box>

        <Paper sx={{ p: 2 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
            <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
              <Tab label="قائمة الموظفين" />
              <Tab label="سجل النشاطات" />
            </Tabs>
          </Box>

          <TabPanel value={tabValue} index={0}>
            <TextField
              fullWidth
              label="بحث"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ mb: 2 }}
            />

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>الاسم</TableCell>
                    <TableCell>البريد الإلكتروني</TableCell>
                    <TableCell>رقم الهاتف</TableCell>
                    <TableCell>الدور</TableCell>
                    <TableCell>الحالة</TableCell>
                    <TableCell>الإجراءات</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {employeesData?.employees.map((employee: Employee) => (
                    <TableRow key={employee.id}>
                      <TableCell>{employee.name}</TableCell>
                      <TableCell>{employee.email}</TableCell>
                      <TableCell>{employee.phone}</TableCell>
                      <TableCell>
                        <Chip
                          label={employee.role}
                          color={
                            employee.role === 'admin'
                              ? 'error'
                              : employee.role === 'supervisor'
                                ? 'warning'
                                : employee.role === 'sales'
                                  ? 'info'
                                  : 'success'
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={employee.isActive ? 'نشط' : 'غير نشط'}
                          color={employee.isActive ? 'success' : 'error'}
                        />
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1}>
                          <IconButton
                            color="primary"
                            onClick={() => handleViewActivities(employee)}
                          >
                            <IconActivity size={20} />
                          </IconButton>
                          <IconButton
                            color="info"
                            onClick={() => handlePrintReport(employee)}
                          >
                            <IconFileReport size={20} />
                          </IconButton>
                          <IconButton
                            color="secondary"
                            onClick={() => handleOpenPermissions(employee)}
                          >
                            <IconLock size={20} />
                          </IconButton>
                          <IconButton
                            color="warning"
                            onClick={() => handleOpenDialog(employee)}
                          >
                            <IconEdit size={20} />
                          </IconButton>
                          <IconButton
                            color="error"
                            onClick={() => handleDelete(employee.id)}
                          >
                            <IconTrash size={20} />
                          </IconButton>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <Pagination
                count={Math.ceil((employeesData?.total || 0) / 10)}
                page={page}
                onChange={(e, value) => setPage(value)}
                color="primary"
              />
            </Box>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>الموظف</TableCell>
                    <TableCell>الإجراء</TableCell>
                    <TableCell>التفاصيل</TableCell>
                    <TableCell>التاريخ</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {activitiesData?.activities.map((activity: any) => (
                    <TableRow key={activity.id}>
                      <TableCell>{activity.employeeName}</TableCell>
                      <TableCell>{activity.action}</TableCell>
                      <TableCell>{activity.details}</TableCell>
                      <TableCell>
                        {new Date(activity.createdAt).toLocaleString('ar-SA')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>
        </Paper>

        {/* نافذة إضافة/تعديل موظف */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
          <DialogTitle>
            {selectedEmployee ? 'تعديل موظف' : 'إضافة موظف جديد'}
          </DialogTitle>
          <form onSubmit={handleSubmit}>
            <DialogContent>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="الاسم"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="البريد الإلكتروني"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="رقم الهاتف"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="كلمة المرور"
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    required={!selectedEmployee}
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>الدور</InputLabel>
                    <Select
                      value={formData.role}
                      label="الدور"
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          role: e.target.value as EmployeeRole,
                        })
                      }
                    >
                      <MenuItem value="customer_service">خدمة العملاء</MenuItem>
                      <MenuItem value="sales">المبيعات</MenuItem>
                      <MenuItem value="supervisor">مشرف</MenuItem>
                      <MenuItem value="admin">مدير</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>إلغاء</Button>
              <Button
                type="submit"
                variant="contained"
                disabled={addMutation.isPending || updateMutation.isPending}
              >
                {selectedEmployee ? 'تحديث' : 'إضافة'}
              </Button>
            </DialogActions>
          </form>
        </Dialog>

        {/* نافذة عرض نشاطات الموظف */}
        <Dialog
          open={openActivityDialog}
          onClose={() => setOpenActivityDialog(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>نشاطات الموظف</DialogTitle>
          <DialogContent>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>الإجراء</TableCell>
                    <TableCell>التفاصيل</TableCell>
                    <TableCell>التاريخ</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {activitiesData?.activities.map((activity: any) => (
                    <TableRow key={activity.id}>
                      <TableCell>{activity.action}</TableCell>
                      <TableCell>{activity.details}</TableCell>
                      <TableCell>
                        {new Date(activity.createdAt).toLocaleString('ar-SA')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenActivityDialog(false)}>إغلاق</Button>
          </DialogActions>
        </Dialog>

        {/* نافذة طباعة التقرير */}
        <Dialog
          open={openPrintDialog}
          onClose={() => setOpenPrintDialog(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>تقرير الموظف</DialogTitle>
          <DialogContent>
            {pdfData && (
              <PDFDocument
                title={pdfData.title}
                template="report"
                data={pdfData}
              />
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenPrintDialog(false)}>إغلاق</Button>
          </DialogActions>
        </Dialog>

        {/* نافذة إدارة الصلاحيات */}
        <Dialog
          open={openPermissionsDialog}
          onClose={() => setOpenPermissionsDialog(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>إدارة صلاحيات الموظف</DialogTitle>
          <DialogContent>
            {selectedEmployee && (
              <PermissionsManager
                role={selectedEmployee.role}
                permissions={selectedEmployee.permissions}
                onUpdate={handleUpdatePermissions}
              />
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenPermissionsDialog(false)}>إغلاق</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </PermissionGuard>
  );
} 