"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { FaLock, FaHome, FaArrowLeft, FaUserShield } from "react-icons/fa";
import { useRouter } from "next/navigation";

interface UnauthorizedMessageProps {
  title?: string;
  message?: string;
  showLoginButton?: boolean;
  showHomeButton?: boolean;
  showBackButton?: boolean;
  isAdmin?: boolean; // ✅ لتحديد إذا كان المستخدم أدمن
  isLoggedIn?: boolean; // ✅ لتحديد إذا كان المستخدم مسجل دخول
}

export default function UnauthorizedMessage({
  title = "غير مصرح بالدخول",
  message = "عذراً، لا تملك الصلاحية للوصول إلى هذه الصفحة",
  showLoginButton = true,
  showHomeButton = true,
  showBackButton = true,
  isAdmin = false,
  isLoggedIn = false,
}: UnauthorizedMessageProps) {
  const router = useRouter();

  // ✅ تحديد رابط الصفحة الرئيسية حسب حالة المستخدم
  const getHomeLink = () => {
    if (isAdmin) return "/admin";
    return "/";
  };

  // ✅ تحديد نص الزر حسب حالة المستخدم
  const getHomeButtonText = () => {
    if (isAdmin) return "لوحة التحكم";
    return "الصفحة الرئيسية";
  };

  // ✅ تحديد الأيقونة حسب حالة المستخدم
  const getHomeIcon = () => {
    if (isAdmin) return <FaUserShield />;
    return <FaHome />;
  };

  return (
    <div className="flex items-center justify-center h-[70%] px-4">
      
      {/* خلفية متحركة بسيطة */}
      
      {/* <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      </div> */}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 text-center max-w-lg w-full"
      >
        {/* أيقونة تحذير متحركة */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="relative mx-auto w-28 h-28 mb-6"
        >
          <motion.div
            animate={{
              rotate: [0, 10, -10, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              repeatType: "reverse",
            }}
            className="absolute inset-0"
          >
            <div className="w-28 h-28 bg-red-100 rounded-3xl rotate-45 absolute -top-2 -right-2"></div>
            <div className="w-28 h-28 bg-gradient-to-br from-red-500 to-orange-500 rounded-3xl shadow-xl flex items-center justify-center">
              <FaLock className="text-white text-4xl" />
            </div>
          </motion.div>

          {/* نقاط متحركة حول الأيقونة */}
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
            }}
            className="absolute -top-2 -right-2 w-8 h-8 bg-red-400 rounded-full blur-sm"
          />
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: 0.5,
            }}
            className="absolute -bottom-2 -left-2 w-8 h-8 bg-orange-400 rounded-full blur-sm"
          />
        </motion.div>

        {/* عنوان */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-3xl md:text-4xl font-bold text-[var(--text-primary)] mb-3"
        >
          {title}
        </motion.h1>

        {/* خط فاصل متحرك */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="w-24 h-1 bg-gradient-to-r from-red-500 to-orange-500 mx-auto mb-4"
        />

        {/* رسالة */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-[var(--text-secondary)] mb-8 text-lg"
        >
          {message}
        </motion.p>

        {/* أزرار */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-3 justify-center"
        >
          {showBackButton && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.back()}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-[var(--bg-tertiary)] hover:bg-[var(--bg-secondary)] text-[var(--text-primary)] rounded-xl transition-all duration-300 shadow-md hover:shadow-lg border border-[var(--border-color)]"
            >
              <FaArrowLeft className="text-sm" />
              <span>رجوع</span>
            </motion.button>
          )}

          {showHomeButton && (
            <Link prefetch={false} href={getHomeLink()}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-orange-500 text-white rounded-xl transition-all duration-300 shadow-md hover:shadow-lg"
              >
                {getHomeIcon()}
                <span>{getHomeButtonText()}</span>
              </motion.button>
            </Link>
          )}

          {showLoginButton && !isLoggedIn && (
            <Link prefetch={false} href="/login">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-all duration-300 shadow-md hover:shadow-lg"
              >
                <FaLock />
                <span>تسجيل الدخول</span>
              </motion.button>
            </Link>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}
