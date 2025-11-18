"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Megaphone, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AnnouncementModalProps {
  classId: number;
  className: string;
}

export function AnnouncementModal({ classId, className }: AnnouncementModalProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [sendEmail, setSendEmail] = useState(true);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !message.trim()) {
      toast({
        title: "Error",
        description: "Please fill in both title and message",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`/api/classes/${classId}/announcements`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          message,
          sendEmail,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        toast({
          title: "Announcement sent!",
          description: `Sent to ${data.studentCount} students`,
        });
        setTitle("");
        setMessage("");
        setOpen(false);
      } else {
        const error = await res.json();
        toast({
          title: "Error",
          description: error.error || "Failed to send announcement",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error sending announcement:", error);
      toast({
        title: "Error",
        description: "Failed to send announcement",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Megaphone className="h-4 w-4 mr-2" />
          Send Announcement
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Send Class Announcement</DialogTitle>
          <DialogDescription>
            Send an announcement to all students in {className}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="e.g., Important: Quiz Rescheduled"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              placeholder="Write your announcement here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={6}
              required
              className="resize-none"
            />
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="sendEmail"
              checked={sendEmail}
              onChange={(e) => setSendEmail(e.target.checked)}
              className="rounded border-gray-300"
            />
            <Label htmlFor="sendEmail" className="text-sm font-normal cursor-pointer">
              Also send email notification to students
            </Label>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                "Sending..."
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Announcement
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
