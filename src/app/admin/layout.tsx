"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

const navItems = [
  { href: "/admin", label: "Overview", icon: "\u{1F4CA}" },
  { href: "/admin/availability", label: "Availability", icon: "\u{1F305}" },
  { href: "/admin/requests", label: "Requests", icon: "\u{1F4CB}" },
  { href: "/admin/calendar", label: "Calendar", icon: "\u{1F4C5}" },
  { href: "/admin/settings", label: "Settings", icon: "\u{2699}\u{FE0F}" },
];

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 w-64 border-r border-glass-border bg-midnight-800/50 backdrop-blur-xl">
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="border-b border-glass-border p-6">
            <Link href="/admin" className="flex items-center gap-2">
              <span className="text-2xl">{"\u{1F305}"}</span>
              <span className="text-lg font-semibold text-text-primary">
                Catch a Morning
              </span>
            </Link>
          </div>

          {/* Nav */}
          <nav className="flex-1 space-y-1 p-4">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all",
                    isActive
                      ? "bg-indigo-500/10 text-indigo-400"
                      : "text-text-secondary hover:bg-glass-white hover:text-text-primary"
                  )}
                >
                  <span>{item.icon}</span>
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="border-t border-glass-border p-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              disabled={loggingOut}
              className="w-full justify-start text-text-secondary"
            >
              {"\u{1F6AA}"} Sign out
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="ml-64 flex-1 p-8">{children}</main>
    </div>
  );
}
