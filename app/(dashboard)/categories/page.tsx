'use client';

import { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  IconButton,
  Chip,
  TextField,
  InputAdornment,
} from '@mui/material';
import {
  IconPlus,
  IconEdit,
  IconTrash,
  IconSearch,
  IconPackage,
  IconTruck,
} from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Category } from '@/interfaces';
import { AddCategoryDialog } from '@/components/categories/add-category-dialog';
import { EditCategoryDialog } from '@/components/categories/edit-category-dialog';
import { toast } from 'react-toastify';

export default function CategoriesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  const { data: categories = [], refetch } = useQuery<Category[]>({
    queryKey: ['categories', searchQuery],
    queryFn: async () => {
      const response = await axios.get(`/api/categories?search=${searchQuery}`);
      return response.data;
    },
  });

  const handleDeleteCategory = async (categoryId: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا التصنيف؟')) {
      try {
        await axios.delete(`/api/categories/${categoryId}`);
        toast.success('تم حذف التصنيف بنجاح');
        refetch();
      } catch (error) {
        toast.error('حدث خطأ أثناء حذف التصنيف');
      }
    }
  };

  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Typography variant="h5" fontWeight="bold">
          التصنيفات
        </Typography>
        <Button
          variant="contained"
          startIcon={<IconPlus />}
          onClick={() => setIsAddDialogOpen(true)}
        >
          إضافة تصنيف
        </Button>
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <TextField
          fullWidth
          placeholder="البحث في التصنيفات..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <IconSearch size={20} />
              </InputAdornment>
            ),
          }}
        />
      </Paper>

      <Grid container spacing={3}>
        {filteredCategories.map((category) => (
          <Grid item xs={12} sm={6} md={4} key={category.id}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                '&:hover': {
                  boxShadow: (theme) => theme.shadows[4],
                },
              }}
            >
              <CardMedia
                component="img"
                height="140"
                image={category.imageUrl || '/category-placeholder.png'}
                alt={category.name}
                sx={{ objectFit: 'cover' }}
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Typography variant="h6" fontWeight="bold">
                    {category.name}
                  </Typography>
                  {category.type === 'service' ? (
                    <IconPackage size={20} color="#0068FF" />
                  ) : (
                    <IconTruck size={20} color="#4CAF50" />
                  )}
                </Box>
                {category.subName && (
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {category.subName}
                  </Typography>
                )}
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    mb: 2,
                  }}
                >
                  {category.description}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Chip
                    label={category.type === 'service' ? 'خدمة' : 'توصيل'}
                    color={category.type === 'service' ? 'primary' : 'success'}
                    size="small"
                  />
                  <Chip
                    label={category.status === 'active' ? 'نشط' : 'غير نشط'}
                    color={category.status === 'active' ? 'success' : 'error'}
                    size="small"
                    variant="outlined"
                  />
                </Box>
              </CardContent>
              <CardActions sx={{ justifyContent: 'flex-end', p: 2 }}>
                <IconButton
                  size="small"
                  color="info"
                  onClick={() => setSelectedCategory(category)}
                >
                  <IconEdit size={18} />
                </IconButton>
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => handleDeleteCategory(category.id)}
                >
                  <IconTrash size={18} />
                </IconButton>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <AddCategoryDialog
        open={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onSuccess={() => {
          setIsAddDialogOpen(false);
          refetch();
        }}
      />

      {selectedCategory && (
        <EditCategoryDialog
          open={!!selectedCategory}
          onClose={() => setSelectedCategory(null)}
          onSuccess={() => {
            setSelectedCategory(null);
            refetch();
          }}
          category={selectedCategory}
        />
      )}
    </Box>
  );
} 