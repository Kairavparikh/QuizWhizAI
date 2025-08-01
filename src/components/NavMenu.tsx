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
import { BarChartBig, Plus } from "lucide-react"
export function NavMenu() {
  return (
      <DropdownMenuContent className="w-56" align="start">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <Link href = "/dashboard" className = "flex">
              DashBoard
            </Link>
          </DropdownMenuItem>
          
          <DropdownMenuItem>
          <Link href = "/quizz/new" className = "flex" >
          
            Add Quiz
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem>
          <Link href = "/billing" className = "flex" >
            Billing
            </Link>
          </DropdownMenuItem>
         
        </DropdownMenuGroup>
      
      </DropdownMenuContent>
  )
}
