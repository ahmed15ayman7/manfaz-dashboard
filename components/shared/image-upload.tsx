'use client';

import { useState, useCallback } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  CircularProgress,
} from '@mui/material';
import { useDropzone } from 'react-dropzone';
import Cropper from 'react-cropper';
import 'cropperjs/dist/cropper.css';
import { IconUpload, IconPhoto, IconX } from '@tabler/icons-react';
import { CldUploadWidget } from 'next-cloudinary';
import Image from 'next/image';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  maxSize?: number; // بالميجابايت
  aspectRatio?: number;
  className?: string;
  label?: string;
}

export const ImageUpload = ({
  value,
  onChange,
  maxSize = 5, // 5 ميجابايت كحد أقصى افتراضي
  aspectRatio = 1, // مربع افتراضي
  className = '',
  label = '',
}: ImageUploadProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [cropper, setCropper] = useState<any>();
  const [isCropperOpen, setIsCropperOpen] = useState(false);

  // التحقق من حجم وامتداد الملف
  const validateFile = (file: File): boolean => {
    // التحقق من الحجم
    if (file.size > maxSize * 1024 * 1024) {
      setError(`حجم الملف يجب أن يكون أقل من ${maxSize} ميجابايت`);
      return false;
    }

    // التحقق من نوع الملف
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('يجب أن يكون الملف بصيغة JPG أو PNG أو WebP');
      return false;
    }

    setError(null);
    return true;
  };

  // رفع الصورة إلى Cloudinary
  const uploadToCloudinary = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!);

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error.message);
      }

      return data.secure_url;
    } catch (error) {
      console.error('خطأ في رفع الصورة:', error);
      setError('حدث خطأ أثناء رفع الصورة');
      throw error;
    }
  };

  // معالجة اختيار الملف
  const handleFileSelect = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!validateFile(file)) return;

    setLoading(true);
    setError(null);

    try {
      const url = await uploadToCloudinary(file);
      onChange(url);
    } catch (error) {
      console.error('خطأ في رفع الصورة:', error);
      setError('حدث خطأ أثناء رفع الصورة');
    } finally {
      setLoading(false);
    }
  }, [onChange]);

  // إزالة الصورة
  const handleRemove = useCallback(() => {
    onChange('');
  }, [onChange]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      if (file.size > maxSize * 1024 * 1024) {
        alert(`حجم الملف يجب أن يكون أقل من ${maxSize} ميجابايت`);
        return;
      }
      setFile(file);
      setIsCropperOpen(true);
    }
  }, [maxSize]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp'],
    },
    maxFiles: 1,
  });

  const handleCrop = async () => {
    if (cropper) {
      const canvas = cropper.getCroppedCanvas();
      if (canvas) {
        // تحويل الصورة المقصوصة إلى blob
        canvas.toBlob(async (blob: Blob) => {
          const formData = new FormData();
          formData.append('file', blob);
          formData.append('upload_preset', 'manfaz_uploads'); // استبدل بـ preset الخاص بك

          try {
            const response = await fetch(
              `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
              {
                method: 'POST',
                body: formData,
              }
            );
            const data = await response.json();
            onChange(data.secure_url);
            setIsCropperOpen(false);
            setFile(null);
          } catch (error) {
            console.error('Error uploading to Cloudinary:', error);
            alert('حدث خطأ أثناء رفع الصورة');
          }
        });
      }
    }
  };

  return (
    <Box className={`relative ${className}`}>
      {label && <Typography variant="subtitle2" gutterBottom>{label}</Typography>}
      {/* منطقة رفع الصورة */}
      <Box
        className={`
          relative
          flex
          flex-col
          items-center
          justify-center
          w-full
          h-40
          border-2
          border-dashed
          rounded-lg
          transition-all
          ${value ? 'border-primary' : 'border-gray-300'}
          ${loading ? 'opacity-50' : 'hover:border-primary'}
        `}
      >
        {loading ? (
          <CircularProgress size={24} />
        ) : value ? (
          <>
            {/* عرض الصورة المختارة */}
            <Box className="relative w-full h-full">
              <Image
                src={value}
                alt="الصورة المختارة"
                fill
                style={{ objectFit: 'cover' }}
                className="rounded-lg"
              />
              {/* زر إزالة الصورة */}
              <Button
                onClick={handleRemove}
                className="absolute top-2 right-2"
                variant="contained"
                color="error"
                size="small"
              >
                <IconX size={16} />
              </Button>
            </Box>
          </>
        ) : (
          <>
            {/* زر اختيار الصورة */}
            <IconUpload size={24} className="mb-2 text-gray-400" />
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileSelect}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <span className="text-sm text-gray-500">اختر صورة أو اسحبها هنا</span>
            <span className="text-xs text-gray-400 mt-1">
              JPG, PNG, WebP | بحد أقصى {maxSize} ميجابايت
            </span>
          </>
        )}
      </Box>

      {/* عرض رسالة الخطأ */}
      {error && (
        <p className="mt-2 text-sm text-error">{error}</p>
      )}

      <Dialog
        open={isCropperOpen}
        onClose={() => setIsCropperOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>تحرير الصورة</DialogTitle>
        <DialogContent>
          {file && (
            <Cropper
              src={URL.createObjectURL(file)}
              style={{ height: 400, width: '100%' }}
              aspectRatio={aspectRatio}
              guides={true}
              onInitialized={(instance) => setCropper(instance)}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsCropperOpen(false)}>إلغاء</Button>
          <Button variant="contained" onClick={handleCrop}>
            قص وحفظ
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}; 