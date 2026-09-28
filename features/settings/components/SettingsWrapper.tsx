'use client';

import ImageUploadClient from "./ImageUploadClient";

interface SettingsWrapperProps {
  children: React.ReactNode;
}

export default function SettingsWrapper({ children }: SettingsWrapperProps) {
  return (
    <div>
      {children}
      <div className="space-y-8">
        {/* Login/Register Images Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">صور تسجيل الدخول والتسجيل</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ImageUploadClient type="login" title="صورة صفحة الدخول" />
              <ImageUploadClient type="register" title="صورة صفحة التسجيل" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
