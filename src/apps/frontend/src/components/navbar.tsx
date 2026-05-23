"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Search, User, Settings, LogOut } from "lucide-react";
import { logout, getMe } from "@/lib/api/auth";
import { searchForums } from "@/lib/api/communities";
import type { ForumSummary } from "@/lib/api/communities";
import { useRouter } from "next/navigation";

const NavBar = () => {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<ForumSummary[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getMe()
      .then((user) => {
        setIsLoggedIn(true);
        setAvatarUrl(user.img_perfil);
        setUsername(user.nome_usuario);
      })
      .catch(() => setIsLoggedIn(false));
  }, []);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }
    const timer = setTimeout(() => {
      searchForums(searchQuery).then((results) => {
        setSearchResults(results);
        setShowDropdown(results.length > 0);
      });
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  function handleLogout() {
    logout();
    setIsLoggedIn(false);
    setAvatarUrl(null);
    setProfileOpen(false);
    router.push("/");
  }

  return (
    <header className="bg-surface-base border-b border-surface-overlay sticky top-0 z-50">
      <nav className="flex items-center h-16 px-6 gap-4">
        {/* Logo */}
        <Link
          href="/"
          className="font-bold text-xl tracking-tight shrink-0 text-accent hover:opacity-80 transition-opacity"
        >
          PUCVault
        </Link>

        {/* Centered search */}
        <div className="hidden md:flex flex-1 justify-center">
          <div className="relative w-full max-w-sm" ref={searchRef}>
            <div className="flex items-center gap-2 bg-surface-raised px-3 py-1.5 rounded-lg border border-accent/20 focus-within:border-accent/60 transition-all duration-200">
              <Search size={14} className="text-text-muted shrink-0" />
              <input
                type="search"
                placeholder="Buscar vaults..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent text-sm text-text-secondary placeholder:text-text-muted outline-none w-full"
              />
            </div>
            {showDropdown && (
              <div className="absolute top-full mt-1 w-full bg-surface-overlay border border-surface-raised/60 rounded-xl py-1 shadow-2xl z-50">
                {searchResults.map((forum) => (
                  <Link
                    key={forum.id}
                    href={`/v/${forum.nome}`}
                    onClick={() => { setSearchQuery(""); setShowDropdown(false); }}
                    className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-text-secondary hover:text-text-primary hover:bg-surface-raised transition-colors duration-150"
                  >
                    {forum.img_perfil ? (
                      <img src={forum.img_perfil} alt="" className="size-5 rounded-full object-cover shrink-0" />
                    ) : (
                      <div className="size-5 rounded-full bg-surface-base shrink-0" />
                    )}
                    {forum.nome}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Auth controls */}
        <div className="shrink-0 ml-auto md:ml-0">
          {isLoggedIn ? (
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileOpen((o) => !o)}
                className="flex items-center justify-center rounded-full bg-surface-overlay size-8 transition-all duration-200 overflow-hidden cursor-pointer"
                aria-label="Perfil"
              >
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User size={15} className="text-text-secondary" />
                )}
              </button>

              {profileOpen && (
                <div className="absolute right-0 top-full mt-2 w-44 bg-surface-overlay border border-surface-raised/60 rounded-xl py-1 shadow-2xl animate-slide-down">
                  {username && (
                    <Link
                      href={`/u/${username}`}
                      className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-text-secondary hover:text-text-primary hover:bg-surface-raised transition-colors duration-150 cursor-pointer"
                      onClick={() => setProfileOpen(false)}
                    >
                      <User size={14} />
                      Perfil
                    </Link>
                  )}
                  <Link
                    href="/config"
                    className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-text-secondary hover:text-text-primary hover:bg-surface-raised transition-colors duration-150 cursor-pointer"
                    onClick={() => setProfileOpen(false)}
                  >
                    <Settings size={14} />
                    Configurações
                  </Link>
                  <div className="my-1 border-t border-surface-raised/60" />
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2.5 w-full px-3 py-2.5 text-sm text-text-muted hover:text-red-400 hover:bg-surface-raised transition-colors duration-150 cursor-pointer"
                  >
                    <LogOut size={14} />
                    Sair
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="text-text-secondary text-sm hover:text-text-primary transition-colors duration-150 px-3 py-1.5 cursor-pointer"
              >
                Entrar
              </Link>
              <Link
                href="/sign-in"
                className="bg-accent text-surface-base text-sm font-semibold px-3 py-1.5 rounded-lg hover:opacity-90 transition-all duration-200 cursor-pointer"
              >
                Criar conta
              </Link>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
};

export default NavBar;
