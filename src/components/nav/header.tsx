import { SidebarTrigger } from "../ui/sidebar";
import { ThemeToggle } from "../theme-toggle";

export function Header() {
  return (
    <div className="flex items-center gap-2 p-4 justify-between sticky top-0 bg-transparent z-10">
      <SidebarTrigger className="-ml-1" />
      <ThemeToggle />
    </div>
  );
}