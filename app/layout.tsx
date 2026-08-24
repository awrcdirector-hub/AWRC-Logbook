import type { Metadata } from "next";
import { PwaRegister } from "./pwa-register";
import "./globals.css";

export const metadata: Metadata = {
  title: "AWRC Training Signup",
  description:
    "A training signup and attendance hub for Aramoho-Whanganui Rowing Club.",
  applicationName: "AWRC Training Signup",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Training Signup",
  },
  formatDetection: {
    telephone: false,
  },
  themeColor: "#0a4c56",
  icons: {
    icon: [
      { url: "/awrc-favicon.ico", sizes: "any" },
      { url: "/awrc-icon-transparent-192.png", type: "image/png", sizes: "192x192" },
    ],
    shortcut: "/awrc-favicon.ico",
    apple: "/awrc-icon-transparent-192.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="Training Signup" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body>
        <PwaRegister />
        {children}
      </body>
    </html>
  );
}
