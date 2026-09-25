import ProfileEditClient from "./ProfileEditClient";

export default function SettingsPage() {
  return (
    <div className="p-6 overflow-y-auto h-full">
      <h1 className="text-2xl font-bold  mb-6">الملف الشخصي</h1>
      <ProfileEditClient />
    </div>
  );
}

