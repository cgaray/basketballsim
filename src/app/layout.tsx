import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Basketball Team Builder & Simulator",
  description: "Build basketball teams from player cards and simulate matches with AI-powered play-by-play commentary",
  keywords: ["basketball", "team builder", "simulator", "NBA", "sports cards"],
  authors: [{ name: "Basketball Team Builder" }],
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full antialiased bg-gradient-to-br from-basketball-gray to-white">
        <div className="min-h-screen flex flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}
