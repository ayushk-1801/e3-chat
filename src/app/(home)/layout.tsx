import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/nav/app-sidebar";
import { Header } from "@/components/nav/header";

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <Header />
          <div className="pt-[4.5rem]">
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </>
  );
}
