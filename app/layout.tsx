import type { Metadata } from "next";
import { M_PLUS_Rounded_1c } from "next/font/google";
// @ts-ignore
import "./globals.css";
import AuthProvider from "@/components/providers/AuthProvider";
import DashboardLayout from "./components/DashboardLayout";

const mPlusRounded = M_PLUS_Rounded_1c({
  variable: "--font-m-plus-rounded",
  subsets: ["latin"],
  weight: ["100", "300", "400", "500", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "TEAi | Transcription Engine for Autonomous Intelligence",
  description: "Advanced transcription technology meets autonomous AI to transform meetings into actionable insights and automated workflows",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${mPlusRounded.variable} antialiased font-sans`}
      >
        <AuthProvider>
          <DashboardLayout>
            {children}
          </DashboardLayout>
        </AuthProvider>
      </body>
    </html>
  );
}
