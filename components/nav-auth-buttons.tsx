// components/nav-auth-buttons.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";          // ← add this
import { signOut } from "next-auth/react";

export function NavAuthButtons() {
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/api/auth/session")
      .then(r => r.json())
      .then(({ user }) => setLoggedIn(Boolean(user)))
      .catch(() => setLoggedIn(false));
  }, []);

  if (loggedIn === null) {
    return <div className="h-9 w-32 animate-pulse rounded bg-gray-200" />;
  }

  return loggedIn ? (
    <div className="flex items-center gap-2">
  <a href="/u/me" className="rounded border px-3 py-1.5 text-sm hover:bg-gray-50">Profile</a>
      <button onClick={() => signOut({ callbackUrl: "/" })} className="rounded border px-3 py-1.5 text-sm hover:bg-gray-50">
        Sign out
      </button>
    </div>
  ) : (
    <div className="flex items-center gap-2">
      <Link
        href="/enroll"
        className="rounded border px-3 py-1.5 text-sm hover:bg-gray-50"
      >
        Enroll
      </Link>
      <Link
        href="/login"
        className="rounded bg-black px-3 py-1.5 text-sm text-white hover:opacity-90"
      >
        Sign in
      </Link>
    </div>
  );
}
