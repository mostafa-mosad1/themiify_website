"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { FaEye, FaEyeSlash, FaEnvelope, FaLock, FaUser } from "react-icons/fa";
import { motion } from "framer-motion";
import Link from "next/link";
import { toast } from "sonner";
import BannerImage from "./BannerImage";
import Button from "@/components/ui/Button";

export default function RegisterClient() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    acceptTerms: true,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("كلمة المرور غير متطابقة");
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
      setLoading(false);
      return;
    }

    try {
      // Save local session / user registration
      const sessionData = {
        isLoggedIn: true,
        userId: "user-" + Date.now(),
        email: formData.email,
        userName: formData.name,
        userRole: "end_user",
      };

      localStorage.setItem("localAuthSession", JSON.stringify(sessionData));
      localStorage.setItem("userData", JSON.stringify({ email: formData.email, name: formData.name, role: "end_user" }));
      document.cookie = `authToken=${sessionData.userId}; path=/; max-age=604800; SameSite=Lax`;

      toast.success("تم إنشاء الحساب بنجاح!");
      window.location.href = "/";
    } catch (err: any) {
      const errorMessage = err?.message || "حدث خطأ غير متوقع";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    toast.info("تسجيل الدخول باستخدام جوجل متاح قريباً");
  };

  if (!mounted) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4 lg:p-8"
        dir="rtl"
      >
        <div className="flex flex-col md:flex-row h-auto w-full max-w-6xl bg-white p-6 md:p-8 rounded-3xl bg-glass shadow-2xl">
          {/* قسم الفورم Skeleton */}
          <div className="rounded-3xl p-4 md:p-6 lg:p-8 relative z-10 w-full md:w-1/2 flex flex-col justify-center order-2 md:order-1">
            <div className="text-center mb-6">
              <div className="inline-block mb-4">
                <div className="flex items-center justify-center gap-2">
                  <div className="w-8 h-8 md:w-10 md:h-10 bg-gray-200 rounded-lg animate-pulse"></div>
                  <div className="w-24 h-8 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
              <div className="w-40 h-4 bg-gray-200 rounded mx-auto animate-pulse"></div>
            </div>
            <div className="mb-4 md:mb-6 text-center">
              <div className="w-48 h-8 bg-gray-200 rounded mx-auto mb-2 animate-pulse"></div>
              <div className="w-64 h-6 bg-gray-200 rounded mx-auto animate-pulse"></div>
            </div>
            <div className="space-y-4 md:space-y-5">
              {[...Array(3)].map((_, i) => (
                <div key={i}>
                  <div className="w-24 h-4 bg-gray-200 rounded mb-2 animate-pulse"></div>
                  <div className="w-full h-12 bg-gray-200 rounded-xl animate-pulse"></div>
                </div>
              ))}
              <div className="flex gap-4">
                <div className="flex-1">
                  <div className="w-24 h-4 bg-gray-200 rounded mb-2 animate-pulse"></div>
                  <div className="w-full h-12 bg-gray-200 rounded-xl animate-pulse"></div>
                </div>
                <div className="flex-1">
                  <div className="w-24 h-4 bg-gray-200 rounded mb-2 animate-pulse"></div>
                  <div className="w-full h-12 bg-gray-200 rounded-xl animate-pulse"></div>
                </div>
              </div>
              <div className="w-full h-12 bg-gray-200 rounded-xl animate-pulse mt-6"></div>
            </div>
            <div className="mt-4 md:mt-6 text-center">
              <div className="w-48 h-4 bg-gray-200 rounded inline-block animate-pulse"></div>
            </div>
          </div>
          <div className="w-full md:w-1/2 order-1 md:order-2 mb-6 md:mb-0">
            <div className="w-full h-[300px] md:h-full bg-gray-200 rounded-2xl animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 lg:p-8" dir="rtl">
      <div className="flex flex-col md:flex-row h-auto w-full max-w-6xl bg-white p-6 md:p-8 rounded-3xl bg-glass shadow-2xl">
        {/* قسم الفورم */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="rounded-3xl p-4 md:p-6 lg:p-8 relative z-10 w-full md:w-1/2 flex flex-col justify-center order-2 md:order-1"
        >
          {/* الشعار */}
          <div className="text-center mb-3">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="inline-block mb-4"
            >
              <Link href="/">
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold flex items-center justify-center gap-2">
                  <Image
                    src="/favicon.ico"
                    alt="Logo"
                    width={35}
                    height={35}
                    className="rounded-lg w-8 h-8 md:w-10 md:h-10"
                  />
                  <span className="text-primary">Themiify</span>
                </h1>
              </Link>
            </motion.div>
          </div>

          {/* عنوان الصفحة */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-4 md:mb-6 text-center"
          >
            <h2 className="text-xl md:text-2xl lg:text-3xl font-bold">
              إنشاء حساب جديد
            </h2>
            <p className="text-sm md:text-base mt-1 text-gray-500">انضم إلى مجتمع Themify</p>
          </motion.div>

          {/* رسالة الخطأ */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-2 md:p-3 bg-red-50 text-red-600 rounded-xl text-xs md:text-sm"
            >
              {error}
            </motion.div>
          )}

          {/* زر تسجيل بجوجل */}
          <div className="mb-4">
            <button
              type="button"
              onClick={handleGoogleRegister}
              className="w-full flex items-center justify-center gap-3 border-2 border-gray-200 py-3 rounded-xl transition hover:bg-gray-50 cursor-pointer"
            >
              <Image
                src="https://www.svgrepo.com/show/475656/google-color.svg"
                alt="Google"
                width={20}
                height={20}
              />
              <span className="font-medium text-sm md:text-base">التسجيل باستخدام Google</span>
            </button>

            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-[1px] bg-gray-200"></div>
              <span className="text-gray-400 text-sm">أو</span>
              <div className="flex-1 h-[1px] bg-gray-200"></div>
            </div>
          </div>

          {/* الفورم */}
          <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
            {/* حقل الاسم */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <label className="block text-gray-700 font-medium mb-1 md:mb-2 text-xs md:text-sm">
                الاسم الكامل
              </label>
              <div className="relative">
                <FaUser className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm md:text-base" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="ادخل اسمك الكامل"
                  required
                  className="w-full px-9 md:px-11 py-2.5 md:py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl outline-none focus:border-primary focus:bg-white transition-all shadow-inner shadow-gray-200 text-sm md:text-base"
                />
              </div>
            </motion.div>

            {/* حقل البريد الإلكتروني */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <label className="block text-gray-700 font-medium mb-1 md:mb-2 text-xs md:text-sm">
                البريد الإلكتروني
              </label>
              <div className="relative">
                <FaEnvelope className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm md:text-base" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="ادخل البريد الخاص بك"
                  required
                  className="w-full px-9 md:px-11 py-2.5 md:py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl outline-none focus:border-primary focus:bg-white transition-all shadow-inner shadow-gray-200 text-sm md:text-base text-right"
                />
              </div>
            </motion.div>

            {/* حقل كلمة المرور وتأكيدها جنب بعض */}
            <div className="flex gap-4">
              {/* حقل كلمة المرور */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="flex-1"
              >
                <label className="block text-gray-700 font-medium mb-1 md:mb-2 text-xs md:text-sm">
                  كلمة المرور
                </label>
                <div className="relative">
                  <FaLock className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm md:text-base" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="ادخل كلمة المرور"
                    required
                    minLength={6}
                    className="w-full px-9 md:px-11 py-2.5 md:py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl outline-none focus:border-primary focus:bg-white transition-all shadow-inner shadow-gray-200 text-sm md:text-base text-right"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-colors cursor-pointer"
                  >
                    {showPassword ? (
                      <FaEyeSlash size={16} className="md:w-[18px] md:h-[18px]" />
                    ) : (
                      <FaEye size={16} className="md:w-[18px] md:h-[18px]" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  يجب أن تكون 6 أحرف على الأقل
                </p>
              </motion.div>

              {/* حقل تأكيد كلمة المرور */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="flex-1"
              >
                <label className="block text-gray-700 font-medium mb-1 md:mb-2 text-xs md:text-sm">
                  تأكيد كلمة المرور
                </label>
                <div className="relative">
                  <FaLock className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm md:text-base" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="أعد إدخال كلمة المرور"
                    required
                    className="w-full px-9 md:px-11 py-2.5 md:py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl outline-none focus:border-primary focus:bg-white transition-all shadow-inner shadow-gray-200 text-sm md:text-base text-right"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-colors cursor-pointer"
                  >
                    {showConfirmPassword ? (
                      <FaEyeSlash size={16} className="md:w-[18px] md:h-[18px]" />
                    ) : (
                      <FaEye size={16} className="md:w-[18px] md:h-[18px]" />
                    )}
                  </button>
                </div>
              </motion.div>
            </div>

            {/* زر إنشاء الحساب */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full"
            >
              <Button
                type="submit"
                disabled={loading}
                variant="primary"
                className="w-full py-2.5 md:py-3.5 text-sm md:text-lg justify-center cursor-pointer"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 md:w-5 md:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>جاري إنشاء الحساب...</span>
                  </div>
                ) : (
                  "إنشاء حساب"
                )}
              </Button>
            </motion.div>
          </form>

          {/* رابط تسجيل الدخول */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-sm md:text-base text-gray-500 mt-4 md:mt-6 text-center md:text-right"
          >
            لديك حساب بالفعل؟{" "}
            <Link
              href="/login"
              className="text-primary hover:text-primary/70 font-medium text-xs md:text-sm transition-colors mr-1"
            >
              تسجيل الدخول
            </Link>
          </motion.p>
        </motion.div>

        {/* قسم الصورة */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full md:w-1/2 order-1 md:order-2 mb-6 md:mb-0"
        >
          <BannerImage />
        </motion.div>
      </div>
    </div>
  );
}
