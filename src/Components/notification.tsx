"use client";
import { notification } from "antd";

type NotificationType = "success" | "error" | "info" | "warning";

interface NotificationProps {
    type: NotificationType;
    message: string;
    description?: string;
    duration?: number;
}

const showNotification = ({ type, message, description, duration = 3 }: NotificationProps) => {
    notification[type]({
        message,
        description,
        duration,
        placement: "topRight",
    });
};

export default showNotification;
