import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Typography,
} from '@mui/material';

interface Column {
  field: string;
  headerName: string;
  width?: number;
  renderCell?: (params: any) => React.ReactNode;
}

interface DataTableProps {
  rows: any[];
  columns: Column[];
  rowCount: number;
  loading?: boolean;
}

export const DataTable = ({ rows, columns, loading }: DataTableProps) => {
  // التحقق من وجود بيانات
  if (!rows?.length && !loading) {
    return (
      <Box className="p-8 text-center">
        <Typography color="text.secondary">
          لا توجد بيانات لعرضها
        </Typography>
      </Box>
    );
  }

  return (
    <TableContainer component={Paper} className="mt-4">
      <Table>
        <TableHead>
          <TableRow>
            {columns.map((column) => (
              <TableCell
                key={column.field}
                style={{ width: column.width }}
                className="font-semibold"
              >
                {column.headerName}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row, index) => (
            <TableRow key={row.id || index}>
              {columns.map((column) => (
                <TableCell key={`${row.id || index}-${column.field}`}>
                  {column.renderCell ? column.renderCell(row) : row[column.field]}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}; 