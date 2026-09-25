import ThemeForm from "../../ThemeForm";

export default async function EditThemePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ThemeForm mode="edit" themeId={id} />;
}