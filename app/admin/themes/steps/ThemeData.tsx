"use client";

import React, {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import {
  IoShirtOutline,
  IoBagHandleOutline,
  IoBagOutline,
  IoSparklesOutline,
  IoDiamondOutline,
  IoColorPaletteOutline,
  IoCarSportOutline,
  IoCarOutline,
  IoConstructOutline,
  IoRestaurantOutline,
  IoFastFoodOutline,
  IoPizzaOutline,
  IoMedicalOutline,
  IoBandageOutline,
  IoHomeOutline,
  IoStorefrontOutline,
  IoLeafOutline,
  IoNutritionOutline,
  IoBarbellOutline,
  IoFitnessOutline,
  IoBriefcaseOutline,
  IoGiftOutline,
  IoPricetagOutline,
} from "react-icons/io5";
import {
  RiShirtLine,
  RiTShirtLine,
  RiTShirt2Line,
  RiHandbagLine,
  RiShoppingBagLine,
  RiSparklingLine,
  RiSparkling2Line,
  RiMedicineBottleLine,
  RiCarLine,
  RiRoadsterLine,
  RiTaxiLine,
  RiSteeringLine,
  RiGasStationLine,
  RiRestaurantLine,
  RiRestaurant2Line,
  RiKnifeLine,
  RiGiftLine,
  RiHospitalLine,
  RiNurseLine,
  RiSyringeLine,
  RiHealthBookLine,
  RiSofaLine,
  RiHome2Line,
  RiHomeHeartLine,
  RiPlantLine,
  RiLeafLine,
  RiTreeLine,
  RiFlowerLine,
  RiRunLine,
  RiBasketballLine,
  RiFootballLine,
  RiCustomerServiceLine,
  RiToolsLine,
  RiServiceLine,
  RiStoreLine,
  RiStore2Line,
} from "react-icons/ri";
import { IoMdAddCircle } from "react-icons/io";
import { toast } from "sonner";
import Image from "next/image";
import { FaImage, FaTimes } from "react-icons/fa";
import { HiOutlineGlobeAlt } from "react-icons/hi2";
import { Demo } from "@/types/theme.types";
import { fetchPlatforms, IPlatform } from "@/lib/api/platforms";
import { fetchCategories, ICategory } from "@/lib/api/categories";

type Category = ICategory;
type Platform = IPlatform;

const availableIcons = [
  { name: "Shirt", icon: IoShirtOutline, color: "text-blue-500" },
  { name: "TShirt", icon: RiTShirtLine, color: "text-indigo-500" },
  { name: "TShirt2", icon: RiTShirt2Line, color: "text-violet-500" },
  { name: "ShirtLine", icon: RiShirtLine, color: "text-blue-400" },
  { name: "ShoppingBag", icon: IoBagHandleOutline, color: "text-purple-500" },
  { name: "Bag", icon: IoBagOutline, color: "text-purple-400" },
  { name: "Handbag", icon: RiHandbagLine, color: "text-pink-400" },
  { name: "ShoppingBagRi", icon: RiShoppingBagLine, color: "text-indigo-400" },
  { name: "Sparkles", icon: IoSparklesOutline, color: "text-pink-500" },
  { name: "Sparkling", icon: RiSparklingLine, color: "text-rose-500" },
  { name: "Sparkling2", icon: RiSparkling2Line, color: "text-fuchsia-400" },
  { name: "Diamond", icon: IoDiamondOutline, color: "text-fuchsia-500" },
  { name: "Palette", icon: IoColorPaletteOutline, color: "text-pink-400" },
  { name: "Medicine", icon: RiMedicineBottleLine, color: "text-rose-400" },
  { name: "CarSport", icon: IoCarSportOutline, color: "text-zinc-600" },
  { name: "Car", icon: IoCarOutline, color: "text-gray-600" },
  { name: "CarRi", icon: RiCarLine, color: "text-slate-600" },
  { name: "Roadster", icon: RiRoadsterLine, color: "text-zinc-500" },
  { name: "Taxi", icon: RiTaxiLine, color: "text-yellow-600" },
  { name: "Steering", icon: RiSteeringLine, color: "text-gray-500" },
  { name: "GasStation", icon: RiGasStationLine, color: "text-orange-600" },
  { name: "Restaurant", icon: IoRestaurantOutline, color: "text-lime-600" },
  { name: "Restaurant2", icon: RiRestaurantLine, color: "text-green-600" },
  { name: "Restaurant3", icon: RiRestaurant2Line, color: "text-emerald-600" },
  { name: "FastFood", icon: IoFastFoodOutline, color: "text-orange-500" },
  { name: "Pizza", icon: IoPizzaOutline, color: "text-red-400" },
  { name: "Knife", icon: RiKnifeLine, color: "text-amber-600" },
  { name: "Gift", icon: IoGiftOutline, color: "text-yellow-500" },
  { name: "GiftRi", icon: RiGiftLine, color: "text-amber-500" },
  { name: "Pricetag", icon: IoPricetagOutline, color: "text-indigo-400" },
  { name: "Store", icon: RiStoreLine, color: "text-yellow-600" },
  { name: "Store2", icon: RiStore2Line, color: "text-amber-600" },
  { name: "Medical", icon: IoMedicalOutline, color: "text-red-500" },
  { name: "Bandage", icon: IoBandageOutline, color: "text-red-400" },
  { name: "Hospital", icon: RiHospitalLine, color: "text-blue-600" },
  { name: "Syringe", icon: RiSyringeLine, color: "text-green-500" },
  { name: "Nurse", icon: RiNurseLine, color: "text-teal-500" },
  { name: "HealthBook", icon: RiHealthBookLine, color: "text-cyan-600" },
  { name: "Sofa", icon: RiSofaLine, color: "text-amber-700" },
  { name: "Home", icon: IoHomeOutline, color: "text-orange-400" },
  { name: "Home2", icon: RiHome2Line, color: "text-yellow-700" },
  { name: "HomeHeart", icon: RiHomeHeartLine, color: "text-red-400" },
  { name: "Storefront", icon: IoStorefrontOutline, color: "text-orange-500" },
  { name: "Leaf", icon: IoLeafOutline, color: "text-green-600" },
  { name: "LeafRi", icon: RiLeafLine, color: "text-emerald-600" },
  { name: "Plant", icon: RiPlantLine, color: "text-green-500" },
  { name: "Tree", icon: RiTreeLine, color: "text-green-700" },
  { name: "Flower", icon: RiFlowerLine, color: "text-pink-400" },
  { name: "Nutrition", icon: IoNutritionOutline, color: "text-lime-500" },
  { name: "Barbell", icon: IoBarbellOutline, color: "text-blue-500" },
  { name: "Fitness", icon: IoFitnessOutline, color: "text-sky-500" },
  { name: "Run", icon: RiRunLine, color: "text-orange-500" },
  { name: "Basketball", icon: RiBasketballLine, color: "text-orange-600" },
  { name: "Football", icon: RiFootballLine, color: "text-green-600" },
  { name: "Tools", icon: RiToolsLine, color: "text-zinc-500" },
  { name: "Service", icon: RiServiceLine, color: "text-orange-600" },
  { name: "Build", icon: IoConstructOutline, color: "text-yellow-700" },
  { name: "Briefcase", icon: IoBriefcaseOutline, color: "text-slate-600" },
];

export interface ThemeDataProps {
  step1: {
    themeName: string;
    themePrice: string;
    platformName: string;
    platformId?: number | string | null;
    categoryName: string;
    categoryId?: number | string | null;
    themeImages: File[];
    themeImagePreviews: string[];
    demos: Demo[];
};
  updateStep1: (data: Partial<ThemeDataProps["step1"]>) => void;
}

export interface ThemeDataRef {
  validateStep1: () => string[];
  getData: () => ThemeDataProps["step1"];
}

const ThemeData = forwardRef<ThemeDataRef, ThemeDataProps>(
  ({ step1, updateStep1 }, ref) => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [platforms, setPlatforms] = useState<Platform[]>([]);
    const [loading, setLoading] = useState(true);
    const [showIconPicker, setShowIconPicker] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
      const fetchData = async () => {
        try {
          const token =
            typeof window !== "undefined"
              ? localStorage.getItem("authToken") ||
                localStorage.getItem("bearer_token") ||
                localStorage.getItem("adminToken") ||
                null
              : null;
          const [platformsRes, categoriesRes] = await Promise.all([
            fetchPlatforms(token),
            fetchCategories(token),
          ]);

          setPlatforms(platformsRes.platforms || []);
          setCategories(categoriesRes.categories || []);
        } catch (error) {
          console.error('Error fetching data:', error);
          toast.error('فشل تحميل البيانات');
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }, []);

    const {
      themeName = "",
      themePrice = "",
      platformName = "",
      platformId = null,
      categoryName = "",
      categoryId = null,
      themeImages = [],
      themeImagePreviews = [],
      demos = [],
    } = step1;

    const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/jpg", "image/webp"];

    const handleThemeImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const allFiles = Array.from(e.target.files || []);
      const validFiles = allFiles.filter((f) => ALLOWED_IMAGE_TYPES.includes(f.type.toLowerCase()));
      if (allFiles.length > validFiles.length) {
        toast.error("يرجى اختيار صور بصيغة JPG أو PNG أو WEBP فقط (الـ SVG غير مدعوم للبنر)");
      }
      if (!validFiles.length) return;
      const newPreviews = validFiles.map((file) => URL.createObjectURL(file));
      updateStep1({
        themeImages: [...(themeImages || []), ...validFiles],
        themeImagePreviews: [...(themeImagePreviews || []), ...newPreviews],
      });
      e.target.value = "";
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      const allFiles = Array.from(e.dataTransfer.files || []);
      const validFiles = allFiles.filter((f) => ALLOWED_IMAGE_TYPES.includes(f.type.toLowerCase()));
      if (allFiles.length > validFiles.length) {
        toast.error("يرجى اختيار صور بصيغة JPG أو PNG أو WEBP فقط (الـ SVG غير مدعوم للبنر)");
      }
      if (!validFiles.length) return;
      const newPreviews = validFiles.map((file) => URL.createObjectURL(file));
      updateStep1({
        themeImages: [...(themeImages || []), ...validFiles],
        themeImagePreviews: [...(themeImagePreviews || []), ...newPreviews],
      });
    };

    const removeThemeImage = (index: number) => {
      updateStep1({
        themeImages: (themeImages || []).filter((_, i) => i !== index),
        themeImagePreviews: (themeImagePreviews || []).filter((_, i) => i !== index),
      });
    };

    const addDemo = () => {
      updateStep1({ demos: [...demos, { id: `demo-${Date.now()}`, iconName: "Globe", url: "", order: demos.length }] });
    };

    const updateDemo = (id: string, updates: Partial<Demo>) => {
      updateStep1({
        demos: demos.map((d) => (d.id === id ? { ...d, ...updates } : d)),
      });
    };

    const removeDemo = (id: string) => {
      updateStep1({
        demos: demos
          .filter((d) => d.id !== id)
          .map((d, i) => ({ ...d, order: i })),
      });
    };

    const handleDemoImageChange = (demoId: string, e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !file.type.startsWith("image/")) return;
      const preview = URL.createObjectURL(file);
      updateStep1({
        demos: demos.map((d) =>
          d.id === demoId
            ? { ...d, imageFile: file, imagePreview: preview, imageUrl: preview }
            : d,
        ),
      });
      e.target.value = "";
    };

    const removeDemoImage = (demoId: string) => {
      updateStep1({
        demos: demos.map((d) =>
          d.id === demoId
            ? {
                ...d,
                imageFile: undefined,
                imagePreview: undefined,
                imageUrl: undefined,
              }
            : d,
        ),
      });
    };

    const validateStep1 = (): string[] => {
      const errors: string[] = [];
      if (!step1.themeName?.trim()) errors.push("اسم الثيم مطلوب");
      if (!step1.themePrice?.trim()) errors.push("سعر الثيم مطلوب");
      if (!step1.platformName?.trim()) errors.push("المنصة مطلوبة");
      if (!step1.categoryName?.trim()) errors.push("التصنيف مطلوب");
      // الصور غير إجبارية
      demos.forEach((demo, i) => { if (!demo.url?.trim()) errors.push(`الديمو ${i + 1}: رابط الديمو مطلوب`); });
      return errors;
    };

    const getData = () => step1;
    useImperativeHandle(ref, () => ({ validateStep1, getData }));

    const inputCls =
      "w-full !bg-transparent !rounded-full px-4 py-3 outline-none focus:border-[var(--primary-color)] focus:ring-2 focus:ring-[var(--primary-color)] transition-all text-right text-sm !text-[var(--text-primary)] cursor-pointer appearance-none !border-b !border-[var(--border-color)]";
    const selectCls =
      "w-full !bg-transparent !rounded-full px-4 py-3 outline-none focus:border-[var(--primary-color)] focus:ring-2 focus:ring-[var(--primary-color)] transition-all text-right text-sm !text-[var(--text-primary)] cursor-pointer appearance-none !border-b !border-[var(--border-color)]";
    const labelCls =
      "block text-[var(--text-primary)] text-base font-semibold mb-2 text-right";
    const shadow = " !shadow-[inset_0px_2px_4px_0px_var(--shadow-color)]";

    return (
      <div className="space-y-6" dir="rtl">
        {/* Row 1: اسم + سعر + منصة + تصنيف */}
        <div className="grid grid-cols-4 gap-14 mb-8">
          <div>
            <label className={labelCls}>
              اسم الثيم <span>*</span>
            </label>
            <input
              type="text"
              value={themeName}
              onChange={(e) => updateStep1({ themeName: e.target.value })}
              className={inputCls + shadow}
              placeholder="ادخل الاسم"
            />
          </div>

          <div>
            <label className={labelCls}>
              سعر الثيم <span>*</span>
            </label>
            <input
              type="number"
              value={themePrice}
              onChange={(e) => updateStep1({ themePrice: e.target.value })}
              className={inputCls + shadow}
              placeholder="ادخل السعر بالريال السعودي"
              min="0"
            />
          </div>

          <div>
            <label className={labelCls}>
              المنصة التابع لها الثيم <span>*</span>
            </label>
            <div className="relative">
              {loading ? (
                <div className={inputCls + shadow + " text-[var(--text-tertiary)]"}>
                  جاري التحميل...
                </div>
              ) : (
                <>
                  <select
                    value={platformName}
                    onChange={(e) => {
                      const selectedVal = e.target.value;
                      const selectedPlat = platforms.find((p) => p.name === selectedVal || String(p.id) === selectedVal);
                      updateStep1({
                        platformName: selectedPlat ? selectedPlat.name : selectedVal,
                        platformId: selectedPlat ? selectedPlat.id : null,
                      });
                    }}
                    className={selectCls + shadow}
                  >
                    <option value="">ادخل المنصة</option>
                    {platforms.map((p) => (
                      <option key={p.id} value={p.name}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                  <svg
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)] pointer-events-none"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </>
              )}
            </div>
          </div>

          <div>
            <label className={labelCls}>
              تصنيف الثيم <span>*</span>
            </label>
            <div className="relative">
              {loading ? (
                <div className={inputCls + shadow + " text-[var(--text-tertiary)]"}>
                  جاري التحميل...
                </div>
              ) : (
                <>
                  <select
                    value={categoryName}
                    onChange={(e) => {
                      const selectedVal = e.target.value;
                      const selectedCat = categories.find((c) => c.name === selectedVal || String(c.id) === selectedVal);
                      updateStep1({
                        categoryName: selectedCat ? selectedCat.name : selectedVal,
                        categoryId: selectedCat ? selectedCat.id : null,
                      });
                    }}
                    className={selectCls + shadow}
                  >
                    <option value="">اختر التصنيف</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <svg
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)] pointer-events-none"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </>
              )}
            </div>
          </div>
        </div>

        {/* صور الثيم */}
        <div>
          <label className={labelCls}>
            صورة معبرة عن الثيم (اختياري)
          </label>
          {themeImagePreviews.length > 0 && (
            <div className="grid grid-cols-4 gap-3 mb-3">
              {themeImagePreviews.map((preview, index) => (
                <div
                  key={index}
                  className="relative group rounded-xl overflow-hidden border border-[var(--border-color)] aspect-video"
                >
                  <Image src={preview} alt="" fill sizes="200px" className="object-cover" />
                  <button
                    type="button"
                    onClick={() => removeThemeImage(index)}
                    className="absolute top-1.5 right-1.5 bg-[var(--bg-primary)]/90 text-[var(--text-secondary)] rounded-full p-1 opacity-0 group-hover:opacity-100 transition shadow"
                  >
                    <FaTimes size={10} />
                  </button>
                  {index === 0 && (
                    <span className="absolute bottom-1.5 right-1.5 bg-[var(--primary-color)] text-[var(--bg-primary)] text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                      رئيسية
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
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
              <p className="text-[var(--text-secondary)] font-semibold text-sm">
                يسمح بصورة بحد أقصى 10 ميغابايت
              </p>
              {isUploading && (
                <p className="text-[var(--primary-color)] text-xs">جاري الرفع...</p>
              )}
              <input type="file" accept="image/png,image/jpeg,image/jpg,image/webp" multiple className="hidden" onChange={handleThemeImagesChange} />
            </label>
          </div>
        </div>

        {/* ديموهات */}
        <div className="mt-9">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[var(--text-primary)] font-bold text-xl flex items-center gap-2">
              إضافة ديمو للثيم
              <button type="button" onClick={addDemo}>
                <IoMdAddCircle className="text-[var(--primary-color)]" size={24} />
              </button>
            </h3>
          </div>

          {demos.length === 0 ? (
            <div className="text-center py-6 border-2 border-dashed border-[var(--text-primary)] rounded-xl h-32 flex items-center justify-center flex-col">
              <p className="text-[var(--text-tertiary)] text-sm">لم يتم إضافة أي ديمو بعد</p>
              <button type="button" onClick={addDemo} className="mt-2 text-[var(--primary-color)] text-sm font-medium">
                أضف أول ديمو الآن
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {demos.map((demo) => {
                const IconComponent = availableIcons.find((i) => i.name === demo.iconName)?.icon || HiOutlineGlobeAlt;
                const iconColor = availableIcons.find((i) => i.name === demo.iconName)?.color || "text-blue-500";

                return (
                  <div key={demo.id} className="relative rounded-xl py-6 px-8 border-2 border-dashed border-[var(--text-primary)]">
                    {/* زرار حذف الديمو */}
                    <button
                      type="button"
                      onClick={() => removeDemo(demo.id)}
                      className="absolute -top-3 -right-3 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-md transition duration-200 z-10"
                      title="حذف الديمو"
                    >
                      <FaTimes size={10} />
                    </button>
                    <div className="grid grid-cols-2 gap-7">

                      {/* القسم الأول: أيقون الديمو - الجزء القديم */}
                      <div>
                        {(() => {
                          const previewSrc =
                            demo.imagePreview ||
                            demo.imageUrl ||
                            (demo as any).image_url ||
                            (demo as any).image;

                          return (
                            <div className="flex items-center gap-5">
                              {previewSrc ? (
                                <div className="relative w-14 h-14 flex-shrink-0">
                                  <img
                                    src={previewSrc}
                                    alt="أيقونة الديمو"
                                    className="w-14 h-14 object-cover rounded-lg border border-[var(--border-color)]"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => removeDemoImage(demo.id)}
                                    className="absolute -top-1.5 -right-1.5 bg-red-500 text-[var(--bg-primary)] rounded-full w-4 h-4 flex items-center justify-center cursor-pointer shadow hover:bg-red-600 transition"
                                  >
                                    <FaTimes size={8} />
                                  </button>
                                </div>
                              ) : (
                                <div className="w-14 h-14 bg-[var(--bg-secondary)] rounded-2xl flex items-center justify-center flex-shrink-0 border border-[var(--border-color)]">
                                  <FaImage className="text-[var(--text-tertiary)] text-xl" />
                                </div>
                              )}
                              <div className="flex items-start flex-col">
                                <p className="text-xs text-[var(--text-primary)] mb-[10px] font-normal">
                                  يرجى رفع أيقون مريحة، بحجم أقل من 100 كيلوبايت
                                </p>
                                <label className="cursor-pointer flex items-center justify-between w-full px-4 py-2 rounded-full shadow-[inset_0px_4px_4px_0px_#0E132C0F] border-b border-[var(--border-color)]">
                                  {!previewSrc && (
                                    <span className="text-[var(--text-tertiary)] text-sm font-medium">
                                      لم يتم اختيار أيقون
                                    </span>
                                  )}
                                  <div
                                    className={`bg-[var(--primary-color)] text-[var(--bg-primary)] text-sm px-5 py-1.5 rounded-full font-bold hover:opacity-80 duration-300 transition ${
                                      !previewSrc ? "" : "w-full text-center"
                                    }`}
                                  >
                                    {previewSrc ? "تغيير الأيقون" : "اختر ملف"}
                                  </div>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) =>
                                      handleDemoImageChange(demo.id, e)
                                    }
                                  />
                                </label>
                              </div>
                            </div>
                          );
                        })()}
                      </div>

                      {/* رابط الديمو */}
                      <div>
                        <label className="text-base text-[var(--text-primary)] mb-2 font-semibold block">
                          رابط الديمو <span>*</span>
                        </label>
                        <div className="flex items-center gap-2 justify-between w-full px-4 py-2 rounded-full shadow-[inset_0px_4px_4px_0px_#0E132C0F] border-b border-[var(--border-color)]">
                          <div
                            className="flex items-center justify-center cursor-pointer"
                            onClick={() => setShowIconPicker(showIconPicker === demo.id ? null : demo.id)}
                          >
                            <IconComponent className={`text-lg ${iconColor}`} />
                          </div>
                        
                          <input
                            type="url"
                            value={demo.url}
                            onChange={(e) => updateDemo(demo.id, { url: e.target.value })}
                            className="!bg-transparent w-full outline-none !border-none focus:!border-none font-medium text-sm text-[var(--text-primary)]"
                            placeholder="أضف رابط الديمو"
                            dir="rtl"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const url = demo.url?.trim();
                              if (!url) {
                                toast.error("يرجى إدخال رابط الديمو");
                                return;
                              }
                              try {
                                new URL(url);
                                toast.success("الرابط صحيح ✅");
                              } catch {
                                toast.error("الرابط غير صالح، تأكد من الصيغة (مثال: https://example.com)");
                              }
                            }}
                            className="bg-[var(--primary-color)] text-[var(--bg-primary)] px-6 py-2.5 rounded-full text-sm font-medium hover:opacity-80 duration-300 transition flex-shrink-0"
                          >
                            رفع
                          </button>
                        </div>
                        {showIconPicker === demo.id && (
                          <div className="mt-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl shadow-lg z-10 max-h-48 overflow-y-auto p-2">
                            <div className="grid grid-cols-6 gap-1">
                              {availableIcons.map((icon) => (
                                <button
                                  key={icon.name}
                                  type="button"
                                  onClick={() => { updateDemo(demo.id, { iconName: icon.name }); setShowIconPicker(null); }}
                                  className={`p-2 rounded-lg hover:bg-[var(--bg-tertiary)] flex flex-col items-center ${demo.iconName === icon.name ? "bg-[var(--bg-tertiary)] ring-1 ring-[var(--primary-color)]" : ""}`}
                                  title={icon.name}
                                >
                                  <icon.icon className={`text-xl ${icon.color}`} />
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  },
);

ThemeData.displayName = "ThemeData";
export default ThemeData;