'use client';

import { useState } from 'react';
import { useAuth } from "@/lib/auth-context";
import { useNotificationStore } from '@/lib/notification-store';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, Check } from "lucide-react";
import { format } from 'date-fns';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function NotificationsPage() {
  const { user } = useAuth();
  const { notifications, markAsRead, markAllAsRead } = useNotificationStore();
  const [filter, setFilter] = useState<'all' | 'unread' | 'leave_request' | 'weekly_report'>('all');

  // Filter notifications based on user role and targetUserId
  const userNotifications = notifications.filter(notification => {
    // For admin, show only notifications without targetUserId (system notifications)
    if (user?.role?.name === 'admin') {
      return !notification.targetUserId;
    }
    // For employees, show notifications either targeted to them or without a specific target
    return !notification.targetUserId || notification.targetUserId === user?.id;
  });

  const filteredNotifications = userNotifications.filter(notification => {
    if (filter === 'unread') return !notification.read;
    if (filter === 'leave_request') return notification.type === 'leave_request';
    if (filter === 'weekly_report') return notification.type === 'weekly_report';
    return true;
  });

  const unreadCount = userNotifications.filter(n => !n.read).length;

  const getNotificationMessage = (notification: typeof notifications[0]) => {
    if (notification.message) {
      return notification.message;
    }

    switch (notification.type) {
      case 'leave_request':
        return user?.role?.name === 'admin'
          ? `${notification.employeeName} submitted a leave request`
          : `Your leave request has been ${notification.message?.includes('approved') ? 'approved' : 'rejected'}`;
      
      case 'weekly_report':
        return user?.role?.name === 'admin'
          ? `${notification.employeeName} submitted a weekly report`
          : 'Your weekly report has been received';
      
      case 'ticket':
        return notification.message || `${notification.employeeName} submitted a new support ticket`;
      
      default:
        return 'New notification';
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center gap-4 mb-8">
        <Bell className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground">Stay updated with latest activities</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Total Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{userNotifications.length}</p>
            <p className="text-sm text-muted-foreground">All notifications</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Unread</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{unreadCount}</p>
            <p className="text-sm text-muted-foreground">Pending notifications</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Today's Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">
              {userNotifications.filter(n => 
                new Date(n.timestamp).toDateString() === new Date().toDateString()
              ).length}
            </p>
            <p className="text-sm text-muted-foreground">Received today</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between items-center mb-6">
        <Select value={filter} onValueChange={(value: typeof filter) => setFilter(value)}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter notifications" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Notifications</SelectItem>
            <SelectItem value="unread">Unread</SelectItem>
            <SelectItem value="leave_request">Leave Requests</SelectItem>
            <SelectItem value="weekly_report">Weekly Reports</SelectItem>
          </SelectContent>
        </Select>

        {unreadCount > 0 && (
          <Button variant="outline" onClick={() => markAllAsRead()}>
            <Check className="mr-2 h-4 w-4" />
            Mark all as read
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {filteredNotifications.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8 text-muted-foreground">
              No notifications found
            </CardContent>
          </Card>
        ) : (
          filteredNotifications.map((notification) => (
            <Card
              key={notification.id}
              className={notification.read ? 'opacity-75' : ''}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="font-medium">
                      {getNotificationMessage(notification)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(notification.timestamp), 'PPp')}
                    </p>
                  </div>
                  {!notification.read && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => markAsRead(notification.id)}
                    >
                      Mark as read
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}