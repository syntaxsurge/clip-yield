import type { Metadata } from "next";
import { AppProviders } from "@/components/providers/AppProviders";
import { Toaster } from "react-hot-toast";
import AllOverlays from "@/app/components/AllOverlays";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "ClipYield",
  description: "Creator boosts powered by onchain yield.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AppProviders>
          <AllOverlays />
          {children}
          <Toaster position="bottom-right" />
        </AppProviders>
      </body>
    </html>
  );
}
