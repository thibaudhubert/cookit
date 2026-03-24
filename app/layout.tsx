import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cookit - Share your recipes. Cook with friends.",
  description: "A social platform for sharing and discovering amazing recipes",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
