"use client";

import { createSession, removeSession } from "@/actions/auth-action";
import { signInWithGoogle, signOutWithGoogle } from "@/app/lib/firebase/auth";
import { useUserSession } from "@/hooks/use-auth";

export function Header({ session }: { session: string | null }) {
  const userSessionId = useUserSession(session);

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

  if (!userSessionId) {
    return (
      <header>
        <button onClick={handleSignIn}>Sign In</button>
      </header>
    );
  }

  return (
    <header>
      <button onClick={handleSignOut}>Sign Out</button>
    </header>
  );
}

export default Header;
