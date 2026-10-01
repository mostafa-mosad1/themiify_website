"use client";

import { useState } from "react";
import Link from "next/link";
import { FaEnvelope, FaArrowLeft } from "react-icons/fa";
import { motion } from "framer-motion";
import Button from "@/components/ui/Button";
import { toast } from "sonner";
import Image from "next/image";
import forgotImage from "@/public/images/forgotpassword.png";
import doneImage from "@/public/images/donee.png";

export default function ForgotPasswordClient() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      setSent(true);
      toast.success("تم إرسال رابط إعادة تعيين كلمة السر إلى بريدك الإلكتروني");
    } catch (error: any) {
      toast.error(error.message || "حدث خطأ. يرجى المحاولة مرة أخرى");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 md:p-6 lg:p-8"
      dir="rtl"
    >
      <div className="flex flex-col md:flex-row h-auto w-full max-w-6xl bg-white p-6 md:p-8 rounded-3xl bg-glass">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="rounded-3xl p-4 md:p-6 lg:p-8 relative z-10 w-full md:w-1/2 flex flex-col order-2 md:order-1 "
        >
          <Link prefetch={false}
            href="/login"
            className="inline-flex justify-end items-center gap-2 text-gray-600 hover:text-primary mb-6 transition-colors "
          >
            <span>العودة لتسجيل الدخول</span>
            <FaArrowLeft size={16} />
          </Link>
          <div>
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
                  <span className="text-primary">Themify</span>
                </h1>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="mb-6 text-center"
            >
              <h2 className="text-xl md:text-2xl lg:text-3xl font-bold mb-2">
                إعاده تعيين كلمة المرور
              </h2>
              <p className="text-gray-500 text-sm">
                لأمان حسابك، يرجي تعيين كلمة مرور جديدة
              </p>
            </motion.div>

            {!sent ? (
              <form onSubmit={handleSubmit} className="space-y-5">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <label className="block text-gray-700 font-medium mb-2 text-sm">
                    البريد الإلكتروني
                  </label>
                  <div className="relative">
                    <FaEnvelope className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="example@email.com"
                      required
                      className="w-full pr-12 pl-4 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl outline-none focus:border-primary focus:bg-white transition-all"
                    />
                  </div>
                </motion.div>

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
                    className="w-full py-3.5 text-lg justify-center"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>جاري الإرسال...</span>
                      </div>
                    ) : (
                      "إرسال رابط إعادة التعيين"
                    )}
                  </Button>
                </motion.div>
              </form>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center"
              >
                <Image
                  src={doneImage}
                  alt="Done"
                  width={65}
                  height={65}
                  className="rounded-lg w-16 h-16 md:w-20 md:h-20 mb-5 mx-auto"
                />
                <h3 className="text-xl font-bold mb-5">تم إرسال الرابط!</h3>
                <motion.p
                  className="text-sm text-gray-500"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  إذا لم يصلك البريد، تحقق من مجلد الرسائل غير المرغوب فيها أو{" "}
                  <button
                    onClick={() => setSent(false)}
                    className="text-primary hover:underline"
                  >
                    حاول مرة أخرى
                  </button>
                </motion.p>
              </motion.div>
            )}

            <motion.p
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-sm text-gray-500 mt-6 text-center"
            >
              ليس لديك حساب؟{" "}
              <Link prefetch={false}
                href="/register"
                className="text-primary hover:text-primary/70 font-medium transition-colors"
              >
                أنشئ حساب جديد
              </Link>
            </motion.p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full md:w-1/2 order-1 md:order-2 mb-6 md:mb-0"
        >
          <Image
            src={forgotImage}
            alt="Forgot Password"
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
