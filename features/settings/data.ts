export interface SiteColorSetting {
  id: string;
  key: string;
  label: string;
  defaultValue: string;
}

export const defaultSiteColors: SiteColorSetting[] = [
  { id: "primary", key: "primaryColor", label: "اللون الأساسي", defaultValue: "#3B82F6" },
  { id: "secondary", key: "secondaryColor", label: "اللون الثانوي", defaultValue: "#10B981" },
  { id: "accent", key: "accentColor", label: "لون التمييز", defaultValue: "#F59E0B" },
  { id: "background", key: "backgroundColor", label: "لون الخلفية", defaultValue: "#F9FAFB" },
  { id: "text", key: "textColor", label: "لون النص", defaultValue: "#111827" },
  { id: "border", key: "borderColor", label: "لون الحدود", defaultValue: "#E5E7EB" },
];

export interface GeneralSettingsState {
  siteTitle: string;
  siteDescription: string;
  maintenanceMode: boolean;
  registrationEnabled: boolean;
}

export const defaultGeneralSettings: GeneralSettingsState = {
  siteTitle: "لوحة التحكم",
  siteDescription: "نظام إدارة المحتوى",
  maintenanceMode: false,
  registrationEnabled: true,
};

export const defaultColorsState: Record<string, string> = {
  primaryColor: "#3B82F6",
  secondaryColor: "#10B981",
  accentColor: "#F59E0B",
  backgroundColor: "#F9FAFB",
  textColor: "#111827",
  borderColor: "#E5E7EB",
};
