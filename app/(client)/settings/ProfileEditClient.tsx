"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { FaCamera, FaUser, FaSave, FaSpinner } from "react-icons/fa";
import { MdEdit } from "react-icons/md";
import { FaTrash } from "react-icons/fa";

export default function ProfileEditClient() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [avatarPreview, setAvatarPreview] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [deleted, setDeleted] = useState(false);

  useEffect(() => {
    try {
      const cached = localStorage.getItem("userData");
      if (cached) {
        const parsed = JSON.parse(cached);
        setName(parsed.userName || "Admin");
        setEmail(parsed.email || "admin@themiify.com");
        setAvatarUrl(parsed.userAvatar || "");
        setAvatarPreview(parsed.userAvatar || "");
      } else {
        const rawSession = localStorage.getItem("localAuthSession");
        if (rawSession) {
          const session = JSON.parse(rawSession);
          setName(session.userName || "Admin");
          setEmail(session.email || "admin@themiify.com");
          setAvatarUrl(session.userAvatar || "");
          setAvatarPreview(session.userAvatar || "");
        } else {
          setName("Admin");
          setEmail("admin@themiify.com");
        }
      }
    } catch {
      setName("Admin");
      setEmail("admin@themiify.com");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setMessage({ type: "error", text: "يرجى اختيار صورة صالحة" });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: "error", text: "حجم الصورة يجب أن يكون أقل من 5 ميجا" });
      return;
    }

    setSelectedFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    setMessage(null);
  };

  const uploadAvatar = async (file: File): Promise<string | null> => {
    const form = new FormData();
    form.append("file", file);

    const res = await fetch("/api/upload-avatar", {
      method: "POST",
      body: form,
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      console.error("Storage upload error:", body);
      return null;
    }

    const { url } = await res.json();
    return url as string;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setMessage({ type: "error", text: "الاسم لا يمكن أن يكون فارغاً" });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      let finalAvatarUrl = avatarUrl;

      if (selectedFile) {
        const uploaded = await uploadAvatar(selectedFile);
        if (uploaded) {
          finalAvatarUrl = uploaded;
          setAvatarUrl(uploaded);
        } else {
          setMessage({ type: "error", text: "حدث خطأ أثناء رفع الصورة." });
          setSaving(false);
          return;
        }
      }

      const cachedData = localStorage.getItem("userData");
      const parsed = cachedData ? JSON.parse(cachedData) : {};
      parsed.userName = name.trim();
      parsed.userAvatar = finalAvatarUrl;
      localStorage.setItem("userData", JSON.stringify(parsed));
      localStorage.setItem("userDataTime", Date.now().toString());

      setSelectedFile(null);
      setMessage({ type: "success", text: "تم حفظ التغييرات بنجاح ✓" });
    } catch (err: unknown) {
      const error = err as { message?: string };
      setMessage({ type: "error", text: error?.message || "حدث خطأ أثناء الحفظ" });
    } finally {
      setSaving(false);
    }
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <FaSpinner className="animate-spin text-primary text-3xl" />
      </div>
    );
  }

  const initials = name
    ? name.charAt(0).toUpperCase()
    : email.charAt(0).toUpperCase();

  return (
    <div className="max-w-xl mx-auto">
      <form onSubmit={handleSave} className=" rounded-2xl shadow-sm p-8 space-y-8">

        <div className="flex flex-col items-center gap-4">
          <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            {/* Avatar */}
            <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-primary/30 shadow-md">
              {avatarPreview ? (
                <Image
                  src={avatarPreview}
                  alt="صورة الملف الشخصي"
                  width={112}
                  height={112}
                  className="w-full h-full object-cover"
                  unoptimized
                />
              ) : (
                <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                  <span className="text-primary font-bold text-4xl">{initials}</span>
                </div>
              )}
            </div>

            <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <FaCamera className="text-white text-2xl" />
            </div>

            <div className="absolute -bottom-1 -left-1 text-primary rounded-full p-1.5 shadow">
              <MdEdit size={14} />
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />

          <button type="button" onClick={() => {
            setAvatarPreview("");
            setSelectedFile(null);
            setAvatarUrl("");
            setDeleted(true);
          }} className={` text-red-500 rounded-full p-1.5 shadow ${!avatarPreview && "hidden"}`}>
              <span className="flex items-center gap-2">مسح الصوره <FaTrash /></span>
          </button>

          <p className="text-sm text-gray-400">اضغط على الصورة لتغييرها</p>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            الاسم الكامل
          </label>
          <div className="relative">
            <FaUser className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="أدخل اسمك"
              className="w-full border border-gray-200 rounded-xl pr-10 pl-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition text-right"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            البريد الإلكتروني
          </label>
          <input
            type="email"
            value={email}
            readOnly
            className="w-full border border-gray-100 rounded-xl px-4 py-3 bg-gray-50 text-gray-500 cursor-not-allowed text-right"
          />
          <p className="text-xs text-gray-400">لا يمكن تغيير البريد الإلكتروني</p>
        </div>

        {message && (
          <div
            className={`rounded-xl px-4 py-3 text-sm font-medium ${
              message.type === "success"
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-red-50 text-red-600 border border-red-200"
            }`}
          >
            {message.text}
          </div>
        )}

        <button   
          type="submit"
          disabled={saving}
          className="w-full bg-primary/90 disabled:opacity-60 font-semibold rounded-xl py-3 flex items-center justify-center gap-2 transition"
        >
          {saving ? (
            <>
              <FaSpinner className="animate-spin" />
              جاري الحفظ...
            </>
          ) : (
            <>
              <FaSave />
              حفظ التغييرات
            </>
          )}
        </button>
      </form>
    </div>
  );
}
