'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function BannerImage() {
  const [imageSrc, setImageSrc] = useState('/images/login.png');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBannerImage();
  }, []);

  const fetchBannerImage = async () => {
    try {
      const response = await fetch('/api/admin/settings/upload?type=login');
      const data = await response.json();
      
      if (data.success && data.image) {
        setImageSrc(data.image);
      }
    } catch (error) {
      console.error('Error fetching banner image:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full h-[300px] md:h-full bg-gray-200 rounded-2xl animate-pulse" />
    );
  }

  return (
    <Image
      src={imageSrc}
      alt="Login Banner"
      className="w-full h-auto rounded-2xl object-cover max-h-[300px] md:max-h-full"
      width={500}
      height={500}
      priority
      onError={() => setImageSrc('/images/login.png')} // Fallback to default image
    />
  );
}
