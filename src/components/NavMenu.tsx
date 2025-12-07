import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { BarChartBig, Plus, RefreshCw, GraduationCap, BookOpen, Sparkles, LogOut, User, Settings } from "lucide-react"
import { auth, signOut } from "@/auth"

export async function NavMenu() {
  const session = await auth();
  const userRole = (session?.user as any)?.role;

  return (
      <DropdownMenuContent className="w-56" align="start">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {userRole === "STUDENT" && (
            <>
              <DropdownMenuItem>
                <Link href="/dashboard" className="flex w-full items-center">
                  <BookOpen className="mr-2 h-4 w-4" />
                  Dashboard
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link href="/student/classes" className="flex w-full items-center">
                  <GraduationCap className="mr-2 h-4 w-4" />
                  My Classes
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link href="/quizz/new" className="flex w-full items-center">
                  <Sparkles className="mr-2 h-4 w-4" />
                  Study Tools
                </Link>
              </DropdownMenuItem>
            </>
          )}

          {userRole === "TEACHER" && (
            <>
              <DropdownMenuItem>
                <Link href="/teacher/dashboard" className="flex w-full items-center">
                  <GraduationCap className="mr-2 h-4 w-4" />
                  Teacher Dashboard
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link href="/quizz/new/upload" className="flex w-full items-center">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Quiz
                </Link>
              </DropdownMenuItem>
            </>
          )}

          <DropdownMenuItem>
            <Link href="/billing" className="flex w-full items-center">
              <BarChartBig className="mr-2 h-4 w-4" />
              Billing
            </Link>
          </DropdownMenuItem>

        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <form action={async () => {
            'use server';
            await signOut({ redirectTo: "/" })
          }} className="w-full">
            <button type="submit" className="flex w-full items-center cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </button>
          </form>
        </DropdownMenuItem>

      </DropdownMenuContent>
  )
}
