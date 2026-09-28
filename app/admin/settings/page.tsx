'use client';

import { useState } from "react";
import { MdSettings, MdPalette, MdLogin } from "react-icons/md";
import { FaSave } from "react-icons/fa";
import ImageUploadClient from "./ImageUploadClient";
import { toast } from "sonner";
import {
  defaultSiteColors,
  defaultGeneralSettings,
  defaultColorsState,
  GeneralSettingsState,
} from "@/features/settings";

export default function SimpleSettingsPage() {
  const [colors, setColors] = useState<Record<string, string>>(defaultColorsState);
  const [generalSettings, setGeneralSettings] = useState<GeneralSettingsState>(defaultGeneralSettings);

  const handleColorChange = (key: string, value: string) => {
    setColors((prev) => ({ ...prev, [key]: value }));
  };

  const handleGeneralChange = <K extends keyof GeneralSettingsState>(
    field: K,
    value: GeneralSettingsState[K]
  ) => {
    setGeneralSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    // Save settings locally or to backend API
    toast.success("تم حفظ الإعدادات بنجاح!");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">إعدادات الموقع</h1>
          <p className="text-gray-600">تحكم في مظهر وسلوك الموقع</p>
        </div>

        {/* Settings Sections */}
        <div className="space-y-8">
          {/* Login/Register Images Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <MdLogin className="text-2xl text-blue-500" />
                <h2 className="text-xl font-bold text-gray-900">صور تسجيل الدخول والتسجيل</h2>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ImageUploadClient type="login" title="صورة صفحة الدخول" />
                <ImageUploadClient type="register" title="صورة صفحة التسجيل" />
              </div>
            </div>
          </div>

          {/* Site Colors Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <MdPalette className="text-2xl text-purple-500" />
                <h2 className="text-xl font-bold text-gray-900">ألوان الموقع</h2>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {defaultSiteColors.map((colorItem) => {
                  const currentValue = colors[colorItem.key] ?? colorItem.defaultValue;
                  return (
                    <div key={colorItem.id} className="border border-gray-200 rounded-lg p-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {colorItem.label}
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={currentValue}
                          onChange={(e) => handleColorChange(colorItem.key, e.target.value)}
                          className="w-16 h-10 border border-gray-300 rounded cursor-pointer"
                        />
                        <input
                          type="text"
                          value={currentValue}
                          onChange={(e) => handleColorChange(colorItem.key, e.target.value)}
                          className="flex-1 p-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* General Settings Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <MdSettings className="text-2xl text-green-500" />
                <h2 className="text-xl font-bold text-gray-900">إعدادات عامة</h2>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Site Title */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">عنوان الموقع</label>
                  <input
                    type="text"
                    value={generalSettings.siteTitle}
                    onChange={(e) => handleGeneralChange("siteTitle", e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  />
                </div>

                {/* Site Description */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">وصف الموقع</label>
                  <input
                    type="text"
                    value={generalSettings.siteDescription}
                    onChange={(e) => handleGeneralChange("siteDescription", e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  />
                </div>

                {/* Maintenance Mode */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">وضع الصيانة</label>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={generalSettings.maintenanceMode}
                        onChange={(e) => handleGeneralChange("maintenanceMode", e.target.checked)}
                        className="ml-2"
                      />
                      <span className="text-sm">تفعيل وضع الصيانة</span>
                    </label>
                  </div>
                </div>

                {/* Registration Enabled */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">التسجيل الجديد</label>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={generalSettings.registrationEnabled}
                        onChange={(e) => handleGeneralChange("registrationEnabled", e.target.checked)}
                        className="ml-2"
                      />
                      <span className="text-sm">السماح بالتسجيل الجديد</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-lg transition-colors"
            >
              <FaSave />
              <span>حفظ جميع الإعدادات</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
