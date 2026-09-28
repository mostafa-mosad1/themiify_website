"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { FaTrash, FaTimes } from "react-icons/fa";

interface DeleteButtonProps {
  onDelete: () => Promise<any>;
  itemName?: string;
  buttonText?: string;
  className?: string;
  confirmMessage?: string;
  iconOnly?: boolean;
}

function RedTrashIcon({ className = "w-20 h-20" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 84 94"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Can body gradient */}
        <linearGradient
          id="trashBodyGrad"
          x1="14"
          y1="32"
          x2="70"
          y2="88"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#EF4444" />
          <stop offset="50%" stopColor="#DC2626" />
          <stop offset="100%" stopColor="#B91C1C" />
        </linearGradient>

        {/* Lid gradient */}
        <linearGradient
          id="trashLidGrad"
          x1="10"
          y1="18"
          x2="74"
          y2="30"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#F87171" />
          <stop offset="35%" stopColor="#EF4444" />
          <stop offset="100%" stopColor="#B91C1C" />
        </linearGradient>

        {/* Handle gradient */}
        <linearGradient
          id="trashHandleGrad"
          x1="30"
          y1="6"
          x2="54"
          y2="18"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#EF4444" />
          <stop offset="100%" stopColor="#B91C1C" />
        </linearGradient>

        {/* Soft shadow */}
        <filter
          id="trashGlow"
          x="-15%"
          y="-10%"
          width="130%"
          height="130%"
          filterUnits="userSpaceOnUse"
        >
          <feDropShadow
            dx="0"
            dy="5"
            stdDeviation="5"
            floodColor="#DC2626"
            floodOpacity="0.25"
          />
        </filter>
      </defs>

      <g filter="url(#trashGlow)">
        {/* Lid Top Handle */}
        <path
          d="M32 16 C32 9, 36 6, 42 6 C48 6, 52 9, 52 16"
          stroke="url(#trashHandleGrad)"
          strokeWidth="4.5"
          strokeLinecap="round"
          fill="none"
        />

        {/* Lid Plate */}
        <path
          d="M19 22 C19 18.5 22 16 26 16 L58 16 C62 16 65 18.5 65 22 L68 25 C69 26 68.5 27 67 27 L17 27 C15.5 27 15 26 16 25 Z"
          fill="url(#trashLidGrad)"
        />

        {/* Rim Bar */}
        <rect
          x="13"
          y="25"
          width="58"
          height="7"
          rx="3.5"
          fill="#DC2626"
        />
        {/* Rim Highlight */}
        <rect
          x="16"
          y="26"
          width="52"
          height="1.8"
          rx="0.9"
          fill="#FFFFFF"
          fillOpacity="0.45"
        />

        {/* Trash Can Body (tapered down) */}
        <path
          d="M18 32 L22.5 82 C22.9 86.5 26.5 90 31 90 L53 90 C57.5 90 61.1 86.5 61.5 82 L66 32 Z"
          fill="url(#trashBodyGrad)"
        />

        {/* Body Left Curved Highlight */}
        <path
          d="M19 33 L23 81 C23.3 84.5 25.5 87 28.5 88 L26 88 C23 87 20.5 83.5 20 80 L17.5 33 Z"
          fill="#FFFFFF"
          fillOpacity="0.18"
        />

        {/* 3 Vertical White Slots */}
        <rect
          x="28.5"
          y="42"
          width="5"
          height="34"
          rx="2.5"
          fill="#FFFFFF"
        />
        <rect
          x="39.5"
          y="42"
          width="5"
          height="34"
          rx="2.5"
          fill="#FFFFFF"
        />
        <rect
          x="50.5"
          y="42"
          width="5"
          height="34"
          rx="2.5"
          fill="#FFFFFF"
        />
      </g>
    </svg>
  );
}

export default function DeleteButton({
  onDelete,
  itemName = "",
  buttonText = "حذف",
  className = "",
  confirmMessage = "هل انت متأكد من حذف هذا العنصر",
  iconOnly = false,
}: DeleteButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setLoading(true);
    try {
      await onDelete();
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("data-mutated", { detail: { type: "all" } })
        );
        window.dispatchEvent(new Event("platforms-updated"));
        window.dispatchEvent(new Event("categories-updated"));
        window.dispatchEvent(new Event("themes-updated"));
        window.dispatchEvent(new Event("blogs-updated"));
      }
      router.refresh();
    } catch (err) {
      console.error("Error during deletion:", err);
    } finally {
      setLoading(false);
      setIsOpen(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={className}
        title={buttonText}
        type="button"
      >
        {iconOnly ? <FaTrash size={16} /> : buttonText}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
            onClick={() => !loading && setIsOpen(false)}
          />

          {/* Modal Card */}
          <div
            className="relative bg-white dark:bg-zinc-900 rounded-[28px] shadow-2xl w-full max-w-[400px] p-8 sm:p-9 flex flex-col items-center text-center z-10 border border-gray-100 dark:border-zinc-800 animate-in fade-in zoom-in-95 duration-200"
            dir="rtl"
          >
            {/* Close Button top-left in RTL */}
            <button
              onClick={() => setIsOpen(false)}
              disabled={loading}
              className="absolute top-5 left-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-1"
              title="إغلاق"
              type="button"
            >
              <FaTimes size={15} />
            </button>

            {/* Red 3D Trash Can Graphic */}
            <div className="mb-4 flex items-center justify-center">
              <RedTrashIcon className="w-20 h-20" />
            </div>

            {/* Confirm Message */}
            <h3 className="text-gray-900 dark:text-white font-bold text-lg sm:text-xl mb-6">
              {confirmMessage}
            </h3>

            {/* Buttons (Right = حذف, Left = إلغاء in RTL) */}
            <div className="flex items-center justify-center gap-4 w-full">
              <button
                onClick={handleDelete}
                disabled={loading}
                type="button"
                className="flex-1 max-w-[130px] py-2.5 px-6 rounded-full bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white font-bold text-sm shadow-md shadow-red-500/25 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span>حذف</span>
                )}
              </button>

              <button
                onClick={() => setIsOpen(false)}
                disabled={loading}
                type="button"
                className="flex-1 max-w-[130px] py-2.5 px-6 rounded-full border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-700 dark:text-gray-300 font-bold text-sm hover:bg-gray-50 dark:hover:bg-zinc-700 transition-all hover:scale-105 active:scale-95 cursor-pointer"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
