"use client";

import React, { useEffect } from "react";
import { CheckCircle, XCircle, AlertTriangle, Info, X } from "lucide-react";
import { useNotificationStore, Notification as NotificationType } from "../../store/notificationStore";

const typeStyles = {
  success: {
    bg: "bg-green-50 border-green-400 text-green-800",
    borderLeft: "border-l-4 border-l-green-500",
    icon: CheckCircle,
  },
  error: {
    bg: "bg-red-50 border-red-400 text-red-800",
    borderLeft: "border-l-4 border-l-red-500",
    icon: XCircle,
  },
  warning: {
    bg: "bg-yellow-50 border-yellow-400 text-yellow-800",
    borderLeft: "border-l-4 border-l-yellow-500",
    icon: AlertTriangle,
  },
  info: {
    bg: "bg-blue-50 border-blue-400 text-blue-800",
    borderLeft: "border-l-4 border-l-blue-500",
    icon: Info,
  },
};

export default function NotificationContainer() {
  const { notifications, removeNotification } = useNotificationStore();

  return (
    <div
      aria-live="polite"
      role="status"
      className="fixed top-4 right-4 z-[9999] flex flex-col space-y-3 w-[380px] pointer-events-none"
    >
      {notifications.map((n) => (
        <NotificationCard key={n.id} notification={n} onClose={removeNotification} />
      ))}
    </div>
  );
}

function NotificationCard({
  notification,
  onClose,
}: {
  notification: NotificationType;
  onClose: (id: string) => void;
}) {
  const { id, type, title, message, duration = 5000 } = notification;
  const styles = typeStyles[type] || typeStyles.info;
  const IconComponent = styles.icon;

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, duration);
    return () => clearTimeout(timer);
  }, [id, duration, onClose]);

  return (
    <div
      className={`pointer-events-auto flex items-start p-4 rounded border ${styles.bg} ${styles.borderLeft} shadow-lg transition-all duration-300 ease-out transform translate-x-0 animate-in fade-in slide-in-from-right-5`}
    >
      <div className="flex-shrink-0 mr-3">
        <IconComponent className="h-5 w-5" />
      </div>
      <div className="flex-1">
        <h4 className="font-bold text-sm leading-5">{title}</h4>
        {message && <p className="mt-1 text-xs leading-4 opacity-90">{message}</p>}
      </div>
      <button
        onClick={() => onClose(id)}
        className="flex-shrink-0 ml-4 hover:opacity-75 transition-opacity"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
