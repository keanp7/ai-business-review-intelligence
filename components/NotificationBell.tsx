import React, { useState } from "react";
import { Bell, Check } from "lucide-react";
import { Link } from "react-router-dom";
import {
  useNotifications,
  useUnreadCount,
  useMarkNotificationsRead,
} from "../helpers/useNotifications";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../components/Popover";
import { Button } from "./Button";
import { Badge } from "./Badge";
import styles from "./NotificationBell.module.css";

export const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { data: unreadCount = 0 } = useUnreadCount();
  const { data: notificationsData, isLoading } = useNotifications();
  const markRead = useMarkNotificationsRead();

  const handleMarkAllRead = () => {
    markRead.mutate({ markAllRead: true });
  };

  const handleNotificationClick = (notificationId: number, businessId: number) => {
    markRead.mutate({ notificationId });
    setIsOpen(false);
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return "just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon-md" className={styles.trigger}>
          <Bell size={20} />
          {unreadCount > 0 && (
            <span className={styles.badge}>{unreadCount > 9 ? "9+" : unreadCount}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className={styles.content} align="end" sideOffset={8}>
        <div className={styles.header}>
          <h4 className={styles.title}>Notifications</h4>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className={styles.markReadBtn}
              onClick={handleMarkAllRead}
              disabled={markRead.isPending}
            >
              <Check size={14} className="mr-1" /> Mark all read
            </Button>
          )}
        </div>
        
        <div className={styles.scrollArea}>
          {isLoading ? (
            <div className={styles.loading}>Loading...</div>
          ) : notificationsData?.notifications.length === 0 ? (
            <div className={styles.empty}>
              <Bell size={32} className={styles.emptyIcon} />
              <p>No notifications yet</p>
            </div>
          ) : (
            <div className={styles.list}>
              {notificationsData?.notifications.map((notification) => (
                <Link
                  key={notification.id}
                  to={`/business/${notification.businessId}`}
                  className={`${styles.item} ${!notification.isRead ? styles.unread : ""}`}
                  onClick={() => handleNotificationClick(notification.id, notification.businessId)}
                >
                  <div className={styles.itemContent}>
                    <div className={styles.itemHeader}>
                      <span className={styles.businessName}>{notification.businessName}</span>
                      <span className={styles.time}>{formatTimeAgo(notification.createdAt.toString())}</span>
                    </div>
                    <p className={styles.message}>{notification.message}</p>
                    <div className={styles.typeTag}>
                      <Badge variant="outline" className={styles.miniBadge}>
                        {notification.type.replace("_", " ")}
                      </Badge>
                    </div>
                  </div>
                  {!notification.isRead && <div className={styles.dot} />}
                </Link>
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};