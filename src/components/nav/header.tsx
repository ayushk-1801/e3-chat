import { SidebarTrigger } from "../ui/sidebar";
import { ThemeToggle } from "../theme-toggle";

export function Header() {
  return (
    <div className="flex items-center gap-2 p-4 justify-between fixed top-0 left-0 right-0 z-[60] w-full">
      <SidebarTrigger className="-ml-1" />
      <ThemeToggle />
    </div>
  );
}