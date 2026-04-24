"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, User, Menu, X } from "lucide-react";
import { logout } from "@/lib/api/auth";
import { useRouter } from "next/navigation";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Popular", href: "/popular" },
  { label: "All", href: "/all" },
];

const NavBar = () => {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem("auth_token"));
  }, []);

  function handleLogout() {
    logout();
    setIsLoggedIn(false);
    router.push("/");
  }

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

        {/* Desktop right: search + auth */}
        <div className="hidden md:flex items-center gap-4 ml-auto">
          <div className="flex items-center gap-2 bg-surface-raised px-3 py-1.5 rounded-sm">
            <Search size={14} className="text-text-muted shrink-0" />
            <input
              type="search"
              placeholder="Search communities..."
              className="bg-transparent text-sm text-text-secondary placeholder:text-text-muted outline-none w-56"
            />
          </div>

          {isLoggedIn ? (
            <div className="flex items-center gap-2">
              <Link
                href="/profile"
                className="flex items-center justify-center rounded-full bg-surface-overlay size-8 shrink-0 hover:bg-surface-raised transition-colors"
                aria-label="Perfil"
              >
                <User size={15} className="text-text-secondary" />
              </Link>
              <button
                onClick={handleLogout}
                className="text-text-muted text-sm hover:text-text-secondary transition-colors"
              >
                Sair
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="text-text-secondary text-sm hover:text-text-primary transition-colors px-3 py-1.5"
              >
                Entrar
              </Link>
              <Link
                href="/sign-in"
                className="bg-accent text-surface-raised text-sm font-medium px-3 py-1.5 rounded-sm hover:opacity-90 transition-opacity"
              >
                Criar conta
              </Link>
            </div>
          )}
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
          {isLoggedIn ? (
            <button
              onClick={handleLogout}
              className="text-text-muted text-sm text-left hover:text-text-secondary transition-colors"
            >
              Sair
            </button>
          ) : (
            <div className="flex gap-2 mt-1">
              <Link
                href="/login"
                className="flex-1 text-center text-text-secondary text-sm border border-surface-overlay rounded-sm py-1.5 hover:bg-surface-overlay transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                Entrar
              </Link>
              <Link
                href="/sign-in"
                className="flex-1 text-center bg-accent text-surface-raised text-sm font-medium rounded-sm py-1.5 hover:opacity-90 transition-opacity"
                onClick={() => setMobileOpen(false)}
              >
                Criar conta
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default NavBar;
