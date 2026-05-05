import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Resort Multi-tenant Template",
  description: "Next.js 16 multi-tenant resort website template"
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="th">
      <body>
        <header className="site-header">
          <div className="shell header-row">
            <div className="brand">Resort Template</div>
            <nav>
              <a href="#contact">ติดต่อ</a>
            </nav>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
