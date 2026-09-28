'use client';

import { useState, useEffect } from 'react';
import { FaUpload, FaTrash, FaImage } from 'react-icons/fa';

interface ImageUploadClientProps {
  type: 'login' | 'register';
  title: string;
}

export default function ImageUploadClient({ type, title }: ImageUploadClientProps) {
  const [image, setImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch current image on component mount
  useEffect(() => {
    fetchCurrentImage();
  }, [type]);

  const fetchCurrentImage = async () => {
    try {
      const response = await fetch(`/api/admin/settings/upload?type=${type}`);
      const data = await response.json();
      
      if (data.success && data.image) {
        setImage(data.image);
      }
    } catch (error) {
      console.error('Error fetching image:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);

      const response = await fetch('/api/admin/settings/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      
      if (data.success) {
        setImage(data.filename);
        // Refresh the page to show new image
        setTimeout(() => window.location.reload(), 1000);
      } else {
        alert(data.error || 'فشل في رفع الصورة');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('حدث خطأ أثناء رفع الصورة');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!image) return;

    try {
      // In a real implementation, you'd have a delete endpoint
      // For now, we'll just clear the local state
      setImage(null);
      
      // Remove the image
      const response = await fetch('/api/admin/settings/upload', {
        method: 'POST',
        body: JSON.stringify({ type, action: 'delete' }),
        headers: { 'Content-Type': 'application/json' },
      });
      
    } catch (error) {
      console.error('Delete error:', error);
      alert('فشل في حذف الصورة');
    }
  };

  if (loading) {
    return (
      <div className="border border-gray-200 rounded-lg p-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">{title}</label>
        <div className="bg-gray-50 rounded-lg p-3 min-h-[100px] flex items-center justify-center">
          <span className="text-gray-400">جاري التحميل...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">{title}</label>
      <div className="space-y-3">
        {/* File Input */}
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 cursor-pointer bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg transition-colors">
            <FaUpload />
            <span>{uploading ? 'جاري الرفع...' : 'اختر صورة'}</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              disabled={uploading}
              className="hidden"
            />
          </label>
          
          {image && (
            <button
              onClick={handleDelete}
              className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <FaTrash />
              <span>حذف</span>
            </button>
          )}
        </div>

        {/* Image Preview */}
        <div className="bg-gray-50 rounded-lg p-3 min-h-[100px] flex items-center justify-center">
          {image ? (
            <div className="relative">
              <img
                src={image}
                alt={`${type} banner`}
                className="max-w-full max-h-[200px] rounded-lg shadow-sm"
              />
              <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                <FaImage className="inline ml-1" />
                تم الرفع
              </div>
            </div>
          ) : (
            <div className="text-center">
              <FaImage className="text-4xl text-gray-300 mx-auto mb-2" />
              <span className="text-gray-400 text-sm">لا توجد صورة محملة</span>
            </div>
          )}
        </div>

        {/* Image URL */}
        {image && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-2">
            <p className="text-xs text-blue-700 break-all">
              <strong>رابط الصورة:</strong> {image}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
