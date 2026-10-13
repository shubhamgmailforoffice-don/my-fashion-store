"use client";

import { GooeyToaster } from "goey-toast";
import "goey-toast/styles.css";
import { useTheme } from "@/lib/theme";

export default function ToastProvider() {
  const { theme } = useTheme();

  return (
    <GooeyToaster
      position="top-right"
      theme={theme === "dark" ? "dark" : "light"}
      preset="bouncy"
      closeButton="top-right"
      showProgress
      showTimestamp={false}
      duration={3500}
      offset="80px"
    />
  );
}
