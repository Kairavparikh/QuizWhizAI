"use client";

import { useEffect, useState } from "react";
import { Bell, Trash2, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  link: string | null;
  read: boolean;
  createdAt: Date;
  classId: number | null;
  assignmentId: number | null;
  quizId: number | null;
}

type FilterType = "all" | "unread" | "assignments" | "announcements";

export default function InboxPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("all");
  const router = useRouter();

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const unreadOnly = filter === "unread";
      const res = await fetch(
        `/api/notifications?limit=100&unreadOnly=${unreadOnly}`
      );
      if (res.ok) {
        const data = await res.json();
        let filteredNotifications = data.notifications;

        // Apply additional filters
        if (filter === "assignments") {
          filteredNotifications = filteredNotifications.filter(
            (n: Notification) => n.type === "ASSIGNMENT_POSTED"
          );
        } else if (filter === "announcements") {
          filteredNotifications = filteredNotifications.filter(
            (n: Notification) => n.type === "ANNOUNCEMENT"
          );
        }

        setNotifications(filteredNotifications);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [filter]);

  const markAsRead = async (notificationId: number) => {
    try {
      await fetch(`/api/notifications/${notificationId}/mark-read`, {
        method: "PATCH",
      });
      fetchNotifications();
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch("/api/notifications/mark-all-read", {
        method: "PATCH",
      });
      fetchNotifications();
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  const deleteNotification = async (notificationId: number) => {
    try {
      await fetch(`/api/notifications/${notificationId}`, {
        method: "DELETE",
      });
      fetchNotifications();
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    // Route to student classes page
    router.push(`/student/classes`);
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
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays < 7) return `${diffDays} days ago`;
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <Bell className="h-8 w-8" />
                Inbox
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {unreadCount > 0
                  ? `${unreadCount} unread notification${
                      unreadCount > 1 ? "s" : ""
                    }`
                  : "All caught up!"}
              </p>
            </div>
            {unreadCount > 0 && (
              <Button onClick={markAllAsRead} variant="outline" size="sm">
                <CheckCheck className="h-4 w-4 mr-2" />
                Mark all as read
              </Button>
            )}
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 mt-6 border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 font-medium transition-colors ${
                filter === "all"
                  ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter("unread")}
              className={`px-4 py-2 font-medium transition-colors ${
                filter === "unread"
                  ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              }`}
            >
              Unread {unreadCount > 0 && `(${unreadCount})`}
            </button>
            <button
              onClick={() => setFilter("assignments")}
              className={`px-4 py-2 font-medium transition-colors ${
                filter === "assignments"
                  ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              }`}
            >
              Assignments
            </button>
            <button
              onClick={() => setFilter("announcements")}
              className={`px-4 py-2 font-medium transition-colors ${
                filter === "announcements"
                  ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              }`}
            >
              Announcements
            </button>
          </div>
        </div>

        {/* Notifications List */}
        {loading ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-12 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              Loading notifications...
            </p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-12 text-center">
            <Bell className="h-16 w-16 mx-auto mb-4 text-gray-400 dark:text-gray-600" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No notifications
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {filter === "unread"
                ? "You're all caught up!"
                : filter === "assignments"
                ? "No assignment notifications yet"
                : filter === "announcements"
                ? "No announcements yet"
                : "You don't have any notifications yet"}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 transition-all hover:shadow-md ${
                  !notification.read
                    ? "border-l-4 border-blue-500"
                    : "border-l-4 border-transparent"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="text-3xl flex-shrink-0">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div
                    className="flex-1 min-w-0 cursor-pointer"
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {notification.title}
                      </h3>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2" />
                      )}
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mt-1 whitespace-pre-wrap">
                      {notification.message}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                      {getRelativeTime(notification.createdAt)}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotification(notification.id);
                    }}
                    className="flex-shrink-0"
                  >
                    <Trash2 className="h-4 w-4 text-gray-400 hover:text-red-500" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
