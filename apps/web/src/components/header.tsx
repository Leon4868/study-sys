import { Button } from "@study-sys/ui/components/button";
import { cn } from "@study-sys/ui/lib/utils";
import { Link, useRouterState } from "@tanstack/react-router";
import { BarChart3, BookOpen, History, Plus, UserRound } from "lucide-react";

import { ModeToggle } from "./mode-toggle";
import UserMenu from "./user-menu";

export default function Header() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  if (pathname === "/login") {
    return null;
  }

  const links = [
    { to: "/dashboard", label: "仪表盘", icon: BarChart3, active: pathname === "/dashboard" },
    { to: "/records", label: "学习记录", icon: History, active: pathname.startsWith("/records") },
    { to: "/", label: "个人中心", icon: UserRound, active: pathname === "/" },
  ] as const;

  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 flex-col border-r border-[#c4c6cf] bg-[#f0f3ff] p-4 lg:flex">
      <div className="mb-12 px-2 py-4">
        <Link to="/dashboard" className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-xl bg-[#002045] text-white">
            <BookOpen className="size-5" />
          </span>
          <span>
            <span className="font-study-heading block text-2xl font-semibold text-[#002045]">
              智学管理系统
            </span>
            <span className="text-sm font-medium text-[#43474e]">专注、成长、记录</span>
          </span>
        </Link>
      </div>

      <nav className="flex flex-1 flex-col gap-2">
        {links.map(({ to, label, icon: Icon, active }) => (
          <Link
            key={to}
            to={to}
            className={cn(
              "flex items-center gap-4 rounded-xl px-4 py-3 text-sm font-semibold transition-all",
              active
                ? "bg-[#7db6ff] text-[#00477f]"
                : "text-[#43474e] hover:bg-[#d8e3fa] hover:text-[#002045]",
            )}
          >
            <Icon className="size-5" />
            {label}
          </Link>
        ))}
      </nav>

      <div className="mt-auto space-y-4">
        <Button
          render={<Link to="/records/new" />}
          className="h-12 w-full rounded-xl bg-[#002045] text-sm font-bold text-white hover:bg-[#1a365d]"
        >
          <Plus className="size-4" />
          新增记录
        </Button>
        <div className="flex items-center justify-between border-t border-[#c4c6cf] pt-4">
          <UserMenu />
          <ModeToggle />
        </div>
      </div>
    </aside>
  );
}
