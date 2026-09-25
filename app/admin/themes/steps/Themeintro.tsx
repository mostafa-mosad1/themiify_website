"use client";

import React, { useState } from "react";
import { FaLink, FaStar, FaAngleUp, FaAngleDown, FaVideo, FaList } from "react-icons/fa";
import { FaImage, FaTimes } from "react-icons/fa";
import Image from "next/image";
import { toast } from "sonner";

export interface ThemeIntroProps {
  step2: {
    introImage: File | null;
    introImagePreview: string;
    videoLink: string;
    videoTitle: string;
    videoDescription: string;
    platformRank: number;
    themeRating: number;
    ratingCount: number;
    purchaseCount: number;
    enableRating: boolean;
    enablePurchase: boolean;
    buttonTitle: string;
    buyLink: string;
    previewLink: string;
    themeVideoLink: string;
    playlistLink: string;
  };
  updateStep2: (data: Partial<ThemeIntroProps["step2"]>) => void;
}

const ThemeIntro: React.FC<ThemeIntroProps> = ({ step2, updateStep2 }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [videoLinkError, setVideoLinkError] = useState<string | null>(null);
  const [videoLinkValid, setVideoLinkValid] = useState(false);

  const validateVideoLink = () => {
    const link = step2.videoLink?.trim();
    if (!link) { setVideoLinkError("يرجى إدخال رابط الفيديو"); setVideoLinkValid(false); return; }
    try {
      const url = new URL(link);
      const isYoutube = url.hostname.includes("youtube.com") || url.hostname.includes("youtu.be");
      const isVimeo = url.hostname.includes("vimeo.com");
      if (!isYoutube && !isVimeo && !url.protocol.startsWith("http")) {
        setVideoLinkError("الرابط غير صحيح، يرجى إدخال رابط يوتيوب أو فيميو");
        setVideoLinkValid(false);
      } else {
        setVideoLinkError(null);
        setVideoLinkValid(true);
      }
    } catch {
      setVideoLinkError("الرابط غير صالح");
      setVideoLinkValid(false);
    }
  };

  const {
    introImage = null, introImagePreview = "", videoLink = "", videoTitle = "",
    videoDescription = "", platformRank = 1, themeRating = 1, ratingCount = 0,
    purchaseCount = 0, enableRating = true, enablePurchase = true,
    buttonTitle = "", buyLink = "", previewLink = "", themeVideoLink = "", playlistLink = "",
  } = step2;

  const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/jpg", "image/webp"];

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!ALLOWED_IMAGE_TYPES.includes(file.type.toLowerCase())) {
      toast.error("يرجى اختيار صورة بنر بصيغة JPG أو PNG أو WEBP فقط");
      return;
    }
    const preview = URL.createObjectURL(file);
    updateStep2({ introImage: file, introImagePreview: preview });
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    if (!ALLOWED_IMAGE_TYPES.includes(file.type.toLowerCase())) {
      toast.error("يرجى اختيار صورة بنر بصيغة JPG أو PNG أو WEBP فقط");
      return;
    }
    const preview = URL.createObjectURL(file);
    updateStep2({ introImage: file, introImagePreview: preview });
  };

  const removeImage = () => updateStep2({ introImage: null, introImagePreview: "" });

  const inputCls = "w-full !bg-transparent  px-4 py-3 outline-none focus:border-[var(--primary-color)] focus:ring-2 focus:ring-[var(--primary-color)]/10 transition-all text-right text-sm !text-[var(--text-primary)] cursor-pointer appearance-none border-b border-[var(--border-color)]";
  const labelCls = "block !text-[var(--text-primary)] text-base font-semibold mb-2 text-right ";
  const inputarrow = "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none";
  const shadow = " !shadow-[inset_0px_2px_4px_0px_var(--shadow-color)]"


  return (
    <div className="space-y-8" dir="rtl">
      {/* بنر */}
      <div className="mb-8">
        <label className={labelCls}>بنر معبر عن الثيم (اختياري)</label>
        {introImagePreview ? (
          <div className="relative w-full h-36 rounded-xl overflow-hidden border border-[var(--border-color)]">
            <Image src={introImagePreview} alt="banner" fill sizes="100%" className="object-cover" />
            <button
              type="button"
              onClick={removeImage}
              className="absolute top-2 right-2 bg-[var(--bg-primary)]/90 text-[var(--text-secondary)] rounded-full p-1.5 shadow hover:bg-[var(--bg-primary)] transition"
            >
              <FaTimes size={11} />
            </button>
          </div>
        ) : (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onDragEnter={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleDrop(e);
            }}
            className="border-2 border-dashed border-[var(--text-primary)] rounded-2xl p-6 text-center hover:border-[var(--primary-color)] hover:bg-[var(--bg-tertiary)] transition-all cursor-pointer"
          >
            <label className="cursor-pointer flex flex-col items-center gap-2">
              <div className="w-8 h-6 bg-[var(--bg-secondary)] rounded-full flex items-center justify-center">
                <FaImage className="text-[var(--text-tertiary)] text-xl" />
              </div>
              <p className="text-[var(--text-primary)] text-base font-semibold">
                <span className="text-[var(--primary-color)]">تصفح</span> أو اسحب صورة
              </p>
              <p className="text-[var(--text-secondary)] font-semibold text-sm">يسمح بصورة بحد أقصى 10 ميغابايت</p>
              {isUploading && <p className="text-[var(--primary-color)] text-xs">جاري الرفع...</p>}
              <input type="file" accept="image/png,image/jpeg,image/jpg,image/webp" className="hidden" onChange={handleImageChange} />
            </label>
          </div>
        )}
      </div>

      {/* الروابط */}
      <div className="grid grid-cols-2 gap-14">
        <div>
          <label className={labelCls}>رابط شراء الثيم (اختياري)</label>
          <input type="url" value={buyLink} onChange={(e) => updateStep2({ buyLink: e.target.value })} className={inputCls + shadow + " !rounded-full"} placeholder="https://example.com/buy-theme" dir="ltr" />
        </div>
        <div>
          <label className={labelCls}>رابط المعاينة (اختياري)</label>
          <input type="url" value={previewLink} onChange={(e) => updateStep2({ previewLink: e.target.value })} className={inputCls + shadow + " !rounded-full"} placeholder="https://demo.example.com" dir="ltr" />
        </div>
      </div>

      {/* رابط الفيديو + قائمة التشغيل */}
      <div className="grid grid-cols-2 gap-14">
        <div>
          <label className={labelCls}>رابط الفيديو التعريفي </label>
          <div className={inputCls + shadow + " !rounded-full flex items-center justify-between w-full h-12"}>
            <div className="flex items-center justify-start gap-2.5 h-full w-full">
              <FaLink className="!text-[var(--text-tertiary)]" size={13} />
              <input
                type="url"
                value={videoLink}
                onChange={(e) => { updateStep2({ videoLink: e.target.value }); setVideoLinkError(null); setVideoLinkValid(false); }}
                className="outline-none h-full w-full !border-none !bg-transparent !text-[var(--text-primary)]"
                placeholder="أضف رابط الفيديو"
                dir="rtl"
              />
            </div>
            <button
              type="button"
              onClick={validateVideoLink}
              className={`py-1.5 px-5 text-sm font-bold rounded-2xl transition duration-300 flex-shrink-0 ${videoLinkValid ? "bg-green-100 text-green-600" : "bg-[var(--text-secondary)] text-[var(--bg-secondary)] hover:bg-[var(--primary-color)] hover:text-[var(--bg-primary)]"}`}
            >
              {videoLinkValid ? "✓" : "رفع"}
            </button>
          </div>
          <p className="text-xs !text-[var(--text-tertiary)] mt-1 text-right">رابط فيديو توضيحي للثيم (اختياري)</p>
          {videoLinkError && <p className="text-red-500 text-xs mt-1 text-right">{videoLinkError}</p>}
          {videoLinkValid && <p className="text-green-500 text-xs mt-1 text-right">✓ الرابط صحيح</p>}
        </div>

        <div>
          <label className={labelCls}>رابط قائمة تشغيل</label>
          <div className={inputCls + shadow + " flex items-center gap-2 h-12 !rounded-full"}>
            <FaList className="!text-[var(--text-tertiary)] flex-shrink-0" size={13} />
            <input
              type="url"
              value={playlistLink}
              onChange={(e) => updateStep2({ playlistLink: e.target.value })}
              className="outline-none w-full !bg-transparent !border-none text-right !text-[var(--text-primary)]"
              placeholder="https://youtube.com/playlist?list=..."
              dir="ltr"
            />
          </div>
          <p className="text-xs text-[var(--text-tertiary)] mt-1 text-right">قائمة تشغيل فيديوهات تعليمية (اختياري)</p>
        </div>
      </div>

      {/* وصف الفيديو */}
      <div>
        <label className={labelCls}>وصف فرعي للثيم</label>
        <textarea
          value={videoDescription}
          onChange={(e) => updateStep2({ videoDescription: e.target.value })}
          className={inputCls + shadow + " resize-none h-[183px] !rounded-2xl !p-4 font-medium"}
          placeholder="ادخل وصفاً فرعياً... ( لا يزيد عن 500 كلمة)"
          rows={4}
          maxLength={500}
        />
      </div>

      {/* Toggles */}
      <div className="grid grid-cols-2 gap-14">
        <div className={ shadow + ` flex items-center justify-between px-5 py-3 rounded-full border-b border-[var(--border-color)]`}>
          <span className="text-[var(--text-primary)] font-semibold text-sm">تفعيل التقييم</span>
          <button
            type="button"
            onClick={() => updateStep2({ enableRating: !enableRating })}
            className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${enableRating ? "bg-[var(--primary-color)]" : "bg-[var(--bg-secondary)]"}`}
          >
            <span className={`absolute top-1 w-4 h-4 bg-[var(--bg-primary)] rounded-full shadow transition-all duration-300 ${enableRating ? "left-1" : "right-1"}`} />
          </button>
        </div>

        <div className={shadow +  " flex items-center justify-between px-5 py-3 rounded-full border-b border-[var(--border-color)]"}>
          <span className="text-[var(--text-primary)] font-semibold text-sm">تفعيل عدد المشتريات</span>
          <button
            type="button"
            onClick={() => updateStep2({ enablePurchase: !enablePurchase })}
            className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${enablePurchase ? "bg-[var(--primary-color)]" : "bg-[var(--bg-secondary)]"}`}
          >
            <span className={`absolute top-1 w-4 h-4 bg-[var(--bg-primary)] rounded-full shadow transition-all duration-300 ${enablePurchase ? "left-1" : "right-1"}`} />
          </button>
        </div>
      </div>

      {/* الترتيب + التقييم + عدد التقييمات + عدد المشتريات */}
      <div className="grid grid-cols-4 gap-1 items-center">
        {/* الترتيب على المنصة */}
        <div className="flex justify-start">
          <div className="flex items-center gap-1 overflow-hidden">
            <label className={labelCls + " !mb-0"}>الترتيب على المنصة</label>
            <div className={ shadow +  " flex items-center justify-center w-24 h-12 rounded-full border-b border-[var(--border-color)]"}>
              <div className="flex flex-col items-center justify-center w-1/3 h-5">
                <button type="button" onClick={() => updateStep2({ platformRank: platformRank + 1 })} className="text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] transition text-xs leading-none"><FaAngleUp /></button>
                <button type="button" onClick={() => updateStep2({ platformRank: Math.max(1, platformRank - 1) })} className="text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] transition text-xs leading-none"><FaAngleDown /></button>
              </div>
              <input
                type="number"
                value={platformRank}
                onChange={(e) => updateStep2({ platformRank: parseInt(e.target.value) || 1 })}
                className={`${inputarrow} outline-none text-center font-medium text-xl text-[var(--text-primary)] w-1/3 bg-transparent`}
                min={1}
              />
            </div>
          </div>
        </div>

        {/* التقييم */}
        {enableRating && (
          <div className="flex justify-center">
            <div className="flex items-center gap-1 overflow-hidden">
              <label className={labelCls + " !mb-0"}>التقييم</label>
              <div className={ shadow +  " flex items-center justify-center w-[118px] h-12 py-2.5 px-6 gap-2.5 rounded-full border-b border-[var(--border-color)]"}>
                <div className="flex flex-col items-center justify-center w-1/3 h-5">
                  <button type="button" onClick={() => updateStep2({ themeRating: Math.min(5, themeRating + 1) })} className="text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] transition text-xs leading-none"><FaAngleUp /></button>
                  <button type="button" onClick={() => updateStep2({ themeRating: Math.max(1, themeRating - 1) })} className="text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] transition text-xs leading-none"><FaAngleDown /></button>
                </div>
                <input
                  type="number"
                  value={themeRating}
                  onChange={(e) => updateStep2({ themeRating: Math.min(5, Math.max(1, parseInt(e.target.value) || 1)) })}
                  className={`${inputarrow} outline-none text-center font-medium text-xl text-[var(--text-primary)] w-2/3 bg-transparent`}
                  min={1} max={5}
                />
                <FaStar className="text-yellow-400 w-1/3" size={16} />
              </div>
            </div>
          </div>
        )}

        {/* عدد التقييمات */}
        <div className="flex justify-center">
          <div className="flex items-center gap-1 overflow-hidden">
            <label className={labelCls + " !mb-0"}>عدد التقييمات</label>
            <div className={ shadow +   " flex items-center justify-center w-[118px] h-12 rounded-full border-b border-[var(--border-color)]"}>
              <div className="flex flex-col items-center justify-center w-1/4 h-5">
                <button type="button" onClick={() => updateStep2({ ratingCount: ratingCount + 1 })} className="text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] transition text-xs leading-none"><FaAngleUp /></button>
                <button type="button" onClick={() => updateStep2({ ratingCount: Math.max(0, ratingCount - 1) })} className="text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] transition text-xs leading-none"><FaAngleDown /></button>
              </div>
              <input
                type="number"
                value={ratingCount}
                onChange={(e) => updateStep2({ ratingCount: parseInt(e.target.value) || 0 })}
                className={`${inputarrow} outline-none text-center font-medium text-xl text-[var(--text-primary)] w-2/3 bg-transparent`}
                min={0}
              />
            </div>
          </div>
        </div>

        {/* عدد المشتريات */}
        {enablePurchase && (
          <div className="flex justify-end">
            <div className="flex items-center gap-1">
              <label className={labelCls + " !mb-0"}>عدد المشتريات</label>
              <div className={shadow +  " flex items-center justify-center w-[118px] h-12 rounded-full border-b border-[var(--border-color)]"}>
                <div className="flex flex-col items-center justify-center w-1/4 h-5">
                  <button type="button" onClick={() => updateStep2({ purchaseCount: purchaseCount + 1 })} className="text-[var(--text-secondary)] text-xs leading-none"><FaAngleUp /></button>
                  <button type="button" onClick={() => updateStep2({ purchaseCount: Math.max(0, purchaseCount - 1) })} className="text-[var(--text-secondary)] text-xs leading-none"><FaAngleDown /></button>
                </div>
                <input
                  type="number"
                  value={purchaseCount}
                  onChange={(e) => updateStep2({ purchaseCount: parseInt(e.target.value) || 0 })}
                  className={`${inputarrow} outline-none text-center font-medium text-xl text-[var(--text-primary)] w-2/3 bg-transparent`}
                  min={0}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* عنوان الزر */}
      <div>
        <label className={labelCls}>عنوان الزر</label>
        <input
          type="text"
          value={buttonTitle}
          onChange={(e) => updateStep2({ buttonTitle: e.target.value })}
          className={inputCls + shadow + " flex items-center justify-center !w-1/2 h-12 !rounded-full"}
          placeholder="ادخل عنوان مناسب للزر (اختياري)"
        />
      </div>
    </div>
  );
};

export default ThemeIntro;