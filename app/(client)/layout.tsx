import Header from "@/components/shared/Header";
import SideBar from "@/components/shared/SideBar";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex justify-center items-center">
      <div className="flex w-full gap-5 bg-glass p-1 md:p-4 md:rounded-3xl !border-none">
        <SideBar  />
        <main className="flex-1 flex flex-col w-full">
          <Header />
          <div className="flex-1 w-full ">{children}</div>
        </main>
      </div>
    </div>
  );
}
