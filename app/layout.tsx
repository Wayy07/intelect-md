import type { Metadata } from "next";
import "./globals.css";



export const metadata: Metadata = {
  title: "Intelect MD",
  description: "Intelect MD Magazin de electronice",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
