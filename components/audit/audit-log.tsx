'use client';

import { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  TextField,
  Stack,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Pagination,
} from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import {
  IconEye,
  IconFileExport,
  IconFilter,
} from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import API_ENDPOINTS from '@/lib/apis';
import { ExcelExport } from '@/components/shared/excel-export';
import { PDFDocument } from '@/components/shared/pdf-document';
import { AdapterDateFns } from '../../node_modules/@mui/x-date-pickers/AdapterDateFns/AdapterDateFns';

interface AuditLog {
  id: string;
  employeeId: string;
  employeeName: string;
  action: string;
  details: string;
  oldData?: any;
  newData?: any;
  ipAddress?: string;
  createdAt: Date;
}

interface FilterOptions {
  startDate: Date | null;
  endDate: Date | null;
  employeeId: string;
  action: string;
}

export default function AuditLog() {
  const [page, setPage] = useState(1);
  const [openFilters, setOpenFilters] = useState(false);
  const [openDetails, setOpenDetails] = useState(false);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [filters, setFilters] = useState<FilterOptions>({
    startDate: null,
    endDate: null,
    employeeId: '',
    action: '',
  });

  // استدعاء سجل النشاطات
  const { data: auditLogs } = useQuery({
    queryKey: ['audit-logs', page, filters],
    queryFn: async () => {
      const response = await axios.get(API_ENDPOINTS.employeeActivities.getAuditLogs({
        page,
        ...filters,
      }));
      return response.data;
    },
  });

  // استدعاء قائمة الموظفين للفلتر
  const { data: employees } = useQuery({
    queryKey: ['employees'],
    queryFn: async () => {
      const response = await axios.get(API_ENDPOINTS.employees.getAll({}));
      return response.data;
    },
  });

  const handleViewDetails = (log: AuditLog) => {
    setSelectedLog(log);
    setOpenDetails(true);
  };

  const handleCloseDetails = () => {
    setOpenDetails(false);
    setSelectedLog(null);
  };

  const handleFilterChange = (key: keyof FilterOptions, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // تعريف أعمدة ملف Excel
  const excelColumns = [
    { header: 'الموظف', key: 'employeeName' },
    { header: 'الإجراء', key: 'action' },
    { header: 'التفاصيل', key: 'details' },
    { header: 'عنوان IP', key: 'ipAddress' },
    { header: 'التاريخ', key: 'createdAt' },
  ];

  // تحضير بيانات ملف Excel
  const excelData = auditLogs?.logs.map((log: AuditLog) => ({
    employeeName: log.employeeName,
    action: log.action,
    details: log.details,
    ipAddress: log.ipAddress,
    createdAt: new Date(log.createdAt).toLocaleString('ar-SA'),
  }));

  // تحضير بيانات تقرير PDF
  const pdfData = {
    title: 'سجل النشاطات',
    subtitle: `${filters.startDate ? new Date(filters.startDate).toLocaleDateString('ar-SA') : ''} - ${filters.endDate ? new Date(filters.endDate).toLocaleDateString('ar-SA') : ''
      }`,
    data: excelData,
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight="bold">
          سجل النشاطات
        </Typography>
        <Stack direction="row" spacing={2}>
          <ExcelExport
            data={excelData || []}
            columns={excelColumns}
            filename="سجل-النشاطات"
          />
          <Button
            variant="outlined"
            startIcon={<IconFilter size={20} />}
            onClick={() => setOpenFilters(true)}
          >
            تصفية
          </Button>
        </Stack>
      </Box>

      <Paper sx={{ p: 2 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>الموظف</TableCell>
                <TableCell>الإجراء</TableCell>
                <TableCell>التفاصيل</TableCell>
                <TableCell>عنوان IP</TableCell>
                <TableCell>التاريخ</TableCell>
                <TableCell>الإجراءات</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {auditLogs?.logs.map((log: AuditLog) => (
                <TableRow key={log.id}>
                  <TableCell>{log.employeeName}</TableCell>
                  <TableCell>
                    <Chip
                      label={log.action}
                      color={
                        log.action.includes('create')
                          ? 'success'
                          : log.action.includes('update')
                            ? 'warning'
                            : log.action.includes('delete')
                              ? 'error'
                              : 'default'
                      }
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{log.details}</TableCell>
                  <TableCell>{log.ipAddress}</TableCell>
                  <TableCell>
                    {new Date(log.createdAt).toLocaleString('ar-SA')}
                  </TableCell>
                  <TableCell>
                    <IconButton
                      color="primary"
                      onClick={() => handleViewDetails(log)}
                    >
                      <IconEye size={20} />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Pagination
            count={Math.ceil((auditLogs?.total || 0) / 10)}
            page={page}
            onChange={(e, value) => setPage(value)}
            color="primary"
          />
        </Box>
      </Paper>

      {/* نافذة الفلترة */}
      <Dialog
        open={openFilters}
        onClose={() => setOpenFilters(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>تصفية سجل النشاطات</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="من تاريخ"
                  value={filters.startDate}
                  onChange={(date: any) => handleFilterChange('startDate', date)}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                    },
                  }}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} md={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="إلى تاريخ"
                  value={filters.endDate}
                  onChange={(date: any) => handleFilterChange('endDate', date)}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                    },
                  }}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>الموظف</InputLabel>
                <Select
                  value={filters.employeeId}
                  label="الموظف"
                  onChange={(e) =>
                    handleFilterChange('employeeId', e.target.value)
                  }
                >
                  <MenuItem value="">الكل</MenuItem>
                  {employees?.employees.map((employee: any) => (
                    <MenuItem key={employee.id} value={employee.id}>
                      {employee.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>الإجراء</InputLabel>
                <Select
                  value={filters.action}
                  label="الإجراء"
                  onChange={(e) => handleFilterChange('action', e.target.value)}
                >
                  <MenuItem value="">الكل</MenuItem>
                  <MenuItem value="create">إضافة</MenuItem>
                  <MenuItem value="update">تعديل</MenuItem>
                  <MenuItem value="delete">حذف</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenFilters(false)}>إلغاء</Button>
          <Button
            variant="contained"
            onClick={() => {
              setOpenFilters(false);
              setPage(1); // إعادة تعيين الصفحة عند تطبيق الفلتر
            }}
          >
            تطبيق
          </Button>
        </DialogActions>
      </Dialog>

      {/* نافذة تفاصيل النشاط */}
      <Dialog
        open={openDetails}
        onClose={handleCloseDetails}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>تفاصيل النشاط</DialogTitle>
        <DialogContent>
          {selectedLog && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  الموظف
                </Typography>
                <Typography variant="body1">{selectedLog.employeeName}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  الإجراء
                </Typography>
                <Chip
                  label={selectedLog.action}
                  color={
                    selectedLog.action.includes('create')
                      ? 'success'
                      : selectedLog.action.includes('update')
                        ? 'warning'
                        : selectedLog.action.includes('delete')
                          ? 'error'
                          : 'default'
                  }
                  size="small"
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">
                  التفاصيل
                </Typography>
                <Typography variant="body1">{selectedLog.details}</Typography>
              </Grid>
              {selectedLog.oldData && (
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    البيانات القديمة
                  </Typography>
                  <pre
                    style={{
                      backgroundColor: '#f5f5f5',
                      padding: '8px',
                      borderRadius: '4px',
                      overflow: 'auto',
                    }}
                  >
                    {JSON.stringify(selectedLog.oldData, null, 2)}
                  </pre>
                </Grid>
              )}
              {selectedLog.newData && (
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    البيانات الجديدة
                  </Typography>
                  <pre
                    style={{
                      backgroundColor: '#f5f5f5',
                      padding: '8px',
                      borderRadius: '4px',
                      overflow: 'auto',
                    }}
                  >
                    {JSON.stringify(selectedLog.newData, null, 2)}
                  </pre>
                </Grid>
              )}
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">
                  عنوان IP
                </Typography>
                <Typography variant="body1">{selectedLog.ipAddress}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">
                  التاريخ
                </Typography>
                <Typography variant="body1">
                  {new Date(selectedLog.createdAt).toLocaleString('ar-SA')}
                </Typography>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetails}>إغلاق</Button>
          <Button
            variant="contained"
            startIcon={<IconFileExport size={20} />}
            onClick={() => {
              // تصدير التفاصيل كملف PDF
            }}
          >
            تصدير PDF
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 