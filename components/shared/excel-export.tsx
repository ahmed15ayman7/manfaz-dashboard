import { Workbook } from 'exceljs';
import { saveAs } from 'file-saver';
import { IconFileSpreadsheet } from '@tabler/icons-react';
import { Button } from '@mui/material';

interface Column {
  header: string;
  key: string;
  width?: number;
}

interface ExcelExportProps {
  data: any[];
  columns: Column[];
  filename?: string;
  sheetName?: string;
  buttonProps?: any;
}

export const ExcelExport = ({
  data,
  columns,
  filename = 'export.xlsx',
  sheetName = 'Sheet1',
  buttonProps,
}: ExcelExportProps) => {
  const exportToExcel = async () => {
    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet(sheetName, {
      views: [{ rightToLeft: true }],
    });

    // إعداد رأس الجدول
    worksheet.columns = columns.map((col) => ({
      header: col.header,
      key: col.key,
      width: col.width || 20,
    }));

    // تنسيق رأس الجدول
    worksheet.getRow(1).font = {
      bold: true,
      size: 12,
    };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' },
    };

    // إضافة البيانات
    data.forEach((item) => {
      const row: any = {};
      columns.forEach((col) => {
        row[col.key] = item[col.key];
      });
      worksheet.addRow(row);
    });

    // تنسيق الخلايا
    worksheet.eachRow((row, rowNumber) => {
      row.eachCell((cell) => {
        cell.alignment = {
          vertical: 'middle',
          horizontal: 'right',
        };
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
      });
    });

    // تصدير الملف
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    saveAs(blob, filename);
  };

  return (
    <Button
      variant="outlined"
      startIcon={<IconFileSpreadsheet />}
      onClick={exportToExcel}
      {...buttonProps}
    >
      تصدير Excel
    </Button>
  );
}; 