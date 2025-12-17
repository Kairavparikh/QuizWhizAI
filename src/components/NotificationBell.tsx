"use client";

import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "./ui/dropdown-menu";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  link: string | null;
  read: boolean;
  createdAt: Date;
  classId: number | null;
}

export function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const { data: session } = useSession();

  // Fetch unread count
  const fetchUnreadCount = async () => {
    try {
      const res = await fetch("/api/notifications/unread-count");
      if (res.ok) {
        const data = await res.json();
        setUnreadCount(data.count);
      }
    } catch (error) {
      console.error("Error fetching unread count:", error);
    }
  };

  // Fetch recent notifications
  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications?limit=5");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId: number) => {
    try {
      await fetch(`/api/notifications/${notificationId}/mark-read`, {
        method: "PATCH",
      });
      // Refresh data
      fetchUnreadCount();
      fetchNotifications();
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      await fetch("/api/notifications/mark-all-read", {
        method: "PATCH",
      });
      // Refresh data
      fetchUnreadCount();
      fetchNotifications();
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchUnreadCount();
    fetchNotifications();
  }, []);

  // Poll for updates every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchUnreadCount();
      if (isOpen) {
        fetchNotifications();
      }
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [isOpen]);

  // Fetch notifications when dropdown opens
  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read) {
      await markAsRead(notification.id);
    }
    // Route based on user role
    const userRole = (session?.user as any)?.role;
    if (userRole === "TEACHER") {
      router.push(`/teacher/dashboard`);
    } else {
      router.push(`/student/classes`);
    }
    setIsOpen(false);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "ASSIGNMENT_POSTED":
        return "📚";
      case "ANNOUNCEMENT":
        return "📢";
      case "QUIZ_GRADED":
        return "✅";
      case "STUDENT_JOINED_CLASS":
        return "👋";
      case "QUIZ_REMINDER":
        return "⏰";
      case "CLASS_UPDATE":
        return "🔔";
      default:
        return "📌";
    }
  };

  const getRelativeTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return new Date(date).toLocaleDateString();
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative" size="icon">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between px-4 py-2">
          <h3 className="font-semibold text-lg">Notifications</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="text-xs"
            >
              Mark all read
            </Button>
          )}
        </div>
        <DropdownMenuSeparator />

        {notifications.length === 0 ? (
          <div className="px-4 py-8 text-center text-gray-500">
            <Bell className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No notifications yet</p>
          </div>
        ) : (
          <>
            {notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={`px-4 py-3 cursor-pointer ${
                  !notification.read ? "bg-blue-50 dark:bg-blue-950" : ""
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex gap-3 w-full">
                  <div className="text-2xl flex-shrink-0">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium text-sm truncate">
                        {notification.title}
                      </p>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1" />
                      )}
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      {getRelativeTime(notification.createdAt)}
                    </p>
                  </div>
                </div>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link
                href="/inbox"
                className="w-full text-center text-sm py-2 text-blue-600 dark:text-blue-400 font-medium cursor-pointer"
              >
                View all notifications
              </Link>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
