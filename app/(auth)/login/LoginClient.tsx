"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { FaEye, FaEyeSlash, FaEnvelope, FaLock } from "react-icons/fa";
import { motion } from "framer-motion";
import Link from "next/link";
import { toast } from "sonner";
import Image from "next/image";
import BannerImage from "./BannerImage";
import Button from "@/components/ui/Button";
import { loginUser } from "@/lib/api/auth";

// Inner component that safely uses useSearchParams inside a Suspense boundary
function SearchParamsHandler({
  onRegistered,
  onAuthError,
}: {
  onRegistered: () => void;
  onAuthError: () => void;
}) {
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("registered") === "true") onRegistered();
    if (searchParams.get("error") === "auth") onAuthError();
  }, [searchParams, onRegistered, onAuthError]);

  return null;
}

export default function LoginClient() {
  const [mounted, setMounted] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setError("يرجى إدخال البريد الإلكتروني وكلمة المرور");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await loginUser({
        email: formData.email.trim(),
        password: formData.password,
      });

      if (!res.success || !res.data) {
        throw new Error(res.error || res.message || "البريد الإلكتروني أو كلمة المرور غير صحيحة");
      }

      const token = res.data.token;
      const responseRole = String(res.data.role || "").toLowerCase();
      const user = res.data.admin || res.data.user;

      const isSuperAdmin = Boolean(
        res.data.is_super_admin ||
        user?.is_super_admin ||
        responseRole === "super_admin"
      );
      const isUserAdmin = Boolean(
        isSuperAdmin ||
        res.data.is_admin ||
        responseRole === "admin" ||
        responseRole === "super_admin" ||
        user?.is_admin ||
        Boolean(res.data.admin) ||
        user?.role === "admin" ||
        user?.role === "super_admin"
      );

      const resolvedRole = isSuperAdmin
        ? "super_admin"
        : isUserAdmin
          ? "admin"
          : "user";

      if (token) {
        // تخزين التوكن في الكوكيز للـ Server Components
        document.cookie = `authToken=${token}; path=/; max-age=${60 * 60 * 24 * 7}; samesite=lax`;
        document.cookie = `bearer_token=${token}; path=/; max-age=${60 * 60 * 24 * 7}; samesite=lax`;
        if (isUserAdmin) {
          document.cookie = `adminToken=${token}; path=/; max-age=${60 * 60 * 24 * 7}; samesite=lax`;
        } else {
          document.cookie = "adminToken=; path=/; max-age=0; samesite=lax";
        }
        
        const sessionPayload = {
          userName: user?.name || user?.userName || "",
          userAvatar: user?.avatar || "",
          email: user?.email || formData.email.trim(),
          isAdmin: isUserAdmin,
          is_super_admin: isSuperAdmin,
          userRole: resolvedRole,
          isLoggedIn: true,
        };
        document.cookie = `localAuthSession=${encodeURIComponent(JSON.stringify(sessionPayload))}; path=/; max-age=${60 * 60 * 24 * 7}; samesite=lax`;

        try {
          localStorage.setItem("authToken", token);
          localStorage.setItem("bearer_token", token);
          if (isUserAdmin) localStorage.setItem("adminToken", token);
          else localStorage.removeItem("adminToken");
          localStorage.setItem("localAuthSession", JSON.stringify(sessionPayload));
          localStorage.setItem(
            "userData",
            JSON.stringify({
              ...(user ?? {}),
              ...sessionPayload,
            }),
          );
        } catch {}

      }

      toast.success("تم تسجيل الدخول بنجاح");
      
      const redirectPath = isUserAdmin ? "/admin" : "/";
      window.location.href = redirectPath;
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "حدث خطأ أثناء تسجيل الدخول";
      setError(errorMessage);
      toast.error(errorMessage || "فشل تسجيل الدخول");
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4 md:p-6 lg:p-8"
        dir="rtl"
      >
        <div className="flex flex-col md:flex-row h-auto w-full max-w-6xl bg-white p-6 md:p-8 rounded-3xl bg-glass shadow-2xl">
          <div className="rounded-3xl p-4 md:p-6 lg:p-8 relative z-10 w-full md:w-1/2 flex flex-col justify-center order-2 md:order-1">
            <div className="text-center mb-6 md:mb-8">
              <div className="inline-block mb-4">
                <div className="flex items-center justify-center gap-2">
                  <div className="w-8 h-8 md:w-10 md:h-10 bg-gray-200 rounded-lg animate-pulse"></div>
                  <div className="w-24 h-8 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
              <div className="w-40 h-4 bg-gray-200 rounded mx-auto animate-pulse"></div>
            </div>
            <div className="space-y-4 md:space-y-5">
              <div>
                <div className="w-24 h-4 bg-gray-200 rounded mb-2 animate-pulse"></div>
                <div className="w-full h-12 bg-gray-200 rounded-full animate-pulse"></div>
              </div>
              <div>
                <div className="w-24 h-4 bg-gray-200 rounded mb-2 animate-pulse"></div>
                <div className="w-full h-12 bg-gray-200 rounded-full animate-pulse"></div>
              </div>
              <div className="w-full h-12 bg-gray-200 rounded-full animate-pulse mt-6"></div>
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
    <div
      className="min-h-screen flex items-center justify-center p-4 md:p-6 lg:p-8"
      dir="rtl"
    >
      <Suspense fallback={null}>
        <SearchParamsHandler
          onRegistered={() => setSuccess(true)}
          onAuthError={() =>
            setError("فشل تسجيل الدخول. يرجى المحاولة مرة أخرى.")
          }
        />
      </Suspense>
      <div className="flex flex-col md:flex-row h-auto w-full max-w-6xl bg-white p-6 md:p-8 rounded-3xl bg-glass">
        {/* Form Column */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="rounded-3xl p-4 md:p-6 lg:p-8 relative z-10 w-full md:w-1/2 flex flex-col justify-center order-2 md:order-1"
        >
          <div className="text-center mb-6 md:mb-8">
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
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-gray-500 text-xs md:text-sm"
            >
              خطوة عليك والباقي علينا
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-4 md:mb-6 text-center font-bold"
          >
            <h2 className="text-xl md:text-2xl lg:text-3xl mb-1 md:mb-2">
              أهلاً! بعودتك
            </h2>
            <p className="text-lg md:text-xl lg:text-2xl mt-1">
              كل ما تحتاجه في مكان واحد
            </p>
          </motion.div>

          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-2 md:p-3 bg-green-50 text-green-600 rounded-xl text-xs md:text-sm"
            >
              تم إنشاء الحساب بنجاح! يمكنك تسجيل الدخول الآن
            </motion.div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-2 md:p-3 bg-red-50 text-red-600 rounded-xl text-xs md:text-sm"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleEmailLogin} className="space-y-4 md:space-y-5">
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
                  className="w-full px-9 md:px-11 py-2.5 md:py-3.5 border-2 border-gray-200 rounded-full outline-none focus:border-primary transition-all shadow-inner shadow-gray-200 text-sm md:text-base"
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
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
                  className="w-full px-9 md:px-11 py-2.5 md:py-3.5 border-2 border-gray-200 rounded-full outline-none focus:border-primary transition-all shadow-inner shadow-gray-200 text-sm md:text-base"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-colors"
                >
                  {showPassword ? (
                    <FaEyeSlash size={16} className="md:w-[18px] md:h-[18px]" />
                  ) : (
                    <FaEye size={16} className="md:w-[18px] md:h-[18px]" />
                  )}
                </button>
              </div>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
            >
              <Link
                href="/forgotpassword"
                className="text-gray-500 hover:text-primary font-medium text-xs md:text-sm transition-colors mr-1 underline"
              >
                نسيت كلمة المرور؟
              </Link>
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full"
            >
              <Button
                type="submit"
                disabled={loading}
                variant="primary"
                className="w-full py-2.5 md:py-3.5 text-sm md:text-lg justify-center"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 md:w-5 md:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>جاري تسجيل الدخول...</span>
                  </div>
                ) : (
                  "تسجيل الدخول"
                )}
              </Button>
            </motion.div>
          </form>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="text-sm md:text-base text-gray-500 mt-4 md:mt-6 text-center"
          >
            ليس لديك حساب؟{" "}
            <Link
              href="/register"
              className="text-primary hover:text-primary/70 font-medium text-xs md:text-sm transition-colors mr-1"
            >
              أنشئ حساب جديد
            </Link>
          </motion.p>
        </motion.div>

        {/* Banner Column */}
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
