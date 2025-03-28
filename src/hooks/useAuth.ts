//認証ガード

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/stores/userStore";

export function useAuth(allowedRoles?: ("admin" | "parent" | "staff" | "pending")[]) {
  const { setUser, clearUser, setChecked, checked } = useUserStore();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (checked) {
      setLoading(false);
      return;
    }

    const checkAuth = async () => {
      try {
        const res = await fetch("/api/me");
        if (!res.ok) {
          clearUser();
          return;
        }

        const data = await res.json();
        const user = data.user;

        if (allowedRoles && !allowedRoles.includes(user.role)) {
          router.push("/login");
          return;
        }

        setUser(user);
      } catch {
        clearUser();
      } finally {
        setChecked(true);
        setLoading(false);
      }
    };

    checkAuth();
  }, [router, allowedRoles, checked, setUser, clearUser, setChecked]);

  return { loading };
}
