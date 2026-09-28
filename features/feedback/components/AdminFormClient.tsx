"use client";

import React, { useState, useEffect } from "react";
import {
  FaStar,
  FaPhone,
  FaEnvelope,
  FaUser,
  FaCheck,
  FaTimes,
  FaEye,
  FaSearch,
  FaExclamationTriangle,
  FaArrowLeft,
  FaArrowRight,
  FaDownload,
  FaTrash,
  FaCheckCircle,
  FaGlobe,
} from "react-icons/fa";
import { toast } from "sonner";
import * as XLSX from 'xlsx';
import { fetchAdminFeedbacks, updateAdminFeedback, deleteAdminFeedback } from "@/lib/api/feedbacks";
import {
  FilterStatus,
  FilterRating,
  FilterProfession,
  FEEDBACK_STATUS_OPTIONS,
  FEEDBACK_RATING_OPTIONS,
  FEEDBACK_PROFESSION_OPTIONS,
  getFeedbackStatusColor,
  getFeedbackRatingColor,
  FEEDBACK_EXCEL_COL_WIDTHS,
} from "../data";

// تعريف نوع التقييم
interface Feedback {
  id: number;
  created_at: string;
  email?: string;
  updated_at: string;
  fullName: string;
  phoneNumber: string;
  storeLink?: string;
  overallRating: string;
  experienceFeedback?: string;
  hadDifficulty: boolean;
  difficultyDetails?: string;
  improvementsSuggestions?: string;
  recommendation: boolean;
  profession: string;
  status: string;
  adminNotes?: string;
  userAgent?: string;
  pageUrl: string;
  user_id?: string;
}

const FeedbacksAdminPage = () => {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(
    null,
  );
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [updating, setUpdating] = useState(false);

  // حالات التصفية
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("الكل");
  const [filterRating, setFilterRating] = useState<FilterRating>("الكل");
  const [filterProfession, setFilterProfession] =
    useState<FilterProfession>("الكل");
  const [searchTerm, setSearchTerm] = useState("");

  // حالات الصفحات
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // جلب التقييمات
  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      const result = await fetchAdminFeedbacks();
      let localData = (result.feedbacks || []) as unknown as Feedback[];
      if (filterStatus !== "الكل") {
        localData = localData.filter((item) => item.status === filterStatus);
      }
      if (filterRating !== "الكل") {
        localData = localData.filter((item) => item.overallRating === filterRating);
      }
      if (filterProfession !== "الكل") {
        localData = localData.filter((item) => item.profession === filterProfession);
      }

      setFeedbacks(localData);
    } catch (error: any) {
      console.error("خطأ في جلب التقييمات:", error);
      toast.error("فشل في جلب التقييمات");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, [filterStatus, filterRating, filterProfession]);

  // تحديث حالة التقييم
  const updateFeedbackStatus = async (id: number, newStatus: string) => {
    try {
      setUpdating(true);
      const res = await updateAdminFeedback(id, { status: newStatus, updated_at: new Date().toISOString() });
      if (!res.success) {
        throw new Error(res.error || "فشل تحديث الحالة");
      }

      toast.success(`تم تحديث الحالة إلى ${newStatus}`);
      fetchFeedbacks();

      if (selectedFeedback?.id === id) {
        setSelectedFeedback({ ...selectedFeedback, status: newStatus });
      }
    } catch (error: any) {
      toast.error("فشل في تحديث الحالة");
    } finally {
      setUpdating(false);
    }
  };

  // دالة تصدير Excel
  const exportToExcel = () => {
    const filtered = getFilteredFeedbacks();

    // تجهيز البيانات
    const data = filtered.map((f) => ({
      'التاريخ': (() => {
        const date = new Date(f.created_at);
        const day = date.getDate();
        const month = date.getMonth() + 1;
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
      })(),
      'الاسم': f.fullName,
      'رقم الموبايل': f.phoneNumber,
      'البريد الإلكتروني': f.email,
      'لينك المتجر': f.storeLink,
      'المهنة': f.profession,
      'التقييم': f.overallRating,
      'التعليق': f.experienceFeedback,
      'التوصية': f.recommendation ? "نعم" : "لا",
      'الحالة': f.status,
      'واجه صعوبة': f.hadDifficulty ? "نعم" : "لا",
      'تفاصيل الصعوبة': f.difficultyDetails || "-",
      'اقتراحات التحسين': f.improvementsSuggestions || "-",
      'ملاحظات المسؤول': f.adminNotes || "-",
      'تاريخ التحديث': (() => {
        const date = new Date(f.updated_at);
        const day = date.getDate();
        const month = date.getMonth() + 1;
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
      })(),
    }));

    // إنشاء ورقة عمل
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Feedbacks");

    // تنسيق الأعمدة (عرض أفضل)
    ws['!cols'] = FEEDBACK_EXCEL_COL_WIDTHS;

    // تصدير الملف
    XLSX.writeFile(wb, `feedbacks-${new Date().toISOString().split('T')[0]}.xlsx`);
    
    toast.success("تم تصدير الملف بنجاح");
  };

  // حذف تقييم
  const deleteFeedback = async (id: number) => {
    toast.custom(
      (t) => (
        <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <FaExclamationTriangle className="text-red-500 text-xl" />
            </div>
            <div>
              <h3 className="font-bold text-gray-800 text-lg">تأكيد الحذف</h3>
              <p className="text-sm text-gray-600">
                هل أنت متأكد من حذف هذا التقييم؟
              </p>
            </div>
          </div>

          <p className="text-xs text-red-500 mb-4 bg-red-50 p-2 rounded-lg">
            ⚠️ لا يمكن التراجع عن هذا الإجراء
          </p>

          <div className="flex gap-2">
            <button
              onClick={() => {
                toast.dismiss(t as string);
                executeDelete(id);
              }}
              className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
            >
              نعم، احذف
            </button>
            <button
              onClick={() => toast.dismiss(t as string)}
              className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              إلغاء
            </button>
          </div>
        </div>
      ),
      {
        duration: Infinity,
        position: "top-center",
      },
    );
  };

  // دالة التنفيذ الفعلية للحذف
  const executeDelete = async (id: number) => {
    try {
      setUpdating(true);

      toast.loading("جاري حذف التقييم...", { id: "delete-feedback" });

      const result = await deleteAdminFeedback(id);
      if (!result.success) {
        throw new Error(result.error || "فشل حذف التقييم");
      }

      toast.success("✅ تم حذف التقييم بنجاح", { id: "delete-feedback" });

      fetchFeedbacks();

      if (selectedFeedback?.id === id) {
        setSelectedFeedback(null);
        setShowDetailsModal(false);
      }
    } catch (error: any) {
      toast.error(
        "❌ فشل في حذف التقييم: " + (error.message || "خطأ غير معروف"),
        {
          id: "delete-feedback",
          duration: 4000,
        },
      );
      console.error("خطأ في الحذف:", error);
    } finally {
      setUpdating(false);
    }
  };

  // الحصول على لون حالة التقييم
  const getStatusColor = getFeedbackStatusColor;

  // الحصول على لون التقييم
  const getRatingColor = getFeedbackRatingColor;

  // تصفية وبحث
  const getFilteredFeedbacks = () => {
    return feedbacks.filter((f) => {
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        return (
          f.fullName.toLowerCase().includes(term) ||
          f.phoneNumber.includes(term) ||
          f.email?.toLowerCase().includes(term) ||
          f.experienceFeedback?.toLowerCase().includes(term)
        );
      }
      return true;
    });
  };

  // Pagination
  const filteredFeedbacks = getFilteredFeedbacks();
  const totalPages = Math.ceil(filteredFeedbacks.length / itemsPerPage);
  const paginatedFeedbacks = filteredFeedbacks.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  // إحصائيات سريعة
  const stats = {
    total: feedbacks.length,
    new: feedbacks.filter((f) => f.status === "جديد").length,
    reviewed: feedbacks.filter((f) => f.status === "تم المراجعة").length,
    contacted: feedbacks.filter((f) => f.status === "تم التواصل").length,
    positive: feedbacks.filter(
      (f) => f.overallRating === "ممتاز" || f.overallRating === "جيد جدًا",
    ).length,
    negative: feedbacks.filter(
      (f) => f.overallRating === "غير راضٍ" || f.overallRating === "مقبول",
    ).length,
    recommend: feedbacks.filter((f) => f.recommendation === true).length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل التقييمات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen  p-4" dir="rtl">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">
              إدارة التقييمات
            </h1>
            <p className=" mt-2">
              إجمالي التقييمات: {feedbacks.length} تقييم
            </p>
          </div>
          <button
            onClick={exportToExcel}
            className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <FaDownload />
            <span>تصدير Excel</span>
          </button>
        </div>
      </div>
      {/* Stats Cards - Grid ذكي */}
      <div className={`max-w-7xl mx-auto mb-8 grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4`}>
        <div className="bg-glass rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm">جديد</p>
              <p className="text-3xl font-bold text-blue-600">{stats.new}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FaEye className="text-blue-600 text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-glass rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">تقييمات إيجابية</p>
              <p className="text-3xl font-bold text-green-600">
                {stats.positive}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <FaStar className="text-green-600 text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-glass rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">تقييمات سلبية</p>
              <p className="text-3xl font-bold text-red-600">
                {stats.negative}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <FaExclamationTriangle className="text-red-600 text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-glass rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">يوصي بنا</p>
              <p className="text-3xl font-bold text-purple-600">
                {stats.recommend}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <FaCheckCircle className="text-purple-600 text-xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto mb-6 bg-glass rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <FaSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="بحث..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-10 pl-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-orange-500"
            />
          </div>

          {/* Filter by Status */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-orange-500"
          >
            {FEEDBACK_STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {status === "الكل" ? "جميع الحالات" : status}
              </option>
            ))}
          </select>

          {/* Filter by Rating */}
          <select
            value={filterRating}
            onChange={(e) => setFilterRating(e.target.value as FilterRating)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-orange-500"
          >
            {FEEDBACK_RATING_OPTIONS.map((rating) => (
              <option key={rating} value={rating}>
                {rating === "الكل" ? "جميع التقييمات" : rating}
              </option>
            ))}
          </select>

          {/* Filter by Profession */}
          <select
            value={filterProfession}
            onChange={(e) =>
              setFilterProfession(e.target.value as FilterProfession)
            }
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-orange-500"
          >
            {FEEDBACK_PROFESSION_OPTIONS.map((prof) => (
              <option key={prof} value={prof}>
                {prof === "الكل" ? "جميع المهن" : prof}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Feedbacks Table */}
      <div className="max-w-7xl mx-auto bg-glass rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-2 py-4 text-right text-sm font-semibold text-gray-600">
                  التاريخ
                </th>
                <th className="px-2 py-4 text-right text-sm font-semibold text-gray-600">
                  الاسم
                </th>
                <th className="px-2 py-4 text-right text-sm font-semibold text-gray-600">
                  رقم الموبايل
                </th>
                <th className="px-2 py-4 text-right text-sm font-semibold text-gray-600">
                  المهنة
                </th>
                <th className="px-2 py-4 text-right text-sm font-semibold text-gray-600">
                  التقييم
                </th>
                <th className="px-2 py-4 text-right text-sm font-semibold text-gray-600">
                  التوصية
                </th>
                <th className="px-2 py-4 text-right text-sm font-semibold text-gray-600">
                  الحالة
                </th>
                <th className="px-2 py-4 text-right text-sm font-semibold text-gray-600">
                  الإجراءات
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedFeedbacks.map((feedback) => (
                <tr
                  key={feedback.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <td className="px-2 py-4 text-sm text-gray-600">
                    {(() => {
                      const date = new Date(feedback.created_at);
                      const day = date.getDate();
                      const month = date.getMonth() + 1;
                      const year = date.getFullYear();
                      return `${day}/${month}/${year}`;
                    })()}
                  </td>
                  <td className="px-2 py-4">
                    <div className="font-medium ">
                      {feedback.fullName}
                    </div>
                  </td>
                  <td className="px-2 py-4 text-sm ">
                    {feedback.phoneNumber}
                  </td>
                  <td className="px-2 py-4 text-sm ">
                    {feedback.profession}
                  </td>
                  <td className="px-2 py-4">
                    <span
                      className={`font-medium ${getRatingColor(feedback.overallRating)}`}
                    >
                      {feedback.overallRating}
                    </span>
                  </td>
                  <td className="px-2 py-4">
                    {feedback.recommendation ? (
                      <span className="text-green-600">نعم</span>
                    ) : (
                      <span className="text-red-600">لا</span>
                    )}
                  </td>
                  <td className="px-2 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(feedback.status)}`}
                    >
                      {feedback.status}
                    </span>
                  </td>
                  <td className="px-2 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedFeedback(feedback);
                          setShowDetailsModal(true);
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="عرض التفاصيل"
                      >
                        <FaEye />
                      </button>
                      <button
                        onClick={() => deleteFeedback(feedback.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="حذف التقييم"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-2 py-4 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              عرض {(currentPage - 1) * itemsPerPage + 1} -{" "}
              {Math.min(currentPage * itemsPerPage, filteredFeedbacks.length)}{" "}
              من {filteredFeedbacks.length}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FaArrowRight />
              </button>
              <span className="px-4 py-2 bg-orange-50 text-orange-600 rounded-lg">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FaArrowLeft />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedFeedback && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] shadow-2xl flex flex-col overflow-hidden border border-gray-100">
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-5 text-white shrink-0">
              <div className="flex justify-between items-center gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm shrink-0">
                    <FaUser className="text-2xl text-white" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs text-orange-100 font-medium block mb-0.5">
                      تفاصيل تقييم العميل
                    </span>
                    <h3 className="text-xl font-bold !text-white break-words">
                      {selectedFeedback.fullName || "غير متوفر"}
                    </h3>
                    <p className="text-orange-100 text-sm mt-0.5 flex items-center gap-2">
                      <span className="inline-block w-2 h-2 bg-emerald-300 rounded-full animate-pulse"></span>
                      <span>المهنة: {selectedFeedback.profession || "غير محدد"}</span>
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="w-9 h-9 bg-white/15 rounded-xl hover:bg-white/30 transition-colors flex items-center justify-center text-white shrink-0"
                >
                  <FaTimes className="text-lg text-white" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto flex-1 min-h-0 space-y-4 bg-gray-50/50">
              {/* بطاقات المعلومات الأساسية */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                  <div className="flex items-center gap-2 text-blue-600 mb-2">
                    <FaPhone className="text-lg" />
                    <span className="text-sm font-medium">رقم الموبايل</span>
                  </div>
                  <p className="text-gray-800 font-bold text-base" dir="ltr">
                    {selectedFeedback.phoneNumber || "غير متوفر"}
                  </p>
                </div>

                <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                  <div className="flex items-center gap-2 text-purple-600 mb-2">
                    <FaCheckCircle className="text-lg" />
                    <span className="text-sm font-medium">تاريخ الإرسال</span>
                  </div>
                  <p className="text-gray-800 font-bold text-sm">
                    {(() => {
                      const date = new Date(selectedFeedback.created_at);
                      const day = date.getDate();
                      const month = date.getMonth() + 1;
                      const year = date.getFullYear();
                      const hours = date.getHours().toString().padStart(2, '0');
                      const minutes = date.getMinutes().toString().padStart(2, '0');
                      return `${day}/${month}/${year} ${hours}:${minutes}`;
                    })()}
                  </p>
                </div>

                <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                  <div className="flex items-center gap-2 text-emerald-600 mb-2">
                    <FaGlobe className="text-lg" />
                    <span className="text-sm font-medium">المتجر</span>
                  </div>
                  {selectedFeedback.storeLink ? (
                    <a
                      href={selectedFeedback.storeLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-800 font-bold hover:text-emerald-600 transition-colors truncate block text-sm"
                      dir="ltr"
                    >
                      {selectedFeedback.storeLink.replace("https://", "")}
                    </a>
                  ) : (
                    <p className="text-gray-400 text-sm">غير متوفر</p>
                  )}
                </div>
              </div>

              {/* بطاقة التقييم */}
              <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 bg-orange-100 rounded-lg flex items-center justify-center">
                      <FaStar className="text-orange-500 text-lg" />
                    </div>
                    <span className="font-bold text-gray-700">
                      التقييم العام
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      selectedFeedback.overallRating === "ممتاز" ? "bg-green-100 text-green-700" :
                      selectedFeedback.overallRating === "جيد جدًا" ? "bg-blue-100 text-blue-700" :
                      selectedFeedback.overallRating === "جيد" ? "bg-yellow-100 text-yellow-700" :
                      selectedFeedback.overallRating === "مقبول" ? "bg-orange-100 text-orange-700" :
                      selectedFeedback.overallRating === "غير راضٍ" ? "bg-red-100 text-red-700" :
                      "bg-gray-100 text-gray-700"
                    }`}>
                      {selectedFeedback.overallRating}
                    </span>
                  </div>
                </div>
                {selectedFeedback.experienceFeedback && (
                  <div className="mb-3 p-3 bg-gray-50 rounded-lg text-sm">
                    <p className="text-gray-700 leading-relaxed">
                      "{selectedFeedback.experienceFeedback}"
                    </p>
                  </div>
                )}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 font-medium">التوصية للآخرين:</span>
                  <span
                    className={`font-bold ${
                      selectedFeedback.recommendation
                        ? "text-emerald-600"
                        : "text-red-600"
                    }`}
                  >
                    {selectedFeedback.recommendation ? "نعم" : "لا"}
                  </span>
                </div>
              </div>

              {/* اقتراحات التحسين */}
              {selectedFeedback.improvementsSuggestions && (
                <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <FaCheckCircle className="text-purple-500 text-base" />
                    </div>
                    <span className="font-bold text-gray-700 text-sm">
                      اقتراحات التحسين
                    </span>
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed bg-gray-50 p-3 rounded-lg">
                    {selectedFeedback.improvementsSuggestions}
                  </p>
                </div>
              )}

              {/* الصعوبات */}
              {selectedFeedback.hadDifficulty && (
                <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                      <FaExclamationTriangle className="text-red-500 text-base" />
                    </div>
                    <span className="font-bold text-gray-700 text-sm">
                      الصعوبات التي واجهها
                    </span>
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed bg-red-50/50 p-3 rounded-lg border-r-4 border-red-400">
                    {selectedFeedback.difficultyDetails || "لم يتم توضيح التفاصيل"}
                  </p>
                </div>
              )}

              {/* ملاحظات المسؤول */}
              {selectedFeedback.adminNotes && (
                <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center">
                      <FaCheck className="text-gray-600 text-base" />
                    </div>
                    <span className="font-bold text-gray-700 text-sm">
                      ملاحظات المسؤول
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm bg-gray-50 p-3 rounded-lg">
                    {selectedFeedback.adminNotes}
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 p-4 bg-gray-50 flex justify-end items-center gap-3 shrink-0">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium text-sm"
              >
                إغلاق
              </button>
              <button
                onClick={() => deleteFeedback(selectedFeedback.id)}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2 font-medium text-sm shadow-sm"
              >
                <FaTrash className="text-xs" />
                <span>حذف التقييم</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedbacksAdminPage;
