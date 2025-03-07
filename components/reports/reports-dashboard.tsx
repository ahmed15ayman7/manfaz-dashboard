'use client';

import { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Stack,
  Button,
  IconButton,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import {
  IconFileSpreadsheet,
  IconFilePdf,
  IconChartBar,
  IconChartPie,
  IconChartLine,
  IconCash,
  IconUsers,
  IconShoppingCart,
  IconTruck,
  IconBuildingStore,
} from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import API_ENDPOINTS from '@/lib/apis';
import { ExcelExport } from '@/components/shared/excel-export';
import { PDFDocument } from '@/components/shared/pdf-document';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

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
      id={`report-tabpanel-${index}`}
      aria-labelledby={`report-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function ReportsDashboard() {
  const [tabValue, setTabValue] = useState(0);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [reportType, setReportType] = useState('daily');
  const [openExportDialog, setOpenExportDialog] = useState(false);

  // استدعاء إحصائيات لوحة التحكم
  const { data: dashboardStats } = useQuery({
    queryKey: ['dashboard-stats', startDate, endDate, reportType],
    queryFn: async () => {
      const response = await axios.get(API_ENDPOINTS.reports.getDashboardStats({
        startDate,
        endDate,
        type: reportType,
      }));
      return response.data;
    },
  });

  // استدعاء تقرير المبيعات
  const { data: salesReport } = useQuery({
    queryKey: ['sales-report', startDate, endDate, reportType],
    queryFn: async () => {
      const response = await axios.get(API_ENDPOINTS.reports.getSalesReport({
        startDate,
        endDate,
        type: reportType,
      }));
      return response.data;
    },
  });

  // استدعاء تقرير الإيرادات
  const { data: revenueReport } = useQuery({
    queryKey: ['revenue-report', startDate, endDate, reportType],
    queryFn: async () => {
      const response = await axios.get(API_ENDPOINTS.reports.getRevenueReport({
        startDate,
        endDate,
        type: reportType,
      }));
      return response.data;
    },
  });

  // تحضير بيانات الرسوم البيانية
  const chartData = {
    labels: salesReport?.data.map((item: any) => item.date) || [],
    datasets: [
      {
        label: 'المبيعات',
        data: salesReport?.data.map((item: any) => item.total) || [],
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
      },
      {
        label: 'الإيرادات',
        data: revenueReport?.data.map((item: any) => item.total) || [],
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
      },
    ],
  };

  const pieData = {
    labels: ['المبيعات', 'الإيرادات', 'المصروفات'],
    datasets: [
      {
        data: [
          dashboardStats?.totalSales || 0,
          dashboardStats?.totalRevenue || 0,
          dashboardStats?.totalExpenses || 0,
        ],
        backgroundColor: [
          'rgba(75, 192, 192, 0.5)',
          'rgba(53, 162, 235, 0.5)',
          'rgba(255, 99, 132, 0.5)',
        ],
        borderColor: [
          'rgb(75, 192, 192)',
          'rgb(53, 162, 235)',
          'rgb(255, 99, 132)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // تعريف أعمدة ملف Excel
  const excelColumns = [
    { header: 'التاريخ', key: 'date' },
    { header: 'المبيعات', key: 'sales' },
    { header: 'الإيرادات', key: 'revenue' },
    { header: 'المصروفات', key: 'expenses' },
    { header: 'عدد الطلبات', key: 'ordersCount' },
    { header: 'عدد العملاء', key: 'customersCount' },
  ];

  // تحضير بيانات ملف Excel
  const excelData = salesReport?.data.map((item: any) => ({
    date: new Date(item.date).toLocaleDateString('ar-SA'),
    sales: item.total,
    revenue: revenueReport?.data.find((r: any) => r.date === item.date)?.total || 0,
    expenses: item.expenses,
    ordersCount: item.ordersCount,
    customersCount: item.customersCount,
  }));

  // تحضير بيانات تقرير PDF
  const pdfData = {
    title: 'تقرير المبيعات والإيرادات',
    subtitle: `${startDate ? new Date(startDate).toLocaleDateString('ar-SA') : ''} - ${
      endDate ? new Date(endDate).toLocaleDateString('ar-SA') : ''
    }`,
    data: excelData,
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight="bold">
          التقارير والإحصائيات
        </Typography>
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            startIcon={<IconFileSpreadsheet size={20} />}
            onClick={() => setOpenExportDialog(true)}
          >
            تصدير
          </Button>
        </Stack>
      </Box>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center">
                <IconCash size={40} color="var(--primary)" />
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    إجمالي المبيعات
                  </Typography>
                  <Typography variant="h6">
                    {dashboardStats?.totalSales?.toLocaleString('ar-SA')} ريال
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center">
                <IconShoppingCart size={40} color="var(--success)" />
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    عدد الطلبات
                  </Typography>
                  <Typography variant="h6">
                    {dashboardStats?.ordersCount?.toLocaleString('ar-SA')}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center">
                <IconUsers size={40} color="var(--warning)" />
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    عدد العملاء
                  </Typography>
                  <Typography variant="h6">
                    {dashboardStats?.customersCount?.toLocaleString('ar-SA')}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center">
                <IconBuildingStore size={40} color="var(--info)" />
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    عدد المتاجر
                  </Typography>
                  <Typography variant="h6">
                    {dashboardStats?.storesCount?.toLocaleString('ar-SA')}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper sx={{ mb: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
            <Tab label="المبيعات والإيرادات" />
            <Tab label="تحليل البيانات" />
          </Tabs>
        </Box>

        <Box sx={{ p: 2 }}>
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} md={4}>
              <DatePicker
                label="من تاريخ"
                value={startDate}
                onChange={(date) => setStartDate(date)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <DatePicker
                label="إلى تاريخ"
                value={endDate}
                onChange={(date) => setEndDate(date)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>نوع التقرير</InputLabel>
                <Select
                  value={reportType}
                  label="نوع التقرير"
                  onChange={(e) => setReportType(e.target.value)}
                >
                  <MenuItem value="daily">يومي</MenuItem>
                  <MenuItem value="weekly">أسبوعي</MenuItem>
                  <MenuItem value="monthly">شهري</MenuItem>
                  <MenuItem value="yearly">سنوي</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                تحليل المبيعات والإيرادات
              </Typography>
              <Box sx={{ height: 400 }}>
                <Line
                  data={chartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'top' as const,
                      },
                    },
                  }}
                />
              </Box>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom>
                توزيع المبيعات والإيرادات
              </Typography>
              <Box sx={{ height: 400 }}>
                <Pie
                  data={pieData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'top' as const,
                      },
                    },
                  }}
                />
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom>
                تحليل الطلبات
              </Typography>
              <Box sx={{ height: 400 }}>
                <Bar
                  data={{
                    labels: salesReport?.data.map((item: any) => item.date) || [],
                    datasets: [
                      {
                        label: 'عدد الطلبات',
                        data: salesReport?.data.map((item: any) => item.ordersCount) || [],
                        backgroundColor: 'rgba(75, 192, 192, 0.5)',
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'top' as const,
                      },
                    },
                  }}
                />
              </Box>
            </Grid>
          </Grid>
        </TabPanel>
      </Paper>

      {/* نافذة التصدير */}
      <Dialog
        open={openExportDialog}
        onClose={() => setOpenExportDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>تصدير التقرير</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<IconFileSpreadsheet size={20} />}
                onClick={() => {
                  // تصدير إلى Excel
                }}
              >
                تصدير Excel
              </Button>
            </Grid>
            <Grid item xs={12} md={6}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<IconFilePdf size={20} />}
                onClick={() => {
                  // تصدير إلى PDF
                }}
              >
                تصدير PDF
              </Button>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenExportDialog(false)}>إغلاق</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 