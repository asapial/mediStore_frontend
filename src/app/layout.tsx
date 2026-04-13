import type { Metadata } from "next";
import "./globals.css";

import { ThemeProvider }   from "@/provider/themeProvider";
import { Toaster }         from "@/components/ui/sonner";
import { FloatingChatbot } from "@/components/chatbot/FloatingChatbot";

export const metadata: Metadata = {
  title: "LifeLine — Healthcare Platform",
  description: "Your trusted online pharmacy. Order medicines, track prescriptions, and manage your health with LifeLine.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Toaster />
          {children}
          {/* Floating AI chatbot — visible on every page */}
          <FloatingChatbot />
        </ThemeProvider>
      </body>
    </html>
  );
}
