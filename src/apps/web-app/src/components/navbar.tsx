"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, User, Menu, X } from "lucide-react";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Popular", href: "/popular" },
  { label: "All", href: "/all" },
];

const NavBar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="bg-surface-base border-b border-surface-raised">
      <nav className="flex items-center justify-between h-16 px-6">
        {/* Mobile: hamburger */}
        <button
          className="md:hidden text-text-secondary hover:text-text-primary transition-colors"
          onClick={() => setMobileOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        {/* Logo */}
        <Link
          href="/"
          className="text-text-primary font-bold text-xl tracking-tight md:mr-0 mx-auto md:mx-0 text-accent"
        >
          PUCVault
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-6 ml-8 text-text-secondary text-base">
          {NAV_LINKS.map(({ label, href }) => (
            <Link key={href} href={href} className="hover:text-text-primary transition-colors">
              {label}
            </Link>
          ))}
        </div>

        {/* Desktop right: search + avatar */}
        <div className="hidden md:flex items-center gap-4 ml-auto">
          <div className="flex items-center gap-2 bg-surface-raised px-3 py-1.5 rounded-sm">
            <Search size={14} className="text-text-muted shrink-0" />
            <input
              type="search"
              placeholder="Search communities..."
              className="bg-transparent text-sm text-text-secondary placeholder:text-text-muted outline-none w-56"
            />
          </div>
          <div className="flex items-center justify-center rounded-full bg-surface-overlay size-8 shrink-0">
            <User size={15} className="text-text-secondary" />
          </div>
        </div>

        {/* Mobile right: search icon */}
        <button
          className="md:hidden text-text-secondary hover:text-text-primary transition-colors"
          aria-label="Search"
        >
          <Search size={18} />
        </button>
      </nav>

      {/* Mobile dropdown menu */}
      {mobileOpen && (
        <div className="md:hidden bg-surface-raised border-t border-surface-overlay px-6 py-4 flex flex-col gap-3">
          {NAV_LINKS.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              className="text-text-secondary text-base hover:text-text-primary transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              {label}
            </Link>
          ))}
          <div className="flex items-center gap-2 bg-surface-input px-3 py-2 rounded-sm mt-2">
            <Search size={14} className="text-text-muted shrink-0" />
            <input
              type="search"
              placeholder="Search communities..."
              className="bg-transparent text-sm text-text-secondary placeholder:text-text-muted outline-none w-full"
            />
          </div>
        </div>
      )}
    </header>
  );
};

export default NavBar;
