"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// Sidebar navigation for the four main screens.
// "Result" is reached from "New check" after running the checks, so it is
// intentionally not a top-level nav item (per SPEC.md screen list).
const NAV_ITEMS = [
  { href: "/", label: "Dashboard" },
  { href: "/new-check", label: "New check" },
  { href: "/suppliers", label: "Suppliers" },
  { href: "/audit-log", label: "Audit log" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-60 flex-none flex-col bg-navy text-slate-200">
      <div className="px-6 py-6">
        <p className="text-lg font-semibold text-white">Before You Pay</p>
        <p className="mt-1 text-xs text-slate-400">
          Verify before you transfer
        </p>
      </div>
      <nav className="flex-1 px-3">
        <ul className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`block rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-navy-light text-white"
                      : "text-slate-300 hover:bg-navy-light hover:text-white"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
