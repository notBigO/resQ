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

  return (
    <nav className="w-full bg-white shadow-md">
      <div className="container mx-auto px-4 flex items-center justify-between h-16">
        {/* Logo */}
        <div className="text-lg font-bold text-gray-800">
          <a href="/">LOGO</a>
        </div>

        {/* Links */}
        <div className="hidden md:flex space-x-4">
          <a href="#home" className="text-gray-600 hover:text-gray-900">
            Home
          </a>
          <a href="#about" className="text-gray-600 hover:text-gray-900">
            About
          </a>
          <a href="#services" className="text-gray-600 hover:text-gray-900">
            Services
          </a>
          <a href="#contact" className="text-gray-600 hover:text-gray-900">
            Contact
          </a>
        </div>

        {/* Login / Logout */}
        <div className="flex items-center space-x-4">
          {!user ? (
            <Button onClick={handleSignIn}>Sign In</Button>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center space-x-2">
                  <img
                    src={user.photoURL || "/default-avatar.png"}
                    alt="Avatar"
                    className="w-8 h-8 rounded-full"
                  />
                  <span className="text-gray-600">
                    {user.displayName || "User"}
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={handleSignOut}>
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-gray-600 hover:text-gray-900"
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
      {isMobileMenuOpen && (
        <div className="md:hidden bg-gray-100 space-y-2 py-2 px-4">
          <a href="#home" className="block text-gray-600 hover:text-gray-900">
            Home
          </a>
          <a href="#about" className="block text-gray-600 hover:text-gray-900">
            About
          </a>
          <a
            href="#services"
            className="block text-gray-600 hover:text-gray-900"
          >
            Services
          </a>
          <a
            href="#contact"
            className="block text-gray-600 hover:text-gray-900"
          >
            Contact
          </a>
          {!user ? (
            <Button onClick={handleSignIn} className="w-full">
              Sign In
            </Button>
          ) : (
            <Button onClick={handleSignOut} className="w-full">
              Sign Out
            </Button>
          )}
        </div>
      )}
    </nav>
  );
}

export default Navbar;
