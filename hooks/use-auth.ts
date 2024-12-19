import { useEffect, useState } from "react";
import { onAuthStateChanged } from "@/app/lib/firebase/auth";

export function useUserSession(initialSession: string | null) {
  const [user, setUser] = useState<null | {
    uid: string;
    email?: string;
    displayName?: string;
    photoURL?: string;
  }>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(async (authUser) => {
      if (authUser) {
        setUser({
          uid: authUser.uid,
          email: authUser.email || null,
          displayName: authUser.displayName || null,
          photoURL: authUser.photoURL || null,
        });
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  return user;
}
