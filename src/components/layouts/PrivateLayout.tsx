import { AppSidebar } from "../Sidebar/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "../ui/sidebar";

interface PrivateLayoutProps {
  children: React.ReactNode;
}

function LayoutContent({ children }: { children: React.ReactNode }) {
  const { open } = useSidebar();

  return (
    <>
      {!open && <SidebarTrigger className="absolute top-4 left-8 z-50" />}
      {children}
    </>
  );
}

export function PrivateLayout({ children }: PrivateLayoutProps) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="relative bg-[var(--sidebar)] p-2">
        <LayoutContent>{children}</LayoutContent>
      </SidebarInset>
    </SidebarProvider>
  );
}
