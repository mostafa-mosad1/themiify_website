"use client";

import React, { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  FaPlus,
  FaEdit,
  FaSearch,
  FaBox,
  FaUsers,
  FaEnvelope,
  FaCalendar,
  FaGlobe,
  FaEye,
} from "react-icons/fa";
import { IoMdAdd } from "react-icons/io";
import {
  MdAdminPanelSettings,
  MdCategory,
  MdArticle,
  MdHelp,
  MdHistory,
  MdSettings,
  MdSupport,
  MdInfo,
  MdDashboard,
} from "react-icons/md";
import DeleteButton from "./DeleteButton";
import Modal, { Field } from "./Modal";
import ViewDetailsModal from "./ViewDetailsModal";
import { stripHtml } from "@/lib/utils";
import { resolveIcon } from "@/lib/utils/iconMap";

// تعريف أنواع البيانات
export interface Column {
  key: string;
  label: string;
  type?: "text" | "email" | "date" | "badge" | "image" | "color" | "actions" | "icon";
  badgeColors?: { [key: string]: string };
  render?: (value: any, item: any) => React.ReactNode;
}

export interface PaginationInfo {
  current_page?: number;
  last_page?: number;
  per_page?: number;
  total?: number;
  from?: number | null;
  to?: number | null;
  currentPage?: number;
  lastPage?: number;
  perPage?: number;
}

export interface TablePageProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  data: any[];
  editData?: any[];
  columns: Column[];
  stats?: {
    label: string;
    value: number | string;
    icon: React.ReactNode;
    color?: string;
  }[];
  pagination?: PaginationInfo;
  itemsPerPage?: number;
  onAdd?: (formData: FormData) => Promise<{ success: boolean; error?: string }>;
  onEdit?: (
    formData: FormData,
  ) => Promise<{ success: boolean; error?: string }>;
  onDelete?: (id: string) => Promise<any>;
  onFetchItem?: (id: string | number) => Promise<any>;
  addModalFields?: Field[];
  editModalFields?: Field[];
  idKey?: string;
}

// دالة مساعدة لتنسيق التاريخ
function formatDate(dateString: string) {
  if (!dateString) return "-";
  try {
    return new Date(dateString).toLocaleDateString("ar-EG", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateString;
  }
}

// دالة للحصول على أيقونة الصفحة
function getPageIcon(title: string, icon?: React.ReactNode) {
  if (icon) return icon;

  const iconMap: { [key: string]: React.ReactNode } = {
    about: <MdInfo className="text-primary text-4xl" />,
    accounts: <MdAdminPanelSettings className="text-primary text-4xl" />,
    categories: <MdCategory className="text-primary text-4xl" />,
    essays: <MdArticle className="text-primary text-4xl" />,
    faqs: <MdHelp className="text-primary text-4xl" />,
    logs: <MdHistory className="text-primary text-4xl" />,
    platforms: <FaGlobe className="text-primary text-4xl" />,
    settings: <MdSettings className="text-primary text-4xl" />,
    support: <MdSupport className="text-primary text-4xl" />,
    users: <FaUsers className="text-primary text-4xl" />,
    themes: <FaBox className="text-primary text-4xl" />,
    dashboard: <MdDashboard className="text-primary text-4xl" />,
  };

  return (
    iconMap[title.toLowerCase()] || <MdInfo className="text-primary text-4xl" />
  );
}

// دالة لترجمة عنوان الصفحة
function getPageTitle(title: string): string {
  const titleMap: { [key: string]: string } = {
    about: "حول",
    accounts: "حسابات الأدمن",
    categories: "التصنيفات",
    essays: "المقالات",
    faqs: "الأسئلة الشائعة",
    logs: "سجل الأنشطة",
    platforms: "المنصات",
    settings: "الإعدادات",
    support: "الدعم الفني",
    users: "الموظفين",
    themes: "الثيمات",
    dashboard: "لوحة التحكم",
  };
  return titleMap[title.toLowerCase()] || title;
}

export default function TablePage({
  title,
  description,
  icon,
  data,
  editData,
  columns,
  stats = [],
  pagination,
  itemsPerPage,
  onAdd,
  onEdit,
  onDelete,
  onFetchItem,
  addModalFields = [],
  editModalFields = [],
  idKey = "id",
}: TablePageProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [searchTerm, setSearchTerm] = useState("");
  const [clientPage, setClientPage] = useState(1);
  const perPage = itemsPerPage || pagination?.per_page || pagination?.perPage || 15;

  const isServerPagination = Boolean(
    pagination && (
      (pagination.last_page ?? pagination.lastPage ?? 1) > 1 ||
      (pagination.total ?? 0) > perPage ||
      (pagination.current_page ?? pagination.currentPage ?? 1) > 1
    )
  );

  const activePage = isServerPagination
    ? (pagination?.current_page ?? pagination?.currentPage ?? 1)
    : clientPage;

  // Create a map for faster lookup
  const editDataMap = editData
    ? new Map(editData.map((item) => [String(item[idKey]), item]))
    : null;

  // تصفية البيانات حسب البحث
  const filteredData = data.filter((item) =>
    Object.values(item).some(
      (value) =>
        value &&
        value.toString().toLowerCase().includes(searchTerm.toLowerCase()),
    ),
  );

  // حساب الصفحات
  const totalPages = isServerPagination
    ? (pagination?.last_page ?? pagination?.lastPage ?? 1)
    : Math.ceil(filteredData.length / perPage);

  // البيانات المعروضة في الجدول
  const paginatedData = isServerPagination
    ? (searchTerm ? filteredData : data)
    : filteredData.slice((clientPage - 1) * perPage, clientPage * perPage);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    if (isServerPagination) {
      const params = new URLSearchParams(searchParams?.toString() || "");
      params.set("page", String(newPage));
      router.push(`${pathname}?${params.toString()}`);
    } else {
      setClientPage(newPage);
    }
  };

  const totalCount = isServerPagination
    ? (pagination?.total ?? data.length)
    : filteredData.length;

  const fromCount = isServerPagination
    ? (pagination?.from ?? ((activePage - 1) * perPage + 1))
    : ((clientPage - 1) * perPage + 1);

  const toCount = isServerPagination
    ? (pagination?.to ?? Math.min(activePage * perPage, totalCount))
    : Math.min(clientPage * perPage, totalCount);

  // أيقونة الصفحة
  const pageIcon = getPageIcon(title, icon);
  const pageTitle = getPageTitle(title);

  const handleFetchItem = onFetchItem
    ? async (id: string | number) => {
        try {
          const res = await onFetchItem(id);
          if (res) return res;
        } catch (err) {
          console.warn("onFetchItem error:", err);
        }
        return null;
      }
    : undefined;

  return (
    <div className="min-h-screen bg-[var(--bg-secondary)] p-4 md:p-8" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[var(--text-primary)] flex items-center gap-3">
              {pageIcon}
              <span>{pageTitle}</span>
            </h1>
            {description && (
              <p className="text-[var(--text-secondary)] mt-1 text-sm">{description}</p>
            )}
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            {onAdd && (
              <Modal
                title={`إضافة ${pageTitle}`}
                fields={addModalFields}
                onSubmit={onAdd}
                triggerButton={
                  <button className="bg-[var(--primary-color)] text-[var(--bg-primary)] px-5 py-2.5 rounded-full font-semibold hover:opacity-90 transition-all flex items-center gap-2 shadow-md">
                    <IoMdAdd size={20} />
                    <span>إضافة جديد</span>
                  </button>
                }
              />
            )}
          </div>
        </div>

        {/* Stats Cards */}
        {stats.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="bg-[var(--bg-primary)] p-6 rounded-2xl border border-[var(--border-color)] shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[var(--text-secondary)] text-sm mb-1">{stat.label}</p>
                    <h3 className="text-2xl font-bold text-[var(--text-primary)]">{stat.value}</h3>
                  </div>
                  <div className="p-3 bg-[var(--bg-tertiary)] rounded-xl">{stat.icon}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Table Section */}
        <div className="bg-[var(--bg-primary)] rounded-2xl border border-[var(--border-color)] overflow-hidden shadow-sm">
          {/* Search Bar */}
          <div className="p-6 border-b border-[var(--border-color)]">
            <div className="relative max-w-md">
              <input
                type="text"
                placeholder="بحث في الجدول..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setClientPage(1);
                }}
                className="w-full bg-[var(--bg-secondary)] text-[var(--text-primary)] pl-4 pr-10 py-2.5 rounded-full border border-[var(--border-color)] focus:border-[var(--primary-color)] outline-none text-sm transition-colors placeholder:text-[var(--text-tertiary)]"
              />
              <FaSearch className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] text-sm" />
            </div>
          </div>

          <div className="px-2 py-4 border-b border-[var(--border-color)] bg-[var(--bg-tertiary)] flex justify-between items-center">
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">
              قائمة {pageTitle}
            </h2>
            <p className="text-sm text-[var(--text-secondary)]">
              إجمالي:{" "}
              <span className="font-semibold text-[var(--text-primary)]">
                {filteredData.length}
              </span>
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[var(--bg-tertiary)]">
                  {columns.map((column) => (
                    <th
                      key={column.key}
                      className="text-right py-4 px-6 text-sm font-semibold text-[var(--text-secondary)] border-b border-[var(--border-color)]"
                    >
                      {column.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginatedData.length > 0 ? (
                  paginatedData.map((item, index) => (
                    <tr
                      key={item[idKey] || index}
                      className={`hover:bg-[var(--bg-tertiary)] transition-colors ${
                        index !== paginatedData.length - 1
                          ? "border-b border-[var(--border-light)]"
                          : ""
                      }`}
                    >
                      {columns.map((column) => {
                        if (column.key === "actions") {
                          return (
                            <td key="actions" className="py-4 px-6">
                              <div className="flex items-center gap-3">
                                {onFetchItem && (
                                  <>
                                    <ViewDetailsModal
                                      title={`تفاصيل ${pageTitle}`}
                                      item={editDataMap?.get(String(item[idKey])) || item}
                                      idKey={idKey}
                                      columns={columns}
                                      onFetchItem={handleFetchItem}
                                      triggerButton={
                                        <button
                                          type="button"
                                          className="text-blue-500 hover:text-blue-700 transition-colors p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg cursor-pointer"
                                          title="عرض التفاصيل"
                                        >
                                          <FaEye size={18} />
                                        </button>
                                      }
                                    />
                                    {(onEdit || onDelete) && (
                                      <span className="text-gray-300">|</span>
                                    )}
                                  </>
                                )}
                                {onEdit && (
                                  <Modal
                                    title={`تعديل ${pageTitle}`}
                                    fields={editModalFields}
                                    initialData={editDataMap?.get(String(item[idKey])) || item}
                                    isEdit={true}
                                    onSubmit={onEdit}
                                    onFetchInitialData={handleFetchItem}
                                    triggerButton={
                                      <button
                                        className="text-yellow-600 hover:text-yellow-700 transition-colors p-2 hover:bg-yellow-50 rounded-lg cursor-pointer"
                                        title="تعديل"
                                      >
                                        <FaEdit size={18} />
                                      </button>
                                    }
                                    idField={idKey}
                                  />
                                )}
                                {onDelete && (
                                  <>
                                    {onEdit && <span className="text-gray-300">|</span>}
                                    <DeleteButton
                                      onDelete={() =>
                                        onDelete(item[idKey]?.toString() || "")
                                      }
                                      itemName={`${pageTitle} "${
                                        item.name ||
                                        item.title ||
                                        item.email ||
                                        item.id
                                      }"`}
                                      buttonText=""
                                      className="text-red-500 hover:text-red-700 transition-colors p-2 hover:bg-red-50 rounded-lg cursor-pointer"
                                      confirmMessage={`هل أنت متأكد من حذف هذا العنصر؟`}
                                      iconOnly
                                    />
                                  </>
                                )}
                              </div>
                            </td>
                          );
                        }

                        const value = item[column.key];

                        // إذا كان هناك render مخصص
                        if (column.render) {
                          return (
                            <td key={column.key} className="py-4 px-6">
                              {column.render(value, item)}
                            </td>
                          );
                        }

                        // أنواع مختلفة من البيانات
                        switch (column.type) {
                          case "date":
                            return (
                              <td key={column.key} className="py-4 px-6">
                                <div className="flex items-center gap-2">
                                  <FaCalendar className="text-[var(--text-tertiary)] text-sm" />
                                  <span className="text-sm text-[var(--text-secondary)]">
                                    {formatDate(value)}
                                  </span>
                                </div>
                              </td>
                            );

                          case "email":
                            if (onFetchItem) {
                              return (
                                <td key={column.key} className="py-4 px-6">
                                  <ViewDetailsModal
                                    title={`تفاصيل ${pageTitle}`}
                                    item={editDataMap?.get(String(item[idKey])) || item}
                                    idKey={idKey}
                                    columns={columns}
                                    onFetchItem={handleFetchItem}
                                    triggerButton={
                                      <div className="flex items-center gap-2 cursor-pointer group">
                                        <FaEnvelope className="text-[var(--text-tertiary)] group-hover:text-primary transition-colors text-sm" />
                                        <span
                                          className="text-[var(--text-primary)] group-hover:text-primary font-semibold transition-colors"
                                          dir="ltr"
                                        >
                                          {value || "-"}
                                        </span>
                                      </div>
                                    }
                                  />
                                </td>
                              );
                            }
                            return (
                              <td key={column.key} className="py-4 px-6">
                                <div className="flex items-center gap-2">
                                  <FaEnvelope className="text-[var(--text-tertiary)] text-sm" />
                                  <span
                                    className="text-[var(--text-secondary)]"
                                    dir="ltr"
                                  >
                                    {value || "-"}
                                  </span>
                                </div>
                              </td>
                            );

                          case "badge":
                            const badgeColor =
                              column.badgeColors?.[value] ||
                              "bg-[var(--bg-tertiary)] text-[var(--text-primary)]";
                            return (
                              <td key={column.key} className="py-4 px-6">
                                <span
                                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${badgeColor} whitespace-nowrap`}
                                >
                                  {value}
                                </span>
                              </td>
                            );

                          case "image":
                            const imgVal = value || item.image_url || item.image;
                            return (
                              <td key={column.key} className="py-4 px-6">
                                {imgVal && typeof imgVal === "string" && !imgVal.includes("[object") && imgVal.trim() !== "" ? (
                                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center border border-[var(--border-color)]">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                      src={imgVal}
                                      alt={item.name || "صورة"}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                ) : (
                                  <div className="w-10 h-10 rounded-lg bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--text-tertiary)] border border-[var(--border-color)]">
                                    <MdCategory size={18} />
                                  </div>
                                )}
                              </td>
                            );

                          case "icon":
                            const iconVal = value || item.icon;
                            return (
                              <td key={column.key} className="py-4 px-6">
                                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-xl shadow-xs border border-primary/20">
                                  {resolveIcon(iconVal)}
                                </div>
                              </td>
                            );

                          case "color":
                            return (
                              <td key={column.key} className="py-4 px-6">
                                {value ? (
                                  <div className="flex items-center gap-2">
                                    <span
                                      className="w-4 h-4 rounded-full border border-gray-300 inline-block shadow-sm flex-shrink-0"
                                      style={{ backgroundColor: value }}
                                    />
                                    <span className="font-mono text-xs text-[var(--text-secondary)]" dir="ltr">
                                      {value}
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-[var(--text-tertiary)]">-</span>
                                )}
                              </td>
                            );

                          default:
                            const rawStr = value?.toString() || "-";
                            const cleanStr = typeof value === "string" ? stripHtml(value) : rawStr;
                            const isTitleOrName = column.key === "name" || column.key === "title";
                            if (isTitleOrName) {
                              return (
                                <td key={column.key} className="py-4 px-6">
                                  <ViewDetailsModal
                                    title={`تفاصيل ${pageTitle}`}
                                    item={editDataMap?.get(String(item[idKey])) || item}
                                    idKey={idKey}
                                    columns={columns}
                                    onFetchItem={handleFetchItem}
                                    triggerButton={
                                      <span
                                        className="text-[var(--text-primary)] hover:text-primary font-semibold block max-w-96 truncate cursor-pointer transition-colors"
                                        title={cleanStr}
                                      >
                                        {cleanStr}
                                      </span>
                                    }
                                  />
                                </td>
                              );
                            }
                            return (
                              <td key={column.key} className="py-4 px-6">
                                <span
                                  className="text-[var(--text-primary)] block max-w-96 truncate"
                                  title={cleanStr}
                                >
                                  {cleanStr}
                                </span>
                              </td>
                            );
                        }
                      })}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={columns.length} className="text-center py-16">
                      <div className="flex flex-col items-center gap-4">
                        <div className="bg-[var(--bg-tertiary)] p-4 rounded-full">
                          {pageIcon}
                        </div>
                        <p className="text-[var(--text-secondary)] text-lg">
                          لا توجد بيانات بعد
                        </p>
                        {onAdd && (
                          <Modal
                            title={`إضافة ${pageTitle}`}
                            fields={addModalFields}
                            onSubmit={onAdd}
                            triggerButton={
                              <button className="bg-primary hover:bg-primary/80 text-white px-6 py-2 rounded-lg transition-all flex items-center gap-2">
                                <FaPlus size={16} />
                                <span>إضافة جديد</span>
                              </button>
                            }
                          />
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-[var(--border-color)] bg-[var(--bg-tertiary)] flex flex-col sm:flex-row justify-between items-center gap-4">
              <p className="text-sm text-[var(--text-secondary)]">
                عرض{" "}
                <span className="font-medium text-[var(--text-primary)]">
                  {fromCount}
                </span>{" "}
                -{" "}
                <span className="font-medium text-[var(--text-primary)]">
                  {toCount}
                </span>{" "}
                من{" "}
                <span className="font-bold text-[var(--text-primary)]">
                  {totalCount}
                </span>
              </p>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handlePageChange(activePage - 1)}
                  disabled={activePage <= 1}
                  className="px-3.5 py-1.5 rounded-xl border border-[var(--border-color)] text-sm font-medium text-[var(--text-primary)] bg-[var(--bg-primary)] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[var(--bg-secondary)] transition-all shadow-sm"
                >
                  السابق
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((page) => {
                      if (totalPages <= 7) return true;
                      return (
                        page === 1 ||
                        page === totalPages ||
                        Math.abs(page - activePage) <= 1
                      );
                    })
                    .reduce<(number | string)[]>((acc, page, idx, arr) => {
                      if (idx > 0) {
                        const prev = arr[idx - 1];
                        if (typeof prev === "number" && page - prev > 1) {
                          acc.push(`dots-${page}`);
                        }
                      }
                      acc.push(page);
                      return acc;
                    }, [])
                    .map((item) => {
                      if (typeof item === "string") {
                        return (
                          <span
                            key={item}
                            className="px-2 text-[var(--text-tertiary)] text-xs"
                          >
                            ...
                          </span>
                        );
                      }
                      const isCurrent = item === activePage;
                      return (
                        <button
                          key={item}
                          type="button"
                          onClick={() => handlePageChange(item)}
                          className={`w-8 h-8 rounded-xl text-sm font-medium transition-all flex items-center justify-center ${
                            isCurrent
                              ? "bg-primary text-white shadow-md font-bold"
                              : "border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]"
                          }`}
                        >
                          {item}
                        </button>
                      );
                    })}
                </div>

                <button
                  type="button"
                  onClick={() => handlePageChange(activePage + 1)}
                  disabled={activePage >= totalPages}
                  className="px-3.5 py-1.5 rounded-xl border border-[var(--border-color)] text-sm font-medium text-[var(--text-primary)] bg-[var(--bg-primary)] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[var(--bg-secondary)] transition-all shadow-sm"
                >
                  التالي
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
