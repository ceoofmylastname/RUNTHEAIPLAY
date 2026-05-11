import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Run The AI Play — Waitlist",
  description:
    "The AI Play is loading. Secure your spot on the waitlist for the next generation of AI-native web infrastructure.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=JetBrains+Mono:wght@400;500;600;700&family=Bricolage+Grotesque:opsz,wght,wdth@12..96,200..800,75..125&family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-[#050505] text-white antialiased">
        {children}
      </body>
    </html>
  );
}
