import { Document, Page, Text, View, StyleSheet, PDFViewer, Image, Font } from '@react-pdf/renderer';
import { IconPrinter } from '@tabler/icons-react';
import { Button } from '@mui/material';

// تسجيل الخطوط العربية
Font.register({
  family: 'Cairo',
  src: 'https://fonts.gstatic.com/s/cairo/v20/SLXVc1nY6HkvangtZmpcWmhzfH5lWWgcQyyS4J0.ttf',
});

// تعريف الأنماط
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 30,
    fontFamily: 'Cairo',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  logo: {
    width: 100,
    height: 100,
  },
  companyInfo: {
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#0068FF',
  },
  subtitle: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 5,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    marginVertical: 10,
  },
  section: {
    marginVertical: 10,
  },
  table: {
    flexDirection: 'column',
    marginVertical: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  tableCell: {
    flex: 1,
    textAlign: 'right',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    color: '#666666',
    fontSize: 10,
  },
});

interface PDFDocumentProps {
  title: string;
  data: any;
  template: 'invoice' | 'report';
  companyInfo?: {
    name: string;
    address: string;
    phone: string;
    email: string;
    logo?: string;
  };
}

// قالب الفاتورة
const InvoiceTemplate = ({ data, companyInfo }: any) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        {companyInfo?.logo && (
          <Image style={styles.logo} src={companyInfo.logo} />
        )}
        <View style={styles.companyInfo}>
          <Text style={styles.title}>{companyInfo?.name}</Text>
          <Text style={styles.subtitle}>{companyInfo?.address}</Text>
          <Text style={styles.subtitle}>{companyInfo?.phone}</Text>
          <Text style={styles.subtitle}>{companyInfo?.email}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.section}>
        <Text style={styles.subtitle}>رقم الفاتورة: {data.invoiceNumber}</Text>
        <Text style={styles.subtitle}>التاريخ: {data.date}</Text>
        <Text style={styles.subtitle}>العميل: {data.customerName}</Text>
      </View>

      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={styles.tableCell}>الوصف</Text>
          <Text style={styles.tableCell}>الكمية</Text>
          <Text style={styles.tableCell}>السعر</Text>
          <Text style={styles.tableCell}>الإجمالي</Text>
        </View>
        {data.items?.map((item: any, index: number) => (
          <View key={index} style={styles.tableRow}>
            <Text style={styles.tableCell}>{item.description}</Text>
            <Text style={styles.tableCell}>{item.quantity}</Text>
            <Text style={styles.tableCell}>{item.price} ريال</Text>
            <Text style={styles.tableCell}>{item.total} ريال</Text>
          </View>
        ))}
      </View>

      <View style={styles.divider} />

      <View style={styles.section}>
        <Text style={styles.subtitle}>الإجمالي: {data.total} ريال</Text>
        <Text style={styles.subtitle}>الضريبة: {data.tax} ريال</Text>
        <Text style={styles.subtitle}>المجموع النهائي: {data.grandTotal} ريال</Text>
      </View>

      <Text style={styles.footer}>
        شكراً لثقتكم بنا - {companyInfo?.name}
      </Text>
    </Page>
  </Document>
);

// قالب التقرير
const ReportTemplate = ({ data, companyInfo }: any) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        {companyInfo?.logo && (
          <Image style={styles.logo} src={companyInfo.logo} />
        )}
        <View style={styles.companyInfo}>
          <Text style={styles.title}>{data.title}</Text>
          <Text style={styles.subtitle}>تاريخ التقرير: {data.date}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.section}>
        <Text style={styles.subtitle}>{data.description}</Text>
      </View>

      <View style={styles.table}>
        {data.sections?.map((section: any, index: number) => (
          <View key={index} style={styles.section}>
            <Text style={{ ...styles.subtitle, fontWeight: 'bold' }}>
              {section.title}
            </Text>
            <Text style={styles.subtitle}>{section.content}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.footer}>
        {companyInfo?.name} - تقرير تم إنشاؤه بتاريخ {data.date}
      </Text>
    </Page>
  </Document>
);

export const PDFDocument = ({ title, data, template, companyInfo }: PDFDocumentProps) => {
  return (
    <PDFViewer style={{ width: '100%', height: '600px' }}>
      {template === 'invoice' ? (
        <InvoiceTemplate data={data} companyInfo={companyInfo} />
      ) : (
        <ReportTemplate data={data} companyInfo={companyInfo} />
      )}
    </PDFViewer>
  );
};

// زر الطباعة
export const PrintButton = ({ onClick, ...props }: any) => (
  <Button
    variant="outlined"
    startIcon={<IconPrinter />}
    onClick={onClick}
    {...props}
  >
    طباعة
  </Button>
); 