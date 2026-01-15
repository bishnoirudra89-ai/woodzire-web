import { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react';
import { useImageUpload } from '@/hooks/useImageUpload';

interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  className?: string;
}

const ImageUploader = ({ value, onChange, label, className = '' }: ImageUploaderProps) => {
  const { uploadImage, isUploading } = useImageUpload();

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = await uploadImage(file);
    if (url) {
      onChange(url);
    }
  };

  const handleRemove = () => {
    onChange('');
  };

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-muted-foreground mb-2">
          {label}
        </label>
      )}
      
      {value ? (
        <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-muted group">
          <img src={value} alt="" className="w-full h-full object-cover" />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center w-full aspect-video rounded-xl border-2 border-dashed border-border hover:border-gold cursor-pointer text-muted-foreground hover:text-gold transition-colors bg-background">
          {isUploading ? (
            <Loader2 className="animate-spin" size={32} />
          ) : (
            <>
              <ImageIcon size={32} className="mb-2" />
              <span className="text-sm">Click to upload</span>
            </>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleUpload}
            className="hidden"
            disabled={isUploading}
          />
        </label>
      )}
    </div>
  );
};

export default ImageUploader;
