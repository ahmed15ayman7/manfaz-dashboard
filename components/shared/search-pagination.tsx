import { ChangeEvent, useCallback, useEffect, useState } from 'react';
import {
  Box,
  TextField,
  Pagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Stack,
  InputAdornment,
} from '@mui/material';
import { IconSearch } from '@tabler/icons-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import debounce from 'lodash/debounce';

interface SearchPaginationProps {
  totalItems: number;
  onSearch?: (query: string) => void;
  onPageChange?: (page: number) => void;
  onLimitChange?: (limit: number) => void;
}

export const SearchPagination = ({
  totalItems,
  onSearch,
  onPageChange,
  onLimitChange,
}: SearchPaginationProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);
  const [limit, setLimit] = useState(Number(searchParams.get('limit')) || 10);

  // تحديث الرابط عند تغيير المعايير
  const updateUrl = useCallback((newParams: Record<string, string>) => {
    const params = new URLSearchParams(searchParams);
    Object.entries(newParams).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    router.push(`${pathname}?${params.toString()}`);
  }, [pathname, router, searchParams]);

  // معالجة البحث مع تأخير
  const debouncedSearch = useCallback(
    debounce((value: string) => {
      updateUrl({ q: value, page: '1' });
      onSearch?.(value);
    }, 500),
    [updateUrl, onSearch]
  );

  // معالجة تغيير البحث
  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearch(value);
    debouncedSearch(value);
  };

  // معالجة تغيير الصفحة
  const handlePageChange = (_: any, newPage: number) => {
    setPage(newPage);
    updateUrl({ page: newPage.toString() });
    onPageChange?.(newPage);
  };

  // معالجة تغيير عدد العناصر في الصفحة
  const handleLimitChange = (event: SelectChangeEvent<number>) => {
    const newLimit = Number(event.target.value);
    setLimit(newLimit);
    setPage(1);
    updateUrl({ limit: newLimit.toString(), page: '1' });
    onLimitChange?.(newLimit);
  };

  // تحديث الحالة عند تغيير الرابط
  useEffect(() => {
    setSearch(searchParams.get('q') || '');
    setPage(Number(searchParams.get('page')) || 1);
    setLimit(Number(searchParams.get('limit')) || 10);
  }, [searchParams]);

  return (
    <Box className="flex flex-col gap-4">
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
        {/* حقل البحث */}
        <TextField
          value={search}
          onChange={handleSearchChange}
          placeholder="بحث..."
          size="small"
          className="min-w-[200px]"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <IconSearch size={20} />
              </InputAdornment>
            ),
          }}
        />

        {/* اختيار عدد العناصر في الصفحة */}
        <FormControl size="small" className="min-w-[100px]">
          <InputLabel>عدد العناصر</InputLabel>
          <Select value={limit} onChange={handleLimitChange} label="عدد العناصر">
            <MenuItem value={5}>5</MenuItem>
            <MenuItem value={10}>10</MenuItem>
            <MenuItem value={25}>25</MenuItem>
            <MenuItem value={50}>50</MenuItem>
          </Select>
        </FormControl>
      </Stack>

      {/* التنقل بين الصفحات */}
      <Box className="flex justify-center mt-4">
        <Pagination
          count={Math.ceil(totalItems / limit)}
          page={page}
          onChange={handlePageChange}
          color="primary"
          showFirstButton
          showLastButton
        />
      </Box>
    </Box>
  );
}; 