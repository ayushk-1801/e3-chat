import { Button } from "../ui/button";
import { SidebarFooter, SidebarGroup, SidebarGroupLabel } from "../ui/sidebar";
import { signOut } from "@/lib/auth-client";
import { LogOutIcon } from "lucide-react";

export function AppSidebarFooter() {
  return (
    <SidebarFooter>
      <SidebarGroup>
        <SidebarGroupLabel>
          <Button variant="ghost" size="icon" onClick={() => signOut()}>
            <LogOutIcon className="h-4 w-4" />
          </Button>
        </SidebarGroupLabel>
      </SidebarGroup>
    </SidebarFooter>
  );
}