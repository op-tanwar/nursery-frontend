"use client";

import { Toaster } from "react-hot-toast";

/** Leaf toast host — keeps react-hot-toast out of the root layout module graph for SSR. */
export default function AppToaster() {
  return (
    <Toaster
      position="top-center"
      toastOptions={{
        duration: 4000,
        style: {
          background: "#ffffff",
          color: "#1c1917",
          borderRadius: "12px",
          fontSize: "14px",
          fontWeight: "600",
          border: "1px solid #e7e5e4",
        },
      }}
    />
  );
}
