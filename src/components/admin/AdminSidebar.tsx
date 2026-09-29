"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Tags,
  Users,
  TicketPercent,
  BarChart3,
  Newspaper,
  LogOut,
  Menu,
  X,
} from "lucide-react";

const LINKS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/categories", label: "Categories", icon: Tags },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/coupons", label: "Coupons", icon: TicketPercent },
  { href: "/admin/blog", label: "Blog", icon: Newspaper },
  { href: "/admin/traffic", label: "Traffic", icon: BarChart3 },
];

export default function AdminSidebar({ adminName }: { adminName: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const logout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  };

  const NavLinks = (
    <nav className="flex flex-col gap-1">
      {LINKS.map((link) => {
        const active =
          link.href === "/admin"
            ? pathname === "/admin"
            : pathname.startsWith(link.href);
        const Icon = link.icon;
        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={() => setOpen(false)}
            className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
              active
                ? "bg-brand-teal text-brand-cream"
                : "text-brand-teal hover:bg-brand-teal/10"
            }`}
          >
            <Icon size={17} />
            {link.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      <div className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-brand-teal/10 bg-brand-cream sticky top-0 z-30">
        <Image src="/images/logo.svg" alt="Samya" width={130} height={52} className="h-10 w-auto" />
        <button onClick={() => setOpen(true)} className="p-2 text-brand-teal" aria-label="Open menu">
          <Menu size={22} />
        </button>
      </div>

      <aside className="hidden lg:flex fixed left-0 top-0 h-full w-64 flex-col border-r border-brand-teal/10 bg-brand-cream p-6">
        <Image
          src="/images/logo.svg"
          alt="Samya By Samishtha"
          width={170}
          height={68}
          className="h-14 w-auto object-contain mb-8"
        />
        {NavLinks}
        <div className="mt-auto pt-6 border-t border-brand-teal/10">
          <p className="text-xs text-brand-teal/60 mb-3 px-4">Signed in as {adminName}</p>
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-brand-teal hover:bg-brand-teal/10"
          >
            <LogOut size={17} />
            Log Out
          </button>
        </div>
      </aside>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-72 bg-brand-cream p-6 flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <Image src="/images/logo.svg" alt="Samya" width={150} height={60} className="h-11 w-auto" />
              <button onClick={() => setOpen(false)} className="p-1 text-brand-teal" aria-label="Close menu">
                <X size={22} />
              </button>
            </div>
            {NavLinks}
            <div className="mt-auto pt-6 border-t border-brand-teal/10">
              <p className="text-xs text-brand-teal/60 mb-3 px-4">Signed in as {adminName}</p>
              <button
                onClick={logout}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-brand-teal hover:bg-brand-teal/10"
              >
                <LogOut size={17} />
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
