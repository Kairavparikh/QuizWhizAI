"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Megaphone, Eye, Clock, Users, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "./ui/button";

interface ReadInfo {
  userId: string;
  userName: string;
  userEmail: string;
  readAt: Date;
}

interface Announcement {
  id: number;
  title: string;
  message: string;
  createdAt: Date;
  totalRecipients: number;
  readCount: number;
  readBy: ReadInfo[];
}

interface AnnouncementsHistoryProps {
  classId: number;
}

export function AnnouncementsHistory({ classId }: AnnouncementsHistoryProps) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    fetchAnnouncements(true);

    // Auto-refresh every 10 seconds to show updated read status
    const interval = setInterval(() => {
      fetchAnnouncements(false); // Don't show loading on auto-refresh
    }, 10000); // 10 seconds

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classId]);

  const fetchAnnouncements = async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
      const res = await fetch(`/api/classes/${classId}/announcements`);
      if (res.ok) {
        const data = await res.json();
        setAnnouncements(data.announcements);
      }
    } catch (error) {
      console.error("Error fetching announcements:", error);
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  const toggleExpand = (id: number) => {
    const newExpanded = new Set(expandedIds);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedIds(newExpanded);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getReadPercentage = (readCount: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((readCount / total) * 100);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <p className="text-gray-600 dark:text-gray-400">Loading announcements...</p>
        </CardContent>
      </Card>
    );
  }

  if (announcements.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Megaphone className="w-16 h-16 mx-auto mb-4 text-gray-400 dark:text-gray-600" />
          <h3 className="text-xl font-semibold mb-2">No Announcements Yet</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Send your first announcement to notify all students in this class.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Megaphone className="w-5 h-5" />
          Announcements History
        </CardTitle>
        <CardDescription>
          View all past announcements and see which students have viewed them
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {announcements.map((announcement) => {
            const isExpanded = expandedIds.has(announcement.id);
            const readPercentage = getReadPercentage(
              announcement.readCount,
              announcement.totalRecipients
            );

            return (
              <div
                key={announcement.id}
                className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
              >
                {/* Announcement Header */}
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">{announcement.title}</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm whitespace-pre-wrap">
                      {announcement.message}
                    </p>
                  </div>
                </div>

                {/* Metadata */}
                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {formatDate(announcement.createdAt)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {announcement.totalRecipients} recipients
                  </span>
                </div>

                {/* Read Status Bar */}
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">
                      <Eye className="w-4 h-4 inline mr-1" />
                      {announcement.readCount} of {announcement.totalRecipients} viewed (
                      {readPercentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${readPercentage}%` }}
                    />
                  </div>
                </div>

                {/* Toggle Viewers */}
                {announcement.totalRecipients > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleExpand(announcement.id)}
                    className="w-full justify-between"
                  >
                    <span>
                      {isExpanded ? "Hide" : "Show"} who viewed this announcement
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </Button>
                )}

                {/* Viewer List */}
                {isExpanded && (
                  <div className="mt-4 space-y-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {announcement.readBy.map((reader) => (
                        <div
                          key={reader.userId}
                          className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded"
                        >
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white font-semibold text-sm">
                            {reader.userName[0]?.toUpperCase() || "?"}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">
                              {reader.userName}
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              ✓ Viewed
                            </p>
                          </div>
                        </div>
                      ))}

                      {/* Unread students */}
                      {announcement.totalRecipients > announcement.readCount && (
                        <>
                          {Array.from({
                            length: announcement.totalRecipients - announcement.readCount,
                          }).map((_, index) => (
                            <div
                              key={`unread-${index}`}
                              className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded opacity-50"
                            >
                              <div className="w-8 h-8 rounded-full bg-gray-400 flex items-center justify-center text-white font-semibold text-sm">
                                ?
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm">Student</p>
                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                  Not viewed yet
                                </p>
                              </div>
                            </div>
                          ))}
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
