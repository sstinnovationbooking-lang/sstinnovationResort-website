import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Resort Multi-tenant Platform",
    template: "%s | Resort Platform"
  },
  description: "Production-ready Next.js 16 multi-tenant resort website with BFF architecture."
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <header className="site-header">
          <div className="shell header-row">
            <div className="brand">SST Innovation Resort</div>
            <nav>
              <a href="#contact">Contact</a>
            </nav>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
