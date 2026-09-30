/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import TablePage from "@/components/ui/TablePage";

interface AccountsClientProps {
  adminsData: any[];
  usersData: any[];
  adminsPagination?: any;
  usersPagination?: any;
  adminsColumns: any[];
  usersColumns: any[];
  adminsStats: any[];
  usersStats: any[];
  onAdd?: (formData: FormData) => Promise<{ success: boolean; error?: string }>;
  onEdit?: (formData: FormData) => Promise<{ success: boolean; error?: string }>;
  onDelete?: (id: string) => Promise<any>;
  onDeleteUser?: (id: string) => Promise<any>;
  onFetchItem?: (id: string | number) => Promise<any>;
  addModalFields?: any[];
  editModalFields?: any[];
  idKey?: string;
}

export default function AccountsClient({
  adminsData,
  usersData,
  adminsPagination,
  usersPagination,
  adminsColumns,
  usersColumns,
  adminsStats,
  usersStats,
  onAdd,
  onEdit,
  onDelete,
  onDeleteUser,
  onFetchItem,
  addModalFields,
  editModalFields,
  idKey,
}: AccountsClientProps) {
  const [activeTab, setActiveTab] = useState<"admins" | "users">("admins");

  const tabs = (
    <div className="flex gap-2 bg-[var(--bg-primary)] p-2 rounded-2xl border border-[var(--border-color)] w-fit">
      <button
        onClick={() => setActiveTab("admins")}
        className={`px-6 py-3 rounded-xl font-semibold transition-all ${
          activeTab === "admins"
            ? "bg-primary text-white shadow-md"
            : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]"
        }`}
      >
        حسابات الأدمن
      </button>
      <button
        onClick={() => setActiveTab("users")}
        className={`px-6 py-3 rounded-xl font-semibold transition-all ${
          activeTab === "users"
            ? "bg-primary text-white shadow-md"
            : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]"
        }`}
      >
        المستخدمين
      </button>
    </div>
  );

  return (
    <div className="space-y-0">
      {/* Content */}
      {activeTab === "admins" ? (
        <TablePage
          title="accounts"
          description="إدارة حسابات الأدمن وإضافة وتعديل بياناتهم"
          data={adminsData}
          columns={adminsColumns}
          stats={adminsStats}
          pagination={adminsPagination}
          itemsPerPage={15}
          onAdd={onAdd}
          onEdit={onEdit}
          onDelete={onDelete}
          onFetchItem={onFetchItem}
          addModalFields={addModalFields}
          editModalFields={editModalFields}
          idKey={idKey}
          tabs={tabs}
        />
      ) : (
        <TablePage
          title="users"
          description="قائمة المستخدمين المسجلين في النظام"
          data={usersData}
          columns={usersColumns}
          stats={usersStats}
          pagination={usersPagination}
          itemsPerPage={15}
          idKey="id"
          tabs={tabs}
          onDelete={onDeleteUser}
        />
      )}
    </div>
  );
}
