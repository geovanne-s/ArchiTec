"use client";

import { LogoutIcon } from "@/assets/icons";
import { Avatar } from "@/components/ui/avatar";
import { SidebarMenu, SidebarMenuItem } from "@/components/ui/sidebar";
import { Button } from "../ui/button";
import { getInitials } from "@/lib/utils";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface User {
  name?: string;
  email?: string;
}

interface NavItensProps {
  isOpen?: boolean;
}

export function NavUser({ isOpen }: NavItensProps) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    try {
      const userString = localStorage.getItem("user");
      if (userString) {
        const userData: User = JSON.parse(userString);
        setUser(userData);
      }
    } catch (error) {
      toast.error(error as string);
    }
  }, []);
  return (
    <SidebarMenu>
      <SidebarMenuItem className="flex items-center bg-white p-3 rounded-lg  min-w-[50px]">
        {isOpen && (
          <>
            <Avatar className="h-10 w-10 flex items-center justify-center border-slate-300 border">
              {getInitials(user?.name)}
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight ml-3">
              <span className="truncate font-medium">{user?.name}</span>
              <span className="truncate text-xs">{user?.email}</span>
            </div>
          </>
        )}
        <Button variant={"ghost"} className="hover:cursor-pointer">
          <LogoutIcon className="text-red-500 !h-5 !w-5" />
        </Button>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
