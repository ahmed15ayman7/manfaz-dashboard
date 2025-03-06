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
} from '@mui/material';
import { useDropzone } from 'react-dropzone';
import Cropper from 'react-cropper';
import 'cropperjs/dist/cropper.css';
import { IconUpload, IconPhoto } from '@tabler/icons-react';
import { CldUploadWidget } from 'next-cloudinary';
import Image from 'next/image';

interface ImageUploadProps {
  value?: string;
  onChange: (value: string) => void;
  aspectRatio?: number;
  maxSize?: number; // بالميجابايت
}

export function ImageUpload({
  value,
  onChange,
  aspectRatio = 16 / 9,
  maxSize = 5, // 5 ميجابايت افتراضياً
}: ImageUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [cropper, setCropper] = useState<any>();
  const [isCropperOpen, setIsCropperOpen] = useState(false);

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
    <>
      <Box
        {...getRootProps()}
        sx={{
          border: '2px dashed',
          borderColor: isDragActive ? 'primary.main' : 'grey.300',
          borderRadius: 1,
          p: 3,
          textAlign: 'center',
          cursor: 'pointer',
          bgcolor: isDragActive ? 'primary.lighter' : 'background.paper',
          transition: 'all 0.2s ease',
          '&:hover': {
            borderColor: 'primary.main',
            bgcolor: 'primary.lighter',
          },
        }}
      >
        <input {...getInputProps()} />
        {value ? (
          <Box sx={{ position: 'relative', height: 200 }}>
            <Image
              src={value}
              alt="الصورة المحددة"
              fill
              style={{ objectFit: 'contain' }}
            />
          </Box>
        ) : (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <IconPhoto size={48} strokeWidth={1} />
            <Typography>
              {isDragActive
                ? 'أفلت الصورة هنا'
                : 'اسحب وأفلت الصورة هنا أو اضغط للاختيار'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              PNG, JPG, JPEG أو WEBP - بحد أقصى {maxSize} ميجابايت
            </Typography>
          </Box>
        )}
      </Box>

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
    </>
  );
} 