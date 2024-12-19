"use client";

import { createSession, removeSession } from "@/actions/auth-action";
import { signInWithGoogle, signOutWithGoogle } from "@/app/lib/firebase/auth";
import { useUserSession } from "@/hooks/use-auth";

export function Header({ session }: { session: string | null }) {
  const user = useUserSession(session);

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

  if (!user) {
    return (
      <header>
        <button onClick={handleSignIn}>Sign In</button>
      </header>
    );
  }

  return (
    <header>
      <div>
        <p>Welcome, {user.displayName || "User"}!</p>
        <p>Email: {user.email}</p>
        {user.photoURL && (
          <img
            src={user.photoURL}
            alt="User Avatar"
            style={{ width: "40px", borderRadius: "50%" }}
          />
        )}
      </div>
      <button onClick={handleSignOut}>Sign Out</button>
    </header>
  );
}

export default Header;
