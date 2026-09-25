"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FaLock, FaEye, FaEyeSlash, FaArrowLeft } from "react-icons/fa";
import { motion } from "framer-motion";
import Button from "@/components/ui/Button";
import { toast } from "sonner";
import Image from "next/image";
import resetImage from "@/public/images/forgotpassword.png";

export default function ResetPasswordClient() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
      return;
    }

    if (password !== confirmPassword) {
      setError("كلمة المرور غير متطابقة");
      return;
    }

    setLoading(true);

    try {
      toast.success("تم تغيير كلمة المرور بنجاح");
      router.push("/login");
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 md:p-6 lg:p-8"
      dir="rtl"
    >
      <div className="flex flex-col md:flex-row h-auto w-full max-w-6xl bg-white p-6 md:p-8 rounded-3xl bg-glass shadow-2xl">
        {/* القسم الأيمن - الفورم */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="rounded-3xl p-4 md:p-6 lg:p-8 relative z-10 w-full md:w-1/2 flex flex-col justify-center order-2 md:order-1"
        >
          {/* رجوع */}
          <Link
            href="/login"
            className="inline-flex justify-end items-center gap-2 text-gray-600 hover:text-primary mb-6 transition-colors"
          >
            <span>العودة لتسجيل الدخول</span>
            <FaArrowLeft size={16} />
          </Link>

          <div>
            {/* الشعار */}
            <div className="text-center mb-6 md:mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="mb-4 flex items-center justify-center gap-2"
              >
                <Image
                  src="/favicon.ico"
                  alt="Logo"
                  width={35}
                  height={35}
                  className="rounded-lg w-8 h-8 md:w-10 md:h-10"
                />
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold">
                  <span className="text-primary">Themiify</span>
                </h1>
              </motion.div>
            </div>

            {/* عنوان الصفحة */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="mb-6 text-center"
            >
              <h2 className="text-xl md:text-2xl lg:text-3xl font-bold mb-2">
                إعادة تعيين كلمة المرور
              </h2>
              <p className="text-gray-500 text-sm">أدخل كلمة المرور الجديدة</p>
            </motion.div>

            {/* رسالة الخطأ */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm"
              >
                {error}
              </motion.div>
            )}

            {/* الفورم */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* حقل كلمة المرور الجديدة */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <label className="block text-gray-700 font-medium mb-2 text-sm">
                  كلمة المرور الجديدة
                </label>
                <div className="relative">
                  <FaLock className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="********"
                    required
                    minLength={6}
                    className="w-full pr-12 pl-12 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl outline-none focus:border-primary focus:bg-white transition-all text-right"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-colors cursor-pointer"
                  >
                    {showPassword ? (
                      <FaEyeSlash size={18} />
                    ) : (
                      <FaEye size={18} />
                    )}
                  </button>
                </div>
              </motion.div>

              {/* حقل تأكيد كلمة المرور */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <label className="block text-gray-700 font-medium mb-2 text-sm">
                  تأكيد كلمة المرور
                </label>
                <div className="relative">
                  <FaLock className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="********"
                    required
                    className="w-full pr-12 pl-12 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl outline-none focus:border-primary focus:bg-white transition-all text-right"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-colors cursor-pointer"
                  >
                    {showConfirmPassword ? (
                      <FaEyeSlash size={18} />
                    ) : (
                      <FaEye size={18} />
                    )}
                  </button>
                </div>
              </motion.div>

              {/* زر تغيير كلمة المرور */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  type="submit"
                  disabled={loading}
                  variant="primary"
                  className="w-full py-3.5 text-lg justify-center cursor-pointer"
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>جاري التغيير...</span>
                    </div>
                  ) : (
                    "تغيير كلمة المرور"
                  )}
                </Button>
              </motion.div>
            </form>

            {/* رابط العودة للتسجيل */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="text-sm text-gray-500 mt-6 text-center"
            >
              ليس لديك حساب؟{" "}
              <Link
                href="/register"
                className="text-primary hover:text-primary/70 font-medium transition-colors"
              >
                أنشئ حساب جديد
              </Link>
            </motion.p>
          </div>
        </motion.div>

        {/* القسم الأيسر - الصورة */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full md:w-1/2 order-1 md:order-2 mb-6 md:mb-0"
        >
          <Image
            src={resetImage}
            alt="Reset Password"
            className="w-full h-auto rounded-2xl object-cover max-h-[300px] md:max-h-full"
            width={500}
            height={500}
            priority
          />
        </motion.div>
      </div>
    </div>
  );
}
