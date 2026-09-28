// features/themes/data.ts

export const defaultThemeDataState = {
  themeName: "",
  themePrice: "",
  platformName: "",
  platformId: null as number | null,
  categoryName: "",
  categoryId: null as number | null,
  themeImages: [] as File[],
  themeImagePreviews: [] as string[],
  demos: [] as any[],
};

export const defaultThemeIntroState = {
  introImage: null as File | null,
  introImagePreview: "",
  videoLink: "",
  videoTitle: "",
  videoDescription: "",
  platformRank: 1,
  themeRating: 1,
  ratingCount: 0,
  purchaseCount: 0,
  enableRating: true,
  enablePurchase: true,
  buttonTitle: "",
  buyLink: "",
  previewLink: "",
  themeVideoLink: "",
  playlistLink: "",
};

export const themeFormSteps = [
  { step: 1, title: "بيانات الثيم", description: "الاسم، السعر، والتصنيفات" },
  { step: 2, title: "مقدمة الثيم", description: "الفيديو والصور والمميزات" },
  { step: 3, title: "دليل المستخدم", description: "صفحات وأقسام الشرح" },
] as const;
