"use client";

import { createSession, removeSession } from "@/actions/auth-action";
import { signInWithGoogle, signOutWithGoogle } from "@/app/lib/firebase/auth";
import { useUserSession } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";

const NAV_LINKS = [
  { label: "Alerts", href: "/alerts" },
  { label: "Create Alert", href: "/alert" },
  // { label: "My Alerts", href: "/my-alerts" },
  { label: "Volunteering", href: "/my-volunteering" },
] as const;

export function Navbar({ session }: { session: string | null }) {
  const user = useUserSession(session);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSignIn = async () => {
    const userUid = await signInWithGoogle();
    if (userUid) {
      await createSession(userUid);
    }
  };

  const handleSignOut = async () => {
    await signOutWithGoogle();
    await removeSession();
  };

  const NavLink = ({
    href,
    label,
    className,
  }: {
    href: string;
    label: string;
    className?: string;
  }) => (
    <a
      href={href}
      className={`text-gray-600 hover:text-gray-900 transition-colors duration-200 ${className}`}
    >
      {label}
    </a>
  );

  const AuthButton = ({ className }: { className?: string }) =>
    !user ? (
      <Button onClick={handleSignIn} className={className}>
        Sign In
      </Button>
    ) : (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center space-x-2 hover:opacity-80 transition-opacity duration-200">
            <img
              src={user.photoURL || "/default-avatar.png"}
              alt="Avatar"
              className="w-8 h-8 rounded-full object-cover"
            />
            <span className="text-gray-600 hidden sm:inline">
              {user.displayName || "User"}
            </span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={handleSignOut}>Sign Out</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );

  return (
    <nav className="sticky top-0 w-full z-50">
      <div className="container mx-auto px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          <div className="text-lg font-bold text-gray-800 hover:text-gray-900 transition-colors duration-200">
            <a href="/" className="flex items-center space-x-2">
              ResQ
            </a>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            {NAV_LINKS.map((link) => (
              <NavLink key={link.href} {...link} />
            ))}
          </div>

          <div className="flex items-center space-x-4">
            <AuthButton />

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-md hover:bg-gray-100 transition-colors duration-200"
              aria-label="Toggle menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={
                    isMobileMenuOpen
                      ? "M6 18L18 6M6 6l12 12"
                      : "M4 6h16M4 12h16m-7 6h7"
                  }
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={`md:hidden transition-all duration-300 ease-in-out ${
            isMobileMenuOpen
              ? "max-h-64 opacity-100"
              : "max-h-0 opacity-0 pointer-events-none"
          } overflow-hidden`}
        >
          <div className="py-4 space-y-4">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.href}
                {...link}
                className="block px-2 py-1 rounded-md hover:bg-gray-100"
              />
            ))}
            {user && (
              <Button
                onClick={handleSignOut}
                variant="outline"
                className="w-full"
              >
                Sign Out
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
