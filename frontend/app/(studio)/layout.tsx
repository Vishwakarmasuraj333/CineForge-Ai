"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BrandMark } from "@/components/ui/BrandMark";
import { api, clearStoredTokens, getStoredToken } from "@/lib/api-client";
import {
  LayoutDashboard,
  Video,
  FolderKanban,
  History,
  Coins,
  LogOut,
  Sparkles,
  Menu,
  X,
  User as UserIcon,
  Cpu
} from "lucide-react";

export default function StudioLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<{ display_name: string; email: string; role: string } | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const token = getStoredToken();
    if (!token) {
      router.push("/login");
      return;
    }

    api.auth
      .me()
      .then((data) => setUser(data))
      .catch(() => {
        clearStoredTokens();
        router.push("/login");
      });
  }, [router]);

  const navItems = [
    { name: "Create Studio", href: "/create", icon: Video },
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Projects", href: "/projects", icon: FolderKanban },
    { name: "Generations", href: "/generations", icon: History },
    { name: "Usage & Billing", href: "/usage", icon: Coins },
  ];

  const handleLogout = () => {
    api.auth.logout();
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-cine-950 flex flex-col md:flex-row text-cine-100">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-cine-900 border-b border-cine-800">
        <BrandMark size="sm" />
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1.5 rounded-md text-cine-400 hover:text-white border border-cine-700"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`${
          mobileMenuOpen ? "block" : "hidden"
        } md:flex flex-col w-full md:w-64 bg-cine-900/90 border-r border-cine-800/80 px-4 py-6 shrink-0 md:min-h-screen justify-between`}
      >
        <div className="space-y-6">
          <div className="px-2 hidden md:block">
            <BrandMark size="md" />
          </div>

          {/* Quick Engine Status Chip */}
          <div className="px-3 py-2 rounded-md bg-cine-950 border border-cine-800 flex items-center justify-between text-xs font-mono">
            <span className="flex items-center gap-1.5 text-cine-400">
              <Cpu className="w-3.5 h-3.5 text-teal-400" /> Engine:
            </span>
            <span className="text-teal-400 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" /> Ready
            </span>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all ${
                    isActive
                      ? "bg-cine-800 text-gold-400 font-semibold border-l-2 border-gold-400 shadow-inner"
                      : "text-cine-400 hover:bg-cine-850 hover:text-cine-100"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Card & Logout */}
        <div className="pt-6 border-t border-cine-800 space-y-3">
          {user && (
            <div className="px-3 py-2 rounded-md bg-cine-950/60 border border-cine-800 flex items-center justify-between">
              <div className="truncate">
                <p className="text-xs font-semibold text-white truncate">{user.display_name}</p>
                <p className="text-[10px] text-cine-400 truncate font-mono">{user.email}</p>
              </div>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cine-800 text-gold-400 border border-cine-700">
                {user.role}
              </span>
            </div>
          )}

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium text-cine-400 hover:bg-red-950/40 hover:text-red-400 transition-colors border border-transparent hover:border-red-900"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-cine-950 p-6 md:p-8">
        <div className="max-w-6xl mx-auto">{children}</div>
      </main>
    </div>
  );
}

