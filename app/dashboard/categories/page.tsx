'use client';

import { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Button,
  TextField,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar,
  Chip,
} from '@mui/material';
import { IconPlus, IconEdit, IconTrash, IconSearch, IconCategory, IconTruck, IconPrinter } from '@tabler/icons-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import API_ENDPOINTS from '@/lib/apis';
import { Category } from '@/interfaces';
import { ImageUpload } from '@/components/shared/image-upload';
import { ExcelExport } from '@/components/shared/excel-export';
import { PDFDocument, PrintButton } from '@/components/shared/pdf-document';

export default function CategoriesPage() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryData, setCategoryData] = useState<Partial<Category>>({
    name: '',
    subName: '',
    description: '',
    info: '',
    imageUrl: '',
    type: 'service',
    status: 'active',
    sortOrder: 0,
  });
  const [openPrintDialog, setOpenPrintDialog] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  const queryClient = useQueryClient();

  // استدعاء البيانات
  const { data: categories } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await axios.get(API_ENDPOINTS.categories.getAll({}));
      return response.data;
    },
  });

  // إضافة تصنيف جديد
  const addCategoryMutation = useMutation({
    mutationFn: async (category: typeof categoryData) => {
      const response = await axios.post(API_ENDPOINTS.categories.create({}), category);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      handleCloseDialog();
    },
  });

  // تحديث تصنيف
  const updateCategoryMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof categoryData }) => {
      const response = await axios.put(API_ENDPOINTS.categories.update(id, {}), data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      handleCloseDialog();
    },
  });

  // حذف تصنيف
  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await axios.delete(API_ENDPOINTS.categories.delete(id, {}));
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });

  // تعريف أعمدة ملف Excel
  const excelColumns = [
    { header: 'الاسم', key: 'name', width: 30 },
    { header: 'الاسم الفرعي', key: 'subName', width: 30 },
    { header: 'النوع', key: 'type', width: 15 },
    { header: 'الحالة', key: 'status', width: 15 },
    { header: 'الترتيب', key: 'sortOrder', width: 10 },
    { header: 'عدد الخدمات', key: 'servicesCount', width: 15 },
    { header: 'عدد المتاجر', key: 'storesCount', width: 15 },
  ];

  // تحضير بيانات Excel
  const excelData = categories?.map(category => ({
    name: category.name,
    subName: category.subName || '',
    type: category.type === 'service' ? 'خدمة' : 'توصيل',
    status: category.status === 'active' ? 'نشط' :
            category.status === 'inactive' ? 'غير نشط' : 'مؤرشف',
    sortOrder: category.sortOrder,
    servicesCount: category.services?.length || 0,
    storesCount: category.stores?.length || 0,
  })) || [];

  const handleOpenDialog = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setCategoryData({
        name: category.name,
        subName: category.subName,
        description: category.description,
        info: category.info,
        imageUrl: category.imageUrl,
        type: category.type,
        status: category.status,
        sortOrder: category.sortOrder,
      });
    } else {
      setEditingCategory(null);
      setCategoryData({
        name: '',
        subName: '',
        description: '',
        info: '',
        imageUrl: '',
        type: 'service',
        status: 'active',
        sortOrder: 0,
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingCategory(null);
    setCategoryData({
      name: '',
      subName: '',
      description: '',
      info: '',
      imageUrl: '',
      type: 'service',
      status: 'active',
      sortOrder: 0,
    });
  };

  const handleSubmit = () => {
    if (editingCategory) {
      updateCategoryMutation.mutate({ id: editingCategory.id, data: categoryData });
    } else {
      addCategoryMutation.mutate(categoryData);
    }
  };

  // التعامل مع تغيير الصفحة
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  // التعامل مع تغيير عدد العناصر في الصفحة
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // تصفية التصنيفات حسب البحث
  const filteredCategories = categories?.filter((category) =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // حساب الإحصائيات
  const stats = {
    totalCategories: filteredCategories?.length || 0,
    serviceCategories: filteredCategories?.filter(c => c.type === 'service').length || 0,
    deliveryCategories: filteredCategories?.filter(c => c.type === 'delivery').length || 0,
    activeCategories: filteredCategories?.filter(c => c.status === 'active').length || 0,
  };

  // تحضير بيانات التقرير
  const handlePrintReport = (category: Category) => {
    setSelectedCategory(category);
    setOpenPrintDialog(true);
  };

  const reportData = selectedCategory ? {
    title: `تقرير التصنيف - ${selectedCategory.name}`,
    date: new Date().toLocaleDateString('ar-SA'),
    description: `تقرير تفصيلي عن التصنيف ${selectedCategory.name}`,
    sections: [
      {
        title: 'معلومات التصنيف',
        content: `
          الاسم: ${selectedCategory.name}
          الاسم الفرعي: ${selectedCategory.subName || 'لا يوجد'}
          النوع: ${selectedCategory.type === 'service' ? 'خدمة' : 'توصيل'}
          الحالة: ${selectedCategory.status === 'active' ? 'نشط' :
                   selectedCategory.status === 'inactive' ? 'غير نشط' : 'مؤرشف'}
          الترتيب: ${selectedCategory.sortOrder}
        `
      },
      {
        title: 'الوصف',
        content: selectedCategory.description || 'لا يوجد وصف'
      },
      {
        title: 'معلومات إضافية',
        content: selectedCategory.info || 'لا توجد معلومات إضافية'
      },
      {
        title: 'إحصائيات',
        content: `
          عدد الخدمات: ${selectedCategory.services?.length || 0}
          عدد المتاجر: ${selectedCategory.stores?.length || 0}
        `
      },
    ],
  } : null;

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" fontWeight="bold">
          إدارة التصنيفات
        </Typography>
        <Button
          variant="contained"
          startIcon={<IconPlus />}
          onClick={() => handleOpenDialog()}
          sx={{ backgroundColor: 'primary.main' }}
        >
          إضافة تصنيف جديد
        </Button>
      </Box>

      {/* الإحصائيات */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconCategory size={24} color="#0068FF" />
            <Box>
              <Typography variant="h6">{stats.totalCategories}</Typography>
              <Typography variant="body2" color="text.secondary">
                إجمالي التصنيفات
              </Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconCategory size={24} color="#4CAF50" />
            <Box>
              <Typography variant="h6">{stats.serviceCategories}</Typography>
              <Typography variant="body2" color="text.secondary">
                تصنيفات الخدمات
              </Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconTruck size={24} color="#FF9800" />
            <Box>
              <Typography variant="h6">{stats.deliveryCategories}</Typography>
              <Typography variant="body2" color="text.secondary">
                تصنيفات التوصيل
              </Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconCategory size={24} color="#F44336" />
            <Box>
              <Typography variant="h6">{stats.activeCategories}</Typography>
              <Typography variant="body2" color="text.secondary">
                التصنيفات النشطة
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* قسم البحث */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
        <TextField
          fullWidth
              placeholder="البحث عن تصنيف..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
                startAdornment: <IconSearch size={20} />,
              }}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* أزرار التصدير والطباعة */}
      <Box sx={{ mb: 2, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <ExcelExport
          data={excelData}
          columns={excelColumns}
          filename="categories.xlsx"
          sheetName="التصنيفات"
        />
                </Box>

      {/* جدول التصنيفات */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>التصنيف</TableCell>
              <TableCell>النوع</TableCell>
              <TableCell>الحالة</TableCell>
              <TableCell>الترتيب</TableCell>
              <TableCell>الخدمات</TableCell>
              <TableCell>المتاجر</TableCell>
              <TableCell>الإجراءات</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredCategories
              ?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((category) => (
                <TableRow key={category.id}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar src={category.imageUrl} variant="rounded">
                        {category.name[0]}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2">{category.name}</Typography>
                {category.subName && (
                          <Typography variant="caption" color="text.secondary">
                    {category.subName}
                  </Typography>
                )}
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                  <Chip
                    label={category.type === 'service' ? 'خدمة' : 'توصيل'}
                      color={category.type === 'service' ? 'info' : 'warning'}
                    size="small"
                  />
                  </TableCell>
                  <TableCell>
                  <Chip
                      label={
                        category.status === 'active'
                          ? 'نشط'
                          : category.status === 'inactive'
                          ? 'غير نشط'
                          : 'مؤرشف'
                      }
                      color={
                        category.status === 'active'
                          ? 'success'
                          : category.status === 'inactive'
                          ? 'warning'
                          : 'error'
                      }
                    size="small"
                    />
                  </TableCell>
                  <TableCell>{category.sortOrder}</TableCell>
                  <TableCell>{category.services?.length || 0}</TableCell>
                  <TableCell>{category.stores?.length || 0}</TableCell>
                  <TableCell>
                <IconButton
                      color="primary" 
                  size="small"
                      onClick={() => handleOpenDialog(category)}
                >
                  <IconEdit size={18} />
                </IconButton>
                <IconButton
                      color="error" 
                  size="small"
                      onClick={() => deleteCategoryMutation.mutate(category.id)}
                >
                  <IconTrash size={18} />
                </IconButton>
                    <IconButton 
                      color="info" 
                      size="small"
                      onClick={() => handlePrintReport(category)}
                    >
                      <IconPrinter size={18} />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={filteredCategories?.length || 0}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="عدد العناصر في الصفحة"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}-${to} من ${count !== -1 ? count : `أكثر من ${to}`}`
          }
        />
      </TableContainer>

      {/* نافذة عرض وطباعة التقرير */}
      <Dialog
        open={openPrintDialog}
        onClose={() => setOpenPrintDialog(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedCategory && reportData && (
          <PDFDocument
            title="تقرير تصنيف"
            data={reportData}
            template="report"
            companyInfo={{
              name: 'منفذ',
              address: 'المملكة العربية السعودية',
              phone: '+966 123456789',
              email: 'info@manfath.com',
              logo: '/images/logo.png',
            }}
          />
        )}
      </Dialog>

      {/* نموذج إضافة/تحديث تصنيف */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingCategory ? 'تحديث بيانات التصنيف' : 'إضافة تصنيف جديد'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="اسم التصنيف"
                  value={categoryData.name}
                  onChange={(e) => setCategoryData({ ...categoryData, name: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="الاسم الفرعي"
                  value={categoryData.subName}
                  onChange={(e) => setCategoryData({ ...categoryData, subName: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="الوصف"
                  value={categoryData.description}
                  onChange={(e) => setCategoryData({ ...categoryData, description: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="معلومات إضافية"
                  value={categoryData.info}
                  onChange={(e) => setCategoryData({ ...categoryData, info: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>النوع</InputLabel>
                  <Select
                    value={categoryData.type}
                    label="النوع"
                    onChange={(e) => setCategoryData({ ...categoryData, type: e.target.value as Category['type'] })}
                  >
                    <MenuItem value="service">خدمة</MenuItem>
                    <MenuItem value="delivery">توصيل</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>الحالة</InputLabel>
                  <Select
                    value={categoryData.status}
                    label="الحالة"
                    onChange={(e) => setCategoryData({ ...categoryData, status: e.target.value as Category['status'] })}
                  >
                    <MenuItem value="active">نشط</MenuItem>
                    <MenuItem value="inactive">غير نشط</MenuItem>
                    <MenuItem value="archived">مؤرشف</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="الترتيب"
                  value={categoryData.sortOrder}
                  onChange={(e) => setCategoryData({ ...categoryData, sortOrder: Number(e.target.value) })}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>
                  صورة التصنيف
                </Typography>
                <ImageUpload
                  value={categoryData.imageUrl}
                  onChange={(url) => setCategoryData({ ...categoryData, imageUrl: url })}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>إلغاء</Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={!categoryData.name || !categoryData.type}
          >
            {editingCategory ? 'تحديث' : 'إضافة'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 