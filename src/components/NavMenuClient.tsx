'use client';

import { Button } from "@/components/ui/button"
import {
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { BarChartBig, Plus, GraduationCap, BookOpen, Sparkles, LogOut } from "lucide-react"
import { signOut } from "next-auth/react"

type NavMenuClientProps = {
  userRole: string | null;
  isSubscribed?: boolean;
};

export function NavMenu({ userRole, isSubscribed }: NavMenuClientProps) {
  // Only show My Classes for subscribed users or teachers
  const showMyClasses = isSubscribed || userRole === "TEACHER";

  return (
    <DropdownMenuContent className="w-56" align="end">
      <DropdownMenuLabel>My Account</DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuGroup>
        {userRole === "TEACHER" ? (
          <>
            <DropdownMenuItem asChild>
              <Link href="/teacher/dashboard" className="flex w-full items-center cursor-pointer">
                <GraduationCap className="mr-2 h-4 w-4" />
                Teacher Dashboard
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/quizz/new/upload" className="flex w-full items-center cursor-pointer">
                <Plus className="mr-2 h-4 w-4" />
                Create Quiz
              </Link>
            </DropdownMenuItem>
          </>
        ) : (
          <>
            <DropdownMenuItem asChild>
              <Link href="/dashboard" className="flex w-full items-center cursor-pointer">
                <BookOpen className="mr-2 h-4 w-4" />
                Dashboard
              </Link>
            </DropdownMenuItem>
            {showMyClasses && (
              <DropdownMenuItem asChild>
                <Link href="/student/classes" className="flex w-full items-center cursor-pointer">
                  <GraduationCap className="mr-2 h-4 w-4" />
                  My Classes
                </Link>
              </DropdownMenuItem>
            )}
            <DropdownMenuItem asChild>
              <Link href="/quizz/new" className="flex w-full items-center cursor-pointer">
                <Sparkles className="mr-2 h-4 w-4" />
                Study Tools
              </Link>
            </DropdownMenuItem>
          </>
        )}

        <DropdownMenuItem asChild>
          <Link href="/billing" className="flex w-full items-center cursor-pointer">
            <BarChartBig className="mr-2 h-4 w-4" />
            Billing
          </Link>
        </DropdownMenuItem>

      </DropdownMenuGroup>

      <DropdownMenuSeparator />

      <DropdownMenuItem
        onClick={() => signOut({ callbackUrl: "/" })}
        className="cursor-pointer"
      >
        <LogOut className="mr-2 h-4 w-4" />
        Sign Out
      </DropdownMenuItem>

    </DropdownMenuContent>
  )
}
