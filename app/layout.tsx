import "./globals.css";
import Link from "next/link";
import { NavAuthButtons } from "@/components/nav-auth-buttons";

export const metadata = {
  title: "CYEZ-YQ",
  description: "Class website for students",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-cn" className="h-full">
      <body className="min-h-screen bg-white text-gray-900">
        <header className="border-b">
          <nav className="mx-auto max-w-6xl px-4">
            <div className="flex h-16 items-center justify-between">
              <div className="flex items-center gap-6">
                <Link href="/" className="font-semibold tracking-tight">CYEZ-YQ</Link>
                <Link href="/dashboard" className="text-sm hover:underline">仪表盘</Link>
                <Link href="/announcements" className="text-sm hover:underline">公告</Link>
                <Link href="/discussions" className="text-sm hover:underline">讨论区</Link>
                <Link href="/confessions" className="text-sm hover:underline">表白墙</Link>
                <Link href="/fund" className="text-sm hover:underline">班费</Link>
              </div>
              <NavAuthButtons />
            </div>
          </nav>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
        <footer className="mx-auto max-w-6xl px-4 py-8 text-sm text-gray-500">
          © {new Date().getFullYear()} CYEZ-YQ
        </footer>
      </body>
    </html>
  );
}
