"use client";

import { useEffect } from "react";

/**
 * Recharts + ResponsiveContainer often trigger benign ResizeObserver loop
 * messages that Next.js dev overlay surfaces as a blocking error toast.
 */
export default function ClientRuntimeFixes() {
  useEffect(() => {
    const onError = (event: ErrorEvent) => {
      const msg = event.message ?? "";
      if (
        msg.includes("ResizeObserver loop") ||
        msg.includes("ResizeObserver loop limit exceeded")
      ) {
        event.stopImmediatePropagation();
        event.preventDefault();
      }
    };
    window.addEventListener("error", onError);

    const NativeResizeObserver = window.ResizeObserver;
    if (NativeResizeObserver) {
      window.ResizeObserver = class extends NativeResizeObserver {
        constructor(callback: ResizeObserverCallback) {
          super((entries, observer) => {
            window.requestAnimationFrame(() => {
              callback(entries, observer);
            });
          });
        }
      };
    }

    return () => {
      window.removeEventListener("error", onError);
      if (NativeResizeObserver) {
        window.ResizeObserver = NativeResizeObserver;
      }
    };
  }, []);

  return null;
}
