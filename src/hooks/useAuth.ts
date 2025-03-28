"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/stores/userStore";

type User = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "parent" | "staff" | "pending";
};

export function useAuth(allowedRoles?: User["role"][]) {
  const setUser = useUserStore((state) => state.setUser);
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/me");
        if (!res.ok) {
          router.push("/login");
          return;
        }

        const data = await res.json();
        const user = data.user;

        if (allowedRoles && !allowedRoles.includes(user.role)) {
          router.push("/login");
          return;
        }

        setUser(user); // ZustandにUser情報を状態保存
      } catch {
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router, allowedRoles, setUser]);

  return { loading };
}
