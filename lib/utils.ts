type FormatType = 'number' | 'currency';

export function formatNumber(value: number, type: FormatType = 'number'): string {
  const options: Intl.NumberFormatOptions = {
    style: type === 'currency' ? 'currency' : 'decimal',
    currency: 'SAR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  };

  return new Intl.NumberFormat('ar-SA', options).format(value);
} 

export function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: true,
  });
}
