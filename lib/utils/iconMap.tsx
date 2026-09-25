import React from "react";

import {
  FaDesktop, FaMobile, FaTablet, FaGlobe, FaShoppingCart, FaBlog,
  FaStore, FaImage, FaPlay, FaStar, FaTrash, FaPen, FaList, FaYoutube,
  FaTag, FaCouch, FaLaptop, FaCar, FaHeartbeat, FaUtensils,
  FaCode, FaCoffee, FaBook, FaCamera, FaMusic, FaGamepad, FaPlane,
} from "react-icons/fa";

import {
  IoShirtOutline, IoBagHandleOutline, IoBagOutline, IoSparklesOutline,
  IoDiamondOutline, IoColorPaletteOutline, IoCarSportOutline, IoCarOutline,
  IoConstructOutline, IoRestaurantOutline, IoFastFoodOutline, IoPizzaOutline,
  IoMedicalOutline, IoBandageOutline, IoHomeOutline, IoStorefrontOutline,
  IoLeafOutline, IoNutritionOutline, IoBarbellOutline, IoFitnessOutline,
  IoBriefcaseOutline, IoGiftOutline, IoPricetagOutline,
} from "react-icons/io5";

import {
  RiShirtLine, RiTShirtLine, RiTShirt2Line, RiHandbagLine, RiShoppingBagLine,
  RiSparklingLine, RiSparkling2Line, RiMedicineBottleLine, RiCarLine, RiRoadsterLine,
  RiTaxiLine, RiSteeringLine, RiGasStationLine, RiRestaurantLine, RiRestaurant2Line,
  RiKnifeLine, RiGiftLine, RiHospitalLine, RiNurseLine, RiSyringeLine, RiHealthBookLine,
  RiSofaLine, RiHome2Line, RiHomeHeartLine, RiPlantLine, RiLeafLine, RiTreeLine,
  RiFlowerLine, RiRunLine, RiBasketballLine, RiFootballLine, RiCustomerServiceLine,
  RiToolsLine, RiServiceLine, RiStoreLine, RiStore2Line,
} from "react-icons/ri";

// ─── Icon Map ─────────────────────────────────────────────────────────────────
// Keys are the exact strings stored in `icon_name` (demos) or `icon` (categories).
// Always lowercase; resolveIcon normalises input before lookup.

export const ICON_MAP: Record<string, React.ReactElement> = {
  // ── Code / Tech ─────────────────────────────────────────────────────────────
  code: <FaCode />,
  "icon-code": <FaCode />,
  laptop: <FaLaptop />,
  "icon-laptop": <FaLaptop />,
  falaptop: <FaLaptop />,
  desktop: <FaDesktop />,
  "icon-desktop": <FaDesktop />,
  mobile: <FaMobile />,
  "icon-mobile": <FaMobile />,
  tablet: <FaTablet />,
  "icon-tablet": <FaTablet />,

  // ── Commerce / Shop ─────────────────────────────────────────────────────────
  shop: <FaShoppingCart />,
  "icon-shop": <FaShoppingCart />,
  cart: <FaShoppingCart />,
  "icon-cart": <FaShoppingCart />,
  store: <FaStore />,
  "icon-store": <FaStore />,
  storefront: <IoStorefrontOutline />,
  "icon-storefront": <IoStorefrontOutline />,
  bag: <IoBagHandleOutline />,
  "icon-bag": <IoBagHandleOutline />,
  baghandle: <IoBagHandleOutline />,
  bagoutline: <IoBagOutline />,
  handbag: <RiHandbagLine />,
  "icon-handbag": <RiHandbagLine />,
  shoppingbag: <RiShoppingBagLine />,
  "icon-shoppingbag": <RiShoppingBagLine />,

  // ── Fashion / Beauty ────────────────────────────────────────────────────────
  shirt: <IoShirtOutline />,
  "icon-shirt": <IoShirtOutline />,
  tshirt: <RiTShirtLine />,
  "icon-tshirt": <RiTShirtLine />,
  tshirt2: <RiTShirt2Line />,
  rishirt: <RiShirtLine />,
  diamond: <IoDiamondOutline />,
  "icon-diamond": <IoDiamondOutline />,
  palette: <IoColorPaletteOutline />,
  "icon-palette": <IoColorPaletteOutline />,
  sparkles: <IoSparklesOutline />,
  "icon-sparkles": <IoSparklesOutline />,
  sparkling: <RiSparklingLine />,
  sparkling2: <RiSparkling2Line />,

  // ── Food / Drink ────────────────────────────────────────────────────────────
  restaurant: <IoRestaurantOutline />,
  "icon-restaurant": <IoRestaurantOutline />,
  coffee: <FaCoffee />,
  "icon-coffee": <FaCoffee />,
  fastfood: <IoFastFoodOutline />,
  "icon-fastfood": <IoFastFoodOutline />,
  pizza: <IoPizzaOutline />,
  "icon-pizza": <IoPizzaOutline />,
  rirestaurant: <RiRestaurantLine />,
  rirestaurant2: <RiRestaurant2Line />,
  knife: <RiKnifeLine />,
  fautensils: <FaUtensils />,

  // ── Health / Medical ────────────────────────────────────────────────────────
  medical: <IoMedicalOutline />,
  "icon-medical": <IoMedicalOutline />,
  medicine: <RiMedicineBottleLine />,
  "icon-medicine": <RiMedicineBottleLine />,
  bandage: <IoBandageOutline />,
  hospital: <RiHospitalLine />,
  nurse: <RiNurseLine />,
  syringe: <RiSyringeLine />,
  healthbook: <RiHealthBookLine />,
  faheartbeat: <FaHeartbeat />,

  // ── Fitness / Sports ────────────────────────────────────────────────────────
  fitness: <IoFitnessOutline />,
  "icon-fitness": <IoFitnessOutline />,
  barbell: <IoBarbellOutline />,
  "icon-barbell": <IoBarbellOutline />,
  nutrition: <IoNutritionOutline />,
  run: <RiRunLine />,
  basketball: <RiBasketballLine />,
  football: <RiFootballLine />,

  // ── Vehicles / Transport ────────────────────────────────────────────────────
  car: <IoCarOutline />,
  "icon-car": <IoCarSportOutline />,
  carsport: <IoCarSportOutline />,
  facar: <FaCar />,
  ricar: <RiCarLine />,
  roadster: <RiRoadsterLine />,
  taxi: <RiTaxiLine />,
  steering: <RiSteeringLine />,
  gasstation: <RiGasStationLine />,
  plane: <FaPlane />,
  "icon-plane": <FaPlane />,

  // ── Home / Real Estate ──────────────────────────────────────────────────────
  home: <IoHomeOutline />,
  "icon-home": <IoHomeOutline />,
  home2: <RiHome2Line />,
  homeheart: <RiHomeHeartLine />,
  sofa: <RiSofaLine />,
  "icon-sofa": <RiSofaLine />,
  facouch: <FaCouch />,

  // ── Nature / Plants ─────────────────────────────────────────────────────────
  leaf: <IoLeafOutline />,
  "icon-leaf": <IoLeafOutline />,
  rileaf: <RiLeafLine />,
  plant: <RiPlantLine />,
  tree: <RiTreeLine />,
  flower: <RiFlowerLine />,

  // ── Media / Entertainment ───────────────────────────────────────────────────
  camera: <FaCamera />,
  "icon-camera": <FaCamera />,
  music: <FaMusic />,
  "icon-music": <FaMusic />,
  gamepad: <FaGamepad />,
  "icon-gamepad": <FaGamepad />,
  play: <FaPlay />,
  youtube: <FaYoutube />,
  image: <FaImage />,

  // ── Work / Services / Education ─────────────────────────────────────────────
  briefcase: <IoBriefcaseOutline />,
  "icon-briefcase": <IoBriefcaseOutline />,
  book: <FaBook />,
  "icon-book": <FaBook />,
  tools: <RiToolsLine />,
  "icon-tools": <RiToolsLine />,
  service: <RiServiceLine />,
  construct: <IoConstructOutline />,
  customer: <RiCustomerServiceLine />,
  gift: <IoGiftOutline />,
  "icon-gift": <IoGiftOutline />,
  rigift: <RiGiftLine />,
  pricetag: <IoPricetagOutline />,
  fatag: <FaTag />,
  blog: <FaBlog />,
  star: <FaStar />,
  "icon-star": <FaStar />,
  list: <FaList />,
  trash: <FaTrash />,
  pen: <FaPen />,
  globe: <FaGlobe />,
  "icon-globe": <FaGlobe />,
  ristore: <RiStoreLine />,
  ristore2: <RiStore2Line />,
};

export interface CategoryIconOption {
  value: string;
  label: string;
  icon: React.ReactElement;
  keywords?: string;
  category?: "tech" | "shop" | "fashion" | "food" | "health" | "services" | "other";
}

export const ICON_CATEGORIES = [
  { id: "all", label: "الكل" },
  { id: "tech", label: "تقنية وبرمجة" },
  { id: "shop", label: "تسوق ومتاجر" },
  { id: "fashion", label: "أزياء وتصميم" },
  { id: "food", label: "مطاعم ومشروبات" },
  { id: "health", label: "صحة ولياقة" },
  { id: "services", label: "عقارات وسيارات" },
  { id: "other", label: "أعمال وترفيه" },
];

export const CATEGORY_ICONS: CategoryIconOption[] = [
  { value: "icon-code", label: "برمجيات وتقنية", icon: <FaCode />, keywords: "برمجة كود code software tech تقنية", category: "tech" },
  { value: "icon-shop", label: "متاجر وتسوق", icon: <FaShoppingCart />, keywords: "تسوق متجر shop cart store سلة", category: "shop" },
  { value: "icon-store", label: "متاجر إلكترونية", icon: <FaStore />, keywords: "متجر متجر إلكتروني store shop", category: "shop" },
  { value: "icon-shirt", label: "أزياء وملابس", icon: <IoShirtOutline />, keywords: "ملابس ازياء قميص fashion shirt clothes", category: "fashion" },
  { value: "icon-laptop", label: "كمبيوتر ولابتوب", icon: <FaLaptop />, keywords: "لابتوب كمبيوتر اجهزة laptop computer", category: "tech" },
  { value: "icon-mobile", label: "هواتف وأجهزة", icon: <FaMobile />, keywords: "جوال هاتف موبايل mobile phone", category: "tech" },
  { value: "icon-palette", label: "تصميم وفنون", icon: <IoColorPaletteOutline />, keywords: "تصميم الوان رسم design art palette", category: "fashion" },
  { value: "icon-diamond", label: "مجوهرات وأناقة", icon: <IoDiamondOutline />, keywords: "مجوهرات الماس ذهب diamond jewelry", category: "fashion" },
  { value: "icon-restaurant", label: "مطاعم ومأكولات", icon: <IoRestaurantOutline />, keywords: "مطعم اكل وجبات طعام restaurant food", category: "food" },
  { value: "icon-coffee", label: "كافيهات ومشروبات", icon: <FaCoffee />, keywords: "قهوة كافيه شاي مشروبات coffee cafe", category: "food" },
  { value: "icon-medical", label: "صحة وطب", icon: <IoMedicalOutline />, keywords: "طبي دكتور صحة علاج medical health doctor", category: "health" },
  { value: "icon-fitness", label: "رياضة ولياقة", icon: <IoFitnessOutline />, keywords: "رياضة جيم لياقة fitness gym sport", category: "health" },
  { value: "icon-car", label: "سيارات ومحركات", icon: <IoCarSportOutline />, keywords: "سيارة مركبات car auto motors", category: "services" },
  { value: "icon-home", label: "عقارات ومنازل", icon: <IoHomeOutline />, keywords: "عقار منزل بيت ديكور home house real estate", category: "services" },
  { value: "icon-sofa", label: "أثاث وديكور", icon: <RiSofaLine />, keywords: "اثاث كنب ديكور مفروشات furniture sofa", category: "services" },
  { value: "icon-tools", label: "خدمات وصيانة", icon: <RiToolsLine />, keywords: "صيانة تصليح ادوات عمال tools maintenance service", category: "services" },
  { value: "icon-briefcase", label: "أعمال وشركات", icon: <IoBriefcaseOutline />, keywords: "بيزنس اعمال وظائف شركات business briefcase", category: "other" },
  { value: "icon-plane", label: "سياحة وسفر", icon: <FaPlane />, keywords: "سفر طيران سياحة رحلات travel flight plane", category: "services" },
  { value: "icon-gift", label: "هدايا ومناسبات", icon: <IoGiftOutline />, keywords: "هدية مناسبات اعياد gift celebration", category: "other" },
  { value: "icon-book", label: "تعليم وكتب", icon: <FaBook />, keywords: "كتاب دراسة تعليم مدرسة book study education", category: "other" },
  { value: "icon-camera", label: "تصوير وميديا", icon: <FaCamera />, keywords: "كاميرا تصوير صور فيديو camera photography media", category: "other" },
  { value: "icon-music", label: "صوتيات وموسيقى", icon: <FaMusic />, keywords: "صوت موسيقى اوديو music audio sound", category: "other" },
  { value: "icon-gamepad", label: "ألعاب وترفيه", icon: <FaGamepad />, keywords: "العاب قيمنق العاب الكترونية gaming games", category: "other" },
  { value: "icon-leaf", label: "طبيعة وزراعة", icon: <IoLeafOutline />, keywords: "طبيعة نبات زرع بيئة nature leaf plant", category: "other" },
  { value: "icon-sparkles", label: "تجميل وعناية", icon: <IoSparklesOutline />, keywords: "تجميل ميك اب عناية نظافة beauty cosmetics sparkles", category: "fashion" },
  { value: "icon-star", label: "مميز ومفضل", icon: <FaStar />, keywords: "نجمة مميز تقييم star favorite featured", category: "other" },
  { value: "icon-globe", label: "عام ومواقع", icon: <FaGlobe />, keywords: "موقع ويب شبكة دولي globe web internet", category: "other" },
];

/**
 * Resolves an icon name string to a React element.
 * Falls back to <FaGlobe /> when the name is unknown or empty.
 * @param iconName  - value stored in DB (case-insensitive)
 * @param fallback  - element to return when the name is unknown (default: <FaGlobe />)
 */
export function resolveIcon(
  iconName?: string | null,
  fallback: React.ReactElement = <FaGlobe />
): React.ReactElement {
  if (!iconName) return fallback;
  const clean = String(iconName).toLowerCase().trim();
  if (ICON_MAP[clean]) return ICON_MAP[clean];
  const withoutPrefix = clean.replace(/^(icon|fa|io|ri)-/, "");
  if (ICON_MAP[withoutPrefix]) return ICON_MAP[withoutPrefix];
  const withIconPrefix = `icon-${clean}`;
  if (ICON_MAP[withIconPrefix]) return ICON_MAP[withIconPrefix];
  return fallback;
}
