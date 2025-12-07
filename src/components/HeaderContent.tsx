'use client';

import { Button } from "./ui/button";
import Image from "next/image";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { NavMenu } from "./NavMenuClient";
import { NotificationBell } from "./NotificationBell";
import { Menu } from "lucide-react";
import { useSidebar } from "./SidebarProvider";
import { cn } from "@/lib/utils";

type HeaderContentProps = {
  user: {
    name?: string | null;
    image?: string | null;
  } | undefined;
  userRole: string | null;
  isSubscribed?: boolean;
};

export function HeaderContent({ user, userRole, isSubscribed }: HeaderContentProps) {
  const { isOpen, toggle } = useSidebar();

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <nav className="px-4 py-2.5">
        <div className="flex items-center justify-between mx-auto max-w-screen-xl">
          <div className="flex items-center gap-3">
            {user && (
              <Button
                variant="ghost"
                size="icon"
                onClick={toggle}
                className="hover:bg-gray-700/50"
              >
                <Menu className="h-6 w-6" />
              </Button>
            )}
            <Link
              href="/"
              className={cn(
                "transition-all duration-300",
                user && isOpen ? "ml-0" : user ? "ml-0" : "ml-0"
              )}
            >
              <h1 className="text-3xl font-black cursor-pointer bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 transition-all tracking-tight">
                QuizWhizAI
              </h1>
            </Link>
          </div>

          <div>
            {user ? (
              <div className="flex items-center gap-2">
                <NotificationBell />
                {user.name && user.image && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="rounded-full">
                        <Image
                          src={user.image}
                          alt={user.name}
                          width={38}
                          height={38}
                          className="rounded-full"
                        />
                      </Button>
                    </DropdownMenuTrigger>
                    <NavMenu userRole={userRole} isSubscribed={isSubscribed} />
                  </DropdownMenu>
                )}
              </div>
            ) : (
              <Link href="/api/auth/signin">
                <Button variant="link" className="rounded-xl border">Sign In</Button>
              </Link>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}
