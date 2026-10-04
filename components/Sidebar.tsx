"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentType } from "react";
import {
  ShieldCheckIcon,
  HomeIcon,
  PlusCircleIcon,
  BuildingIcon,
  ClipboardListIcon,
} from "./icons";

// Sidebar navigation for the four main screens.
// "Result" is reached from "New check" after running the checks, so it is
// intentionally not a top-level nav item (per SPEC.md screen list).
// On narrow screens it collapses to icons only (SPEC.md: "Responsive").
const NAV_ITEMS: { href: string; label: string; Icon: ComponentType<{ className?: string }> }[] = [
  { href: "/", label: "Dashboard", Icon: HomeIcon },
  { href: "/new-check", label: "New check", Icon: PlusCircleIcon },
  { href: "/suppliers", label: "Suppliers", Icon: BuildingIcon },
  { href: "/audit-log", label: "Audit log", Icon: ClipboardListIcon },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-16 flex-none flex-col bg-navy text-slate-300 md:w-64">
      <div className="flex items-center gap-3 px-3 py-6 md:px-6">
        <div className="flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-accent text-white shadow-lg shadow-accent/30">
          <ShieldCheckIcon className="h-6 w-6" />
        </div>
        <div className="hidden md:block">
          <p className="text-base font-semibold leading-tight text-white">Before You Pay</p>
          <p className="text-xs text-slate-400">Verify before you transfer</p>
        </div>
      </div>

      <nav className="flex-1 px-2 md:px-3">
        <ul className="space-y-1">
          {NAV_ITEMS.map(({ href, label, Icon }) => {
            const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  title={label}
                  aria-current={isActive ? "page" : undefined}
                  className={`relative flex items-center justify-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors md:justify-start ${
                    isActive
                      ? "bg-white/10 text-white"
                      : "text-slate-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  {isActive && (
                    <span
                      className="absolute -left-2 top-2 bottom-2 w-1 rounded-r-full bg-accent md:-left-3"
                      aria-hidden="true"
                    />
                  )}
                  <Icon className="h-5 w-5 flex-none" />
                  <span className="hidden md:inline">{label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="hidden border-t border-white/10 px-6 py-5 md:block">
        <p className="text-xs font-medium text-slate-300">Deterministic checks</p>
        <p className="mt-1 text-xs leading-relaxed text-slate-500">
          Official VAT white list + your own payment history. If a source is down, the result is
          unverified — never “safe”.
        </p>
      </div>
    </aside>
  );
}
