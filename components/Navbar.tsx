"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Sparkles, Briefcase, Settings, LayoutDashboard, UserCheck, ShieldCheck, Plus, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import CreateJobModal from "@/components/jobs/CreateJobModal";

interface UserSession {
  id: string;
  email: string;
  name: string;
  role: "RECRUITER" | "CANDIDATE";
}

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [userSession, setUserSession] = useState<UserSession | null>(null);

  const loadSession = () => {
    try {
      const stored = localStorage.getItem("user_session");
      if (stored) {
        setUserSession(JSON.parse(stored));
      } else {
        setUserSession(null);
      }
    } catch {
      setUserSession(null);
    }
  };

  useEffect(() => {
    loadSession();

    window.addEventListener("auth-changed", loadSession);
    window.addEventListener("storage", loadSession);

    return () => {
      window.removeEventListener("auth-changed", loadSession);
      window.removeEventListener("storage", loadSession);
    };
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem("user_session");
    setUserSession(null);
    window.dispatchEvent(new Event("auth-changed"));
    router.push("/auth");
  };

  const allNavItems = [
    { name: "Overview", href: "/", icon: LayoutDashboard, roles: ["RECRUITER", "CANDIDATE", "GUEST"] },
    { name: "Recruiter Hub", href: "/recruiter/dashboard", icon: Briefcase, roles: ["RECRUITER"] },
    { name: "Student Portal", href: "/candidate/dashboard", icon: UserCheck, roles: ["CANDIDATE"] },
    { name: "AI Settings", href: "/settings", icon: Settings, roles: ["RECRUITER"] },
  ];

  const userRole = userSession?.role || "GUEST";
  const navItems = allNavItems.filter((item) => item.roles.includes(userRole));

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-[#000000]/90 backdrop-blur-md border-b border-[#1f1f1f]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          {/* Vercel Style Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="w-7 h-7 bg-white text-black rounded flex items-center justify-center font-bold text-xs shadow">
              <span className="leading-none">▲</span>
            </div>
            <span className="text-sm font-semibold tracking-tight text-white group-hover:text-slate-300 transition-colors">
              TalentAI <span className="text-xs text-slate-500 font-mono font-normal">v2.5</span>
            </span>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    isActive
                      ? "bg-[#1f1f1f] text-white border border-[#333333]"
                      : "text-slate-400 hover:text-white hover:bg-[#111111]"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Action CTAs & User Session Badge */}
          <div className="flex items-center space-x-2">
            {userSession ? (
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-2 px-2.5 py-1 rounded-lg bg-[#111111] border border-[#222222] text-xs">
                  <div className="w-5 h-5 rounded-full bg-indigo-600/30 text-indigo-300 font-bold flex items-center justify-center text-[10px]">
                    {userSession.name ? userSession.name.charAt(0).toUpperCase() : "U"}
                  </div>
                  <div className="hidden sm:block text-left">
                    <span className="font-semibold text-white block max-w-[120px] truncate leading-tight">
                      {userSession.name}
                    </span>
                    <span className="text-[9px] uppercase font-mono text-indigo-400 block leading-tight">
                      {userSession.role}
                    </span>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSignOut}
                  className="px-2.5 text-xs text-slate-400 hover:text-white"
                  title="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5 sm:mr-1" />
                  <span className="hidden sm:inline">Sign Out</span>
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/auth?mode=login">
                  <Button variant="outline" size="sm" className="hidden sm:inline-flex text-xs">
                    <ShieldCheck className="w-3.5 h-3.5 mr-1 text-slate-400" />
                    Sign In
                  </Button>
                </Link>

                <Link href="/auth?mode=signup">
                  <Button variant="primary" size="sm" className="text-xs">
                    Create Account
                  </Button>
                </Link>
              </div>
            )}

            {userRole !== "CANDIDATE" && (
              <Button variant="primary" size="sm" onClick={() => setIsJobModalOpen(true)}>
                <Plus className="w-3.5 h-3.5 mr-1" />
                <span className="hidden sm:inline">Post Job</span>
              </Button>
            )}
          </div>
        </div>
      </header>

      {isJobModalOpen && <CreateJobModal isOpen={isJobModalOpen} onClose={() => setIsJobModalOpen(false)} />}
    </>
  );
}
