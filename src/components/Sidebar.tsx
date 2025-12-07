'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Bell,
  Plus,
  GraduationCap,
  Users,
  BarChart3
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebar } from "./SidebarProvider";

type SidebarProps = {
  userRole: string | null;
  isSubscribed?: boolean;
};

export function Sidebar({ userRole, isSubscribed }: SidebarProps) {
  const { isOpen } = useSidebar();
  const pathname = usePathname();

  // Only show My Classes for subscribed users
  const showMyClasses = isSubscribed || userRole === "TEACHER";

  const studentNavItems = [
    {
      section: "Main",
      items: [
        { name: "Dashboard", href: "/dashboard", icon: Home },
        ...(showMyClasses ? [{ name: "My Classes", href: "/student/classes", icon: GraduationCap }] : []),
        { name: "Notifications", href: "/inbox", icon: Bell },
      ]
    },
    {
      section: "Study Tools",
      items: [
        { name: "Create Quiz", href: "/quizz/new", icon: Plus },
        ...(isSubscribed ? [{ name: "Misconceptions", href: "/dashboard/misconceptions", icon: BarChart3 }] : []),
      ]
    }
  ];

  const teacherNavItems = [
    {
      section: "Main",
      items: [
        { name: "Dashboard", href: "/teacher/dashboard", icon: Home },
        { name: "Notifications", href: "/inbox", icon: Bell },
      ]
    },
    {
      section: "Teacher Tools",
      items: [
        { name: "Create Quiz", href: "/quizz/new/upload", icon: Plus },
        { name: "Setup Profile", href: "/teacher/setup", icon: Users },
      ]
    }
  ];

  const navItems = userRole === "TEACHER" ? teacherNavItems : studentNavItems;

  return (
    <>
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen w-72 bg-[#0F172A] text-gray-200 transition-all duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-72"
        )}
      >
        <div className="flex flex-col h-full p-4 pt-20">{/* pt-20 to account for header */}

          {/* Navigation Sections */}
          <nav className="flex-1 space-y-6 overflow-y-auto">
            {navItems.map((section, sectionIdx) => (
              <div key={sectionIdx}>
                {/* Section Header */}
                {section.section && (
                  <h3 className="px-3 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    {section.section}
                  </h3>
                )}

                {/* Section Items */}
                <div className="space-y-1">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;

                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={cn(
                          "flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all",
                          isActive
                            ? "bg-gray-700/50 text-white"
                            : "text-gray-300 hover:bg-gray-800/50 hover:text-white"
                        )}
                      >
                        <Icon className="h-5 w-5 flex-shrink-0" />
                        <span>{item.name}</span>
                      </Link>
                    );
                  })}
                </div>

                {/* Separator between sections */}
                {sectionIdx < navItems.length - 1 && (
                  <hr className="my-4 border-gray-700" />
                )}
              </div>
            ))}
          </nav>
        </div>
      </aside>
    </>
  );
}
