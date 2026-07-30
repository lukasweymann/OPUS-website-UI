"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, CircleAlert, X } from "lucide-react";
import { getToasts, subscribeToToasts, toast } from "./toast";
import s from "./ToastProvider.module.css";

const ICONS = {
  success: CheckCircle2,
  error: CircleAlert,
};

export default function ToastProvider() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    setItems(getToasts());
    return subscribeToToasts(() => setItems([...getToasts()]));
  }, []);

  if (!items.length) return null;

  return (
    <div className={s.region} aria-live="polite" aria-atomic="false">
      {items.map((item) => {
        const Icon = ICONS[item.type] ?? CircleAlert;

        return (
          <div
            key={item.id}
            className={`${s.toast} ${item.type === "success" ? s.success : s.error}`}
            role={item.type === "error" ? "alert" : "status"}
          >
            <Icon className={s.icon} strokeWidth={1.9} aria-hidden="true" />
            <p className={s.message}>{item.message}</p>
            <button
              type="button"
              className={s.close}
              onClick={() => toast.dismiss(item.id)}
              aria-label="Dismiss notification"
            >
              <X size={15} strokeWidth={2} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
